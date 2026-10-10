import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const executeFile = promisify(execFile);
const directory = path.dirname(import.meta.dirname);
const compiler = path.join(directory, 'node_modules/typescript/bin/tsc');
await using temporary = await fs.mkdtempDisposable(path.join(os.tmpdir(), 'soml-typescript-types-benchmark-'));
const repositoryImportPath = path.relative(temporary.path, directory).replaceAll(path.sep, '/');
const configuration = path.join(temporary.path, 'tsconfig.json');
await fs.writeFile(configuration, JSON.stringify({compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, target: 'ESNext', module: 'NodeNext', moduleResolution: 'NodeNext', types: []}, files: ['./consumer.ts']}));

const prelude = `import type {Parse, Encode} from ${JSON.stringify(`${repositoryImportPath}/index.js`)};
import type {Small, Medium, Boundary, Realistic, Deep} from ${JSON.stringify(`${repositoryImportPath}/benchmark/values.js`)};
type Equal<First, Second> = [First] extends [Second] ? [Second] extends [First] ? true : false : false;
type Assert<Value extends true> = Value;
type IsLiteralString<Value> = [Value] extends [never] ? false : Value extends string ? string extends Value ? false : true : false;
`;

function diagnostic(output, name) {
	const value = output.match(new RegExp(`^${name}:\\s+(\\d+)`, 'm'));
	if (!value) {
		throw new Error(`Compiler did not report ${name}`);
	}

	return Number(value[1]);
}

async function measure(name, source) {
	const file = path.join(temporary.path, 'consumer.ts');
	await fs.writeFile(file, `${prelude}${source}`);
	const start = performance.now();
	let output;
	try {
		({stdout: output} = await executeFile(process.execPath, [compiler, '--project', configuration, '--pretty', 'false', '--extendedDiagnostics'], {cwd: directory}));
	} catch (error) {
		throw new Error(`Benchmark ${name} failed: ${(error.stdout ?? error.message).replaceAll(/[\u{0}-\u{1F}\u{7F}-\u{9F}]/gv, ' ')}`);
	}

	return {
		instantiations: diagnostic(output, 'Instantiations'),
		'wall ms': Math.round(performance.now() - start),
		'memory MiB': (diagnostic(output, 'Memory used') / 1024).toFixed(1),
	};
}

const {stdout: version} = await executeFile(process.execPath, [compiler, '--version'], {cwd: directory});
console.log(`TypeScript ${version.trim().replace('Version ', '')}; Node.js ${process.versions.node}`);
const baseline = await measure('baseline', 'export {};\n');
const results = [{case: 'baseline', 'UTF-16 units': 0, ...baseline, 'extra instantiations': 0}];
for (const fixture of ['small', 'medium', 'boundary', 'realistic', 'deep']) {
	const source = await fs.readFile(path.join(import.meta.dirname, 'fixtures', `${fixture}.soml`), 'utf8');
	const value = `${fixture[0].toUpperCase()}${fixture.slice(1)}`;
	for (const operation of ['parse', 'compact encode', 'canonical encode']) {
		const assertion = operation === 'parse'
			? `type Checked = Assert<Equal<Parse<${JSON.stringify(source)}>, ${value}>>;\n`
			: `type Encoded = Encode<${value}${operation === 'canonical encode' ? ', {canonical: true}' : ''}>;\ntype Checked = Assert<IsLiteralString<Encoded>>;\ntype RoundTrip = Parse<Encoded & string>;\ntype CheckedRoundTrip = Assert<${operation === 'canonical encode' ? 'Equal<Encode<RoundTrip, {canonical: true}>, Encoded>' : `Equal<RoundTrip, ${value}>`}>;\n`;
		const measurements = await measure(`${fixture}-${operation}`, assertion);
		results.push({case: `${fixture} ${operation}`, 'UTF-16 units': source.length, ...measurements, 'extra instantiations': measurements.instantiations - baseline.instantiations});
	}
}

console.table(results);
