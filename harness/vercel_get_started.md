---
name: vercel-get-started
area: Getting Started
supported_surfaces: [cli, plugin, skills, mcp]
description: |-
  Hand your coding agent this playbook to set up Vercel: install the
  CLI, add Vercel platform guidance, and connect the official Vercel MCP server
  once for use across projects.
title: 'Onboard your agent to Vercel'
url: https://vercel.com/get-started.md
---

# Set up Vercel for your AI coding agent

Use this playbook to prepare the current agent for Vercel. Install the CLI, guidance, and MCP connection once; link individual projects only when project operations require it.

## How to run

Run section 1 once per machine. Run sections 2 and 3 once per coding agent. In section 2, try the Vercel plugin first and use standalone skills only if the plugin can't be used.

For section 3, follow the route for your client below or in the [Vercel MCP docs](https://vercel.com/docs/agent-resources/vercel-mcp). If neither covers it, adapt the closest route. If a step is blocked, record why and continue with the remaining steps.

Perform actions yourself when terminal or file access is available. Global or user-scoped installation is the default. Pause only for user authentication, approval, or UI actions you cannot perform. Do not merely return commands for the user to copy.

## 1. Install the Vercel CLI

Check for an existing installation:

```sh
vercel --version
```

If the CLI is missing, install the latest version:

```sh
npm install --global vercel@latest
vercel --version
```

If the installed CLI reports that an update is available, run the same global install command. Use bare `vercel` commands for all subsequent operations.

If `whoami` reports that no user is authenticated, you can use `vercel signup` to create an account on the behalf of the user, or `vercel login` if they already have one.

Pause while the user completes sign-up or sign-in, then verify using:

```sh
vercel whoami
```

Do not create or link a Vercel project during global setup. Link a project later when a deployment or project-specific operation requires it.

## 2. Add Vercel guidance

Install either the Vercel plugin or standalone skills—not both.

### Preferred: Vercel plugin

The plugin requires Node.js 18+. Install it if missing and you can, then run:

```sh
node --version
npx plugins add vercel/vercel-plugin
```

Use standalone skills if you know your agent doesn't support plugins, the install reports it unsupported, or Node.js can't be installed. For other errors, check the [plugin docs](https://vercel.com/docs/agent-resources/vercel-plugin) once before falling back.

In OpenCode, use OpenCode's own command instead. It doesn't need Node.js:

```sh
opencode plugin add github:vercel/vercel-plugin
```

Install the plugin once for the current agent. Confirm it is enabled across projects and that a command such as `/vercel-plugin:status` is discoverable. In OpenCode, the command is `/vercel:status`.

Reload only if the newly installed commands are missing.

### Fallback: standalone skills

Use this for any of the reasons above:

```sh
npx skills list
npx skills add vercel-labs/agent-skills --global
npx skills list
```

Choose the current agent if prompted and confirm the installation path. The standalone pack is smaller than the plugin and does not include its complete command, agent, and automation system.

## 3. Connect Vercel MCP

Connect the shared Vercel MCP endpoint once to access Vercel projects, deployments, logs, and analytics across projects.

If you know your client supports remote MCP with OAuth, use its route below. If it supports only stdio servers, configure the client's MCP server command as `npx` with arguments `["mcp-remote", "https://mcp.vercel.com"]`, as in the Gemini CLI route. If unsure, try the route; record MCP as blocked only if it fails.

Before changing a MCP configuration file, inspect it and merge the `vercel` entry without replacing unrelated settings.

For clients supported by the Vercel CLI, configure the shared endpoint:

```sh
vercel mcp --clients "<client>"
```

Use the exact `<client>` value:

- Claude Code: `Claude Code`
- Cursor: `Cursor`
- VS Code with GitHub Copilot: `VS Code with Copilot`

Other supported values are in the [CLI MCP docs](https://vercel.com/docs/cli/mcp). If your client isn't supported, use its route below instead. Use only one route per client.

This is the default. Use `--project` only when the user explicitly requests a project-scoped MCP connection.

### Claude Code

Manual user-scoped fallback:

```bash
claude mcp add --transport http vercel --scope user https://mcp.vercel.com
```

Inspect existing MCP entries before adding. To authenticate, open `/mcp`, select `vercel`, and choose the authentication action.

### Codex CLI

First inspect:

```bash
codex mcp list
```

Codex is not a supported `vercel mcp --clients` target. Its documented add command uses Codex's user-wide configuration:

```bash
codex mcp add vercel --url https://mcp.vercel.com
```

Codex should open a browser during setup. If the server exists but is not authenticated, run:

```bash
codex mcp login vercel
```

### Cursor

Manual fallback: merge this into `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

Cursor displays `Needs login` when authorization is required. Ask the user to click it.

### VS Code with GitHub Copilot

Run **MCP: Add Server**, choose **HTTP**, enter `https://mcp.vercel.com`, name it `Vercel`, and select **Global**. Then run **MCP: List Servers**, start Vercel, and allow authentication. If VS Code offers its alternate URL-handler authentication path, use that prompt.

### OpenCode

The Vercel plugin already adds the `vercel` server. Without the plugin, run:

```bash
opencode mcp add vercel --global --url https://mcp.vercel.com
```

To authenticate, ask the user to run `/mcps` in OpenCode, select `vercel`, and sign in.

### Windsurf

Merge this into `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "serverUrl": "https://mcp.vercel.com"
    }
  }
}
```

Refresh the MCP configuration in Windsurf after saving.

### Gemini CLI

Merge this into `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.vercel.com"]
    }
  }
}
```

Run Gemini CLI and use `/mcp list` to load the server.

### Common authorization and verification

Before authorizing, verify the endpoint is exactly:

```text
https://mcp.vercel.com
```

When a browser or consent screen opens, pause for the user to complete OAuth.

After authorization:

1. Call `search_vercel_documentation`.
2. Call the authenticated, read-only `list_teams` tool.
3. Refresh the client's MCP tools or server list if either is unavailable.
4. Start or resume a session, or reload or restart the client, only if refreshing does not load the server.

Keep human confirmation enabled for every MCP mutation. Connecting MCP gives the agent the access of the authorizing Vercel user.

## Completion

Report only verified state:

```text
▲ Vercel agent setup is ready
CLI: <version>, authenticated as <username>
Guidance: <plugin|skills|blocked: reason>, global or user scope
MCP: <connected|blocked: reason>, global shared endpoint, https://mcp.vercel.com
MCP config: <path|managed by Vercel CLI>
Authenticated MCP check: <list_teams succeeded|not requested>
Reload: <not needed|completed>
```

Sources:

- https://vercel.com/docs/cli
- https://vercel.com/docs/agent-resources/vercel-plugin
- https://vercel.com/docs/agent-resources/skills
- https://vercel.com/docs/agent-resources/vercel-mcp
- https://vercel.com/docs/cli/mcp
