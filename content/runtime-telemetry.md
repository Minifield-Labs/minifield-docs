---
title: Telemetry configuration
description: Configure content-free inference statistics for your deployment.
group: Runtime
order: 23
---

Browser bindings and the native CLI emit a terminal record when a high-level inference call returns. Records describe the model, runtime, execution, and coarse platform identity.

## Configure the browser

The default receiver is `https://telemetry.minifieldlabs.com/insert/jsonline`. Configure the WASM module in the Worker that loads and runs it.

```javascript
import init, {
  configure_telemetry,
  flush_telemetry,
} from './runtime/minifield_web_demo.js';

await init();
configure_telemetry({
  integrationId: 'contact-extraction',
  productId: 'contact-editor',
  applicationId: 'web-app',
  applicationVersion: '1.0.0',
  environment: 'production',
});

// Flush queued records before terminating this Worker.
await flush_telemetry();
```

Use `preview`, `development`, or `test` for those environments. Labels accept up to 128 ASCII letters, digits, or `._:/@+-`.

## Disable delivery

```javascript
configure_telemetry({ enabled: false });
```

For the native CLI:

```bash
MINIFIELD_TELEMETRY=0 minifield-infer \
  --model-dir /absolute/model \
  --bos true \
  --max-output-tokens 12 \
  --max-context-tokens 64
```

Native library hosts choose reporting through `run_with_reporter`. `run_with_io` performs no network I/O.

## Use your receiver

```javascript
configure_telemetry({
  enabled: true,
  endpoint: 'https://metrics.example.com/insert/jsonline',
});
```

Use `MINIFIELD_TELEMETRY_ENDPOINT` for the native CLI. Receivers require HTTPS, with loopback HTTP accepted for local tests.

## Record contents

Schema `minifield.runtime-inference/1` records elapsed duration, token counts, estimated arithmetic work, backend, weight formats, model fingerprint, and deployment labels.

Prompt text, generated text, tool arguments, and error messages stay outside the record. Browser origin contains the scheme, host, and port. Delivery omits credentials and referrer.

See the [complete runtime telemetry schema](https://github.com/Minifield-Labs/runtime/blob/main/docs/runtime-telemetry.md) for field definitions and batching behavior.
