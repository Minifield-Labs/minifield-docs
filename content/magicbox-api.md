---
title: API reference
description: Component props, controller methods, and extracted source spans.
group: MagicBox
order: 13
---

Use `MagicBox` for the complete interface or `useMagicBox` for your own controls. Both share the same extraction and source-span types.

## MagicBoxProps

`T` is the extracted value type. `TSchema` is the schema you pass to your extractor. See [React integration](/magicbox-react/) for controlled input and result handling.

<!-- reference: magicbox-props -->

## MagicBoxController

`useMagicBox` returns the current source, extraction state, results, and controls. Use `canExtract` to enable the extraction button.

<!-- reference: magicbox-controller -->

## MagicBoxSpan

Each span links an extracted field to its source text. Use `text.slice(start, end)` to read the original value. See [Source spans](/magicbox-spans/) for offset validation and Unicode handling.

<!-- reference: magicbox-span -->
