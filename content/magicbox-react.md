---
title: React integration
description: Control the source text, supply extraction, and handle results.
group: MagicBox
order: 11
---

`MagicBox` accepts an extraction callback and supports controlled or uncontrolled text. Import the package stylesheet once in your application.

## The extraction interface

```typescript
type ExtractionContext<TSchema = unknown> = {
  signal: AbortSignal;
  schema?: TSchema;
};

type MagicBoxSpan<T = unknown> = {
  id: string;
  label: string;
  start: number;
  end: number;
  value?: T;
  confidence?: number | null;
  tone?: 'ember' | 'sage' | 'sky' | 'lilac';
};

type Extractor<T, TSchema> = (
  text: string,
  context: ExtractionContext<TSchema>,
) => Promise<readonly MagicBoxSpan<T>[]>;
```

Pass `context.signal` through to your extraction implementation. MagicBox cancels pending work when the source changes or the schema reference changes.

## Control the input

```tsx
import { useState } from 'react';
import { MagicBox } from '@minifield-labs/magicbox';
import type { MagicBoxExtractor } from '@minifield-labs/magicbox';
import '@minifield-labs/magicbox/styles.css';

export function ControlledInput({
  extract,
}: {
  extract: MagicBoxExtractor;
}) {
  const [text, setText] = useState('');

  return (
    <MagicBox
      value={text}
      onValueChange={setText}
      onExtract={extract}
      name="source"
      rows={8}
      maxLength={12000}
    />
  );
}
```

Use `defaultValue` for an uncontrolled input. `name` participates in the host’s form through the native textarea. MagicBox creates no nested form.

## Handle results and errors

`onResult(spans, text)` receives validated spans and their source after extraction. `onError(error)` receives extraction or span-validation failures.

Use `onSelectionChange(span)` to respond to field selection. `renderValue(span, source)` customizes the value presentation.

## Build a custom interface

```tsx
import { useMagicBox } from '@minifield-labs/magicbox/headless';
import type { MagicBoxExtractor } from '@minifield-labs/magicbox';

export function PlainExtractor({ extract }: { extract: MagicBoxExtractor }) {
  const box = useMagicBox({ onExtract: extract });

  return (
    <section>
      <label htmlFor="source">Source text</label>
      <textarea
        id="source"
        value={box.value}
        onChange={(event) => box.setValue(event.target.value)}
      />
      <button disabled={!box.canExtract} onClick={() => void box.extract()}>
        Extract
      </button>
      {box.status === 'extracting' && (
        <button onClick={box.cancel}>Cancel</button>
      )}
      {box.error && <p role="alert">{box.error.message}</p>}
      <ul>
        {box.spans.map((span) => (
          <li key={span.id}>
            {span.label}: {box.value.slice(span.start, span.end)}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

The controller exposes `idle`, `extracting`, `success`, and `error` status. It also exposes `edit`, `clear`, and `select(id)` for source and selection controls.

## Style the component

Set `theme` to `dark`, `light`, or `auto`. Set `unstyled` for your own stylesheet. Stable `data-part` attributes identify the component’s elements.

Use `labels` to replace interface strings. Use `textareaProps` for native textarea attributes and a ref for native textarea access.
