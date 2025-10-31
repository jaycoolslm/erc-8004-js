# ERC-8004 JS Agent Kit

TypeScript SDK with agentic tools for ERC-8004 Trustless Agents protocol. This package provides framework-agnostic tool definitions plus adapters for **LangChain**, **Vercel AI SDK**, and **Model Context Protocol (MCP)**.

## Overview

ERC-8004 enables trustless agent economies through three core registries:

- **Identity Registry** - On-chain agent registration with portable identifiers
- **Reputation Registry** - Feedback and reputation scoring system
- **Validation Registry** - Independent validation and verification hooks

This agent kit wraps the base `erc-8004-js` SDK into tool definitions usable with popular AI agent frameworks.

## Installation

```bash
npm install erc-8004-js-agent-kit ethers
# or
npm install erc-8004-js-agent-kit viem
```

**Note:** `erc-8004-js` (the base SDK) is included as a dependency. You only need to install either `ethers` (v6+) or `viem` (v2+) as your blockchain provider library.

## Quick Start

### 1. Create an Agent Context

```typescript
import { ERC8004Client, EthersAdapter } from 'erc-8004-js';
import { createAgentContext } from 'erc-8004-js-agent-kit';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const adapter = new EthersAdapter(provider, signer);

const client = new ERC8004Client({
  adapter,
  addresses: {
    identityRegistry: '0x...',
    reputationRegistry: '0x...',
    validationRegistry: '0x...',
    chainId: 296, // Hedera testnet
  },
});

const context = await createAgentContext({ client });
```

### 2. Choose Your Framework

#### LangChain Agent Example

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { createLangChainTools } from 'erc-8004-js-agent-kit';

// Create LangChain tools
const tools = await createLangChainTools(context, {
  categories: ['identity', 'reputation'],
});

// Set up the LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
});

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant for managing ERC-8004 agents.'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

// Create the agent
const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

// Create the executor
const executor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

// Run the agent
const result = await executor.invoke({
  input: 'Register a new agent with URI ipfs://QmExample',
});

console.log(result.output);
```

#### Vercel AI SDK

```typescript
import { createAiSdkTools } from 'erc-8004-js-agent-kit';

const tools = await createAiSdkTools(context);
// Use tools in your AI SDK route
```

#### Model Context Protocol (MCP)

```typescript
import { createMcpServer } from 'erc-8004-js-agent-kit';

const server = await createMcpServer(context);
await server.start();
```

## Available Tools

### Identity Tools

All identity tools are prefixed with `identity_`:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `identity_register` | Register a new agent without a token URI | None |
| `identity_registerWithUri` | Register a new agent with a token URI | `tokenURI` (string) - IPFS or HTTP URI |
| `identity_registerWithMetadata` | Register with URI and metadata entries | `tokenURI` (string), `metadata` (optional array of {key, value}) |
| `identity_getOwner` | Look up the current owner address | `agentId` (string/bigint) |
| `identity_getTokenUri` | Fetch the token URI for an agent | `agentId` (string/bigint) |
| `identity_setAgentUri` | Update the token URI | `agentId` (string/bigint), `tokenURI` (string) |
| `identity_getMetadata` | Read an on-chain metadata value by key | `agentId` (string/bigint), `key` (string) |
| `identity_setMetadata` | Persist an on-chain metadata key/value pair | `agentId` (string/bigint), `key` (string), `value` (string) |
| `identity_getRegistrationFile` | Fetch the full registration JSON from token URI | `agentId` (string/bigint) |

### Reputation Tools

All reputation tools are prefixed with `reputation_`:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `reputation_createAndSignFeedbackAuth` | Create and sign feedback authorization in one step | `agentId` (string/bigint), `clientAddress` (address), `indexLimit` (bigint), `expiry` (bigint timestamp), optional: `chainId`, `signerAddress` |
| `reputation_giveFeedback` | Submit feedback on behalf of an authorized client | `agentId` (string/bigint), `score` (0-100), `feedbackAuth` (signed hex string), optional: `tag1`, `tag2`, `feedbackUri`, `feedbackHash` |
| `reputation_revokeFeedback` | Revoke a previously submitted feedback entry | `agentId` (string/bigint), `feedbackIndex` (bigint) |
| `reputation_appendResponse` | Attach a response URI/hash to existing feedback | `agentId` (string/bigint), `clientAddress` (address), `feedbackIndex` (bigint), optional: `responseUri`, `responseHash` |
| `reputation_getSummary` | Aggregate feedback count and average score | `agentId` (string/bigint), optional filters: `clientAddresses`, `tag1`, `tag2` |
| `reputation_readFeedback` | Read a single feedback entry | `agentId` (string/bigint), `clientAddress` (address), `index` (bigint) |
| `reputation_readAllFeedback` | Read all feedback entries with optional filters | `agentId` (string/bigint), optional: `clientAddresses`, `tag1`, `tag2`, `includeRevoked` (boolean) |
| `reputation_getClients` | List client addresses that submitted feedback | `agentId` (string/bigint) |
| `reputation_getLastIndex` | Return the latest feedback index for a client | `agentId` (string/bigint), `clientAddress` (address) |
| `reputation_getResponseCount` | Count responses for given filters | `agentId` (string/bigint), optional: `clientAddress`, `feedbackIndex`, `responders` (array) |
| `reputation_getIdentityRegistry` | Return the identity registry address | None |

### Parameter Types

- **agentId**: String or BigInt representing the agent's unique identifier
- **address**: Ethereum address in hex format (0x...)
- **bigint**: Large integer, can be passed as string or BigInt
- **tokenURI**: IPFS URI (ipfs://...) or HTTP URL
- **score**: Integer between 0-100
- **timestamp**: Unix timestamp in seconds

## Adapter Modes

Set `adapterMode` on the agent context to control return format:

```typescript
const context = await createAgentContext({
  client,
  adapterMode: 'return-bytes', // Raw data structures
});
```

Default `'execute'` mode returns human-readable summaries where appropriate.

## Examples

See the `examples/` directory for complete working examples:

- `langchain-agent.ts` - Interactive LangChain agent with conversation
- `ai-sdk-agent.ts` - Vercel AI SDK integration
- `mcp-server.ts` - Model Context Protocol server

## Environment Variables

Create a `.env` file:

```bash
RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_PRIVATE_KEY_1=0x...
IDENTITY_REGISTRY=0x...
REPUTATION_REGISTRY=0x...
VALIDATION_REGISTRY=0x...
CHAIN_ID=296
OPENAI_API_KEY=sk-... # For LangChain example
```

## License

MIT

## Links

- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [Base SDK Repository](https://github.com/tetratorus/erc-8004-js)
- [Agent Kit Documentation](./docs/AGENT_TOOLS.md)
