import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import test from 'node:test';

const execute = promisify(execFile);
const repositoryDirectory = path.resolve(import.meta.dirname, '..');

const checkFixture = async (source, model, canonical, expectedCode) => {
	await using temporaryDirectory = await fs.mkdtempDisposable(path.join(os.tmpdir(), 'soml-typescript-types-conformance-test-'));
	const validDirectory = path.join(temporaryDirectory.path, 'valid');
	await fs.mkdir(validDirectory);
	await Promise.all([
		fs.writeFile(path.join(validDirectory, 'value.soml'), source),
		fs.writeFile(path.join(validDirectory, 'value.json'), JSON.stringify(model)),
		fs.writeFile(path.join(validDirectory, 'value.canonical.soml'), canonical),
	]);

	let code = 0;
	let output;
	try {
		const result = await execute(process.execPath, [path.join(import.meta.dirname, 'conformance.js'), temporaryDirectory.path], {cwd: repositoryDirectory, timeout: 60_000});
		output = result.stdout;
	} catch (error) {
		if (error.code !== 1) {
			throw error;
		}

		code = error.code;
		output = `${error.stdout}\n${error.stderr}`;
	}

	assert.equal(code, expectedCode, output);
};

const roundedFloat = {type: 'float', value: '0.1'};
const trueValue = {type: 'bool', value: 'true'};
const falseValue = {type: 'bool', value: 'false'};
const original = 'enabled: true\nmeasurement: 0.10000000000000001\n';

test('accepts a correctly modeled rounded float', () => checkFixture(original, {enabled: trueValue, measurement: roundedFloat}, 'enabled: true\nmeasurement: 0.1\n', 0));
test('a rounded float cannot hide an incorrect boolean', () => checkFixture(original, {enabled: falseValue, measurement: roundedFloat}, 'enabled: false\nmeasurement: 0.1\n', 1));
test('a rounded float cannot hide a missing property', () => checkFixture(original, {measurement: roundedFloat}, 'measurement: 0.1\n', 1));
test('a rounded float cannot hide an extra property', () => checkFixture(original, {enabled: trueValue, extra: falseValue, measurement: roundedFloat}, 'enabled: true\nextra: false\nmeasurement: 0.1\n', 1));
test('a rounded float cannot hide an incorrect known float', () => checkFixture('known: 1.25\nmeasurement: 0.10000000000000001\n', {known: {type: 'float', value: '2.5'}, measurement: roundedFloat}, 'known: 2.5\nmeasurement: 0.1\n', 1));
test('a rounded float cannot hide an incorrect integer', () => checkFixture('count: 0x7FFFFFFFFFFFFFFF\nmeasurement: 0.10000000000000001\n', {count: {type: 'int', value: '9223372036854775806'}, measurement: roundedFloat}, 'count: 9223372036854775806\nmeasurement: 0.1\n', 1));
test('a rounded float cannot hide an incorrect array length', () => checkFixture('measurement: 0.10000000000000001\nvalues: [true, false]\n', {measurement: roundedFloat, values: [trueValue]}, 'measurement: 0.1\nvalues: [\n\ttrue\n]\n', 1));
test('a rounded float cannot hide an object modeled as an empty array', () => checkFixture('measurement: 0.10000000000000001\nvalues: {length: 0.0}\n', {measurement: roundedFloat, values: []}, 'measurement: 0.1\nvalues: []\n', 1));
test('a rounded float permits normalization of temporal leaves', () => checkFixture('duration: 1ms\ninstant: 2000-01-01T01:00:00+01:00\nmeasurement: 0.10000000000000001\n', {duration: {type: 'duration', value: '1000000'}, instant: {type: 'instant', value: '2000-01-01T00:00:00Z'}, measurement: roundedFloat}, 'duration: 0.001s\ninstant: 2000-01-01T00:00:00Z\nmeasurement: 0.1\n', 0));
test('a rounded float cannot hide an incorrect temporal value', () => checkFixture('duration: 1ms\nmeasurement: 0.10000000000000001\n', {duration: {type: 'duration', value: '2000000'}, measurement: roundedFloat}, 'duration: 0.002s\nmeasurement: 0.1\n', 1));
test('a rounded float cannot hide an incorrect string', () => checkFixture("measurement: 0.10000000000000001\nname: 'actual'\n", {measurement: roundedFloat, name: {type: 'string', value: 'expected'}}, "measurement: 0.1\nname: 'expected'\n", 1));
test('a rounded float cannot hide an incorrect null', () => checkFixture('measurement: 0.10000000000000001\nvalue: null\n', {measurement: roundedFloat, value: falseValue}, 'measurement: 0.1\nvalue: false\n', 1));
test('retains the unsupported Unicode escape diagnostic', () => checkFixture('measurement: 0.1\nname: "\\u{41}"\n', {measurement: roundedFloat, name: {type: 'string', value: 'A'}}, "measurement: 0.1\nname: 'A'\n", 0));

// The object root and 99 arrays exercise the documented collection depth limit.
let nestedModel = trueValue;
let nestedSource = 'true';
let nestedCanonical = 'true';
for (let depth = 0; depth < 99; depth++) {
	nestedModel = [nestedModel];
	nestedSource = `[${nestedSource}]`;
	nestedCanonical = `[\n${nestedCanonical.split('\n').map(line => `\t${line}`).join('\n')}\n]`;
}

test('checks rounded floats at 100 collection levels', () => checkFixture(`measurement: 0.10000000000000001\nvalues: ${nestedSource}\n`, {measurement: roundedFloat, values: nestedModel}, `measurement: 0.1\nvalues: ${nestedCanonical}\n`, 0));
