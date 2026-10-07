---
title: MCP access
description: Connect an MCP client to your product's tools and training workflow.
group: Training
order: 61
---

Connect an MCP client to the Minifield platform to read tool contracts, author
trajectory drafts, generate previews, and manage training runs for one product.

## Create access

1. Select a product in the platform.
2. Open **Browser tools** and select the allowed actions.
3. Select **Create MCP access**.
4. Copy the server URL.
5. Select **Copy credentials** to export the access/refresh pair.

Tokens start masked. Select **Show token** to reveal them. Access lasts
24 hours. Refresh lasts 90 days and renews that lifetime each time it rotates.
Select **Revoke MCP access** to end the agent connection.

## Configure your client

Use Streamable HTTP with an Authorization header. The endpoint is
`/api/v2/products/{product_id}/mcp` at your platform origin.

The backend package includes `minifield-mcp-auth`, a credential helper for Codex
on macOS and Linux. Import the copied JSON once into an owner-only file:

```sh
install -d -m 700 "$HOME/.config/minifield"
pbpaste | minifield-mcp-auth import \
  --server-url https://app.minifieldlabs.com/api/v2/products/PRODUCT_ID/mcp \
  --file "$HOME/.config/minifield/product.json"
```

`pbpaste` reads the clipboard on macOS. On Linux, pass the copied JSON to the
same command through stdin. Configure Codex with your installed helper path:

```text
[mcp_servers.minifield]
url = "https://app.minifieldlabs.com/api/v2/products/PRODUCT_ID/mcp"
http_headers_helper = '"/absolute/path/minifield-mcp-auth" headers --file "/absolute/path/product.json"'
```

The helper supplies the bearer header and renews expired access through the
platform API. It saves rotated credentials automatically. Browser sign-out
leaves this connection active. The server checks current product permissions
on every request. See the [Codex connection settings](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

Other clients can renew with
`POST /api/v2/products/{product_id}/automation/mcp/refresh` and JSON body
`{"refresh_token":"REFRESH_TOKEN"}`. Reuse an `Idempotency-Key` for an uncertain
retry. The response contains the new `token`, `refresh_token`, `expires_at`,
and `refresh_expires_at`. Each successful renewal rotates both credentials.

## Use the tools

The client discovers the actions you selected. The tool names match the
platform's WebMCP inventory.

| Task | Tools |
| --- | --- |
| Read and save tool contracts | `mf_tools_list`, `mf_tools_versions`, `mf_tools_create`, `mf_tools_update` |
| Read and save trajectories | `mf_trajectories_list`, `mf_trajectories_read`, `mf_trajectories_create`, `mf_trajectories_update` |
| Read immutable versions | `mf_versions_list`, `mf_versions_read` |
| Preview authored cases | `mf_preview` |
| Save or generate wording | `mf_wording_save`, `mf_wording_generate` |
| Read, submit, or change runs | `mf_runs_list`, `mf_runs_read`, `mf_runs_submit`, `mf_runs_action` |
| Read models and release history | `mf_models_list`, `mf_releases_list` |

Write tools accept the endpoint payload under `arguments`. Resource IDs appear
at the top level. Supply an `invocation_key` and reuse it when retrying an
uncertain write. Each successful call returns the operation result and its key.

Human reviews, approvals, private evaluation, and release decisions stay in the
platform. Continue with [training recipes](/training-recipes/) or
[evaluation](/training-evaluation/).
