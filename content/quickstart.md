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

<!-- example: examples/magicbox/contact-input.tsx -->

Choose **Extract** to review the detected field. The span’s `start` and `end` refer to the exact string passed into the callback.

## Connect your extractor

`onExtract` receives the source text and a context containing `schema` and an `AbortSignal`. Return an array of spans. Forward the signal to your extraction adapter so edits and cancellation stop pending work.

Keep the schema object stable between renders. Replacing it cancels pending extraction and clears the current results.

Continue with [React integration](/magicbox-react/) and [source spans](/magicbox-spans/).
