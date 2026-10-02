---
title: Observer
description: Track AI tool usage and inspect findings in your local logs.
group: Observer
order: 40
---

Observer is a macOS menu bar app that reads the logs your AI coding tools keep on your Mac. It totals token usage, estimates cost, and detects secrets and personal information in chat text.

## Build and open

Use macOS `14` or newer and Swift `6`. Run these commands from the [Observer repository](https://github.com/Minifield-Labs/minifield-observer):

```bash
swift run Observer --open
```

To build the menu bar app:

```bash
./scripts/bundle-app.sh
```

The script writes `build/Observer.app`. Open the dashboard from the menu bar or with Control-Option-O. Escape closes it.

## Supported log sources

Observer reads Claude Code, Codex, OpenCode, Devin CLI, Hermes, and Pi logs. Each adapter normalizes the tool’s usage records and deduplicates repeated responses.

Select Today, 7 days, 30 days, or All time in the dashboard. The notch view shows today’s tally. Usage refreshes at launch, every 5 minutes, and when the dashboard opens.

## Review findings

The scanner detects provider keys, private keys, passwords in connection strings, email addresses, phone numbers, and card numbers.

Expand a finding to reveal its value from the source log. Dismiss a finding to clear it until it appears in a newer chat, or allow it to suppress future findings. Filters control individual rules.

## Local storage

Observer performs scanning locally and opens other tools’ databases read-only. It preserves their original logs.

Its cache stores usage counts, IDs, timestamps, keyed fingerprints, and masked finding previews. Revealing a value reads it from the log and retains it in memory while the finding is open.

## Command-line reports

```bash
swift run -c release observer-usage
swift run -c release observer-usage -- --by-model
swift run -c release observer-usage -- --own-work-only
swift run -c release observer-usage -- --samples
```

Reports include usage, cost, findings, and accounting diagnostics. The `--samples` option prints masked finding previews.
