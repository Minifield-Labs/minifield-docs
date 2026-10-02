---
title: Training
description: Train, evaluate, and export a model for your product’s supported actions.
group: Training
order: 50
---

Minifield Training is the Python/JAX package for reproducible model training. It prepares authored cases, trains LFM2 weights on CUDA GPUs, evaluates held-out decisions, and exports model assets with their checksums and prompt format.

A job fixes the model revision, input files, strategy, numerical settings, and evaluation plan. Each execution attempt records progress, checkpoints, usage, and results against that identity.

## Choose a training path

| Strategy | Training behavior |
| --- | --- |
| Two-stage full-weight | Learns action selection and argument generation with separate supervision |
| Packed SFT | Trains complete action JSON targets, packing multiple examples into each sequence |
| Packed QAT | Trains with ternary body weights and exports packed ternary matrices |

The [strategy reference](/training-strategies/) lists recipe versions, optimizer settings, and packing controls. Packed SFT trains all parameter leaves, including the tied embedding. Two-stage training and packed QAT keep the tied embedding frozen.

## Build a run

1. **Define the feature.** Write its action names, parameter schemas, vocabulary, and scope rules. Include valid requests alongside similar unsupported requests.
2. **Prepare the inputs.** Save authored trajectories and metadata. Split case families into training and holdout before expanding their wording variants.
3. **Choose the recipe.** Pin the model revision and input checksums. Select a strategy, physical batch settings, checkpoint cadence, and evaluation plan.
4. **Run the worker.** Validate the recipe, then execute it with separate input and output directories, or use a supervisor to consume assigned jobs.
5. **Review and export.** Inspect held-out results, verify artifacts, and qualify the exported model with Runtime on the target device.

Start with [installation and execution](/training-worker/). [Training data](/training-data/) explains the source contract and the tokens the model learns from.

## Read the evidence

The worker records training loss and update metrics as ordered events. Evaluation checks held-out objectives and decoded actions, with separate counts for false rejection and false acceptance.

Use [evaluation](/training-evaluation/) to configure cadence and interpret results. [Checkpoints and exports](/training-artifacts/) covers recovery, manifests, and the files to deliver to Runtime.

## Package and ownership

The package is `minifield-training`, with `minifield-worker` for execution and `minifield-supervisor` for queue operation. Python prepares training decisions directly from the job’s immutable source files.

Your application defines the supported action contract and enforces permissions when an action executes. Training learns that contract; Runtime performs inference using the exported model and the host’s prompt policy.

The [training repository](https://github.com/Minifield-Labs/training) contains the package, locked dependencies, strategy implementations, and worker protocol.
