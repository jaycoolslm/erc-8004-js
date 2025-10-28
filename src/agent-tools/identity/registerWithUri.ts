import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { formatTxResult, toBigIntString, uriSchema } from '../helpers';

const schema = z.object({
  tokenURI: uriSchema,
});

export interface IdentityRegisterWithUriResult {
  agentId: string;
  txHash: string;
  tokenURI: string;
}

export const registerWithUri: ToolDefinition<IdentityRegisterWithUriResult> = {
  name: 'identity_registerWithUri',
  description: 'Register a new agent with the provided token URI and return identifiers.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const result = await ctx.client.identity.registerWithURI(input.tokenURI);
    const data: IdentityRegisterWithUriResult = {
      agentId: toBigIntString(result.agentId),
      txHash: result.txHash,
      tokenURI: input.tokenURI,
    };
    return formatTxResult(
      'Registered agent with URI',
      data,
      `agent ${data.agentId} using ${data.tokenURI}`
    );
  },
};
