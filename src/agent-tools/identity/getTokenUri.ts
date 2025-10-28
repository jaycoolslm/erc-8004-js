import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
});

export interface IdentityGetTokenUriResult {
  agentId: string;
  tokenURI: string;
}

export const getTokenUri: ToolDefinition<IdentityGetTokenUriResult> = {
  name: 'identity_getTokenUri',
  description: 'Fetch the token URI associated with an agent ID.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const agentId = input.agentId;
    const tokenURI = await ctx.client.identity.getTokenURI(agentId);

    return createToolResult(
      {
        agentId: toBigIntString(agentId),
        tokenURI,
      },
      `Retrieved token URI for agent ${toBigIntString(agentId)}`
    );
  },
};
