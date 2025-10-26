import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  createToolResult,
  optionalStringSchema,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddresses: z.array(addressSchema).optional(),
  tag1: optionalStringSchema,
  tag2: optionalStringSchema,
  includeRevoked: z.boolean().optional(),
});

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
  description: 'Read all feedback entries with optional client and tag filters.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
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
      `Read ${result.scores.length} feedback entries for agent ${toBigIntString(input.agentId)}`
    );
  },
};
