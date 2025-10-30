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
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: optionalAddressSchema,
  feedbackIndex: bigIntSchema.optional(),
  responders: z.array(addressSchema).optional(),
});

type ReputationGetResponseCountInput = z.infer<typeof schema>;

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
  execute: async (ctx, rawInput: ReputationGetResponseCountInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching response count';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          count: 'N/A',
          filters: {
            clientAddress: rawInput.clientAddress,
            feedbackIndex: rawInput.feedbackIndex ? toBigIntString(rawInput.feedbackIndex) : undefined,
            responders: rawInput.responders,
          },
        },
        `Failed to fetch response count for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
