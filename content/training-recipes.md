---
title: Write a recipe
description: Pin a model and its inputs, configure a packed-SFT job, and validate the computation before execution.
group: Training
order: 52
---

A recipe fixes the inputs and settings for a training run. Save it as JSON so each attempt can reconstruct the same computation.

## Choose the identities

| Identity | What it identifies |
| --- | --- |
| `job_id` | The logical job across execution attempts |
| `attempt_id` | One execution, with its own events, checkpoints, and result |
| `product_id` | The product whose action contract appears in the source metadata |
| `computation_digest` | A SHA-256 digest derived from the validated recipe and the strategy's serialization and numerical policies |

The worker calculates `computation_digest`. Keep it with the recipe and results when comparing runs or restoring a checkpoint.

For packed SFT, the digest includes model and data references, physical dimensions, optimizer settings, limits, evaluation settings, and product identity. It excludes `job_id`, `attempt_id`, and `resume`.

Give a resumed execution a new `attempt_id`. Preserve the other computation fields, then add the checkpoint reference described in [checkpoint recovery](/training-artifacts/#resume-a-checkpoint).

## Stage the inputs

Each file reference contains a `path` relative to the input root and a `sha256` for the file's exact bytes. A useful layout is:

```text
inputs/
  model/
    config.json
    tokenizer.json
    model.safetensors
  cases/
    train.yaml
    train-metadata.json
    holdout.yaml
    holdout-metadata.json
```

Use `/` separators and ordinary files. Paths must stay beneath the input root, with no empty components, `.` components, `..` components, or symbolic links.

Pin `model.repository` as `owner/name` and `model.revision` as the exact 40-character lowercase commit hash. The config, tokenizer, and weights each have their own file reference.

Calculate each file's SHA-256 after staging its final bytes. From the input root, this command prints the values for the model files:

```bash
shasum -a 256 model/config.json model/tokenizer.json model/model.safetensors
```

Repeat it for the trajectory and metadata files. Keep the staged inputs unchanged throughout execution.

## Complete packed-SFT recipe

This recipe uses computation `12.0.0` with `lfm2-packed-sft-v1`. Replace the example repository, revision, and hashes with the identities of your staged inputs.

<!-- example: examples/training/packed-sft-job.json -->

`model`, `data`, `training`, `limits`, and `evaluation` are required sections. The example writes every optimizer field explicitly so the settings remain visible during review.

Each selection points to authored YAML and its metadata. The metadata's `product_id` must match the recipe. Use unique selection IDs, include both splits, and keep each family and template hash in a single split.

The selection's `seed`, `start`, and `samples` choose its expansion range. `training.seed` controls the order of the expanded training decisions. See [training data](/training-data/) for case authoring, split boundaries, and packing.

## Choose the physical settings

Start with the length of a complete serialized example: public context, action catalog, assistant prefix, target JSON, and assistant end token. Set `sequence_length` large enough to hold it.

The example recipe uses:

| Setting | Capacity |
| --- | --- |
| `sequence_length: 8192` | 8,192 token positions per row |
| `rows_per_microbatch: 1` | 1 physical row per microbatch |
| `gradient_accumulation_steps: 4` | 4 microbatches per optimizer update |
| `projection_chunk_size: 256`, `max_projection_chunks: 8` | 2,048 supervised target positions per microbatch |

Packing must satisfy both row capacity and target capacity. Accumulation combines microbatches into an update. It doesn't increase the space available to an individual example.

Packed SFT derives its update count from one pass through the admitted training examples. `limits.max_steps: null` allows that pass to finish. Set a positive value to stop after a fixed number of optimizer updates.

Choose checkpoint cadence and evaluation cadence separately. The example saves a checkpoint every 100 updates, evaluates every 100 updates, and gives final decoding a larger budget than routine decoding.

Use the [settings reference](/training-strategies/#packed-sft-settings) for field bounds and optimizer defaults. Use [evaluation](/training-evaluation/) to choose decode budgets and interpret the results.

## Validate and execute

From the installed training checkout, validate the completed JSON file:

```bash
.venv/bin/minifield-worker --job job.json --validate-only
```

The worker loads the versioned recipe, checks its fields and cross-field rules, selects the installed strategy, and prints `valid`, `computation_digest`, and `strategy`. This command works without GPU discovery.

Validation rejects unknown fields, invalid types, repeated selection IDs, split leakage, and routine decode budgets larger than the final budgets. The JSON reader also rejects duplicate keys and non-finite numbers.

Execution resolves the referenced files and verifies their hashes. It also checks source metadata against `product_id` before preparing the training decisions.

Run the attempt with separate input and output trees:

```bash
.venv/bin/minifield-worker \
  --job job.json \
  --input-root inputs \
  --output-root outputs
```

Read [installation and execution](/training-worker/) for device setup and exit codes. The [attempt directory](/training-artifacts/#attempt-directory) contains the expanded recipe, events, checkpoints, and terminal result.
