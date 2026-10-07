---
title: Training data
description: Author trajectories, freeze their inputs, and keep training and holdout families separate.
group: Training
order: 53
---

Write the requests your product should handle, the actions it should take, and the results it should observe. Training expands these authored trajectories into reproducible decisions using a fixed seed and sample range.

Each selection in a computation `9.0.0` through `13.0.0` points to 2 files: trajectory YAML and source metadata JSON. The worker verifies their hashes, applies the saved product instructions and wording, then prepares the selected strategy's training examples.

The [example review guide](/training-examples/) covers importing input/output
records and reviewing their selection in the platform.

## Author a trajectory

For product actions, you can prepare trajectories from a declared initial state
and supported tool functions. Sample reachable partial final states, then find
their shortest valid tool paths. Every supplied final value constrains
completion. Omitted fields can change through valid product actions.

Keep arguments grounded in public context and earlier tool results. Replay
the computed calls and results. Group verified tasks by call count to build a
curriculum that gradually increases chain length.

Create user wording that expresses every requested final value with public
record references. Keep prerequisite actions and incidental effects in the
trajectory. Save the verified calls and results as trajectory YAML, then freeze
the wording and source metadata with that case.

Starting states can come from seeded generation rules for record counts,
patterns, enums, unique values, and relationships. Validate generated states
and complete action outcomes against the same invariants. Collective rules can
require exactly one admin while an atomic transfer updates both people.

Include personal view settings in the product state. Sorting can change an
owned view's field and direction while person records stay unchanged. Verify
the rendered row order along with the view configuration. Sample across valid
worlds and select by call-length quotas, retaining the seed and source version
for each case.

This synthetic task manager changes a task's priority. The same sampled priority appears in the user request, tool arguments, result, and completion.

```yaml
variables:
  TASK_ID: {type: constant, value: task-42}
  PRIORITY: {type: integer, min: 1, max: 3}

system: Use the task manager's actions to update tasks.
context:
  selected_task:
    id: "{{TASK_ID}}"
    title: Review the release notes

tools:
  - type: function
    function:
      name: task.set_priority
      description: Set the priority of an existing task.
      parameters:
        type: object
        properties:
          task_id: {type: string}
          priority: {type: integer, minimum: 1, maximum: 3}
        required: [task_id, priority]
        additionalProperties: false

trigger:
  - "Set {{TASK_ID}} to priority {{PRIORITY}}."
  - "Change the priority of {{TASK_ID}} to {{PRIORITY}}."

trajectory:
  update_priority:
    tool: task.set_priority
    arguments:
      task_id: "{{TASK_ID}}"
      priority: "{{PRIORITY}}"
    result:
      task_id: "{{TASK_ID}}"
      priority: "{{PRIORITY}}"

completion:
  control: $finish
  content: "Set {{TASK_ID}} to priority {{PRIORITY}}."
```

`trigger` accepts a string or a list of phrasings. Each sample chooses a phrasing deterministically. `trajectory` is an ordered mapping of step IDs; each step declares a tool, an arguments object, and its authored result.

The worker records that result as context for the next decision. Source preparation reads these authored values without executing the application tool.

This trajectory produces 2 decisions per source conversation: select `task.set_priority` with its arguments, then select `$finish` with its message. A longer trajectory produces a decision for each supervised action and completion.

## Reuse typed variables

A string containing only `{{VARIABLE}}` preserves the variable's JSON type. In the example, `priority: "{{PRIORITY}}"` becomes an integer. A variable embedded in a sentence becomes text.

Use dotted references such as `{{TASK.id}}` to read object properties. Variable values are shared throughout a sampled conversation, including its follow-up turns.

| Variable type | Definition |
| --- | --- |
| `constant` | `value` contains a fixed JSON value |
| `enum` | `values` contains the available JSON values |
| `integer` | `min`, `max`, and optional `step`, which defaults to `1` |
| `decimal` | `min`, `max`, and `step` define a numeric grid |
| `boolean` | Samples `true` or `false` |
| `string` | `random_suffix` with `length` and `alphabet`; optional `prefix` |
| `object` | `properties` maps each field to a variable definition |
| `array` | `count: {min, max}`, an `items` definition, and optional `unique` |
| `reference` | `from` identifies another value; `select` is `value` or `random_item` |

For dependent decimal ranges, use `depends_on` with a `ranges` mapping. Each entry supplies its own `min`, `max`, and `step`.

```yaml
variables:
  PLAN: {type: enum, values: [standard, premium]}
  DISCOUNT:
    type: decimal
    depends_on: PLAN
    ranges:
      standard: {min: 0, max: 0.1, step: 0.05}
      premium: {min: 0.1, max: 0.2, step: 0.05}
```

Keep dependencies acyclic. The worker rejects unknown variables, duplicate YAML keys, recursive aliases, and unsupported variable fields during preparation.

## Add follow-up turns

`follow_ups` extends the conversation. Each item has its own `trigger`, optional `trajectory`, and optional `completion`. Earlier requests, calls, results, and completion text remain visible to later decisions.

This fragment follows the priority update with a question about its result:

```yaml
follow_ups:
  - trigger: What priority did you set?
    completion:
      control: $finish
      content: "Priority {{PRIORITY}}."
```

Every turn needs a trajectory or completion. Use the same tool names and argument schemas that your application accepts.

## Label completion behavior

An annotated completion selects a control route and provides its `content`. The generated target places that content in `arguments.message`.

| Control | Use it when |
| --- | --- |
| `$finish` | The turn is complete and the response reports the observed outcome, including a failed action |
| `$clarify` | A supported action needs information from the user |
| `$reject_scope` | The request falls outside the product's supported scope |
| `$explain_unavailable` | A supported action needs state or a service that is currently unavailable |
| `$explain_permission` | The action needs authority, a grant, or human approval that the user lacks |

For example, a missing task name can end in a clarification:

```yaml
trigger: Set the priority to 3.
completion:
  control: $clarify
  content: Which task should I update?
```

A scalar completion such as `completion: Updated the task.` becomes a `$finish` target. Use the object form to select another control explicitly.

Cover supported actions and each relevant control outcome in separate cases. Pair unsupported requests with valid requests that use similar language, so evaluation can measure false rejection.

## Choose supervised steps

Actions and completions default to `supervision: desired`. Use `supervision: context_only` for an earlier observation or mistake that later decisions need to see. That step enters the conversation history and produces no training target of its own.

`acceptable_alternatives` lists other valid route names for a desired decision. Each alternative must exist in the candidate catalog and differ from the selected route. Two-stage training protects these routes from negative routing loss; packed training learns the single selected action target.

```yaml
trajectory:
  inspect_task:
    tool: task.get
    arguments: {task_id: task-42}
    result: {task_id: task-42, priority: 1}
    supervision: context_only
```

This fragment assumes the selected tool catalog defines `task.get`. Give context-only steps no acceptable alternatives.

## Freeze source metadata

Source metadata records the product identity, product instructions, selected wording variants, and selected tools. For the inline-tool example above, a metadata file can contain:

```json
{
  "schema_version": "minifield.trajectory-source/1",
  "product_id": "task-manager",
  "product": {
    "instructions": "Use only the task manager's available actions."
  },
  "variants": [],
  "tools": []
}
```

`product_id` must match the job. Product instructions are prepended to the trajectory's `system` text. Each selected variant contributes its `text` to the initial trigger's phrasings.

Supply tools in one place: inline YAML or metadata. A metadata tool uses `definition.name`, `definition.description`, and `definition.input_schema`; preparation converts it to the function-tool shape shown above.

The worker builds a default candidate catalog containing those tools and the 5 control routes. Its source-preparation path uses that same catalog for any named snapshots in the authored case.

## Pin source files

File references contain a relative `path` and a `sha256`. Compute the hash from the final file bytes, then keep those files with the recipe. The worker resolves each path beneath the input root and verifies its bytes before preparation.

Use normalized paths that stay inside the input root. The model section independently pins the repository, exact revision, configuration, tokenizer, and weights. See [recipes and inputs](/training-recipes/) for the complete input layout.

## Select cases and split families

Set `data.kind` to `trajectories` and provide 2–200 selections. Include both `train` and `holdout` selections.

| Field | Purpose |
| --- | --- |
| `id` | Unique selection identifier |
| `family` | Groups related cases for split isolation |
| `split` | `train` or `holdout` |
| `template` | Authored trajectory file reference |
| `metadata` | Frozen metadata file reference |
| `seed` | Unsigned 64-bit expansion seed |
| `start` | First expanded sample index, default `0` |
| `samples` | Source conversations to expand; use `1`–`10,000` per selection |

Assign each family and each template hash to one split before expanding wording variants. The worker rejects duplicate selection IDs and families or template hashes that cross splits.

The selection's `seed`, `start`, and `samples` choose a reproducible slice. For example, selections with the same source and seed can cover indices `0`–`99` and `100`–`199` using `start: 0` and `start: 100`, each with `samples: 100`. Keep both selections in the same split.

`samples` counts source conversations. The priority trajectory above yields 200 decision rows from 100 conversations. Include independent held-out cases with their own families and template bytes.

Continue with [serialization and packing](/training-format/) to see which fields enter the model and which tokens receive loss.
