---
title: MagicBox
description: Free text in. Typed data out.
group: MagicBox
order: 10
---

MagicBox is a React textbox for reviewing extracted data alongside its source. Users enter text, run extraction, and move between highlighted spans and a numbered field rail.

## Add it to your product

```bash
npm install @minifield-labs/magicbox
```

Import `MagicBox` and its stylesheet, then provide `onExtract`. The callback returns fields with source offsets. Your application chooses the schema and extraction implementation.

The [quickstart](/quickstart/) includes a complete working example. [React integration](/magicbox-react/) covers controlled inputs and the headless hook.

## Source and fields stay connected

Each extracted field has an ID, label, and source range. MagicBox uses that range to highlight the exact text and connect it to the field’s detail card.

Optional values let you show normalized data while preserving what the user wrote. Optional tones and confidence values affect presentation.

Read [source spans](/magicbox-spans/) for offsets, overlaps, and validation.

## Choose your presentation

Use the supplied CSS for MagicBox’s document pane, numbered extraction rail, and bottom-anchored detail card. Fonts inherit from the embedding application.

Set `unstyled` to supply your own CSS. Use `useMagicBox` from the headless entry for a custom interface with the same extraction state.

## Explore the interface

Open the [MagicBox preview](https://minifieldlabs.com/magicbox-demo) to inspect source selection and field navigation. Browse the [MagicBox repository](https://github.com/Minifield-Labs/minifield-magicbox) for the package source.
