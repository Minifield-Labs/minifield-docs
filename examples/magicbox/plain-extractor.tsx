import { useId } from 'react';
import { useMagicBox } from '@minifield-labs/magicbox/headless';
import type { MagicBoxExtractor } from '@minifield-labs/magicbox';

export function PlainExtractor({ extract }: { extract: MagicBoxExtractor }) {
  const sourceId = useId();
  const box = useMagicBox({ onExtract: extract });

  return (
    <section>
      <label htmlFor={sourceId}>Source text</label>
      <textarea
        id={sourceId}
        value={box.value}
        onChange={(event) => box.setValue(event.target.value)}
      />
      <button type="button" disabled={!box.canExtract} onClick={() => void box.extract()}>
        Extract
      </button>
      {box.status === 'extracting' && (
        <button type="button" onClick={box.cancel}>Cancel</button>
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
