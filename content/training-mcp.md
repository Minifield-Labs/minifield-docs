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
3. Choose an expiry of 1–60 minutes.
4. Select **Create MCP access**.
5. Copy the server URL and bearer token into your MCP client's HTTP connection settings.

The token starts masked. Select **Show token** to reveal it.
Select **Revoke MCP access** to end access before expiry.

## Configure your client

Use Streamable HTTP with an Authorization header. The endpoint is
`/api/v2/products/{product_id}/mcp` at your platform origin.

```json
{
  "mcpServers": {
    "minifield": {
      "url": "https://app.minifieldlabs.com/api/v2/products/PRODUCT_ID/mcp",
      "headers": {
        "Authorization": "Bearer GRANT_TOKEN"
      }
    }
  }
}
```

Replace `PRODUCT_ID` and `GRANT_TOKEN` with the values from your connection.
The server checks your current product permissions on every request.

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
