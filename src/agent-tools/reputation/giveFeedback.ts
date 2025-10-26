import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  agentIdSchema,
  formatTxResult,
  optionalBytes32Schema,
  optionalStringSchema,
  optionalUriSchema,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  score: z.coerce.number().min(0).max(100),
  tag1: optionalStringSchema,
  tag2: optionalStringSchema,
  feedbackUri: optionalUriSchema,
  feedbackHash: optionalBytes32Schema,
  feedbackAuth: z.string().min(1, 'Signed feedbackAuth bytes are required'),
});

export interface ReputationGiveFeedbackResult {
  agentId: string;
  txHash: string;
  score: number;
}

export const giveFeedback: ToolDefinition<ReputationGiveFeedbackResult> = {
  name: 'reputation_giveFeedback',
  description: 'Submit feedback on behalf of an authorized client.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const result = await ctx.client.reputation.giveFeedback({
      agentId: input.agentId,
      score: input.score,
      tag1: input.tag1,
      tag2: input.tag2,
      feedbackUri: input.feedbackUri,
      feedbackHash: input.feedbackHash,
      feedbackAuth: input.feedbackAuth,
    });

    const data: ReputationGiveFeedbackResult = {
      agentId: toBigIntString(input.agentId),
      txHash: result.txHash,
      score: input.score,
    };

    return formatTxResult(
      'Submitted feedback',
      data,
      `agent ${data.agentId} score ${input.score}`
    );
  },
};
