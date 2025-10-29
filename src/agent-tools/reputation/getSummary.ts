import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  createToolResult,
  optionalStringSchema,
  toBigIntString,
} from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddresses: z.array(addressSchema).optional(),
  tag1: optionalStringSchema,
  tag2: optionalStringSchema,
});

type ReputationGetSummaryInput = z.infer<typeof schema>;

export interface ReputationGetSummaryResult {
  agentId: string;
  count: string;
  averageScore: number;
  filters: {
    clientAddresses?: string[];
    tag1?: string;
    tag2?: string;
  };
}

export const getSummary: ToolDefinition<ReputationGetSummaryResult> = {
  name: 'reputation_getSummary',
  description: 'Aggregate total feedback count and average score with optional filters.',
  schema,
  execute: async (ctx, rawInput: ReputationGetSummaryInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.reputation.getSummary(
        input.agentId,
        input.clientAddresses,
        input.tag1,
        input.tag2
      );

      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          count: toBigIntString(result.count),
          averageScore: result.averageScore,
          filters: {
            clientAddresses: input.clientAddresses,
            tag1: input.tag1,
            tag2: input.tag2,
          },
        },
        `Summary for agent ${toBigIntString(input.agentId)} with ${toBigIntString(result.count)} entries`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching summary';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          count: 'N/A',
          averageScore: 0,
          filters: {
            clientAddresses: rawInput.clientAddresses,
            tag1: rawInput.tag1,
            tag2: rawInput.tag2,
          },
        },
        `Failed to fetch summary for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
