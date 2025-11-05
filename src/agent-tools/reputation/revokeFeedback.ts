import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, bigIntSchema, formatTxResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  feedbackIndex: bigIntSchema,
});

type ReputationRevokeFeedbackInput = z.infer<typeof schema>;

export interface ReputationRevokeFeedbackResult {
  agentId: string;
  feedbackIndex: string;
  txHash: string;
}

export const revokeFeedback: ToolDefinition<ReputationRevokeFeedbackResult> = {
  name: 'reputation_revokeFeedback',
  description: 'Revoke a previously submitted feedback entry.',
  schema,
  execute: async (ctx, rawInput: ReputationRevokeFeedbackInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while revoking feedback';
      return formatTxResult(
        'Failed to revoke feedback',
        {
          agentId: toBigIntString(rawInput.agentId),
          feedbackIndex: toBigIntString(rawInput.feedbackIndex),
          txHash: 'N/A',
        },
        `agent ${toBigIntString(rawInput.agentId)} index ${toBigIntString(rawInput.feedbackIndex)}`,
        message
      );
    }
  },
};
