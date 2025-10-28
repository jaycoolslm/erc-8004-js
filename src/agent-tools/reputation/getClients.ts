import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
});

export interface ReputationGetClientsResult {
  agentId: string;
  clients: string[];
}

export const getClients: ToolDefinition<ReputationGetClientsResult> = {
  name: 'reputation_getClients',
  description: 'List client addresses that have ever submitted feedback for the agent.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const clients = await ctx.client.reputation.getClients(input.agentId);
    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        clients,
      },
      `Found ${clients.length} feedback clients for agent ${toBigIntString(input.agentId)}`
    );
  },
};
