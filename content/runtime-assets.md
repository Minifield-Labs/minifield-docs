---
title: Model assets
description: Package the exact weights, configuration, and tokenizer your runtime loads.
group: Runtime
order: 22
---

A raw runtime bundle contains 3 assets: model configuration, weights, and a tokenizer. Keep their paths and checksums in the delivered artifact record.

## Raw bundle layout

```text
model/
  config.json
  model.safetensors
  tokenizer/
    tokenizer.json
```

The native CLI accepts the containing directory with `--model-dir`. The browser harness loads the directory selected by its `bundle` query parameter.

## Configuration and weights

`config.json` describes the supported LFM2 architecture configuration. `model.safetensors` supplies dense or supported packed matrices.

Packed format metadata belongs with the weights. The runtime selects compatible kernels at execution time. Offline converters own packaging and explicit quantization.

## Tokenizer and prompts

The tokenizer must match the model’s vocabulary. The host supplies its chat template and product prompt policy.

Keep private expected results, judge rules, and training lineage outside model-visible context. Supply only the public context your feature needs.

## Release manifest

The pinned `model-bundle` contract records product identity, base-model revision, training and dataset identity, engine requirements, context limits, decoding settings, and asset hashes.

Its required asset roles are weights, tokenizer, chat template, and product contract. Runtime consumers validate the pinned schema and exact asset bytes.

The training worker also writes an [export manifest and prompt serializer](/training-artifacts/#model-export). Preserve those files with the training result. Package the flat training export into the raw bundle layout above and record the release metadata required by your consumer.

## Validate the delivered bundle

Check hashes before loading. Confirm the loader accepts the exact configuration and weight formats. Run task evaluation and device qualification against the same assets you distribute.

Keep schema versions immutable after consumption. Coordinate new schema versions with consumers and update their pinned snapshots explicitly.
