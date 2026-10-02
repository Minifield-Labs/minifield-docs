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

Keep the adapter that translates model output into product data in your application. That gives the UI a small interface and keeps model configuration in one place.

## Run inference locally

Serve the JavaScript, WASM, tokenizer, configuration, and weights from locations your application controls. Load the runtime inside a Worker when integrating browser inference.

The [browser runtime guide](/runtime-browser/) covers asset loading. [Telemetry configuration](/runtime-telemetry/) controls operational reporting separately from model inputs.

## Enforce supported actions

Treat a model result as a proposed input. Validate the action name and parameters against the feature’s schema. Check the current user’s permissions in application code when the action executes.

For a Command integration, show the selected proposal for approval and route execution through the same authorization checks as the rest of your product. WebMCP can expose the supported action interface while those checks stay in the application.

## Train against the same contract

Use the same action names, parameter types, and scope rules in authored cases, model evaluation, and application integration.

Include valid requests, unsupported requests, clarification cases, and permission failures. [Prepare training data](/training-data/) with separate case families for training and holdout, then [evaluate](/training-evaluation/) task success and false rejection.

## Exchange versioned artifacts

Keep the model’s weights, tokenizer, prompt serializer, and action contract together. Record their checksums and the exact training recipe used to produce them.

The [training export guide](/training-artifacts/) describes these artifacts. Package the exported weights and tokenizer in the [runtime asset layout](/runtime-assets/), then test that exact bundle on the devices you intend to support.
