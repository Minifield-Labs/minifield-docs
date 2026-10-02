---
title: Introduction
description: Build AI features that run on your users’ devices.
group: Start here
order: 0
---

Minifield builds small models for specific software features. Give a model your product’s vocabulary, data, and supported actions, then run inference locally in your application.

These docs cover the interfaces you embed, the runtime that executes your model, and the tools for preparing and training it.

## Find your starting point

<div class="product-list">
  <a href="/magicbox/"><strong>MagicBox <span aria-hidden="true">↗</span></strong><p>Extract typed fields from free text in a React textbox.</p></a>
  <a href="/runtime/"><strong>Runtime <span aria-hidden="true">↗</span></strong><p>Run LFM2 inference with Rust, CPU, and WebGPU.</p></a>
  <a href="/command/"><strong>Command <span aria-hidden="true">↗</span></strong><p>Turn requests into proposals users can review and approve.</p></a>
  <a href="/observer/"><strong>Observer <span aria-hidden="true">↗</span></strong><p>Track usage and inspect findings in local AI tool logs.</p></a>
  <a href="/data-generation/"><strong>Data generation <span aria-hidden="true">↗</span></strong><p>Expand authored trajectories into repeatable training records.</p></a>
  <a href="/training/"><strong>Training <span aria-hidden="true">↗</span></strong><p>Train and evaluate a model around your product’s supported scope.</p></a>
</div>

## How the pieces fit

Your application supplies the product context and enforces permissions. MagicBox presents extracted fields. Command presents action proposals and asks the host to execute the selected action. Runtime handles local model inference.

Training produces model assets. Data generation expands authored cases into seeded records. The Minifield application and backend manage product setup, durable jobs, evidence, and releases.

Read [the integration guide](/integration/) for the responsibilities at each interface.

## Begin with one feature

Choose a task you can describe and test: extracting an email address, selecting a supported filter, or changing a document property. Define its inputs, outputs, and permitted actions before selecting a model.

Start with [MagicBox’s React integration](/magicbox-react/) to connect an extraction callback. For local inference, follow [the runtime guide](/runtime/).
