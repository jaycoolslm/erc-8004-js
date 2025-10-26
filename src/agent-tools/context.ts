import type { ERC8004Client } from '../ERC8004Client';
import type { IPFSClient } from '../utils/ipfs';

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
