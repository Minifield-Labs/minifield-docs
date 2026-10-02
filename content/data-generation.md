---
title: Data generation
description: Expand authored trajectories into seeded training records.
group: Models and data
order: 50
---

Minifield’s Rust generator combines a product catalog with an authored trajectory. It samples typed variables, selects saved trigger wording, generates tool results from declared schemas, and writes OpenAI-compatible message records.

## Generate a preview

Use Rust `1.89` or newer in the data-generation repository.

```bash
cargo build --locked --release --bin minifield-generate
mkdir -p /tmp/minifield-docs-preview
target/release/minifield-generate \
  examples/catalog.yaml \
  examples/trigger-variants.yaml \
  --samples 3 \
  --seed 42 \
  --output /tmp/minifield-docs-preview/samples.jsonl
```

The parent directory must exist, and the output filename must be new. Each JSONL line contains one training record.

## Author the catalog

The catalog holds the system instruction, full tool list, parameter schemas, and `returns` schemas. Put product-wide tool definitions here.

A trajectory carries its variables, entry request, ordered calls, optional follow-up turns, and completion. Every called tool must exist in the catalog.

## Author a trajectory

This trajectory uses `modify` from the repository’s example catalog:

```yaml
seed: 42
variables:
  WIDTH:
    type: decimal
    min: 20
    max: 80
    step: 0.5
trigger:
  - "Set obj-panel width to {{WIDTH}}cm"
  - "Make obj-panel {{WIDTH}}cm wide"
trajectory:
  resize:
    tool: modify
    arguments:
      object: obj-panel
      property: width
      value: "{{WIDTH}}"
completion: "Set the width to {{WIDTH}}cm."
```

A whole-field placeholder preserves its sampled type. A placeholder inside surrounding text becomes text. Trigger lists choose wording without changing the parameter draws.

## Reproduce a chunk

```bash
target/release/minifield-generate \
  examples/catalog.yaml examples/resize.yaml \
  --samples 100 --start 500 --seed 42
```

The seed and sample index make each record reproducible. Record input checksums, generator identity, seed, start, count, and format with the output.

Split related case families before augmentation. Keep their parameters and paraphrases in the same dataset split.

## Embed the generator

The native library exposes `Catalog` and `Generator`. Browser and Node builds expose a WASM `Generator` with JSON-string results.

`sample(index)` returns a training record ending at an assistant target. `transcript(index)` includes the full authored sequence. `generate(start, count)` produces a bounded batch.

The host owns persistence, job state, trigger authoring, product simulation, and semantic judging. See the [generator DSL reference](https://github.com/Minifield-Labs/data-generation/blob/main/docs/dsl.md) for variable types and substitution rules.
