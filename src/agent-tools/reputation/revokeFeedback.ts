import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, bigIntSchema, formatTxResult, toBigIntString } from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  feedbackIndex: bigIntSchema,
});

export interface ReputationRevokeFeedbackResult {
  agentId: string;
  feedbackIndex: string;
  txHash: string;
}

export const revokeFeedback: ToolDefinition<ReputationRevokeFeedbackResult> = {
  name: 'reputation_revokeFeedback',
  description: 'Revoke a previously submitted feedback entry.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const result = await ctx.client.reputation.revokeFeedback(input.agentId, input.feedbackIndex);
    const data: ReputationRevokeFeedbackResult = {
      agentId: toBigIntString(input.agentId),
      feedbackIndex: toBigIntString(input.feedbackIndex),
      txHash: result.txHash,
    };

    return formatTxResult(
      'Revoked feedback',
      data,
      `agent ${data.agentId} index ${data.feedbackIndex}`
    );
  },
};
