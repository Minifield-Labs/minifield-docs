import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const annotations = ['title', 'description', 'default'];

function keys(node, allowed) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new Error('Training reference requires an object schema');
  }
  for (const key of Object.keys(node)) {
    if (![...annotations, ...allowed].includes(key)) {
      throw new Error(`Unsupported training reference keyword: ${key}`);
    }
  }
}

function objectSchema(node) {
  keys(node, ['type', 'properties', 'required', 'additionalProperties']);
  if (node.type !== 'object' || node.additionalProperties !== false ||
      !node.properties || typeof node.properties !== 'object' || Array.isArray(node.properties)) {
    throw new Error('Training reference requires fixed object properties');
  }
  if (node.required !== undefined && (!Array.isArray(node.required) ||
      node.required.some(field => typeof field !== 'string' || !Object.hasOwn(node.properties, field)))) {
    throw new Error('Invalid required fields in training reference');
  }
  return node;
}

function literal(value) {
  if (typeof value === 'bigint') return value.toString();
  if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
    throw new Error('Training reference requires a scalar literal');
  }
  return JSON.stringify(value);
}

function escape(value) {
  return String(value).replace(/[&<>|`\r\n]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '|': '&#124;', '`': '&#96;',
    '\r': '&#13;', '\n': '&#10;',
  })[character]);
}

function code(value) {
  return `<code>${escape(value)}</code>`;
}

function describe(schema, node, references = []) {
  if (node.$ref) {
    keys(node, ['$ref']);
    const match = /^#\/\$defs\/([A-Za-z0-9_]+)$/.exec(node.$ref);
    if (!match || !Object.hasOwn(schema.$defs, match[1]) || references.includes(node.$ref)) {
      throw new Error(`Unsupported training reference: ${node.$ref}`);
    }
    return describe(schema, schema.$defs[match[1]], [...references, node.$ref]);
  }
  if (node.anyOf) {
    keys(node, ['anyOf']);
    if (!Array.isArray(node.anyOf) || node.anyOf.length < 2) {
      throw new Error('Training reference requires at least two union branches');
    }
    return node.anyOf.map(branch => describe(schema, branch, references)).join(' or ');
  }
  if (node.type === 'object') {
    objectSchema(node);
    return `object${node.title ? ` (${escape(node.title)})` : ''}`;
  }
  keys(node, ['type', 'const', 'enum', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum']);
  if (!['string', 'integer', 'number', 'boolean', 'null'].includes(node.type)) {
    throw new Error(`Unsupported training reference type: ${node.type}`);
  }
  let type = node.type;
  if (Object.hasOwn(node, 'const')) type = code(literal(node.const));
  if (node.enum) {
    if (!Array.isArray(node.enum) || node.enum.length === 0 || Object.hasOwn(node, 'const')) {
      throw new Error('Unsupported training reference enum');
    }
    type = node.enum.map(value => code(literal(value))).join(' or ');
  }
  const bounds = [];
  for (const [key, operator] of [
    ['minimum', '≥'], ['exclusiveMinimum', '>'], ['maximum', '≤'], ['exclusiveMaximum', '<'],
  ]) {
    if (!Object.hasOwn(node, key)) continue;
    if (!['integer', 'number'].includes(node.type) || !['number', 'bigint'].includes(typeof node[key])) {
      throw new Error(`Invalid training reference bound: ${key}`);
    }
    bounds.push(`${escape(operator)} ${literal(node[key])}`);
  }
  return `${type}${bounds.length ? ` (${bounds.join(', ')})` : ''}`;
}

function rows(schema, definition, fields, prefix = '') {
  const node = objectSchema(schema.$defs[definition]);
  return (fields ?? Object.keys(node.properties)).map(field => {
    if (!Object.hasOwn(node.properties, field)) {
      throw new Error(`Unknown training reference field: ${definition}.${field}`);
    }
    const property = node.properties[field];
    const value = node.required?.includes(field) ? 'Required'
      : Object.hasOwn(property, 'default') ? code(literal(property.default)) : 'Optional';
    return `| ${code(prefix + field)} | ${describe(schema, property)} | ${value} |`;
  });
}

function table(lines) {
  return ['| Field | Type | Default |', '| --- | --- | --- |', ...lines].join('\n');
}

async function readSchema(version, manifest) {
  const path = `contracts/training/v${version}/job.schema.json`;
  const entries = manifest.files.filter(file => file.path === path);
  if (entries.length !== 1) throw new Error(`Missing or duplicate training schema pin: ${path}`);
  const bytes = await readFile(new URL(`../${path}`, import.meta.url));
  if (createHash('sha256').update(bytes).digest('hex') !== entries[0].sha256) {
    throw new Error(`Training schema checksum mismatch: ${path}`);
  }
  // Keep uint64 range limits exact when JavaScript cannot represent them as numbers.
  return JSON.parse(bytes.toString('utf8'), (_key, value, context) => {
    if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
      return BigInt(context.source);
    }
    return value;
  });
}

export async function trainingReferences() {
  const manifest = JSON.parse(await readFile(new URL('../contracts/training/manifest.json', import.meta.url), 'utf8'));
  const [sft, qat] = await Promise.all(['12.0.0', '13.0.0'].map(version => readSchema(version, manifest)));
  return {
    'training-packed-sft': table(rows(sft, 'PackedSftTraining')),
    'training-qat-objective': table(rows(qat, 'PackedSftQatTraining', [
      'distill_weight', 'distill_temperature', 'ce_weight', 'scale_rule',
    ])),
    'training-optimizer': table(rows(sft, 'Optimizer')),
    'training-evaluation': table([
      ...rows(sft, 'EvaluationV10'), ...rows(sft, 'RoutineEvaluation', undefined, 'routine.'),
    ]),
    'training-limits': table(rows(sft, 'PackedSftLimits')),
  };
}
