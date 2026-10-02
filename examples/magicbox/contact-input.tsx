import { MagicBox } from '@minifield-labs/magicbox';
import type { MagicBoxExtractor } from '@minifield-labs/magicbox';
import '@minifield-labs/magicbox/styles.css';

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
  },
} as const;

export const extractEmail: MagicBoxExtractor<string, typeof schema> = async (text) => {
  const match = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.exec(text);
  if (!match) return [];

  return [{
    id: 'email-1',
    label: 'Email',
    start: match.index,
    end: match.index + match[0].length,
    value: match[0],
  }];
};

export default function ContactInput() {
  return (
    <MagicBox
      schema={schema}
      defaultValue="Send the invitation to robin@minifieldlabs.com."
      onExtract={extractEmail}
    />
  );
}
