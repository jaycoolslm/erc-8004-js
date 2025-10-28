import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  optionalAddressSchema,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: optionalAddressSchema,
  feedbackIndex: bigIntSchema.optional(),
  responders: z.array(addressSchema).optional(),
});

export interface ReputationGetResponseCountResult {
  agentId: string;
  count: string;
  filters: {
    clientAddress?: string;
    feedbackIndex?: string;
    responders?: string[];
  };
}

export const getResponseCount: ToolDefinition<ReputationGetResponseCountResult> = {
  name: 'reputation_getResponseCount',
  description: 'Return how many responses exist for the given feedback filter set.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const count = await ctx.client.reputation.getResponseCount(
      input.agentId,
      input.clientAddress,
      input.feedbackIndex,
      input.responders
    );

    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        count: toBigIntString(count),
        filters: {
          clientAddress: input.clientAddress,
          feedbackIndex: input.feedbackIndex ? toBigIntString(input.feedbackIndex) : undefined,
          responders: input.responders,
        },
      },
      `Response count for agent ${toBigIntString(input.agentId)} is ${toBigIntString(count)}`
    );
  },
};
