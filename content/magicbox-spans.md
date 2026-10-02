---
title: Source spans
description: Keep every extracted field tied to the exact text the user wrote.
group: MagicBox
order: 12
---

MagicBox expects half-open source ranges: `start` is included and `end` is excluded. By default, offsets use JavaScript’s UTF-16 indexing.

## Return a field

For `Email robin@minifieldlabs.com`, the email begins at offset `6` and ends at offset `29`.

```json
[
  {
    "id": "contact-email",
    "label": "Email",
    "start": 6,
    "end": 29,
    "value": "robin@minifieldlabs.com"
  }
]
```

Use `text.slice(start, end)` to recover the source. Keep offsets tied to the original callback text when you normalize the extracted value.

## Validate the result

Each span needs a unique, nonempty `id` and a nonempty `label`. Offsets must be integers within the source, with `end > start`.

Confidence, when present, must be finite and between `0` and `1`. Tones must be `ember`, `sage`, `sky`, or `lilac`. A range must preserve complete Unicode characters.

MagicBox validates the returned array, copies and freezes spans, and normalizes their offsets.

## Work with Unicode

JavaScript indexes strings in UTF-16 code units. An emoji can occupy 2 code units. Extractors that count Unicode code points can set `offsetUnit="codepoint"` so MagicBox converts their ranges.

```typescript
import { normalizeSpans } from '@minifield-labs/magicbox/spans';

const source = 'Hi 👋 Robin';
const spans = normalizeSpans(source, [{
  id: 'person',
  label: 'Person',
  start: 5,
  end: 10,
}], 'codepoint');

console.log(source.slice(spans[0].start, spans[0].end));
// Robin
```

## Present overlapping fields

Overlapping ranges can represent different fields in the same source. MagicBox segments the source around their boundaries and preserves the host’s span order within overlaps.

Use `segmentSource` from the spans entry when building your own highlighted source display. It accepts validated UTF-16 spans and returns source segments with their active field IDs.
