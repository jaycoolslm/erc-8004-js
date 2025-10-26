import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, formatTxResult, toBigIntString, uriSchema } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  tokenURI: uriSchema,
});

export interface IdentitySetAgentUriResult {
  agentId: string;
  txHash: string;
  tokenURI: string;
}

export const setAgentUri: ToolDefinition<IdentitySetAgentUriResult> = {
  name: 'identity_setAgentUri',
  description: 'Update the token URI associated with an agent.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const result = await ctx.client.identity.setAgentUri(input.agentId, input.tokenURI);

    const data: IdentitySetAgentUriResult = {
      agentId: toBigIntString(input.agentId),
      txHash: result.txHash,
      tokenURI: input.tokenURI,
    };

    return formatTxResult(
      'Updated agent URI',
      data,
      `agent ${data.agentId} set to ${data.tokenURI}`
    );
  },
};
