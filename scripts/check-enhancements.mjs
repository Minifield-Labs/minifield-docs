import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';

// Exercise the shipped bundle through DOM events with a pending network request.
function element(properties = {}) {
  return {
    listeners: {}, attributes: {}, children: [], textContent: '',
    addEventListener(name, handler) { this.listeners[name] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; },
    removeAttribute(name) { delete this.attributes[name]; },
    replaceChildren() { this.children = []; },
    append(...children) { this.children.push(...children); },
    ...properties,
  };
}

const input = element({ value: '' });
const results = element();
const status = element();
const copyStatus = element();
const code = element({ textContent: 'const value = 1;' });
const copyButton = element({ hidden: true, attributes: { 'aria-label': 'Copy example.ts' }, closest: () => ({ querySelector: () => code }) });
const nodes = { '.search-dialog': element(), '#docs-search': input, '.search-results': results, '.search-status': status, '[data-close-search]': element(), '[data-copy-status]': copyStatus };
const headings = ['first', 'second', 'café'].map((id, index) => ({ id, top: 160 + index * 500, getBoundingClientRect() { return { top: this.top }; } }));
const links = headings.map(({ id }) => element({ hash: `#${encodeURIComponent(id)}` }));
let resetCopy;
let selectedCode;
let copiedText;
let clipboardBlocked = false;
const window = element({ innerWidth: 1440, innerHeight: 900, setTimeout: (callback) => { resetCopy = callback; }, getSelection: () => ({ removeAllRanges() {}, addRange() {} }) });
const document = element({
  querySelector: (selector) => nodes[selector],
  querySelectorAll: (selector) => ({ '.prose h2, .prose h3': headings, '.contents a': links, '[data-copy]': [copyButton] })[selector] ?? [],
  createElement: () => element(),
  createRange: () => ({ selectNodeContents: (node) => { selectedCode = node; } }),
});
const search = JSON.parse(await readFile('dist/search.json', 'utf8'));
let request;
let fetches = 0;
runInNewContext(await readFile('dist/assets/docs.js', 'utf8'), {
  document, window, navigator: { platform: 'MacIntel', clipboard: { async writeText(text) {
    if (clipboardBlocked) throw new Error('Clipboard unavailable');
    copiedText = text;
  } } },
  fetch: () => {
    fetches++;
    return new Promise((resolve, reject) => { request = { resolve, reject }; });
  },
});

function type(query) {
  input.value = query;
  input.listeners.input();
}

type('magicbox');
type('');
request.reject(new Error('Offline'));
await setImmediate();
assert.equal(status.textContent, 'Type to search the documentation.', 'A stale failure must preserve the empty-query state');
type('runtime');
request.reject(new Error('Offline'));
await setImmediate();
assert.match(status.textContent, /Search couldn’t load/, 'A current failure must show its error');
type('MagicBoxExtractor');
request.resolve({ ok: true, json: async () => search });
await setImmediate();
assert.ok(results.children.some((link) => link.href === '/magicbox-react/'), 'Retry must find an API from a code example');
assert.equal(fetches, 3, 'Each failed index request must allow a retry');

assert.equal(copyButton.hidden, false, 'Copy controls appear only after enhancement loads');
await copyButton.listeners.click();
assert.equal(copiedText, code.textContent);
assert.equal(copyStatus.textContent, 'Code copied to clipboard.');
assert.ok(copyButton.getAttribute('aria-label').includes(copyButton.textContent), 'Accessible name contains the visible success label');
resetCopy();
assert.equal(copyButton.getAttribute('aria-label'), 'Copy example.ts');
clipboardBlocked = true;
await copyButton.listeners.click();
assert.equal(selectedCode, code, 'Clipboard failure selects the source for manual copying');
assert.ok(copyButton.getAttribute('aria-label').includes(copyButton.textContent), 'Accessible name contains the visible fallback label');
assert.match(copyStatus.textContent, /Code selected/);
resetCopy();

headings.forEach((heading) => { heading.top -= 596; });
window.listeners.scroll();
assert.equal(links[1].attributes['aria-current'], 'location', 'A fragment landing at 64px must select its section');
assert.equal(links[0].attributes['aria-current'], undefined);
headings.forEach((heading) => { heading.top -= 500; });
window.listeners.scroll();
assert.equal(links[2].attributes['aria-current'], 'location', 'Encoded fragments must select their section');
headings.forEach((heading) => { heading.top += 500; });
window.listeners.resize();
assert.equal(links[1].attributes['aria-current'], 'location', 'Resizing must recalculate the current section');
assert.equal(links[2].attributes['aria-current'], undefined);
console.log('Checked search recovery, accessible copy states, and contents tracking across fragment jumps and resize.');
