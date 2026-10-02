---
title: React integration
description: Control the source text, supply extraction, and handle results.
group: MagicBox
order: 11
---

`MagicBox` accepts an extraction callback and supports controlled or uncontrolled text. Import the package stylesheet once in your application.

## The extraction interface

Import `MagicBoxExtractor<T, TSchema>` from `@minifield-labs/magicbox` to type your callback. It receives the source text and `ExtractionContext<TSchema>`, then resolves to a readonly array of `MagicBoxSpan<T>`.

`T` describes each span’s value. `TSchema` describes the schema passed to your extractor. See the [API reference](/magicbox-api/) for the public fields and component props.

Pass `context.signal` through to your extraction implementation. MagicBox cancels pending work when the source changes or the schema reference changes.

## Control the input

<!-- example: examples/magicbox/controlled-input.tsx -->

Use `defaultValue` for an uncontrolled input. `name` participates in the host’s form through the native textarea. MagicBox creates no nested form.

## Handle results and errors

`onResult(spans, text)` receives validated spans and their source after extraction. `onError(error)` receives extraction or span-validation failures.

Use `onSelectionChange(span)` to respond to field selection. `renderValue(span, source)` customizes the value presentation.

## Build a custom interface

<!-- example: examples/magicbox/plain-extractor.tsx -->

The controller exposes `idle`, `extracting`, `success`, and `error` status. It also exposes `edit`, `clear`, and `select(id)` for source and selection controls.

## Style the component

Set `theme` to `dark`, `light`, or `auto`. Set `unstyled` for your own stylesheet. Stable `data-part` attributes identify the component’s elements.

Use `labels` to replace interface strings. Use `textareaProps` for native textarea attributes and a ref for native textarea access.
