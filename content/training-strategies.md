---
title: Strategies and settings
description: Match the recipe schema to its training strategy and numerical settings.
group: Training
order: 53
---

The worker dispatches on the recipe’s schema version and `model.implementation`. Keep both identifiers with the recipe and exported artifacts.

## Strategy versions

| Implementation | Computation version |
| --- | --- |
| `lfm2-full-weight-two-stage-v1` | `7.0.0` through `11.0.0` |
| `lfm2-packed-sft-v1` | `12.0.0` |
| `lfm2-packed-qat-v1` | `13.0.0` |

Use `minifield-worker --list-strategies` to inspect the installed registry. Direct worker recipes select any installed strategy; the supervisor advertises its accepted computations when claiming work.

## Two-stage full-weight training

Two-stage training learns action routing and argument generation with separate supervision. It updates the model body while keeping the tied embedding and language-model head frozen.

`training.updates` sets the update count; set `limits.max_steps` to the same value. `sequence_length` defaults to `8192`, with a supported range of `2`–`32768`. The default training seed is `42`.

The dense path uses `quantization_profile: "disabled-v1"` and `schedule: "constant-v1"`. Forward computation uses BF16; master weights and optimizer state use FP32.

## Packed SFT settings

Packed SFT trains complete action targets and updates every parameter leaf, including the tied embedding. It uses recipe computation `12.0.0` and the same dense numerical profile.

The `training` object contains the physical layout and numerical settings:

<!-- reference: training-packed-sft -->

Each row holds `sequence_length` tokens. `rows_per_microbatch` sets the row count, and `gradient_accumulation_steps` sets microbatches per optimizer update.

`projection_chunk_size` × `max_projection_chunks` sets supervised target capacity per microbatch. `seed` controls the training shuffle.

For example, this `training` fragment uses 1 row per microbatch, accumulates 4 microbatches per update, and allows 2,048 supervised target positions per microbatch:

<!-- example: examples/training/packed-sft-training.json -->

Choose dimensions against your model, example lengths, and GPU memory. `generation.json` records the prepared packing plan; training events report its input and supervised token counts.

## Packed quantization-aware training

Packed QAT uses the direct worker’s `13.0.0` recipe and the packed physical settings above. Set `quantization_profile` to `ternary-g128-v1` and `schedule` to `immediate-v1`.

Eligible body weights participate in the forward pass as ternary matrices with group-128 scales. FP32 master weights receive the optimizer updates. The tied embedding stays frozen and exports as BF16.

The objective combines supervised cross-entropy with distillation from the job’s dense starting weights. Its recipe settings are:

<!-- reference: training-qat-objective -->

A `null` scale rule uses the quantization profile’s rule. A zero objective weight disables that term. These settings participate in the computation identity.

The exported body uses 2-bit packed ternary codes and FP16 scales in the `minifield.ternary.v1` format. Preserve the quantization settings with the export identity when comparing it in Runtime.

## Optimizer defaults

The `optimizer` object uses AdamW. An omitted optimizer uses these defaults:

<!-- reference: training-optimizer -->

Training records gradient norm, update norm, loss, token counts, and elapsed step time. Use these alongside [held-out evaluation](/training-evaluation/) to judge a run.

## Limits and recovery

Packed recipes checkpoint every `100` optimizer updates by default. Set `limits.checkpoint_every_steps` to choose the cadence and `limits.max_steps` to set an optional update cap.

<!-- reference: training-limits -->

The computation identity binds model and data references, serialization, packing, numerical settings, optimizer, schedule, and training seed. Resume using the same computation settings and a new attempt identity. A changed computation starts a new run.

Read [checkpoint recovery](/training-artifacts/#resume-a-checkpoint) for the saved state and verification process.
