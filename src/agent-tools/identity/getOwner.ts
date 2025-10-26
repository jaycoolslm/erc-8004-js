import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
});

export interface IdentityGetOwnerResult {
  agentId: string;
  owner: string;
}

export const getOwner: ToolDefinition<IdentityGetOwnerResult> = {
  name: 'identity_getOwner',
  description: 'Look up the current owner address for an agent.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const owner = await ctx.client.identity.getOwner(input.agentId);
    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        owner,
      },
      `Owner for agent ${toBigIntString(input.agentId)} is ${owner}`
    );
  },
};
