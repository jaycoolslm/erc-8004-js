# Agent Toolkit Quick Start

The agent toolkit wraps the existing `ERC8004Client` into tool definitions usable with agents like LangChain, Vercel AI SDK, and MCP servers. Every tool maps directly to a public method on `IdentityClient` or `ReputationClient`.

## 1. Create an `AgentContext`

```ts
import { ERC8004Client, createAgentContext } from 'erc-8004-js';

const client = new ERC8004Client({ /* adapter + registry addresses */ });
const context = await createAgentContext({ client });
```

`AgentContext` caches chain metadata and threads optional helpers (IPFS client, adapter mode flags) through every tool.

## 2. Select Tools

```ts
import { createAgentTools } from 'erc-8004-js';

const allIdentity = createAgentTools({ categories: ['identity'] });
const singleTool = createAgentTools({ include: ['identity_register'] });
```

Tools always validate inputs with the bundled Zod schemas before calling the SDK.

## 3. Framework Adapters

### LangChain Structured Tools

```ts
import { createLangChainTools } from 'erc-8004-js';

const structuredTools = await createLangChainTools(context);
```

Each tool returns the JSON result by default. Set `hydrateSummary: true` to return the summary string when available.

### Vercel AI SDK

```ts
import { createAiSdkTools } from 'erc-8004-js';

const tools = await createAiSdkTools(context);
```

The factory returns a `{ [name]: tool }` record ready to spread into `tools` when instantiating an AI SDK route.

### Model Context Protocol (MCP)

```ts
import { createMcpServer } from 'erc-8004-js';

const server = await createMcpServer(context);
await server.start();
```

Use `registerAgentToolsWithMcpServer` to bind tools to an existing server instance.

## Adapter Modes

Set `adapterMode: 'return-bytes'` on the agent context to receive raw data structures in adapter handlers. The default `'execute'` mode returns summaries where appropriate.

## Available Tools

- Identity: registration helpers, metadata management, owner lookups, token URI utilities.
- Reputation: feedback authorization, submission, queries, and summaries.

Additional categories can be added by dropping new tool files under `src/agent-tools/<category>/` and exporting them from the category index.
