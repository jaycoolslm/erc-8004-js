import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, stringSchema, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  key: stringSchema,
});

export interface IdentityGetMetadataResult {
  agentId: string;
  key: string;
  value: string;
}

export const getMetadata: ToolDefinition<IdentityGetMetadataResult> = {
  name: 'identity_getMetadata',
  description: 'Read an on-chain metadata value by key for the given agent.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const value = await ctx.client.identity.getMetadata(input.agentId, input.key);
    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        key: input.key,
        value,
      },
      `Read metadata ${input.key} for agent ${toBigIntString(input.agentId)}`
    );
  },
};
