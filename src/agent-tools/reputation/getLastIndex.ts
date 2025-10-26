import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { addressSchema, agentIdSchema, createToolResult, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
});

export interface ReputationGetLastIndexResult {
  agentId: string;
  clientAddress: string;
  lastIndex: string;
}

export const getLastIndex: ToolDefinition<ReputationGetLastIndexResult> = {
  name: 'reputation_getLastIndex',
  description: 'Return the latest feedback index for a client/agent pair.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const lastIndex = await ctx.client.reputation.getLastIndex(input.agentId, input.clientAddress);
    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        clientAddress: input.clientAddress,
        lastIndex: toBigIntString(lastIndex),
      },
      `Last feedback index for client ${input.clientAddress} is ${toBigIntString(lastIndex)}`
    );
  },
};
