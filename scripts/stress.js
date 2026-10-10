import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';

const execute = promisify(execFile);
const repositoryDirectory = path.resolve(import.meta.dirname, '..');
const oracleFilename = path.resolve(process.argv[2] ?? path.join(repositoryDirectory, '../soml-javascript/source/parse.ts'));
const {parse} = await import(pathToFileURL(oracleFilename).href);
const serializerFilename = path.resolve(process.argv[3] ?? path.join(repositoryDirectory, '../soml-javascript/source/stringify.ts'));
const {stringify, stringifyValue} = await import(pathToFileURL(serializerFilename).href);
const compiler = path.join(repositoryDirectory, 'node_modules/typescript/bin/tsc');
const stringLiteral = value => JSON.stringify(value).replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
const safeText = value => value.replaceAll(/[\u{0}-\u{1F}\u{7F}-\u{9F}]/gv, character => `\\u{${character.codePointAt(0).toString(16)}}`);
const cases = [];

function assertEqual(label, actual, expected) {
	cases.push({label, assertion: `Equal<${actual}, ${expected}>`});
}

function checkParsing(source, exact = false) {
	let value;
	try {
		value = parse(source);
	} catch {
		cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(source)}>>`});
		return;
	}

	if (exact) {
		assertEqual(source, `Parse<${stringLiteral(source)}>`, JSON.stringify(value));
	} else {
		cases.push({label: source, assertion: `IsValid<Parse<${stringLiteral(source)}>>`});
	}
}

function checkCanonicalScalar(source, expected) {
	assertEqual(source, `Canonicalize<${stringLiteral(`value: ${source}`)}>`, stringLiteral(`value: ${expected}\n`));
}

const parserSources = new Set();
const trivia = ['', ' ', '\t', '\n', '/*x*/', '/*\n*/', '#x\n', ' /*x*/\n', '\n/*x*/', '/* x /*/', '/*/* */'];
for (const between of trivia) {
	for (const separator of ['', ',', '\n', '\n,', ',\n']) {
		for (const after of trivia) {
			for (const [left, right] of [['true', 'false'], ["'a'", "'b'"], ['[]', '{}'], ['a: true', 'b: false'], ['a: []', 'b: {}']]) {
				const object = left.startsWith('a:');
				parserSources.add(`${object ? '{' : '['}${left}${between}${separator}${after}${right}${object ? '}' : ']'}`);
				if (object) {
					parserSources.add(`${left}${between}${separator}${after}${right}`);
				}
			}
		}
	}
}

for (const source of parserSources) {
	checkParsing(source);
}

console.log(`Generated ${parserSources.size} parser separator checks.`);
let previousCount = cases.length;
// A full Gregorian leap cycle uses arithmetic alone, without an instant or host calendar.
for (let year = 1; year <= 400; year++) {
	const source = `${String(year).padStart(4, '0')}-02-29`;
	const valid = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	if (valid) {
		assertEqual(source, `Parse<${stringLiteral(`[${source}]`)}>`, `[SomlDate<${stringLiteral(source)}>]`);
		checkCanonicalScalar(source, source);
	} else {
		cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(`[${source}]`)}>>`});
	}
}

for (const source of ['0001-01-01', '9999-12-31', '1582-10-10', '2011-12-30', '2000-02-29']) {
	assertEqual(source, `Encode<[SomlDate<${stringLiteral(source)}>], {canonical: true}>`, stringLiteral(`[\n\t${source}\n]\n`));
	assertEqual(source, `Parse<${stringLiteral(`day: ${source}# Calendar\ntext: '${source}'`)}>`, `{day: SomlDate<${stringLiteral(source)}>; text: ${stringLiteral(source)}}`);
	for (const suffix of ['T', 'Z', 'foo', 'T12:00:00']) {
		cases.push({label: source + suffix, assertion: `IsError<Parse<${stringLiteral(`[${source}${suffix}]`)}>>`});
	}
}
console.log(`Generated ${cases.length - previousCount} native date cycle, canonical, boundary, and type checks.`);
previousCount = cases.length;
for (const quote of ["'", '"']) {
	for (const length of [3, 4, 5]) {
		for (const indentation of ['', ' ', '\t', ' \t']) {
			for (const content of ['', '\n', ' \n\t\n', 'text\n', ' text\n', '\ttext\n', ' \ttext\n', '\n text\n \n second\n\n', '"""\n', "'''\n", '\\\n', '\\n\n', '\\t\n', '\\"\n']) {
				for (const suffix of ['', ' ', ' #x', '/*x*/', ',', '\n']) {
					checkParsing(`value: ${quote.repeat(length)}\n${content}${indentation}${quote.repeat(length)}${suffix}`, true);
				}
			}
		}
	}
}

console.log(`Generated ${cases.length - previousCount} block string value checks.`);
previousCount = cases.length;
const numericSources = new Set();
for (const sign of ['', '-', '+']) {
	for (const mantissa of ['0', '00', '01', '1', '1_0', '0_0', '1__0', '1_', '_1', '.1', '1.', '0.0', '-0.0', '0.1', '1.00', '1.0_0', '1.0_', '0._1', '9.99', '999', '1.7976931348623158', '2.4703282292062327']) {
		for (const exponent of ['', 'e0', 'e-0', 'e1', 'e-1', 'e+1', 'e01', 'e-01', 'e1_0', 'e-1_0', 'E1', 'e308', 'e309', 'e-323', 'e-324', 'e-325', 'e999999', 'e-999999']) {
			numericSources.add(`${sign}${mantissa}${exponent}`);
		}

		for (const unit of ['s', 'h', 'm', 'ms', 'us', 'ns', 'd', 'H', 's1m', 's1ms', 'h1s', 'm1s', 'ms1us1ns']) {
			numericSources.add(`${sign}${mantissa}${unit}`);
		}
	}
}

for (const token of numericSources) {
	checkParsing(`[${token}]`);
}

console.log(`Generated ${cases.length - previousCount} numeric syntax checks.`);
previousCount = cases.length;
for (const year of [1, 4, 99, 100, 400, 999, 1000, 1900, 2000, 2024, 9998]) {
	for (const month of [1, 2, 3, 4, 12]) {
		for (const sign of ['+', '-']) {
			for (const offset of ['00:01', '01:00', '23:59']) {
				const source = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01T00:00:59.100${sign}${offset}`;
				const instant = new Date(source);
				if (instant.getUTCFullYear() < 1) {
					cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(`value: ${source}`)}>>`});
				} else {
					checkCanonicalScalar(source, instant.toISOString().replace('.100Z', '.1Z'));
				}
			}
		}
	}
}

// Bigint division gives an independent nanosecond oracle without floating-point rounding.
function canonicalDuration(nanoseconds) {
	const magnitude = nanoseconds < 0n ? -nanoseconds : nanoseconds;
	const fraction = (magnitude % 1_000_000_000n).toString().padStart(9, '0').replace(/0+$/v, '');
	const wholeSeconds = magnitude / 1_000_000_000n;
	const seconds = wholeSeconds % 60n;
	const minutes = wholeSeconds / 60n % 60n;
	const hours = wholeSeconds / 3600n;
	const text = `${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}${seconds || fraction ? `${seconds}${fraction ? `.${fraction}` : ''}s` : ''}` || '0s';
	return `${nanoseconds < 0n ? '-' : ''}${text}`;
}

for (let index = 0; index < 300; index++) {
	const nanoseconds = BigInt(index) * 81_992_823_651_783n + BigInt(index % 10);
	checkCanonicalScalar(`${nanoseconds}ns`, canonicalDuration(nanoseconds));
}

console.log(`Generated ${cases.length - previousCount} Date and bigint canonical checks.`);
previousCount = cases.length;
let randomState = 123456;
function random() {
	randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
	return randomState / 2 ** 32;
}

for (let index = 0; index < 300; index++) {
	const value = (random() - 0.5) * 10 ** Math.floor(random() * 632 - 323);
	if (!Number.isFinite(value)) {
		continue;
	}

	const spelling = String(value).replace('e+', 'e');
	const scalar = spelling.includes('.') || spelling.includes('e') ? spelling : `${spelling}.0`;
	assertEqual(scalar, `Parse<${stringLiteral(`[${scalar}]`)}>`, `[${value}]`);
	assertEqual(scalar, `Parse<Encode<[${value}]>>`, `[${value}]`);
	assertEqual(scalar, `Encode<Parse<${stringLiteral(`[${scalar}]`)}>, {canonical: true}>`, stringLiteral(`[\n\t${scalar}\n]\n`));
}

for (let index = 0; index < 150; index++) {
	const hours = Math.floor(random() * 2_000_000);
	const minutes = Math.floor(random() * 600);
	const seconds = Math.floor(random() * 600);
	const source = `${hours}h${minutes}m${seconds}s`;
	const nanoseconds = (BigInt(hours) * 3600n + BigInt(minutes) * 60n + BigInt(seconds)) * 1_000_000_000n;
	assertEqual(source, `Encode<[SomlDuration<${stringLiteral(source)}>], {canonical: true}>`, stringLiteral(`[\n\t${canonicalDuration(nanoseconds)}\n]\n`));
}

for (let index = 0; index < 150; index++) {
	const date = new Date(Date.UTC(Math.floor(random() * 9800 + 100), Math.floor(random() * 12), Math.floor(random() * 28 + 1), Math.floor(random() * 24), Math.floor(random() * 60), Math.floor(random() * 60)));
	const offsetHours = Math.floor(random() * 24);
	const offsetMinutes = Math.floor(random() * 60);
	const sign = random() < 0.5 ? '+' : '-';
	const source = date.toISOString().replace('.000Z', `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`);
	const utc = new Date(date.getTime() + (sign === '+' ? -1 : 1) * (offsetHours * 60 + offsetMinutes) * 60_000).toISOString().replace('.000Z', 'Z');
	assertEqual(source, `Encode<[SomlInstant<${stringLiteral(source)}>], {canonical: true}>`, stringLiteral(`[\n\t${utc}\n]\n`));
}

console.log(`Generated ${cases.length - previousCount} deterministic scalar roundtrip checks.`);
previousCount = cases.length;
const maximumInteger = 9_223_372_036_854_775_807n;
const integerValues = new Set([0n, 1n, maximumInteger, maximumInteger - 1n, 9_007_199_254_740_993n, 1_000_000_000_000_000_000n]);
for (let bit = 1n; bit <= 62n; bit++) {
	integerValues.add(2n ** bit - 1n);
	integerValues.add(2n ** bit);
	integerValues.add(2n ** bit + 1n);
}

let integerState = 17_839n;
for (let index = 0; index < 125; index++) {
	integerState = (integerState * 6_364_136_223_846_793_005n + 1_442_695_040_888_963_407n) & maximumInteger;
	integerValues.add(integerState);
}

for (const value of integerValues) {
	for (const [radix, prefix] of [[2, '0b'], [8, '0o'], [16, '0x']]) {
		const digits = value.toString(radix).toUpperCase();
		const source = `${prefix}00${digits.replace(/(?<=.)(?=(?:.{4})+$)/gv, '_')}`;
		assertEqual(source, `Parse<${stringLiteral(`[${source}]`)}, {integers: 'bigint'}>`, `[${value}n]`);
		checkCanonicalScalar(source, String(value));
	}
}

console.log(`Generated ${cases.length - previousCount} exact radix conversion checks.`);
previousCount = cases.length;
for (const length of [1, 2, 3, 9, 10, 19, 20, 63, 99, 100, 127, 200, 300]) {
	const zeros = '0'.repeat(length);
	for (const [source, value] of [
		[`1${zeros}.0e-${length}`, 1],
		[`-1${zeros}.0e-${length}`, -1],
		[`0.${zeros}125e${length}`, 0.125],
		[`-0.${zeros}125e${length}`, -0.125],
		[`1${zeros}.0e-${length + 1}`, 0.1],
		[`1${zeros}.0e${length === 1 ? '0' : `-${length - 1}`}`, 10],
	]) {
		assertEqual(source, `Parse<${stringLiteral(`[${source}]`)}>`, `[${value}]`);
	}
}

for (const exponent of ['999999999999999999999999999999999', '-999999999999999999999999999999999']) {
	for (const sign of ['', '-']) {
		const source = `${sign}0.0e${exponent}`;
		assertEqual(source, `Parse<${stringLiteral(`[${source}]`)}>`, '[0]');
	}
}

console.log(`Generated ${cases.length - previousCount} float exponent cancellation checks.`);
previousCount = cases.length;
for (let hour = 0; hour < 24; hour++) {
	for (const minute of [0, 1, 9, 10, 30, 59]) {
		const offset = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
		const upperTime = `${String(23 - hour).padStart(2, '0')}:${String(59 - minute).padStart(2, '0')}`;
		checkCanonicalScalar(`0001-01-01T${offset}:00.000000001+${offset}`, '0001-01-01T00:00:00.000000001Z');
		if (offset === '00:00') {
			continue;
		}

		checkCanonicalScalar(`9999-12-31T${upperTime}:59.999999999-${offset}`, '9999-12-31T23:59:59.999999999Z');
		for (const source of [`0001-01-01T00:00:59.999999999+${offset}`, `9999-12-31T23:59:00.000000001-${offset}`]) {
			cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(`[${source}]`)}>>`});
		}
	}
}

for (const year of [1, 4, 99, 100, 400, 1000, 1600, 1900, 2000, 2100, 2400, 9999]) {
	for (let month = 1; month < 13; month++) {
		const source = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01T00:00:00.000000001+00:01`;
		const instant = new Date(source.replace('.000000001', '.000'));
		if (instant.getUTCFullYear() < 1) {
			continue;
		}

		checkCanonicalScalar(source, instant.toISOString().replace('.000Z', '.000000001Z'));
	}
}

console.log(`Generated ${cases.length - previousCount} nanosecond calendar boundary checks.`);
previousCount = cases.length;
const durationUnits = [
	['h', 3_600_000_000_000n, 13],
	['m', 60_000_000_000n, 11],
	['s', 1_000_000_000n, 9],
	['ms', 1_000_000n, 6],
	['us', 1000n, 3],
	['ns', 1n, 0],
];
const durationValues = new Set([0n, 1n, 3n, 9n, 59n, 60n, 999n, 1000n, 1001n, 999_999_999n, 1_000_000_000n, 59_999_999_999n, 60_000_000_000n, 3_599_999_999_999n, 3_600_000_000_000n, maximumInteger, maximumInteger + 1n]);
for (let adjustment = 0n; adjustment < 80n; adjustment++) {
	durationValues.add(maximumInteger - adjustment);
}

for (const value of durationValues) {
	for (const [unit, factor, precision] of durationUnits) {
		const dividend = value * 10n ** BigInt(precision);
		if (dividend % factor !== 0n) {
			continue;
		}

		const coefficient = (dividend / factor).toString().padStart(precision + 1, '0');
		const part = precision ? `${coefficient.slice(0, -precision)}.${coefficient.slice(-precision)}${unit}` : `${coefficient}.0${unit}`;
		for (const sign of value ? ['', '-'] : ['']) {
			if (sign === '' && value > maximumInteger) {
				continue;
			}

			checkCanonicalScalar(`${sign}${part}`, canonicalDuration(sign === '-' ? -value : value));
		}
	}
}

console.log(`Generated ${cases.length - previousCount} exact duration boundary checks.`);
previousCount = cases.length;
for (const [unit, factor] of durationUnits) {
	for (const precision of [1, 3, 6, 9, 10, 11, 12, 13, 14]) {
		for (const coefficient of [0n, 1n, 5n, 25n, 125n, 625n, 999n, 12_345n, 99_999n]) {
			for (const sign of ['', '-']) {
				const digits = coefficient.toString().padStart(precision + 1, '0');
				const source = `${sign}${digits.slice(0, -precision)}.${digits.slice(-precision)}${unit}`;
				const numerator = coefficient * factor;
				const denominator = 10n ** BigInt(precision);
				const nanoseconds = numerator / denominator * (sign === '-' ? -1n : 1n);
				if (numerator % denominator === 0n && !(sign === '-' && nanoseconds === 0n)) {
					checkCanonicalScalar(source, canonicalDuration(nanoseconds));
				} else {
					cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(`[${source}]`)}>>`});
				}
			}
		}
	}
}

console.log(`Generated ${cases.length - previousCount} fractional duration integrality checks.`);
previousCount = cases.length;
randomState = 84953;
const nestedKeys = ['a', '1', '01', '1e-7', ' ', '\t', '\n', "'", '"', '\\', '[]', '{}', 'colon:', 'true', '__proto__', 'constructor', 'toString', '#'];
const nestedScalars = [false, true, null, '', 'plain', "it's", 'slash\\quote"', 'tab\tline\n', 'café 😀', 0, -0, 1.5, 1e21, 1e-7, Infinity, -Infinity, Number.MAX_VALUE, Number.MIN_VALUE, 0n, maximumInteger, -maximumInteger - 1n];
function nestedValue(depth) {
	if (depth === 0 || random() < 0.55) {
		return nestedScalars[Math.floor(random() * nestedScalars.length)];
	}

	const length = Math.floor(random() * 5);
	if (random() < 0.5) {
		return Array.from({length}, () => nestedValue(depth - 1));
	}

	return Object.fromEntries(Array.from({length}, () => [nestedKeys[Math.floor(random() * nestedKeys.length)], nestedValue(depth - 1)]));
}

function valueType(value) {
	if (typeof value === 'bigint') {
		return `${value}n`;
	}

	if (typeof value === 'number') {
		return value === Infinity ? '1e999' : value === -Infinity ? '-1e999' : String(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map(valueType).join(', ')}]`;
	}

	if (value !== null && typeof value === 'object') {
		return `{${Object.entries(value).map(([key, item]) => `${stringLiteral(key)}: ${valueType(item)}`).join('; ')}}`;
	}

	return stringLiteral(value);
}

for (let index = 0; index < 160; index++) {
	const value = random() < 0.5 ? [nestedValue(3), nestedValue(3)] : Object.fromEntries([[nestedKeys[Math.floor(random() * nestedKeys.length)], nestedValue(3)], [nestedKeys[Math.floor(random() * nestedKeys.length)], nestedValue(3)]]);
	const expression = valueType(value);
	const canonical = stringLiteral(stringify(value, {canonical: true}));
	assertEqual(expression, `Encode<${expression}, {canonical: true}>`, canonical);
	assertEqual(expression, `Canonicalize<${canonical}>`, canonical);
	assertEqual(expression, `Parse<Encode<${expression}>, {integers: 'bigint'}>`, expression);
}

console.log(`Generated ${cases.length - previousCount} nested encoding and canonicalization checks.`);
previousCount = cases.length;
const mutationSources = new Set();
const mutationCharacters = ["'", '"', '{', '}', '[', ']', ':', ',', '\n', ' ', '\t', '/', '*', '#', '\\', '_', '-', '+', '0', '1', 'x', '\r', '\0'];
for (const document of [
	'[]',
	'{}',
	'[1,-2,0xF,true,false,null]',
	'{a:[1,{b:false}],c:{d:[]}}',
	'a: {b: [1, 2]}\nc: [true, null]',
	'{"a\\tb":true, \'__proto__\': [0o12,0b10]}',
	'["a\\n\\t\\\\\\\"", \'literal\\n\', \'\']',
	'{a:1/*first*/,b:[2\n3,],c:{d:4,}}',
	'#start\n[{}\n[],\n[false]] #end',
	'/*start*/\na: true\nb: {c: [\'x\',\'y\']}\n/*end*/',
	'{a:\'\'\'\n  first\n\n  second\n  \'\'\',b:true}',
	'["""\n\thello\\tworld\n\t""",0]',
]) {
	mutationSources.add(document);
	for (let position = 0; position <= document.length; position++) {
		for (const character of mutationCharacters) {
			mutationSources.add(document.slice(0, position) + character + document.slice(position));
		}

		if (position < document.length) {
			mutationSources.add(document.slice(0, position) + document.slice(position + 1));
		}

		if (position < document.length - 1) {
			mutationSources.add(document.slice(0, position) + document[position + 1] + document[position] + document.slice(position + 2));
		}
	}
}

const decodedSources = new Set();
for (const quote of ["'", '"']) {
	for (const length of [3, 6, 8]) {
		for (const indentation of ['', ' \t', '\t ']) {
			for (const content of [
				`${indentation}first \n \t\n${indentation}second\t\n`,
				`\t \n${indentation}first\n\n \t\n\t\n${indentation}second\n\t \n`,
				`${indentation}\\n\n${indentation}\\t\n${indentation}\\\\\n`,
				`${indentation}${quote.repeat(length + 1)}\n${indentation}${quote.repeat(length - 1)}\n`,
				`${indentation}# not a comment\n${indentation}/* not a comment */\n`,
				`${indentation}true false null\n${indentation}[1,2] {a:1}\n`,
				`${indentation}\\\"\n${indentation}end  \n`,
			]) {
				const block = `${quote.repeat(length)}\n${content}${indentation}${quote.repeat(length)}`;
				for (const source of [`value: ${block}`, `[${block}, true]`, `{first: ${block}\nsecond: false}`, `[${block}/*comment\nignored*/, {next: 'text'}]`]) {
					decodedSources.add(source);
				}
			}
		}
	}
}

for (const comment of ['/*a*/', '/*a\nb*/', '/*/"\'[#]}*/', '/*a*//*b*/', '/*/**/', '/*/*/', '#x\n', '#/*\"\'*/\n']) {
	for (const token of ["'literal\\n'", '"escaped\\n\\t\\\\\\\""', "'/*#*/'", "''", '[]', '{}', '1', '0xF', 'true']) {
		for (const suffix of ['', ', false', '\nfalse', ' false', `${comment}false`, '\n, false']) {
			decodedSources.add(`[${comment}${token}${comment}${suffix}]`);
		}
	}
}

for (const [first, second] of [['"a\\nb"', "'a\nb'"], ['"a\\tb"', "'a\tb'"], ['"a\\\\b"', "'a\\b'"], ['"a\\\"b"', "'a\"b'"], ['"a"', "'a'"], ["''", '""']]) {
	for (const separator of [',', '\n', '/*x*/,/*y*/', '#x\n']) {
		decodedSources.add(`{${first}: 1${separator}${second}: 2}`);
		decodedSources.add(`{first: {${first}: true}${separator}second: {${second}: false}}`);
	}
}

for (const source of [...mutationSources, ...decodedSources]) {
	let value;
	try {
		value = parse(source);
	} catch {
		cases.push({label: source, assertion: `IsError<Parse<${stringLiteral(source)}, {integers: 'bigint'}>>`});
		continue;
	}

	assertEqual(source, `Parse<${stringLiteral(source)}, {integers: 'bigint'}>`, valueType(value));
}

console.log(`Generated ${cases.length - previousCount} document mutation and decoded string checks (${mutationSources.size} mutations and ${decodedSources.size} decoded strings).`);
previousCount = cases.length;
const durations = ['0h0m0s0ms0us0.0000ns', '0h0m0s0ms0.001us', '1h0m0s0ms0us1ns', '-1h0m0s0ms0us1ns', '12h345m678s901ms234us5ns', '-12h345m678s901ms234us5ns', '1_2h0m0.000_000_025s', '0h1_2m0.000_000_025s', '4h5m0s0ms1.000us', '8h0m0.000001s', '0h0m3.000000000000s', '1h2m3s4ms5us6.000000ns', '0h0m0s0.000001ms', '0h0m0.000000001s', '0h0.00000000005m', '0.00000000000250h'];
const floatSources = ['1_2.3_4e1', '-1_2.3_4e1', '0.000_125e3', '-0.000_125e3', '5.000_000e-3', '1_2_5e-3', '1_000.0_000e-3', '0.0_0_0e999999', '-0.0_0_0e-999999', '100_000e-5', '9.9_9e1', '-2_50.0e-2'];
const integerSources = ['0x000_A_B_C_D', '0o00_123_456', '0b00_1010_1010', '-9_007_199_254_740_993', '9_007_199_254_740_993', '0x00_7FFF_FFFF_FFFF_FFFF'];
for (let index = 0; index < 192; index++) {
	const duration = durations[index % durations.length];
	const year = String(173 + index * 37).padStart(4, '0');
	const month = String(index % 12 + 1).padStart(2, '0');
	const day = String(index % 27 + 1).padStart(2, '0');
	const hour = String(index % 24).padStart(2, '0');
	const minute = String(index * 11 % 60).padStart(2, '0');
	const second = String(index * 17 % 60).padStart(2, '0');
	const offsetHour = String(index * 5 % 24).padStart(2, '0');
	const offsetMinute = String(index * 23 % 60).padStart(2, '0');
	const instant = `${year}-${month}-${day}T${hour}:${minute}:${second}.${String(index * 1234567 + 1).padStart(9, '0')}${index % 2 ? '+' : '-'}${offsetHour}:${offsetMinute}`;
	const safeInstant = instant.endsWith('-00:00') ? instant.replace('-00:00', '+00:00') : instant;
	const floating = floatSources[index % floatSources.length];
	const integer = integerSources[index % integerSources.length];
	const radix = integer.replaceAll('_', '');
	const integerValue = BigInt(radix);
	const floatValue = Number(floating.replaceAll('_', ''));
	const properties = `'0xF': [${duration}/*duration*/, {instant: ${safeInstant}#instant\n}], '__proto__': {value: ${integer}, float: ${floating}}, label: '1h and 2024-01-01T00:00:00Z'`;
	const expectedObject = `{'0xF': [SomlDuration<${stringLiteral(duration)}>, {instant: SomlInstant<${stringLiteral(safeInstant)}> }]; '__proto__': {value: ${integerValue}n; float: ${floatValue}}; label: '1h and 2024-01-01T00:00:00Z'}`;
	const source = index % 3 === 0 ? `[${duration}, {${properties}}, ${safeInstant}]` : index % 3 === 1 ? `{${properties}}` : properties.replaceAll(", '__proto__':", "\n'__proto__':").replaceAll(", label:", '\nlabel:');
	const expected = index % 3 === 0 ? `[SomlDuration<${stringLiteral(duration)}>, ${expectedObject}, SomlInstant<${stringLiteral(safeInstant)}>]` : expectedObject;
	const value = parse(source);
	const canonical = stringify(value, {canonical: true});
	assertEqual(source, `Parse<${stringLiteral(source)}, {integers: 'bigint'}>`, expected);
	assertEqual(source, `Canonicalize<${stringLiteral(source)}>`, stringLiteral(canonical));
	assertEqual(source, `Canonicalize<${stringLiteral(source)}, {integers: 'bigint'}>`, stringLiteral(canonical));
}

for (const source of ['0h0m0.0000000001s', '-0h0m0s0.0ns', '1h0.0m0s', '1h0m0s0us0ms', '0h0m9223372036854775808ns', '0001-01-01T00:00:00.000000001+00:01', '9999-12-31T23:59:59.999999998-00:01', '2024-02-29T23:59:59.0000000000Z', '2024-02-29T23:59:59.0-00:00', '0x00_8000_0000_0000_0000', '-0b00_1', '1_0.0e0_1', '0.00_001e-999999']) {
	for (const document of [`{valid: [true, {delay: 1h}], bad: [false, {value: ${source}}]}`, `[2024-01-01T00:00:00Z, {value: ${source}}, 0s]`]) {
		let rejected = false;
		try {
			parse(document);
		} catch {
			rejected = true;
		}
		if (!rejected) {
			throw new Error(`Expected invalid source: ${document}`);
		}
		cases.push({label: document, assertion: `IsError<Parse<${stringLiteral(document)}>>`});
		cases.push({label: document, assertion: `IsError<Canonicalize<${stringLiteral(document)}>>`});
	}
}

console.log(`Generated ${cases.length - previousCount} composed temporal and numeric checks.`);

previousCount = cases.length;
const stringValues = [
	"'",
	'"',
	'\\',
	"'\\",
	"\\'",
	'\\"',
	'"\\',
	"\\'\\\"\\",
	"'''",
	'"""',
	"''\"'\"''",
	'\\\\\\\\',
	"'\\n'\\t'",
	'\n\t\n',
	'\t\n\t',
	"'\n\\\t\"",
	"\\\n\t'",
	' ',
	'  \t  ',
	'\n\n',
	'\t\t',
	'line\n\nline\n',
	'\\u{61}',
	'${number}',
	'# not a comment /* */',
	'[]{}:,-_+/',
	'ends with \\',
	'\\starts with',
];
for (const text of stringValues) {
	const key = `${text} prefix`;
	const value = Object.fromEntries([[key, {text, mirror: [text, '', text]}], ['prefix', {text: `${text}suffix`}]]);
	const expression = valueType(value);
	const canonical = stringLiteral(stringify(value, {canonical: true}));
	assertEqual(text, `Encode<${stringLiteral(text)}>`, stringLiteral(stringifyValue(text)));
	assertEqual(text, `Encode<${expression}, {canonical: true}>`, canonical);
	assertEqual(text, `Parse<Encode<${expression}>>`, expression);
	assertEqual(text, `Canonicalize<${canonical}>`, canonical);
}

console.log(`Generated ${cases.length - previousCount} string boundary encoding checks.`);

previousCount = cases.length;
for (const character of Array.from({length: 128}, (_, index) => String.fromCodePoint(index))) {
	if (!/[\u0000-\u0008\u000B-\u001F\u007F]/v.test(character)) {
		continue;
	}
	for (const source of [`#text${character}text\n[]`, `/*text${character}text*/{}`, `[true, /*text${character}text*/false]`, `{key: false#text${character}text\n}`, `key: /*text${character}text*/true`, `key: true\n#text${character}text`]) {
		try {
			parse(source);
		} catch {
			assertEqual(source, `Parse<${stringLiteral(source)}>`, "SomlError<'Raw control characters are not allowed'>");
			continue;
		}

		throw new Error('A raw control character was accepted by the oracle');
	}
}

for (const comment of ['#\\r\\0\\v\\t\\n\\\\\\"\n', '/*\\r\\0\\v\\t\\n\\\\\\"*/', '#"unterminated /* { [] true null\\\n', '/*"unterminated # { [] true null\\*/']) {
	for (const source of [`${comment}[true, false, null]`, `[${comment}true, false, null]`, `value:${comment}true`, `value: true ${comment}`, `{value: true, ${comment}other: false}`]) {
		checkParsing(source, true);
	}
}

const opaqueKeys = ['00', '-0', '1__0', '_1', '0x_FF', '0b2', '0o8', '1E10', '1e01', '-0xF', 'Infinity', 'NULL', 'falsefalse', 'NaN', 'undefined', 'nan', 'null', 'true', 'false', 'infinity', '-infinity'];
for (let index = 0; index < opaqueKeys.length; index++) {
	const first = opaqueKeys[index];
	const second = opaqueKeys[(index + 1) % opaqueKeys.length];
	for (const source of [`${first}: true\n${second}: null`, `{${first}: false, ${second}: true}`, `[{${first}: null}, {${second}: [false, true]}]`, `${first}: # : , /* ignored */\ntrue\n${second}: false`, `{${first}: /*[null]\n*/true# , ignored\n${second}: null}`, `${first}: {${second}: true}\n${second}: [null, false]`]) {
		checkParsing(source, true);
	}
}

for (const [left, right] of [['true', 'false'], ['false', 'null'], ['null', 'true'], ['{}', 'true'], ['[]', 'false'], ["'true'", 'null'], ['"false"', '{}']]) {
	for (const between of ['/*x*//*y*/', '/*a\nb*/#tail\n', '#tail\n/*a\nb*/', '/*a*/\n/*b*/', '/*a\nb*/,/*c\nd*/', '\n#tail\n,', '/*a*/#tail\n,']) {
		checkParsing(`{nested: [${left}${between}${right}], done: true}`, true);
		checkParsing(`{nested: {left: ${left}${between}right: ${right}}, done: false}`, true);
	}
}

console.log(`Generated ${cases.length - previousCount} comment control and opaque key checks.`);

previousCount = cases.length;
const keyPrefix = 'configuration'.repeat(24);
for (const suffixes of [['', 'a', 'aa'], ['', '\t', '\n'], ["'", '"', '\\'], ['0', '00', '1'], ['[]', '{}', ':']]) {
	const keys = suffixes.map(suffix => `${keyPrefix}${suffix}`);
	const value = Object.fromEntries(keys.map((key, index) => [key, {enabled: index !== 1, slots: [BigInt(index), null]}]));
	const expression = `{${keys.map((key, index) => `${stringLiteral(key)}: {enabled: ${index !== 1}; slots: [${index}n, null]}`).join('; ')}}`;
	assertEqual(keys.join(', '), `Encode<${expression}, {canonical: true}>`, stringLiteral(stringify(value, {canonical: true})));
	assertEqual(keys.join(', '), `Parse<Encode<${expression}>, {integers: 'bigint'}>`, expression);
}

console.log(`Generated ${cases.length - previousCount} long ASCII key ordering and roundtrip checks.`);

using temporaryDirectory = fs.mkdtempDisposableSync(path.join(os.tmpdir(), 'soml-typescript-types-stress-'));
const importPath = path.relative(temporaryDirectory.path, path.join(repositoryDirectory, 'index.js')).replaceAll(path.sep, '/');
const header = `import type {Canonicalize, Encode, Parse, SomlDate, SomlDuration, SomlError, SomlInstant} from ${stringLiteral(importPath)};
type Assert<Value extends true> = Value;
type Equal<First, Second> = (<Value>() => Value extends First ? 1 : 2) extends (<Value>() => Value extends Second ? 1 : 2) ? true : false;
type IsError<Value> = 0 extends (1 & Value) ? false : [Value] extends [never] ? false : [Value] extends [SomlError] ? true : false;
type IsValid<Value> = [Value] extends [never] ? false : [Extract<Value, SomlError>] extends [never] ? true : false;
type _ErrorAssertionRejectsAny = Assert<Equal<IsError<any>, false>>;
`;
const headerLineCount = header.split('\n').length;
const batchSize = 128;
let failedBatches = 0;
for (let offset = 0; offset < cases.length; offset += batchSize) {
	const batch = cases.slice(offset, offset + batchSize);
	const filename = path.join(temporaryDirectory.path, 'batch.ts');
	fs.writeFileSync(filename, header + batch.map((item, index) => `type Case${index} = Assert<${item.assertion}>;`).join('\n') + '\n');
	try {
		await execute(process.execPath, [compiler, '--ignoreConfig', '--strict', '--noEmit', '--target', 'ESNext', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--exactOptionalPropertyTypes', filename], {cwd: repositoryDirectory, timeout: 60_000, maxBuffer: 1024 * 1024});
	} catch (error) {
		failedBatches++;
		for (const line of `${error.stdout ?? ''}\n${error.stderr ?? ''}`.split('\n')) {
			if (line === '') {
				continue;
			}

			const location = /batch\.ts\((\d+),\d+\): (.+)/v.exec(line);
			const item = location ? batch[Number(location[1]) - headerLineCount] : undefined;
			console.error(item ? `${safeText(item.label)}: ${safeText(location[2])}` : safeText(line));
		}

		console.error(`Batch ${offset / batchSize + 1} failed: ${safeText(error.message)}`);
	}

	console.log(`Checked ${Math.min(offset + batchSize, cases.length)}/${cases.length} stress assertions.`);
}

if (failedBatches > 0) {
	process.exitCode = 1;
	console.error(`${failedBatches} stress batches failed.`);
} else {
	console.log(`All ${cases.length} stress assertions passed.`);
}
