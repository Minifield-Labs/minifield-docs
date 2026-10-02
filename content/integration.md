---
title: Integration guide
description: Keep each product responsibility behind a small, explicit interface.
group: Start here
order: 2
---

Build around the feature’s input and result. Your application owns the user’s state and permissions; the model maps language into the result your feature accepts.

## Choose the interface

| Feature | Interface | Application responsibility |
| --- | --- | --- |
| Extract fields | MagicBox `onExtract` | Supply extraction and consume spans |
| Review an action | Command `onRequest` and `onExecute` | Resolve proposals and execute an approved action |
| Run a model | Runtime browser bindings or native CLI | Load assets, supply prompts, and consume output |
| Prepare examples | Data-generation `Generator` | Author cases and persist records |

Keep the adapter that translates model output into product data in your application. That gives the UI a small interface and keeps model configuration in one place.

## Run inference locally

Serve the JavaScript, WASM, tokenizer, configuration, and weights from locations your application controls. Load the runtime inside a Worker when integrating browser inference.

The [browser runtime guide](/runtime-browser/) covers asset loading. [Telemetry configuration](/runtime-telemetry/) controls operational reporting separately from model inputs.

## Enforce supported actions

Treat a model result as a proposed input. Validate the action name and parameters against the feature’s schema. Check the current user’s permissions in application code when the action executes.

For a Command integration, show the selected proposal for approval and route execution through the same authorization checks as the rest of your product. WebMCP can expose the supported action interface while those checks stay in the application.

## Train against the same contract

Use the same action names, parameter types, and scope rules in authored cases, model evaluation, and application integration.

Include valid requests, unsupported requests, clarification cases, and permission failures. Track task success and false rejection separately. Test the exact exported bundle on the devices you intend to support.

## Exchange versioned artifacts

Each Minifield repository builds independently. Connect installed packages, immutable model assets, and versioned HTTP or worker protocols.

The backend owns durable job state and artifact records. Training consumes job assignments and publishes results. Runtime loads delivered assets. The application presents progress and releases through the backend’s interface.
