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
import { hexToBytes, hexToString } from "viem";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddresses: z.array(addressSchema).optional(),
  tag1: optionalStringSchema,
  tag2: optionalStringSchema,
  includeRevoked: z.boolean().optional(),
});

type ReputationReadAllFeedbackInput = z.infer<typeof schema>;

export interface ReputationReadAllFeedbackResult {
  agentId: string;
  clientAddresses: string[];
  scores: number[];
  tag1s: string[];
  tag2s: string[];
  revokedStatuses: boolean[];
  filters: {
    clientAddresses?: string[];
    tag1?: string;
    tag2?: string;
    includeRevoked?: boolean;
  };
}

export const readAllFeedback: ToolDefinition<ReputationReadAllFeedbackResult> = {
  name: 'reputation_readAllFeedback',
  description: 'Read all feedback entries with optional client and tag filters. Return detailed data for each entry.',
  schema,
  execute: async (ctx, rawInput: ReputationReadAllFeedbackInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.reputation.readAllFeedback(
        input.agentId,
        input.clientAddresses,
        input.tag1,
        input.tag2,
        input.includeRevoked
      );

      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          clientAddresses: result.clientAddresses,
          scores: result.scores,
          tag1s: result.tag1s,
          tag2s: result.tag2s,
          revokedStatuses: result.revokedStatuses,
          filters: {
            clientAddresses: input.clientAddresses,
            tag1: input.tag1,
            tag2: input.tag2,
            includeRevoked: input.includeRevoked,
          },
        },
        `Read ${result.scores.length} feedback entries for agent ${toBigIntString(input.agentId)}. Feedbacks: ${JSON.stringify(result, null, 2)}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while reading all feedback';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          clientAddresses: [],
          scores: [],
          tag1s: [],
          tag2s: [],
          revokedStatuses: [],
          filters: {
            clientAddresses: rawInput.clientAddresses,
            tag1: rawInput.tag1,
            tag2: rawInput.tag2,
            includeRevoked: rawInput.includeRevoked,
          },
        },
        `Failed to read feedback entries for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
