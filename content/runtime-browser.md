---
title: Browser inference
description: Load the WASM runtime and serve your model assets over WebGPU.
group: Runtime
order: 21
---

The browser package pairs Rust inference with thin JavaScript bindings. Build the package in the runtime repository, then serve it from your host application.

## Build the bindings

Use Node `22` or newer, Rust `1.89.0`, and the pinned WASM binding tool.

```bash
npm ci
cargo install wasm-bindgen-cli --version 0.2.127 --locked
npm run build:web
```

The build writes `minifield_web_demo.js` and `minifield_web_demo_bg.wasm` into `web/pkg/`. Distribute both files together. Serve WASM with `application/wasm`.

## Initialize the module

```javascript
import init, { configure_telemetry } from './runtime/minifield_web_demo.js';

const response = await fetch('./runtime/minifield_web_demo_bg.wasm');
if (!response.ok) throw new Error('Runtime WASM could not be loaded.');
const bytes = await response.arrayBuffer();

await init({ module_or_path: bytes });
configure_telemetry({
  integrationId: 'contact-extraction',
  productId: 'contact-editor',
  environment: 'production',
});
```

Initialize and configure the runtime in the same Worker that performs inference. Passing WASM bytes also supports importing the JavaScript from a blob URL.

## Select a binding

`load` and `generate` handle greedy language-model inference with incremental token callbacks. `generate_json` applies byte-level grammar masks during generation.

`load_classifier` accepts an explicit dense head with shape `[classes, hidden]`. `classify` starts fresh state. `classify_cached` reuses shared prefix state where possible. `choose` scores criterion tails after a shared prefill.

Use the generated TypeScript declarations for exact binding signatures. The host supplies the prompt and validates the resulting product data.

## Try the development harness

Put a bundle under `models/demo/` in the runtime checkout, then serve the repository:

```bash
python3 -m http.server 8642 --bind 127.0.0.1
```

Open `http://localhost:8642/web/index.html?bundle=../models/demo`. The browser must expose a WebGPU adapter.

## Qualify an actual browser

```bash
scripts/check.sh browser \
  --bundle /absolute/bundle \
  --prompts /absolute/prompts.json \
  --classes 8 \
  --expected /absolute/native-result.json \
  --out /absolute/browser-result.json
```

The check loads the exact assets in Chrome, compares classification results, exercises cached execution and recovery, and records browser and adapter identity. Keep these results with the bundle’s release evidence.
