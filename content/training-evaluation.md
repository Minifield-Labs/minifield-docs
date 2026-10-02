---
title: Evaluation
description: Measure held-out loss, decoded actions, rejection behavior, and training usage.
group: Training
order: 54
---

Evaluate on case families held out before wording expansion. Keep the action contract and serialization identical to the training recipe, then compare the exact exported model in Runtime.

## Configure packed evaluation

Packed recipes separate routine decoding from final decoding. For example, this `evaluation` fragment evaluates every 100 updates, decodes 3 routine samples, and decodes 20 at the end:

<!-- example: examples/training/packed-evaluation.json -->

Routine sample and token budgets must fit within their final counterparts. A `samples` value of `0` runs objective evaluation with zero qualitative decodes.

<!-- reference: training-evaluation -->

## Read each phase

| Phase | Work performed |
| --- | --- |
| Baseline | Full held-out objective at step `0` |
| Routine | Full held-out objective plus the routine decode budget |
| Final | Full held-out objective plus the final decode budget |

Baseline evaluation uses zero qualitative decodes. The worker writes phase results under `evaluations/`, and copies the final result to `evaluation.json` and the model export.

Packed objective loss is mean negative log-likelihood over all supervised holdout tokens. The report includes `supervised_tokens`, `input_tokens`, `packed_rows`, `physical_slots`, `padding_tokens`, and `packing_density` so the denominator and packing remain visible.

## Inspect decoded actions

Qualitative evaluation greedily decodes an action object and its assistant end token. It checks the output’s structure, action name, and arguments against the expected decision.

| Metric | Interpretation |
| --- | --- |
| `qualitative_samples` | Number of sampled decisions decoded |
| `action_successes` | Decodes with the expected action and arguments |
| `action_success_rate` | Successful actions as a fraction of decoded samples |
| `false_rejections` | A control action emitted when a non-control action was expected |
| `false_acceptances` | A known non-control action emitted when a control action was expected |
| `qualitative_decoded_tokens` | Tokens generated during sampled evaluation |

Failure categories distinguish `wrong_route`, `wrong_arguments`, `invalid_json`, `non_object`, `missing_fields`, `extra_fields`, `empty`, and `unterminated`. Inspect the individual `decodes` as well as the aggregate `categories`.

Keep clarification, rejection, and permission outcomes distinct in the expected actions. Exact action matching then exposes which boundary the model crossed.

## Evaluate two-stage training

Two-stage reports keep routing and argument objectives separate. Routing metrics include `route_pair_accuracy` and `route_set_exact_accuracy`; argument evaluation includes `teacher_forced_argument_token_accuracy`.

Qualitative metrics such as `qualitative_route_exact_accuracy` measure decoded behavior. Compare those decoded results alongside objective metrics and inspect the saved examples before selecting an export.

## Account for work

Training usage records assistant target tokens, non-padding input tokens, optimizer steps, and prepared records. Evaluation usage tracks its own forward calls and decoding work.

A resumed attempt reports the work performed during that attempt. Its inherited checkpoint identifies the earlier progress separately. Keep both attempt records when calculating the total work for a run.

## Qualify the exported model

Verify the [exported artifacts](/training-artifacts/#verify-an-attempt), then run held-out cases through the target Runtime backend. Use the exported tokenizer and prompt serializer with the same public context and action catalog.

Measure task success, rejection, latency, and memory on the device and weight format you plan to deliver. Keep the model hashes with those results so a release can point to the exact bytes evaluated.
