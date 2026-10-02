import { readFile, realpath } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';
import { magicboxReferences } from './magicbox-reference.mjs';
import { trainingReferences } from './training-reference.mjs';

/** Load pinned contracts once per content compilation. */
export async function documentationReferences() {
  return { ...await magicboxReferences(), ...await trainingReferences() };
}

/**
 * Expand authored source references before Markdown parsing and search indexing.
 * @param {string} markdown
 * @param {string} file
 * @param {Record<string, string>} references
 * @param {string} root
 */
export async function expandDocumentation(markdown, file, references, root = process.cwd()) {
  const directive = /^<!-- (example|reference): ([^\r\n]+) -->[ \t]*$/gm;
  let expanded = '';
  let cursor = 0;
  for (const match of markdown.matchAll(directive)) {
    expanded += markdown.slice(cursor, match.index);
    const [, kind, name] = match;
    if (kind === 'reference') {
      if (!Object.hasOwn(references, name)) throw new Error(`${file}: unknown reference ${name}`);
      expanded += references[name];
    } else {
      if (!/^examples\/[a-z0-9/_-]+\.(?:tsx?|json)$/.test(name)) {
        throw new Error(`${file}: invalid example path ${name}`);
      }
      const exampleRoot = await realpath(resolve(root, 'examples'));
      const path = await realpath(resolve(root, name));
      const inside = relative(exampleRoot, path);
      if (inside.startsWith('..') || inside.startsWith('/')) throw new Error(`${file}: example escapes examples/`);
      const code = await readFile(path, 'utf8');
      const language = { '.ts': 'typescript', '.tsx': 'tsx', '.json': 'json' }[extname(path)];
      const fence = '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map(([run]) => run.length + 1)));
      expanded += `${fence}${language} filename="${basename(name)}"\n${code.trimEnd()}\n${fence}`;
    }
    cursor = match.index + match[0].length;
  }
  return expanded + markdown.slice(cursor);
}
