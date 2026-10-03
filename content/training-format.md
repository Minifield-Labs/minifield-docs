---
title: Serialization and packing
description: Follow authored decisions into model context, supervised targets, and packed training rows.
group: Training
order: 55
---

Training turns each supervised trajectory step into a decision record, then serializes that record for the selected strategy. The serializer defines the exact model input and the tokens that contribute to training loss.

## Decision records

Both two-stage and packed training consume `minifield.decision-example/draft-two-stage-1` records. A record represents the next action at one point in a conversation.

| Field | Contents |
| --- | --- |
| `schema` | Decision format identifier |
| `public_context.events` | Conversation history before the target action |
| `public_context.candidates.routes` | Available tools and control routes, including their argument schemas |
| `target` | Selected route, route kind, and arguments |
| `supervision` | Desired-target annotation |
| `acceptable_alternatives` | Other valid route names for routing supervision |
| `provenance` | Source, selection, sample, turn, and decision identity |

For the priority example in [Training data](/training-data/), a generated tool target has this shape:

```json
{
  "kind": "tool",
  "route": "task.set_priority",
  "arguments": {
    "task_id": "task-42",
    "priority": 2
  }
}
```

The action's own tool result enters the next decision's history. It stays out of the context used to predict that action. A `$finish` target can then describe the observed result through its `message` argument.

## Public conversation events

The worker serializes typed events in their original order. A system event carries `policy` and an optional `observation`; a user event carries `content`.

| Event type | Model role | Contents |
| --- | --- | --- |
| `system` | System | Product instructions and public observation |
| `user` | User | User request |
| `tool_call` | Assistant | Tool name, arguments, and call ID |
| `tool_result` | Tool | Result and matching call ID |
| `assistant_text` | Assistant | Previous completion text |

Only put application-visible information into the authored `system`, `context`, and tool results. Training retains supervision, alternatives, and provenance outside the model-visible conversation. Decision IDs remain available for auditing and evaluation.

## Two-stage serialization

`lfm2-full-weight-two-stage-v1` learns routing and arguments separately.

For routing, each candidate gets the same public history followed by its route name and description. The model scores `true` and `false` continuations for whether that route should be the next action.

The selected route receives positive routing supervision. Other eligible routes receive negative supervision. Routes listed in `acceptable_alternatives` remain protected from routing loss.

For arguments, the compiler walks the selected route's parameter schema and the authored argument object. It creates a teacher trace with learned values and choices, plus the fixed syntax determined by the schema. Only learned argument targets contribute argument loss.

Every routing and argument branch keeps its complete causal history. The compiler checks each branch against `training.sequence_length` and rejects a branch that exceeds it.

## Packed action serialization

Packed SFT and packed QAT use `minifield.packed-action-sft/1`. Each decision becomes one complete causal language-model example, in this order:

1. The beginning-of-sequence token.
2. The public conversation events with their model roles.
3. A system message headed `Available actions:` containing the complete public route catalog.
4. The assistant role prefix.
5. The selected action JSON and assistant end token.

The canonical action target uses `name` and `arguments`:

```json
{"arguments":{"priority":2,"task_id":"task-42"},"name":"task.set_priority"}
```

The serializer orders JSON keys deterministically and escapes angle brackets. It checks that the selected route appears exactly once, has the expected kind, and declares parameters.

| Tokens | Loss weight |
| --- | --- |
| Beginning-of-sequence, public history, and catalog | `0` |
| Assistant role prefix | `0` |
| Action JSON | `1` |
| Assistant end token | `1` |
| Padding | `0` |

Packed training learns the selected route and arguments through that one action target. `acceptable_alternatives` stays outside the serialized input and does not create additional packed targets.

## Fit complete examples

`sequence_length` includes the public history, full catalog, role framing, action target, and assistant end token. Each complete example must fit within one row. The serializer rejects overlong examples before packing.

A large catalog or long tool result can use most of the sequence even when the expected action is short. Keep the public context relevant to the task, or choose a sequence length that fits the complete example.

The worker also checks token IDs against the model vocabulary and rejects dynamic text that produces reserved protocol token IDs. Pin the tokenizer with the model so preparation and inference use matching token identities.

## Pack training rows

The worker shuffles training decisions with `training.seed`, serializes them, then applies deterministic first-fit packing. Each admitted example appears once in the packed pass. Holdout order stays fixed.

Each packed example gets its own segment ID and positions starting at `0`. These boundaries separate examples that share a physical row. Padding carries no supervised targets.

Two budgets constrain a microbatch:

| Setting | Budget |
| --- | --- |
| `rows_per_microbatch` | Maximum number of physical sequence rows |
| `projection_chunk_size × max_projection_chunks` | Maximum supervised target tokens across those rows |

The packer closes a microbatch when the next row would exceed either budget. A single example must fit both `sequence_length` and the target-token budget.

`gradient_accumulation_steps` sets microbatches per optimizer update. The final update pads its unused physical slots, and empty microbatches contribute no update work. `limits.max_steps` can stop the pass earlier.

Review [strategy settings](/training-strategies/#packed-sft-settings) for the physical dimensions. Use the prepared counts and packing plan in `generation.json` to understand how many optimizer updates the selected data produces.
