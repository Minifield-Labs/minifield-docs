import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { Marked } from 'marked';
import { documentationReferences, expandDocumentation } from './documentation.mjs';

const references = await documentationReferences();
assert.match(references['magicbox-props'], /onExtract.*Yes/, 'Inherited extractor is required');
assert.match(references['magicbox-props'], /onValueChange.*No/, 'Inherited callback stays optional');
assert.match(references['magicbox-controller'], /extract.*Promise/, 'Controller includes the async action');
assert.match(references['magicbox-span'], /confidence.*null/, 'Span includes its nullable confidence');
assert.match(references['training-packed-sft'], /18446744073709551615/, 'uint64 bounds stay exact');
assert.match(references['training-packed-sft'], /rows_per_microbatch.*Required/);
assert.match(references['training-qat-objective'], /absmax.*absmean.*null/);
assert.match(references['training-limits'], /max_steps.*null/);

const examples = new Set();
const usedReferences = new Set();
const markdown = new Marked();
for (const file of (await readdir('content')).filter(file => file.endsWith('.md'))) {
  const authored = await readFile(`content/${file}`, 'utf8');
  const expanded = await expandDocumentation(authored, file, references);
  assert.doesNotMatch(expanded, /<!-- (?:example|reference):/, `${file}: unresolved directive`);
  const tokens = markdown.lexer(expanded);
  for (const [, path] of authored.matchAll(/^<!-- example: (.+) -->$/gm)) {
    examples.add(path);
    const source = (await readFile(path, 'utf8')).trimEnd();
    assert.ok(tokens.some(token => token.type === 'code' && token.text === source), `${file}: exact example ${path}`);
  }
  for (const [, name] of authored.matchAll(/^<!-- reference: (.+) -->$/gm)) usedReferences.add(name);
}
assert.equal(examples.size, 6, 'All 4 React/TypeScript and 2 JSON examples are published');
assert.deepEqual([...usedReferences].sort(), Object.keys(references).sort(), 'Every generated table is published');
await assert.rejects(expandDocumentation('<!-- reference: missing -->', 'fixture.md', references), /unknown reference/);
await assert.rejects(expandDocumentation('<!-- example: examples/../../package.json -->', 'fixture.md', references), /invalid example path/);

const schema = JSON.parse(await readFile('contracts/training/v12.0.0/job.schema.json', 'utf8'));
const ajv = new Ajv2020({ allErrors: true });
ajv.addSchema(schema);
for (const [file, definition, invalid] of [
  ['packed-sft-training.json', 'PackedSftTraining', { rows_per_microbatch: 0 }],
  ['packed-evaluation.json', 'EvaluationV10', { every_steps: 0 }],
]) {
  const value = JSON.parse(await readFile(`examples/training/${file}`, 'utf8'));
  const validate = ajv.getSchema(`${schema.$id}#/$defs/${definition}`);
  assert.ok(validate, `${definition}: schema is available`);
  assert.ok(validate(value), `${file}: ${ajv.errorsText(validate.errors)}`);
  assert.equal(validate({ ...value, ...invalid }), false, `${file}: invalid numerical settings fail`);
  assert.equal(validate({ ...value, invented_field: true }), false, `${file}: unknown fields fail`);
}
console.log(`Checked ${examples.size} exact source examples, schema validation, and ${usedReferences.size} generated reference tables.`);
