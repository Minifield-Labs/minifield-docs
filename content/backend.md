---
title: Backend and jobs
description: Persist product inputs, training jobs, worker reports, and releases.
group: Platform
order: 61
---

The backend is an independent Python/FastAPI service with PostgreSQL state. It owns versioned tools and trajectories, saved wording, durable jobs, artifacts, evaluation, and release records.

## Start the service

Use Python `3.13` and uv `0.11.30` in the backend repository.

```bash
uv python install
uv sync --locked
docker compose up -d database
uv run --locked minifield-backend serve
```

Prepare `.env` from `.env.example` before launching. Configure the installed generator executable and its SHA-256 for deterministic previews.

The service applies its Alembic migrations at startup and listens on `127.0.0.1:8001`. The versioned browser interface uses `/api/v2`; the service exposes schemas at `/openapi.json`.

## Run dispatch

Start dispatch in a separate process:

```bash
uv run --locked minifield-backend dispatch
```

Dispatch coordinates durable work and recovery. Training workers claim versioned assignments and report events and artifacts through authenticated attempt interfaces.

## Preserve expensive work

Store authored inputs and immutable references. Retain model weights, evaluation results, and recovery artifacts in persistent storage.

Expanded examples can be regenerated from the pinned inputs and generation settings. Keep source identity and result identity with the run.

## Configure hosted access

Use the backend’s hosted authentication settings, secure cookies, exact allowed origins, and TLS ingress. Worker authority and browser grants use separate secrets.

The application owns user-visible interaction. The backend enforces persistent lifecycle and authorization. Execution workers consume assignments and report their measured outcomes.

## Check the backend

```bash
uv run --locked ruff format --check .
uv run --locked ruff check .
uv run --locked ty check
uv run --locked pytest
```

Integration checks use a disposable PostgreSQL instance. Read the [worker protocol](https://github.com/Minifield-Labs/backend/blob/main/docs/worker-protocol.md) for assignment and reporting contracts.
