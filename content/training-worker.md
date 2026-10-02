---
title: Install and run
description: Install the CUDA worker, validate a recipe, and execute a training attempt.
group: Training
order: 51
---

Use Python `3.12` and the repository-pinned uv `0.11.30`. Numerical training runs on the CUDA JAX backend, with BF16 forward computation and FP32 master weights, gradients, and optimizer state.

## Install the worker

From the training checkout:

```bash
uv sync --locked --no-dev --extra cuda --no-editable
.venv/bin/python -c 'import jax; assert jax.default_backend() == "gpu"; print(jax.devices("gpu"))'
.venv/bin/minifield-worker --list-strategies
```

The device check confirms that JAX can see the assigned GPU. The strategy listing reports the recipe computations accepted by the installed package.

Record the checkout revision with the environment used for each run. The locked installation pins JAX, NumPy, tokenizer, and serialization dependencies together.

## Validate a recipe

Set `TRAINING_JOB` to your job JSON path. Validate its schema and strategy selection before starting execution:

```bash
.venv/bin/minifield-worker --job "$TRAINING_JOB" --validate-only
```

The response includes `valid`, `computation_digest`, and the selected `strategy`. Recipe validation checks the declared job; execution resolves and hashes its input files.

The recipe declares job and attempt IDs, product identity, pinned model assets, source selections, training settings, limits, and evaluation settings. Use the [strategy reference](/training-strategies/) to match its schema to the chosen computation.

## Run an attempt

Set `TRAINING_INPUTS` to the directory containing the referenced inputs, and `TRAINING_OUTPUTS` to a separate output directory. Keep both directories outside each other.

```bash
.venv/bin/minifield-worker \
  --job "$TRAINING_JOB" \
  --input-root "$TRAINING_INPUTS" \
  --output-root "$TRAINING_OUTPUTS"
```

The worker verifies input identities, prepares examples, initializes or restores training state, then writes progress and artifacts into the output directory. See [the artifact layout](/training-artifacts/#attempt-directory) for the resulting files.

| Exit code | Meaning |
| --- | --- |
| `0` | Validation or execution completed |
| `2` | Attempt failed |
| `3` | Attempt stopped with a resumable `cancelled` or `limited` result |

Use `result.json` for the attempt’s status and identities, and `events.jsonl` for its ordered progress history.

## Connect a supervised worker

The supervisor manages GPU slots, claims, authenticated input downloads, worker subprocesses, cancellation, and artifact uploads. Its queue claims advertise two-stage computations `9.0.0` through `11.0.0` and packed SFT `12.0.0`.

Enroll a host using your API origin and enrollment code:

```bash
.venv/bin/minifield-connect-worker \
  --api-url "$MINIFIELD_API_URL" \
  --enrollment-code "$MINIFIELD_ENROLLMENT_CODE" \
  --credentials-file "$MINIFIELD_WORKER_CREDENTIALS"
```

Enrollment writes an owner-readable credentials file. Start the supervisor with that file, a trusted input origin, a persistent work directory, and a stable host ID:

```bash
.venv/bin/minifield-supervisor \
  --api-url "$MINIFIELD_API_URL" \
  --credentials-file "$MINIFIELD_WORKER_CREDENTIALS" \
  --input-origin "$MINIFIELD_ASSET_ORIGIN" \
  --work-dir "$MINIFIELD_WORK_DIR" \
  --host-id "$MINIFIELD_HOST_ID"
```

Use HTTPS origins. Repeat `--input-origin` for each allowed asset origin, and `--gpu` with GPU UUIDs to select devices. Give each host its own persistent work directory.

The supervisor holds credentials and assigns exclusive GPU slots to children. It persists claims and event sequence numbers so delivery can resume after an interruption. `SIGINT` and `SIGTERM` initiate shutdown and allow durable result handling to finish.

For host operation and recovery procedures, see the repository’s [deployment guide](https://github.com/Minifield-Labs/training/blob/main/docs/worker-deployment.md) and [supervisor guide](https://github.com/Minifield-Labs/training/blob/main/docs/supervisor.md).
