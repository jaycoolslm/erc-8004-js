# Repository Guidelines

## Project Structure & Module Organization

This repository provides an **agentic toolkit** for ERC-8004, consisting of:

- **`src/agent-tools/`** - Core tool definitions organized by category:
  - `identity/` - Tools for agent registration, metadata management, owner lookups, and token URI operations
  - `reputation/` - Tools for feedback authorization, submission, queries, and reputation summaries
  - `context.ts` - Creates `AgentContext` that threads client config, chain metadata, and optional helpers through every tool
  - `types.ts` - Shared TypeScript interfaces for tool definitions, parameters, and results
  - `helpers.ts` - Utility functions for tool execution and error handling
  - `schema-parser.ts` - Zod schema validation and parsing utilities

- **`src/agent-adapters/`** - Framework-specific adapters that convert tool definitions into usable formats:
  - `langchain.ts` - Exports `createLangChainTools()` to generate LangChain StructuredTool instances
  - `ai-sdk.ts` - Exports `createAiSdkTools()` to generate Vercel AI SDK tool records
  - `mcp.ts` - Exports `createMcpServer()` and `registerAgentToolsWithMcpServer()` for Model Context Protocol integration

- **`examples/`** - Runnable integration examples:
  - `ai-sdk-agent.ts` - Demonstrates Vercel AI SDK integration
  - `langchain-agent.ts` - Shows LangChain agent setup with conversational memory
  - `mcp-server.ts` - Illustrates MCP server creation and startup

- **`docs/`** - Contributor-facing documentation:
  - `AGENT_TOOLS.md` - Quick start guide for the agentic toolkit

- **External SDK dependency** - This package depends on `erc-8004-js` (the base SDK) which provides:
  - `ERC8004Client` - Main client with `identity`, `reputation`, and `validation` sub-clients
  - `EthersAdapter` / `ViemAdapter` - Blockchain provider adapters
  - Contract ABIs and type definitions

## Build, Test, and Development Commands

- `npm install` - Installs dependencies including `erc-8004-js`, `@langchain/core`, `ai`, `@modelcontextprotocol/sdk`, and framework-specific packages
- `npm run build` - Compiles TypeScript to `dist/`, emitting both JS and type definitions
- `tsx examples/ai-sdk-agent.ts` - Runs the Vercel AI SDK example (configure `.env` first)
- `tsx examples/langchain-agent.ts` - Runs the LangChain agent example (configure `.env` first)
- `tsx examples/mcp-server.ts` - Starts the MCP server example (configure `.env` first)

## Coding Style & Naming Conventions

- **TypeScript strict mode** - All code uses strict typing with explicit return types
- **Tool naming** - Use snake_case for tool names (e.g., `identity_register`, `reputation_give_feedback`)
- **Module organization** - Each tool lives in its own file under `src/agent-tools/<category>/<toolName>.ts`
- **Exports** - Category index files (`identity/index.ts`, `reputation/index.ts`) export both array (`identityTools`) and dictionary (`identityToolDictionary`) for flexible access
- **Indentation** - 2 spaces, no tabs
- **Comments** - Document non-obvious logic with single-line `//` comments
- **Type safety** - All tool parameters validate through Zod schemas before execution


## Commit & Pull Request Guidelines

- **Commit messages** - Use conventional commits format: `feat:`, `fix:`, `refactor:`, `docs:`
- **Breaking changes** - Mark with `!` and document in PR body (e.g., `feat!: rename tool parameters`)
- **Tool additions** - Include example usage in PR description
- **Adapter changes** - Test all three adapters (LangChain, AI SDK, MCP) before submitting
- **Documentation** - Update `AGENT_TOOLS.md` when adding categories or changing API surface

## Environment & Security Tips

- **Environment variables** - Store in `.env` at project root:
  - `RPC_URL` - Blockchain RPC endpoint
  - `HEDERA_TESTNET_PRIVATE_KEY_1` - Signer private key, adapt the `./examples` code to use other chains and envs
  - `IDENTITY_REGISTRY`, `REPUTATION_REGISTRY`, `VALIDATION_REGISTRY` - Contract addresses
  - `CHAIN_ID` - Network chain ID (296 for Hedera testnet, 31337 for Hardhat)
  - `OPENAI_API_KEY` - Required for LangChain example
- **Never commit secrets** - `.env` is gitignored
- **Default networks** - Examples default to Hedera testnet; adjust for local development or other chains
- **Adapter modes** - Set `adapterMode: 'return-bytes'` in `AgentContext` to receive raw data structures instead of summaries
