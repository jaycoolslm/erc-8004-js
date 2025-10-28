import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { formatTxResult, toBigIntString } from '../helpers';

const schema = z.object({});

export interface IdentityRegisterResult {
  agentId: string;
  txHash: string;
}

export const register: ToolDefinition<IdentityRegisterResult> = {
  name: 'identity_register',
  description: 'Register a new agent without a token URI and return the transaction hash.',
  schema,
  execute: async (ctx, rawInput) => {
    schema.parse(rawInput ?? {});
    const result = await ctx.client.identity.register();
    const data: IdentityRegisterResult = {
      agentId: toBigIntString(result.agentId),
      txHash: result.txHash,
    };
    return formatTxResult('Registered agent', data, `agent ${data.agentId} on chain ${ctx.chainId}`);
  },
};
