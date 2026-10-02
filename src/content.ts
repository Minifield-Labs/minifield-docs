import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import GithubSlugger from 'github-slugger';
import { createHighlighter } from 'shiki';
import githubDark from 'shiki/themes/github-dark.mjs';
import { documentationReferences, expandDocumentation } from '../scripts/documentation.mjs';

export type Doc = {
  slug: string;
  url: string;
  title: string;
  description: string;
  group: string;
  order: number;
  html: string;
  text: string;
  headings: { id: string; text: string; level: number }[];
};

export type SearchEntry = Pick<Doc, 'url' | 'title' | 'description' | 'group' | 'text'>;

const highlighter = createHighlighter({
  themes: [{
    ...githubDark,
    name: 'minifield-dark',
    tokenColors: [...(githubDark.tokenColors ?? []), {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#8b949e' },
    }],
  }],
  langs: ['tsx', 'typescript', 'javascript', 'json', 'bash', 'yaml', 'rust', 'python', 'text'],
});

// Authored repository Markdown is trusted input. Never accept remote content here.
export async function loadDocs(directory = join(process.cwd(), 'content')): Promise<Doc[]> {
  const highlight = await highlighter;
  const references = await documentationReferences();
  const docs = await Promise.all((await readdir(directory)).filter((name) => name.endsWith('.md')).map(async (file) => {
    const { data, content: authored } = matter(await readFile(join(directory, file), 'utf8'));
    const content = await expandDocumentation(authored, file, references);
    for (const field of ['title', 'description', 'group']) {
      if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${file}: missing ${field}`);
    }
    if (!Number.isInteger(data.order)) throw new Error(`${file}: order must be an integer`);
    const slug = file.replace(/\.md$/, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: invalid filename`);
    const headings: Doc['headings'] = [];
    const slugger = new GithubSlugger();
    let codeBlocks = 0;
    const markdown = new Marked({
      renderer: {
        heading({ tokens, depth }) {
          if (depth === 1) throw new Error(`${file}: use frontmatter for the page title`);
          const text = tokens.map((token) => ('text' in token ? token.text : '')).join('');
          const id = slugger.slug(text);
          headings.push({ id, text, level: depth });
          return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to ${escapeHtml(text)}">${this.parser.parseInline(tokens)}<span aria-hidden="true">#</span></a></h${depth}>`;
        },
        code({ text, lang }) {
          const language = lang?.split(' ')[0] || 'text';
          const filename = lang?.match(/\bfilename="([^"]+)"/)?.[1];
          if (language !== 'text' && !highlight.getLoadedLanguages().includes(language)) throw new Error(`${file}: unsupported language ${language}`);
          const label = `Code example ${++codeBlocks}: ${filename ?? `${language} for ${headings.at(-1)?.text ?? data.title}`}`;
          const html = highlight.codeToHtml(text, {
            lang: language,
            theme: 'minifield-dark',
            transformers: [{ pre(node) {
              node.properties.tabIndex = 0;
              node.properties.role = 'region';
              node.properties.ariaLabel = label;
            } }],
          });
          return `<div class="code-block"><div class="code-toolbar"><span>${escapeHtml(filename ?? language)}</span><button type="button" data-copy hidden aria-label="${escapeHtml(filename ? `Copy ${filename}` : 'Copy code')}">Copy</button></div>${html}</div>`;
        },
      },
    });
    return {
      slug, url: slug === 'overview' ? '/' : `/${slug}/`, title: data.title,
      description: data.description, group: data.group, order: data.order,
      html: await markdown.parse(content),
      text: content,
      headings,
    };
  }));
  docs.sort((a, b) => a.order - b.order);
  if (!docs.some((doc) => doc.slug === 'overview')) throw new Error('content/overview.md is required');
  if (new Set(docs.map((doc) => doc.order)).size !== docs.length) throw new Error('Page order values must be unique');
  return docs;
}

export function searchEntries(docs: Doc[]): SearchEntry[] {
  return docs.map(({ url, title, description, group, text }) => ({ url, title, description, group, text }));
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
