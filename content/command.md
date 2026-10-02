---
title: Command
description: Your product, in plain language.
group: Command
order: 30
---

Command connects a user’s request to reviewable action proposals. The client library supplies the composer, thinking indicator, alternatives, and approval card. Your host supplies request resolution and execution.

## Build the client package

In the client-library repository, build and pack the browser package:

```bash
npm ci
npm run build
npm pack
```

Install the resulting tarball in your application. The package exports an ES module, TypeScript declarations, and `dist/minifield-client.global.js` for a script-tag integration. Styles are isolated inside Shadow DOM.

## Mount the composer

This example accepts “group by status” and updates the host’s presentation state after approval.

```typescript
import { mountCommand } from '@minifield-labs/client-library';

const target = document.querySelector<HTMLElement>('#command')!;

const command = mountCommand<{ groupBy: string }>(target, {
  contextLabel: 'Tasks',
  onRequest: (request) => {
    if (!/group.*status/i.test(request)) {
      throw new Error('Try “group by status”.');
    }
    return {
      title: 'Group these tasks by status?',
      recommendedId: 'by-status',
      proposals: [{
        id: 'by-status',
        label: 'Group by status',
        description: [{ kind: 'text', text: 'Group tasks by current status.' }],
        confidence: 'high',
        payload: { groupBy: 'status' },
      }],
    };
  },
  onExecute: (proposal) => {
    target.dataset.groupBy = proposal.payload.groupBy;
    return { status: 'accepted' };
  },
});

command.open('Group by status');

// Call when the host view unmounts.
// command.destroy();
```

The package listens for Cmd-K or Ctrl-K by default. Set `shortcut: false` when your application owns that shortcut.

## Resolve a request

`onRequest(command, context)` returns a title, proposals, and a recommended proposal ID. The context supplies `requestId`, an `AbortSignal`, and an optional `indicate` function for loading state.

Each proposal has an ID, label, description parts, confidence label, and a host-owned payload. Forward the signal to pending inference or request work.

## Execute an approved proposal

`onExecute(proposal, context)` receives the selected payload, request ID, attempt ID, and cancellation signal. Validate current permissions, parameters, and application state before applying the action.

Return `{ status: 'accepted' }` after successful execution or `{ status: 'cancelled' }` for cancellation. Throw an error to display the retry state.

## Embed only the approval card

Use `mountApproval(target, options)` when your application already has an input surface. It accepts the same proposals, recommendation, and execution callback, with an explicit `requestId`.

The controller exposes `getSnapshot()`, `reset()`, and `destroy()`. The optional `onEvent` callback reports local presentation and execution observations to your host.
