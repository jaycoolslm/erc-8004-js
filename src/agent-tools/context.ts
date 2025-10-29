import { ERC8004Client, IPFSClient } from "erc-8004-js";

export type AdapterMode = 'execute' | 'return-bytes';

export interface AgentContextConfig {
  client: ERC8004Client;
  chainId?: number;
  adapterMode?: AdapterMode;
  ipfsClient?: IPFSClient;
  metadata?: Record<string, unknown>;
}

export interface AgentContext {
  client: ERC8004Client;
  chainId: number;
  adapterMode: AdapterMode;
  ipfsClient?: IPFSClient;
  address?: string | null;
  metadata: Record<string, unknown>;
}

export async function createAgentContext(config: AgentContextConfig): Promise<AgentContext> {
  const chainId = config.chainId ?? (await config.client.getChainId());
  const address = await config.client.getAddress();

  return {
    client: config.client,
    chainId,
    adapterMode: config.adapterMode ?? 'execute',
    ipfsClient: config.ipfsClient,
    address,
    metadata: config.metadata ?? {},
  };
}

export function withAgentContext(base: AgentContext, overrides: Partial<AgentContext>): AgentContext {
  return {
    ...base,
    ...overrides,
    metadata: {
      ...base.metadata,
      ...overrides.metadata,
    },
  };
}
