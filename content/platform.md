---
title: Minifield application
description: Author product cases, submit training, review evidence, and release models.
group: Platform
order: 60
---

The Minifield application provides the product workflow for preparing and training a model. Open [app.minifieldlabs.com](https://app.minifieldlabs.com) to work with products, tools, trajectories, and training runs.

## Prepare the product

Define the product’s tool names and parameter schemas. Author trajectories around supported tasks and save wording variants for each case family.

Inspect deterministic previews before submitting training. Keep expected outcomes and evaluation rules with the product’s evidence.

## Submit and review a run

Training submission saves selected trajectory references and settings. The worker retrieves immutable inputs, prepares records, and reports progress through the backend.

Review evaluation results and model evidence before releasing a candidate. Keep the released bundle tied to its run and product contract.

## Run the frontend locally

In the platform repository:

```bash
cd application
npm ci
npm run dev
```

Open `http://127.0.0.1:4317`. The frontend consumes the backend’s `/api/v2` interface. Its development proxy uses `MINIFIELD_API_URL`, defaulting to `http://127.0.0.1:8001`.

Start the backend with its own setup instructions. See [backend and jobs](/backend/) for service responsibilities.

## Deliver the application

The React frontend builds independently for static hosting. The backend owns persistent state, authentication, job lifecycle, and artifact authorization.

Configure the deployment’s API proxy and exact allowed origins. The application discovers its configured authentication provider through `/api/v2/auth/config`.
