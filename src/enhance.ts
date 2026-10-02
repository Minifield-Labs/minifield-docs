import './styles.css';
import type { SearchEntry } from './content';

const dialog = document.querySelector<HTMLDialogElement>('.search-dialog')!;
const input = document.querySelector<HTMLInputElement>('#docs-search')!;
const results = document.querySelector<HTMLElement>('.search-results')!;
const status = document.querySelector<HTMLElement>('.search-status')!;
let index: Promise<SearchEntry[]> | undefined;

async function search() {
  results.replaceChildren();
  const query = input.value.trim().toLocaleLowerCase();
  if (!query) {
    status.textContent = 'Type to search the documentation.';
    return;
  }
  status.textContent = 'Searching documentation…';
  try {
    index ??= fetch('/search.json').then(async (response) => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json() as Promise<SearchEntry[]>;
    });
    const pages = await index;
    if (input.value.trim().toLocaleLowerCase() !== query) return;
    const words = query.split(/\s+/);
    const matches = pages.filter((page) => words.every((word) => `${page.title} ${page.description} ${page.text}`.toLocaleLowerCase().includes(word)))
      .sort((a, b) => score(b, words) - score(a, words)).slice(0, 8);
    results.replaceChildren();
    for (const page of matches) {
      const link = document.createElement('a');
      link.href = page.url;
      const group = document.createElement('span');
      group.textContent = page.group;
      const title = document.createElement('strong');
      title.textContent = page.title;
      const description = document.createElement('p');
      description.textContent = page.description;
      link.append(group, title, description);
      results.append(link);
    }
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}.` : `No results for “${input.value.trim()}”. Try a product name or another term.`;
  } catch {
    index = undefined;
    if (input.value.trim().toLocaleLowerCase() !== query) return;
    status.textContent = 'Search couldn’t load. Try again or browse the documentation.';
  }
}

function score(page: SearchEntry, words: string[]) {
  return words.reduce((total, word) => total + (page.title.toLocaleLowerCase().includes(word) ? 10 : 0) + (page.description.toLocaleLowerCase().includes(word) ? 3 : 0), 0);
}

function openSearch() {
  if (!dialog.open) dialog.showModal();
  input.focus();
  void search();
}

document.querySelectorAll<HTMLButtonElement>('[data-open-search]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', openSearch);
});
if (!/Mac|iPhone|iPad/.test(navigator.platform)) document.querySelector('[data-shortcut]')!.textContent = 'Ctrl K';
document.querySelector('[data-close-search]')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
input.addEventListener('input', () => { void search(); });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openSearch();
  }
});
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
    return;
  }
  const links = [...results.querySelectorAll<HTMLAnchorElement>('a')];
  if (!links.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const selected = links.findIndex((link) => link === document.activeElement);
  const next = selected + (event.key === 'ArrowDown' ? 1 : -1);
  if (next < 0) input.focus();
  else links[Math.min(next, links.length - 1)].focus();
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.hidden = false;
  const label = button.getAttribute('aria-label')!;
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block')!.querySelector('code')!;
    const copyStatus = document.querySelector('[data-copy-status]')!;
    copyStatus.textContent = '';
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      button.textContent = 'Copied';
      copyStatus.textContent = 'Code copied to clipboard.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      button.textContent = 'Selected';
      copyStatus.textContent = 'Code selected. Use your keyboard to copy.';
    }
    button.setAttribute('aria-label', `${button.textContent}. ${label}`);
    window.setTimeout(() => {
      button.textContent = 'Copy';
      button.setAttribute('aria-label', label);
    }, 1800);
  });
});

const headings = [...document.querySelectorAll<HTMLElement>('.prose h2, .prose h3')];
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.contents a')];
function updateContents() {
  // Heading links land 64px from the top after scroll padding and margin.
  const active = headings.filter((heading) => heading.getBoundingClientRect().top <= 80).at(-1) ?? headings[0];
  if (!active) return;
  for (const link of tocLinks) {
    if (decodeURIComponent(link.hash.slice(1)) === active.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', updateContents, { passive: true });
window.addEventListener('resize', updateContents);
updateContents();
