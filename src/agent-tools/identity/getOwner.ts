import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
});

type IdentityGetOwnerInput = z.infer<typeof schema>;

export interface IdentityGetOwnerResult {
  agentId: string;
  owner: string;
}

export const getOwner: ToolDefinition<IdentityGetOwnerResult> = {
  name: 'identity_getOwner',
  description: 'Look up the current owner address for an agent.',
  schema,
  execute: async (ctx, rawInput: IdentityGetOwnerInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const owner = await ctx.client.identity.getOwner(input.agentId);
      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          owner,
        },
        `Owner for agent ${toBigIntString(input.agentId)} is ${owner}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while getting owner';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          owner: 'N/A',
        },
        `Failed to get owner for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
