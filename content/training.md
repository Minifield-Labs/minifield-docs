---
title: Training
description: Train and evaluate a model for the work your product supports.
group: Models and data
order: 51
---

Minifield Training is the Python/JAX worker for immutable training jobs. It consumes authored inputs and versioned assignments, runs training, and publishes evaluation results and model assets.

## Define the feature

Write the product’s supported actions, vocabulary, parameter schemas, and scope rules. Prepare valid requests alongside similar unsupported requests.

Keep clarification, scope rejection, and permission failure as separate outcomes. Measure false rejection alongside task success.

## Prepare reproducible inputs

Retain authored YAML, saved wording, metadata, and checksums. Split case families before expansion and keep their related requests together.

The worker resolves immutable input references through its assigned protocol. Use the assignment’s declared computation and strategy to select the installed training path.

## Install the worker

Use Python `3.12` and the repository-pinned uv `0.11.30` in the training checkout.

```bash
uv sync --locked
uv run --no-sync python scripts/check_quality.py
uv build --no-sources
```

Numerical execution uses a CUDA JAX backend. The supervisor manages GPU slots, authenticated downloads, child processes, cancellation, and durable event delivery.

## Track a run

The backend owns canonical job state and artifact records. A worker claims an assignment, resolves inputs, reports progress, and uploads verified results.

Checkpoint identity and export identity are checked before publication. Preserve immutable source references and the worker’s exact installed revision with each run.

## Evaluate and export

Evaluate task completion, schema correctness, rejection behavior, and model output against held-out cases. Compare the exported model on the runtime and target device.

Training owns the model bundle and its checksummed manifest. Runtime owns execution compatibility and device evidence. Product release requires the measured evidence for the delivered assets.

Read the [worker deployment guide](https://github.com/Minifield-Labs/training/blob/main/docs/worker-deployment.md) and [supervisor operation](https://github.com/Minifield-Labs/training/blob/main/docs/supervisor.md) for installation and assignment details.
