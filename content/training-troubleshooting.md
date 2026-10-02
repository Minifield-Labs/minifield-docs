---
title: Troubleshooting
description: Diagnose recipe, input, device, packing, decoding, and checkpoint failures.
group: Training
order: 59
---

Start with `result.json` and the last event’s `phase` in `events.jsonl`. Attempt files live under `<output-root>/<job_id>/<attempt_id>`.

The worker prints `error_type` and `status` on failure. Recipe or directory checks can fail before an attempt creates these files.

## Validate the recipe

Run the recipe check before starting a GPU attempt:

```bash
.venv/bin/minifield-worker --job "$TRAINING_JOB" --validate-only
```

Validation checks field types, required settings, cross-field rules, and the installed strategy. Execution then checks the device and referenced file bytes.

Use the [Python API](/training-python/) to inspect validation errors by field. Compare the recipe with the [recipe guide](/training-recipes/).

| Error | What to change |
| --- | --- |
| Extra field or wrong type | Use fields from the selected schema. Supply JSON numbers for numeric settings. |
| `A selection source crosses splits` | Assign each family and template hash to one split. |
| `Separate train and holdout selections are required` | Include selections for both splits. |
| Routine evaluation budget exceeds final budget | Keep routine sample and token counts at or below the final counts. |
| `max_steps must equal full-weight update count` | For two-stage recipes, match `limits.max_steps` to `training.updates`. |

## Check paths and hashes

`--input-root` and `--output-root` must be separate directory trees. Use sibling directories, with every input reference stored beneath the input root.

| Error | What to change |
| --- | --- |
| `Artifact path must be a normalized relative path` | Remove absolute prefixes, backslashes, empty components, `.` and `..` from the reference. |
| `Missing or unconfined artifact` | Stage the file at the exact relative path declared by the recipe. |
| `Symlink artifact is forbidden` | Stage regular files with regular parent directories. |
| `Artifact digest mismatch` | Restore the bytes identified by the recipe. For revised inputs, create a recipe with their new hashes. |
| `Source metadata belongs to another product` | Match the metadata’s `product_id` to the recipe’s product. |

Verify model configuration, tokenizer, weights, trajectory YAML, and metadata together. [Training data](/training-data/) describes how these references identify the run’s inputs.

## Check CUDA visibility

A failure in `initializing_device` can mean JAX can’t see a GPU. Check the same Python environment that launches the worker:

```bash
.venv/bin/python -c 'import jax; print(jax.default_backend()); print(jax.devices("gpu"))'
```

Install the locked CUDA dependencies on the GPU host using [Install and run](/training-worker/). Confirm that the process can access its assigned device before retrying.

## Fit the packed examples

Packed training has separate limits for complete examples and supervised targets.

| Failure | What to change |
| --- | --- |
| `SerializationError` with prompt and target exceeding `sequence_length` | Shorten the conversation or action catalog, or increase `training.sequence_length` within the model’s supported context. |
| `Sequence length exceeds the LFM2 model limit` | Set `training.sequence_length` at or below the model configuration’s `max_position_embeddings`. |
| `PackError` with supervised tokens exceeding the slot budget | Increase `projection_chunk_size × max_projection_chunks`, or shorten the target. |
| `Physical microbatch dimensions are unbounded` | Keep `rows_per_microbatch` and `gradient_accumulation_steps` at or below `4096`. |

The target budget applies to each microbatch. Increasing gradient accumulation changes how many microbatches form an update. Each microbatch keeps the same target capacity.

For reserved or out-of-vocabulary token errors, check that the tokenizer belongs to the pinned model. Review the [packing settings](/training-strategies/#packed-sft-settings) before changing the physical layout.

## Inspect empty or unterminated decodes

Open the phase result under `evaluations/`. Each packed `decodes` entry includes `generated`, `category`, `tokens`, and `terminated`.

An `empty` decode reached the assistant end token with an empty or whitespace-only body. Inspect the expected action and compare the serialized prompt, action catalog, and tokenizer with the training inputs.

An `unterminated` decode exhausted `max_new_tokens` without emitting the assistant end token. Inspect the generated text. If it contains an incomplete action, review the token budget and prompt length.

Use `evaluation.routine.max_new_tokens` for routine decoding and `evaluation.max_new_tokens` for final decoding. Keep the routine budget within the final budget.

A complete JSON body still needs the assistant end token to pass. For `wrong_route` or `wrong_arguments`, compare the emitted action with the expected action in the source case. See [Evaluation](/training-evaluation/) for the metric definitions.

## Retry or resume an attempt

`Attempt directory already used` means the attempt ID already has output. Choose a new `attempt_id` and preserve the earlier directory.

After cancellation, inspect `result.json` for a `checkpoint` reference. A reference identifies a saved recovery point. A `null` value means the attempt stopped before it saved a checkpoint.

To resume directly, stage the complete checkpoint directory beneath the new input root. Point `resume.path` to its `manifest.json` and set `resume.sha256` to that file’s hash.

Keep the original computation settings when resuming. A checkpoint identity failure calls for checking the model, input hashes, tokenizer, optimizer, numerical settings, and packing layout against the saved recipe.

Follow [Checkpoints and exports](/training-artifacts/#resume-a-checkpoint) for recovery and artifact verification.
