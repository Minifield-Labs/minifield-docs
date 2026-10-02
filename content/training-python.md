---
title: Python API
description: Load typed recipes, inspect strategies, run a worker, and verify its artifacts from Python.
group: Training
order: 56
---

Use the installed `minifield_training` modules to validate recipes and connect training to your own scripts. Run these examples in the Python 3.12 environment from [installation](/training-worker/#install-the-worker).

## Load and validate a recipe

`json_io.read_object` reads a UTF-8 JSON object and rejects duplicate keys and non-finite numbers. `recipe.load` selects the typed recipe from `schema_version`, applies defaults, and checks its field and cross-field rules.

```python
from pathlib import Path

from minifield_training import json_io
from minifield_training.execution import recipe
from minifield_training.strategies import registry

job = recipe.load(json_io.read_object(Path("job.json")))
strategy = registry.for_job(job)

print(job.schema_version)
print(strategy.id)
print(job.computation_digest())
```

`registry.for_job` checks that the installed strategy accepts the recipe's implementation and computation version. This validation path leaves GPU discovery to execution.

Use `job.model_dump(mode="json")` to obtain the normalized recipe, including resolved defaults. Treat the loaded object and its nested settings as immutable. To change a recipe, edit its JSON representation and pass it through `recipe.load` again.

See [Write a recipe](/training-recipes/) for a complete packed-SFT example and the fields included in its computation digest.

## Show field errors

Catch `pydantic.ValidationError` when a script needs field-level feedback. Each error supplies a location, a message, and a type.

```python
from pathlib import Path

import pydantic

from minifield_training import json_io
from minifield_training.execution import recipe

payload = json_io.read_object(Path("job.json"))
try:
    job = recipe.load(payload)
except pydantic.ValidationError as error:
    for detail in error.errors(include_input=False, include_context=False):
        field = ".".join(str(part) for part in detail["loc"]) or "recipe"
        print(f"{field}: {detail['msg']}")
    raise SystemExit(2) from None
```

The error location can identify a nested field such as `training.rows_per_microbatch`. Cross-field errors describe relationships such as routine evaluation exceeding its final budget. File-read and JSON-parsing errors occur before typed recipe validation.

## Inspect installed strategies

The registry exposes strategy IDs and accepted computation versions without loading their numerical runners:

```python
from minifield_training.strategies import registry

for strategy in registry.available():
    print(strategy.id, ", ".join(strategy.computation_versions))
```

`registry.get(identifier)` returns one strategy by ID. `registry.for_job(job)` also checks compatibility with a loaded recipe. Both raise `ValueError` for an unsupported selection.

## Export a versioned schema

Choose the class from `minifield_training.execution.recipe` for the computation you accept:

| Computation | Recipe class |
| --- | --- |
| `9.0.0` | `TwoStageRunJobV9` |
| `10.0.0` | `TwoStageRunJobV10` |
| `11.0.0` | `TwoStageRunJobV11` |
| `12.0.0` | `PackedSftRunJob` |
| `13.0.0` | `PackedSftQatRunJob` |

```python
from minifield_training import json_io
from minifield_training.execution import recipe

schema = recipe.PackedSftRunJob.model_json_schema()
print(json_io.canonical(schema))
```

Use the schema to build forms or inspect field constraints. Pass completed values through `recipe.load` to apply the Python cross-field validators as well.

## Execute from a Python script

`cli.main(argv)` runs the complete worker lifecycle: device initialization, input verification, training, evaluation, checkpoints, and export. It returns the same [exit codes](/training-worker/#run-an-attempt) as `minifield-worker`.

```python
from minifield_training.execution import cli

exit_code = cli.main([
    "--job", "job.json",
    "--input-root", "inputs",
    "--output-root", "outputs",
])
raise SystemExit(exit_code)
```

Run this entrypoint on the process's main thread so it can handle `SIGINT` and `SIGTERM`. For an application that owns its own event loop or signal handling, launch the installed `minifield-worker` command in a subprocess.

The attempt writes to `outputs/<job_id>/<attempt_id>/`. Read its `result.json` for the terminal status and checkpoint reference. Use a fresh `attempt_id` for each execution.

## Inspect completed artifacts

`verify.inspect_attempt` reads a completed two-stage or packed-SFT attempt and verifies its saved identities and tensors on CPU:

```python
from pathlib import Path

from minifield_training import json_io
from minifield_training.execution import verify

report = verify.inspect_attempt(Path("outputs/task-priority-sft-001/attempt-001"))
print(json_io.canonical(report))
```

The report includes `job_id`, `attempt_id`, `status`, `checkpoint_step`, `checkpoint_sha256`, `tensor_files`, `tensor_file_bytes`, and `events`. Invalid identities, event sequences, or tensor inventories raise `ValueError`; missing files raise filesystem errors.

Use the [checkpoint and export guide](/training-artifacts/) for artifact layout and recovery. Use [Evaluation](/training-evaluation/) to interpret the model's held-out behavior.
