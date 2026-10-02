---
title: Runtime
description: Local LFM2 inference in Rust, on CPU and WebGPU.
group: Runtime
order: 20
---

Minifield Runtime loads model assets, tokenizes inputs, and runs generation or classification. CPU and WebGPU backends implement the same finite inference contract.

## Run a native bundle

Use the runtime repository with Rust `1.89.0`. Place the model assets in a local bundle directory.

```bash
printf 'Hello' | cargo run --release --locked -p minifield-infer -- \
  --model-dir /absolute/model \
  --bos true \
  --max-output-tokens 12 \
  --max-context-tokens 64
```

The CLI consumes the supplied prompt. The host supplies chat templates, product context, and decoding policy.

See [model assets](/runtime-assets/) for the required files. Use [browser inference](/runtime-browser/) for WebGPU integration.

## Select the task

| Operation | Result |
| --- | --- |
| Generation | Incrementally decoded text |
| Constrained generation | Text selected under a decoding grammar |
| Classification | Logits for an explicit classifier head |
| Choice scoring | Scores for criterion tails with a shared prefix |

Reusable prefix state avoids repeating eligible shared-context work. The host controls prompts, candidates, action masks, and application state.

## Load supported representations

The loader validates the supported LFM2 configuration subset. Dense F32 and BF16 assets execute as F32. Packed `minifield.ternary.v1` and `minifield.nf4.v1` matrices use group-128 scales.

Model files describe weight representation. Runtime dispatch selects compatible kernels using the backend, tensor shape, and explicit memory policy.

## Check the integration

In the runtime checkout:

```bash
npm ci
scripts/check.sh quick
scripts/check.sh ci
```

Portable checks cover code, contracts, and numerical paths. Run GPU and browser qualification against your exact model assets and target device.

Read [the runtime repository](https://github.com/Minifield-Labs/runtime) for its development procedure and qualification tools.
