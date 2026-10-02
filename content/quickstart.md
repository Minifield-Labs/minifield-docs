---
title: Quickstart
description: Connect a React textbox to an extraction function.
group: Start here
order: 1
---

MagicBox gives you a source editor, highlighted spans, and field details. Your application supplies the extraction function.

## Install MagicBox

Use React 18.3 or 19 in your application.

```bash
npm install @minifield-labs/magicbox
```

## Render the textbox

This complete example extracts an email address with a local pattern. You can run it immediately, then replace `extractEmail` with your model adapter.

```tsx
import { MagicBox } from '@minifield-labs/magicbox';
import type { MagicBoxSpan } from '@minifield-labs/magicbox';
import '@minifield-labs/magicbox/styles.css';

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
  },
} as const;

async function extractEmail(text: string): Promise<MagicBoxSpan<string>[]> {
  const match = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.exec(text);
  if (!match) return [];

  return [{
    id: 'email-1',
    label: 'Email',
    start: match.index,
    end: match.index + match[0].length,
    value: match[0],
  }];
}

export default function ContactInput() {
  return (
    <MagicBox
      schema={schema}
      defaultValue="Send the invitation to robin@minifieldlabs.com."
      onExtract={extractEmail}
    />
  );
}
```

Choose **Extract** to review the detected field. The span’s `start` and `end` refer to the exact string passed into the callback.

## Connect your extractor

`onExtract` receives the source text and a context containing `schema` and an `AbortSignal`. Return an array of spans. Forward the signal to your extraction adapter so edits and cancellation stop pending work.

Keep the schema object stable between renders. Replacing it cancels pending extraction and clears the current results.

Continue with [React integration](/magicbox-react/) and [source spans](/magicbox-spans/).
