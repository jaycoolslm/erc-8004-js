import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
});

type ReputationGetClientsInput = z.infer<typeof schema>;

export interface ReputationGetClientsResult {
  agentId: string;
  clients: string[];
}

export const getClients: ToolDefinition<ReputationGetClientsResult> = {
  name: 'reputation_getClients',
  description: 'List client addresses that have ever submitted feedback for the agent.',
  schema,
  execute: async (ctx, rawInput: ReputationGetClientsInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const clients = await ctx.client.reputation.getClients(input.agentId);

      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          clients,
        },
        `Found ${clients.length} feedback clients for agent ${toBigIntString(input.agentId)}. List: ${clients.join(', ')}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching feedback clients';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          clients: [],
        },
        `Failed to fetch feedback clients for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
