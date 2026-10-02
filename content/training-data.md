---
title: Training data
description: Turn authored product cases into reproducible training and holdout decisions.
group: Training
order: 52
---

A job carries immutable references to authored trajectory YAML and metadata. The training worker’s Python preparation step expands these inputs into decisions with a fixed seed, range, and source identity.

## Define the action contract

Each case describes a user request, public product context, available actions, and the expected outcome. Use the action names and argument schemas your application actually accepts.

Cover successful actions, clarification, scope rejection, and permission limits as separate outcomes. Pair unsupported requests with valid requests that use similar language, so evaluation can expose false rejection.

Metadata freezes the product context, tool catalog, and saved wording variants used during preparation. If a case supplies multiple snapshots, select its default explicitly with `decision.default_snapshot` or `context.default_snapshot`.

## Pin source files

File references contain a relative `path` and a `sha256`. The worker resolves them beneath the input root and verifies their bytes. Use normalized paths that stay inside that root.

The model section also pins its repository, exact 40-character revision, configuration, tokenizer, and weights. These identities become part of the computation record.

## Select cases and split families

Computations `9.0.0` through `13.0.0` use `data.kind: "trajectories"` with 2–200 selections. Each selection specifies:

| Field | Purpose |
| --- | --- |
| `id` | Unique selection identifier |
| `family` | Groups related cases for split isolation |
| `split` | `train` or `holdout` |
| `template` | Authored trajectory file reference |
| `metadata` | Frozen metadata file reference |
| `seed` | Unsigned 64-bit expansion seed |
| `start` | First expanded sample index, default `0` |
| `samples` | Number of samples, from `1` to `1,000,000` |

Include both training and holdout selections. Assign each family and each template hash to one split before expanding wording variants. This keeps related examples together and gives the holdout set independent cases.

The seed, start index, and sample count select a reproducible slice. Preserve the original YAML and metadata alongside their hashes so a later attempt can reconstruct it.

## Separate context from supervision

The prompt includes the public events and action catalog that the application can supply at inference time. Expected answers, acceptable alternatives, provenance, and private supervision remain in the training record.

Scalar completion text is preserved as a deterministic `$finish` target. Annotated completion objects carry explicit control supervision. Decision IDs provide audit identity without entering the model-visible prompt.

## Serialize packed action examples

Packed SFT serializes the public conversation, a system action catalog introduced by `Available actions:`, and the assistant prefix. The target is an action object followed by the assistant end token:

```json
{"name":"set_filter","arguments":{"status":"open"}}
```

`set_filter` illustrates an application-defined action. Its name and arguments must match the case’s catalog.

The loss mask covers the target JSON and assistant end token. Prompt, catalog, and padding tokens have zero loss weight. Each complete example must fit within `sequence_length`.

## Pack the training rows

The worker shuffles training decisions with the recipe seed, then places complete examples into rows using deterministic first-fit packing. Holdout order stays fixed.

Two budgets govern a microbatch: sequence rows and supervised target slots. `projection_chunk_size × max_projection_chunks` sets the target-slot budget; `rows_per_microbatch` sets the number of physical rows.

A packed run makes one pass through its admitted training examples. The final update pads remaining physical slots. `limits.max_steps` can end the pass earlier.

Review [packing and optimizer settings](/training-strategies/#packed-sft-settings) before choosing physical dimensions, then use [evaluation](/training-evaluation/) to inspect the held-out behavior.
