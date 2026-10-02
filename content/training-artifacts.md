---
title: Checkpoints and exports
description: Recover training state, verify attempt artifacts, and package models for Runtime.
group: Training
order: 55
---

Each attempt writes its recipe, ordered events, result, evaluation, and model artifacts under one output root. Keep this directory with the pinned inputs and installed worker revision.

## Attempt directory

```text
attempt/
  job.json
  events.jsonl
  result.json
  generation.json
  training.json
  evaluation.json
  evaluations/
  checkpoints/
  model/
```

`generation.json` captures source and prepared-order identities, including the packed plan. `training.json` captures the compiled training settings. Phase evaluations preserve the baseline, routine, and final results.

`result.json` records the attempt outcome and artifact identities. Event sequence numbers support ordered replay when a supervisor delivers progress after reconnecting.

## Resume a checkpoint

A checkpoint saves FP32 master weights, Adam optimizer state, the committed optimizer-update cursor, and the identities needed to reconstruct the computation. Its manifest inventories tensor files with hashes, shapes, and dtypes.

The worker keeps the 2 newest completed checkpoints after a durable save. Periodic checkpoints stay local during supervised execution; on interruption, the supervisor uploads the latest valid recovery checkpoint.

Resume from the checkpoint referenced by the new attempt’s recipe. Preserve the model, source, tokenizer, serializer, packing, optimizer, numerical settings, and schedule identities. The restored cursor continues from the last committed optimizer update.

Checkpoint validation checks the saved identity and tensor inventory before restoring state. Preserve the interrupted attempt’s events and result alongside the resumed attempt.

## Model export

Packed training exports:

```text
model/
  config.json
  tokenizer.json
  model.safetensors
  evaluation.json
  generation.json
  serializer.json
  manifest.json
```

The manifest records the exported file hashes and sizes. `serializer.json` captures the prompt contract: role mapping, action-catalog template, JSON serialization policy, special tokens, sequence bound, and reproduction identity.

Packed SFT exports dense model weights. Packed QAT exports eligible body matrices as `minifield.ternary.v1`, with 2-bit codes and FP16 group scales, and preserves the tied embedding as BF16.

Keep the final evaluation with the exported bytes. It connects the model to the exact held-out evidence produced at the end of training.

## Verify an attempt

For completed two-stage and packed SFT attempts, set `TRAINING_ATTEMPT` to the attempt directory and run:

```bash
.venv/bin/minifield-verify-attempt --attempt "$TRAINING_ATTEMPT"
```

The verifier checks recipe/result identity, event ordering, checkpoint inventory, finite tensor values, model-manifest hashes, and agreement with the final evaluation. It emits a JSON report and exits with `0` on success or `2` on failure.

Artifact verification establishes the saved bytes and their identity. [Task evaluation](/training-evaluation/) supplies the evidence for model behavior.

## Deliver to Runtime

The training export keeps `tokenizer.json` beside the weights. The runtime’s raw directory loader expects it at `tokenizer/tokenizer.json`:

```text
runtime-model/
  config.json
  model.safetensors
  tokenizer/
    tokenizer.json
```

Copy the exported asset bytes into that layout and retain the original export directory and manifest. Record the distribution paths and checksums in your release metadata.

Reproduce the exported serializer’s prompt format in the host application. Supply its public context and action catalog, then validate generated action names and arguments before application execution.

Follow [model asset validation](/runtime-assets/#validate-the-delivered-bundle) and qualify the delivered configuration, weight format, and tokenizer together on the target device.
