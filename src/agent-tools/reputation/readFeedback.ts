import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
  index: bigIntSchema,
});

export interface ReputationReadFeedbackResult {
  agentId: string;
  clientAddress: string;
  index: string;
  score: number;
  tag1: string;
  tag2: string;
  isRevoked: boolean;
}

export const readFeedback: ToolDefinition<ReputationReadFeedbackResult> = {
  name: 'reputation_readFeedback',
  description: 'Read a single feedback entry for an agent and client.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const feedback = await ctx.client.reputation.readFeedback(
      input.agentId,
      input.clientAddress,
      input.index
    );

    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        clientAddress: input.clientAddress,
        index: toBigIntString(input.index),
        score: feedback.score,
        tag1: feedback.tag1,
        tag2: feedback.tag2,
        isRevoked: feedback.isRevoked,
      },
      `Read feedback index ${toBigIntString(input.index)} for agent ${toBigIntString(input.agentId)}`
    );
  },
};
