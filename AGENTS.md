# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the TypeScript SDK; clients such as `ERC8004Client.ts`, `IdentityClient.ts`, `ReputationClient.ts`, and `ValidationClient.ts` compose the public API, while `adapters/`, `utils/`, and `types.ts` supply shared plumbing.
- `src/abis/` maintains contract ABIs that must stay in sync with on-chain deployments; update carefully when contracts change.
- `examples/` offers runnable integration scripts (`testValidation.ts`, `testReputation.ts`, etc.) that double as scenario tests.
- `docs/` captures contributor-facing guides. Add deep dives here rather than in README.

## Build, Test, and Development Commands
- `npm install` brings in dev-time dependencies (`typescript`, `ts-node`, `ethers`, `viem`).
- `npm run build` runs the TypeScript compiler with `tsconfig.json`, emitting artifacts to `dist/`.
- `npx ts-node examples/testValidation.ts` (or other example files) executes smoke tests against a Hardhat node; configure `.env` as needed for RPC URLs and keys.

## Coding Style & Naming Conventions
- Prefer TypeScript, strict typing, and keep modules single-responsibility; shared helpers belong in `src/utils/`.
- Follow existing 2-space indentation, arrow functions for callbacks, and descriptive camelCase for variables/functions. Exported classes and types use PascalCase.
- Document non-obvious logic with single-line `//` comments; avoid block comments except for file headers.
- Run `npm run build` before pushing to catch type or lint regressions (the strict compiler is our primary guardrail).

## Testing Guidelines
- We rely on scenario scripts under `examples/` until formal unit tests land. Tailor new flows by copying an existing file and prefixing with `test`.
- Target at least one on-chain happy path and one failure path per feature; include assertions on returned structs and emitted data.
- When changing contracts or ABIs, validate against a local Hardhat network (`npx hardhat node`) and document any new deployment addresses in the example files.

## Commit & Pull Request Guidelines
- Keep commits focused with short, imperative messages mirroring current history (`update readme`, `rename`). Squash noisy fixups.
- Pull requests should describe intent, list manual verification (commands run, networks used), and link issues when applicable. Add screenshots for UI-oriented changes (if any).
- Request review early for protocol changes; note breaking API updates in the PR body and prepare a follow-up docs task when needed.

## Environment & Security Tips
- Store RPC URLs, private keys, and IPFS tokens in `.env`; never commit secrets. `dotenv` loads them for local scripts.
- Default to Sepolia or Hardhat for experimentation. Double-check chain IDs in `ERC8004Client` configs before broadcasting to production networks.
