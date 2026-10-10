import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execute = promisify(execFile);
const repositoryDirectory = path.resolve(import.meta.dirname, '..');
const corpusDirectory = path.resolve(process.argv[2] ?? path.join(repositoryDirectory, '../soml-javascript/test/conformance'));
const compiler = path.join(repositoryDirectory, 'node_modules/typescript/bin/tsc');
const batchSize = 128;
const scalarTypes = ['string', 'bool', 'null', 'float', 'int', 'date', 'instant', 'duration'];
const stringLiteral = value => JSON.stringify(value).replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
const safeText = text => text.replaceAll(/[\u{0}-\u{1F}\u{7F}-\u{9F}]/gv, character => `\\u{${character.codePointAt(0).toString(16)}}`);

using temporaryDirectory = fs.mkdtempDisposableSync(path.join(os.tmpdir(), 'soml-typescript-types-conformance-'));

const fixtures = [];
// Preserve a BOM as a source character, so Parse itself must reject it.
const decoder = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true});
let totalFixtures = 0;
let byteOnlyFixtures = 0;
let invalidValidFixtures = 0;
for (const kind of ['valid', 'invalid']) {
	for (const filename of fs.globSync(`${kind}/**/*.soml`, {cwd: corpusDirectory}).toSorted()) {
		totalFixtures++;
		const bytes = fs.readFileSync(path.join(corpusDirectory, filename));
		let source;
		try {
			source = decoder.decode(bytes);
		} catch {
			if (kind === 'valid') {
				invalidValidFixtures++;
				console.error(`${safeText(filename)}: a valid fixture contains invalid UTF-8.`);
			} else {
				byteOnlyFixtures++;
				console.log(`${safeText(filename)}: invalid UTF-8 bytes cannot be expressed by the string API.`);
			}

			continue;
		}

		fixtures.push({filename, valid: kind === 'valid', source});
	}
}

if (totalFixtures === 0) {
	throw new Error(`No SOML fixtures found in ${safeText(corpusDirectory)}`);
}

const importPath = path.relative(temporaryDirectory.path, path.join(repositoryDirectory, 'index.js')).replaceAll(path.sep, '/');
const header = `import type {Canonicalize, Encode, Parse, SomlDate, SomlDuration, SomlError, SomlInstant, SomlInteger} from ${JSON.stringify(importPath)};
type Assert<Value extends true> = Value;
type Equal<First, Second> = (<Value>() => Value extends First ? 1 : 2) extends (<Value>() => Value extends Second ? 1 : 2) ? true : false;
type IsNever<Value> = [Value] extends [never] ? true : false;
type IsError<Value> = 0 extends (1 & Value) ? false : IsNever<Value> extends true ? false : [Value] extends [SomlError] ? true : false;
type IsValid<Value> = IsNever<Value> extends true ? false : [Extract<Value, SomlError>] extends [never] ? true : false;
type IsValidOrUnsupported<Value> = IsValid<Value> extends true ? true : Equal<Value, SomlError<'Unicode escapes are unsupported'>>;
type IsUnsupportedEncoding<Value> = 0 extends (1 & Value) ? false : IsNever<Value> extends true ? false : [Value] extends [SomlError<'Encoding requires ASCII object keys' | 'Raw control characters are not allowed'>] ? true : false;
type IsCanonicalSource<Value, Expected, UnsupportedReason extends string> = Equal<Value, Expected> extends true ? true : Equal<Value, SomlError<'Unicode escapes are unsupported'>> extends true ? 'Unicode escapes are unsupported' extends UnsupportedReason ? true : false : Equal<Value, SomlError<'Encoding requires a number literal'>> extends true ? 'Encoding requires a number literal' extends UnsupportedReason ? true : false : false;
type _ErrorAssertionRejectsAny = Assert<Equal<IsError<any>, false>>;
type _UnsupportedEncodingAssertionRejectsAny = Assert<Equal<IsUnsupportedEncoding<any>, false>>;
`;
const headerLineCount = header.split('\n').length;

let failedBatches = 0;
let failedFixtures = 0;
console.log(`Checking ${fixtures.length} string fixtures in ${safeText(corpusDirectory)}; ${byteOnlyFixtures} byte-only fixtures are outside the string API.`);
console.log('Valid documents requiring Unicode escape decoding are checked for the documented unsupported diagnostic.');

async function checkFixtures(cases, label) {
	for (let offset = 0; offset < cases.length; offset += batchSize) {
		const batch = cases.slice(offset, offset + batchSize);
		const source = header + batch.map((fixture, index) => fixture.assertion(index)).join('\n') + '\n';
		const filename = path.join(temporaryDirectory.path, 'batch.ts');
		fs.writeFileSync(filename, source);

		try {
			await execute(process.execPath, [compiler, '--ignoreConfig', '--strict', '--noEmit', '--target', 'ESNext', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', filename], {cwd: repositoryDirectory, timeout: 60_000, maxBuffer: 1024 * 1024});
		} catch (error) {
			failedBatches++;
			const reported = new Set();
			for (const line of `${error.stdout ?? ''}\n${error.stderr ?? ''}`.split('\n')) {
				if (line === '') {
					continue;
				}

				const location = /batch\.ts\((\d+),\d+\): (.+)/v.exec(line);
				const fixture = location ? batch[Number(location[1]) - headerLineCount] : undefined;
				if (fixture) {
					reported.add(fixture.filename);
					console.error(`${safeText(fixture.filename)}: ${safeText(location[2])}`);
				} else {
					console.error(safeText(line));
				}
			}

			failedFixtures += reported.size;
			if (reported.size === 0) {
				console.error(`Batch beginning with ${safeText(batch[0].filename)} failed: ${safeText(error.message)}`);
			}
		}

		console.log(`Checked ${Math.min(offset + batchSize, cases.length)}/${cases.length} ${label}`);
	}
}

await checkFixtures(fixtures.map(fixture => {
	const validAssertion = fixture.source.includes('\\u{') ? 'IsValidOrUnsupported' : 'IsValid';
	return {
		...fixture,
		assertion: index => `type Case${index} = Assert<${fixture.valid ? validAssertion : 'IsError'}<Parse<${stringLiteral(fixture.source)}>>>;`,
	};
}), 'string fixtures');

function valueType(value) {
	if (Array.isArray(value)) {
		return `[${value.map(valueType).join(', ')}]`;
	}

	if (value === null || typeof value !== 'object') {
		return stringLiteral(value);
	}

	switch (value.type) {
		case 'string': {
			return stringLiteral(value.value);
		}
		case 'bool': {
			if (value.value !== 'true' && value.value !== 'false') {
				throw new Error('Invalid bool in expected value fixture');
			}

			return value.value;
		}
		case 'null': {
			return 'null';
		}
		case 'float': {
			const number = value.value === 'infinity' ? Infinity : value.value === '-infinity' ? -Infinity : Number(value.value);
			if (Number.isNaN(number)) {
				throw new Error('Invalid float in expected value fixture');
			}

			return number === Infinity ? '1e999' : number === -Infinity ? '-1e999' : String(number);
		}
		case 'int': {
			return `SomlInteger<${stringLiteral(value.value)}>`;
		}
		case 'date': {
			return `SomlDate<${stringLiteral(value.value)}>`;
		}
		case 'instant': {
			return `SomlInstant<${stringLiteral(value.value)}>`;
		}
		case 'duration': {
			return `SomlDuration<${stringLiteral(`${value.value}ns`)}>`;
		}
		default: {
			return `{${Object.entries(value).map(([key, item]) => `${stringLiteral(key)}: ${valueType(item)}`).join('; ')}}`;
		}
	}
}

// Check parsed leaves individually so exact inference assertions also work at 100 mixed collection levels.
function parsedAssertions(value, valuePath) {
	if (Array.isArray(value)) {
		return [
			`Assert<[${valuePath}] extends [readonly unknown[]] ? true : false>`,
			`Assert<Equal<${valuePath}['length'], ${value.length}>>`,
			...value.flatMap((item, index) => parsedAssertions(item, `${valuePath}[${index}]`)),
		];
	}

	if (value === null || typeof value !== 'object') {
		return [`Assert<Equal<${valuePath}, ${valueType(value)}>>`];
	}

	if (value.type === 'int') {
		return [`Assert<Equal<${valuePath}, ${value.value}n>>`];
	}

	if (value.type === 'float') {
		return [`Assert<Equal<${valuePath}, ${valueType(value)}> extends true ? true : Equal<${valuePath}, number>>`];
	}

	if (value.type === 'instant' || value.type === 'duration') {
		return [`Assert<Equal<Encode<readonly [${valuePath}], {canonical: true}>, Encode<readonly [${valueType(value)}], {canonical: true}>>>`];
	}

	if (scalarTypes.includes(value.type)) {
		return [`Assert<Equal<${valuePath}, ${valueType(value)}>>`];
	}

	return [
		`Assert<[${valuePath}] extends [object] ? true : false>`,
		`Assert<Equal<keyof ${valuePath}, ${Object.keys(value).map(stringLiteral).join(' | ') || 'never'}>>`,
		...Object.entries(value).flatMap(([key, item]) => parsedAssertions(item, `${valuePath}[${stringLiteral(key)}]`)),
	];
}

function hasUnsupportedEncoding(value) {
	if (Array.isArray(value)) {
		return value.some(hasUnsupportedEncoding);
	}

	if (typeof value === 'string') {
		return /[\u{0}-\u{8}\u{B}-\u{1F}\u{7F}]/v.test(value);
	}

	if (value === null || typeof value !== 'object') {
		return false;
	}

	if (value.type === 'string') {
		return hasUnsupportedEncoding(value.value);
	}

	if (scalarTypes.includes(value.type)) {
		return false;
	}

	return Object.entries(value).some(([key, item]) => /[^\t\n\u{20}-\u{7E}]/v.test(key) || hasUnsupportedEncoding(item));
}

function hasFloat(value) {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	return value.type === 'float' || Object.values(value).some(hasFloat);
}

let unsupportedCanonicalFixtures = 0;
const canonicalFixtures = [...fs.globSync('valid/**/*.json', {cwd: corpusDirectory})].toSorted().map(filename => {
	const model = JSON.parse(fs.readFileSync(path.join(corpusDirectory, filename), 'utf8'));
	const expectedValue = valueType(model);
	if (hasUnsupportedEncoding(model)) {
		unsupportedCanonicalFixtures++;
		return {
			filename,
			assertion: index => `type UnsupportedCase${index} = Assert<IsUnsupportedEncoding<Encode<${expectedValue}, {canonical: true}>>>;`,
		};
	}

	const canonicalFilename = filename.replace(/\.json$/v, '.canonical.soml');
	const canonicalSource = decoder.decode(fs.readFileSync(path.join(corpusDirectory, canonicalFilename)));
	const canonicalLiteral = stringLiteral(canonicalSource);
	const originalSource = decoder.decode(fs.readFileSync(path.join(corpusDirectory, filename.replace(/\.json$/v, '.soml'))));
	const originalLiteral = stringLiteral(originalSource);
	const unsupportedReasons = `${originalSource.includes('\\u{') ? "'Unicode escapes are unsupported'" : 'never'} | ${hasFloat(model) ? "'Encoding requires a number literal'" : 'never'}`;
	// A rounded float can lose its literal type without making the other values unverifiable.
	const originalValueAssertions = hasFloat(model)
		? index => `type OriginalValue${index} = Equal<Canonicalize<${originalLiteral}>, SomlError<'Encoding requires a number literal'>> extends true ? Parse<${originalLiteral}, {integers: 'bigint'}> : BigintValue${index}; type OriginalValues${index} = [${parsedAssertions(model, `OriginalValue${index}`).join(', ')}];`
		: () => '';
	return {
		filename,
		assertion: index => `type OriginalCase${index} = Assert<IsCanonicalSource<Canonicalize<${originalLiteral}>, ${canonicalLiteral}, ${unsupportedReasons}>>; type EncodeCase${index} = Assert<Equal<Encode<${expectedValue}, {canonical: true}>, ${canonicalLiteral}>>; type RoundTripCase${index} = Assert<Equal<Encode<Parse<${canonicalLiteral}>, {canonical: true}>, ${canonicalLiteral}>>; type BigintValue${index} = Parse<${canonicalLiteral}, {integers: 'bigint'}>; type BigintRoundTrip${index} = Assert<Equal<Encode<BigintValue${index}, {canonical: true}>, ${canonicalLiteral}>>; type BigintCase${index} = [${parsedAssertions(model, `BigintValue${index}`).join(', ')}]; ${originalValueAssertions(index)}`,
	};
});
await checkFixtures(canonicalFixtures, 'canonical fixtures');

if (failedBatches > 0 || invalidValidFixtures > 0) {
	console.error(`${failedFixtures} fixtures failed assertions across ${failedBatches} batches; ${invalidValidFixtures} valid fixtures failed UTF-8 decoding.`);
	process.exitCode = 1;
} else {
	console.log(`All ${fixtures.length} string fixture checks passed. ${canonicalFixtures.length - unsupportedCanonicalFixtures} canonical fixtures passed, including exact bigint inference; ${unsupportedCanonicalFixtures} checked for documented unsupported encoding diagnostics. ${byteOnlyFixtures} invalid UTF-8 fixtures were reported separately.`);
}
