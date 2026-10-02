import { normalizeSpans } from '@minifield-labs/magicbox/spans';

const source = 'Hi 👋 Robin';
const spans = normalizeSpans(source, [{
  id: 'person',
  label: 'Person',
  start: 5,
  end: 10,
}], 'codepoint');

const person = spans[0];
if (!person) throw new Error('Expected a person span.');

console.log(source.slice(person.start, person.end));
// Robin
