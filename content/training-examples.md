---
title: Review examples
description: Import examples, inspect their inputs and outputs, and review their selection.
group: Training
order: 54
---

Use Examples to collect requests and their accepted outputs in a dataset. Open a
record to inspect its complete input and output, change its label, or include or
exclude it from selection.

## Import a dataset

1. Open **Examples** in your product and select **New dataset**.
2. Give it a name, then choose a JSONL or Parquet file.
3. Select **Import examples**. You can import more files into the same dataset.

A JSONL file contains 1 object per line. Each object needs `input` and `output`.

```json
{"input":{"request":"Set task-42 to priority 3"},"output":{"task_id":"task-42","priority":3},"output_type":"extraction","split":"train","source_id":"case-42"}
```

Input and output can be strings, objects, arrays, numbers, booleans or null.
`source_id` is an optional reference to your original case. Each imported example
receives its own ID.

| Field | Values |
| --- | --- |
| `output_type` | `generation`, `decision`, `regression`, `extraction` |
| `split` | `train`, `eval` |
| `source_id` | Optional string, up to 200 characters |

Type defaults to `generation`, and split defaults to `train`. Keep evaluation
cases separate from training cases, including closely related wording variants.

Parquet files use JSON strings in the `input` and `output` columns. They can also
contain `output_type`, `split` and `source_id`. For example, the JSON boolean false
is stored as the string `false`, while a text output is stored with JSON quotes.

## Import from Hugging Face

1. Select a dataset in **Examples** and choose **Import from Hugging Face**.
2. Enter the Hugging Face repository name or dataset URL. Select **Load dataset**.
3. Choose a source subset/split and select its input columns and output column.
4. Choose the output type and **Training** or **Evaluation**. Enter a row range,
   or leave **Examples** empty to import the complete split.
5. Select **Import dataset**. Use **Pause import** and **Resume import** to control it.

One input column keeps its original value. Multiple input columns become an object
with each column name as a key. The output keeps its original value. **Preview
source row** shows the data before import.

The importer accepts public text and JSON datasets with a complete Hugging Face
viewer split. Each imported example receives its own ID. Imported rows appear in
source order and retain a source reference for review.

## Browse and review

Choose a dataset and filter by selection, split or output type. **Dataset order**
shows imported records in sequence. **Highest loss** shows measured examples from
the latest published successful training run, with the largest losses first.

Select an example number to open its complete JSON. **Save example** creates a new
revision and retains the previous record. **Include example** and **Exclude
example** record your decision; a review reason is optional.

Use **Next page**, **Previous page** and **First page** to browse. When the dataset
changes during review, return to the first page to load its current selection.

[Training data](/training-data/) covers authored source cases and evaluation
families. [Evaluation](/training-evaluation/) explains the evidence to compare
when judging a model.
