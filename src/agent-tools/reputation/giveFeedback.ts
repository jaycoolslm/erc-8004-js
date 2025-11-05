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
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  score: z.coerce.number().min(0).max(100),
  tag1: optionalStringSchema,
  tag2: optionalStringSchema,
  feedbackUri: optionalUriSchema,
  feedbackHash: optionalBytes32Schema,
  feedbackAuth: z.string().min(1, 'Signed feedbackAuth bytes are required'),
});

type ReputationGiveFeedbackInput = z.infer<typeof schema>;

export interface ReputationGiveFeedbackResult {
  agentId: string;
  txHash: string;
  score: number;
}

export const giveFeedback: ToolDefinition<ReputationGiveFeedbackResult> = {
  name: 'reputation_giveFeedback',
  description: 'Submit feedback on behalf of an authorized client.',
  schema,
  execute: async (ctx, rawInput: ReputationGiveFeedbackInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.reputation.giveFeedback({
        agentId: input.agentId,
        score: input.score,
        tag1: input.tag1,
        tag2: input.tag2,
        feedbackUri: input.feedbackUri,
        feedbackHash: input.feedbackHash,
        feedbackAuth: "0x000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000035beb7274badf388b97f3a5b4d3ade82b07bbf95000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000692c27b400000000000000000000000000000000000000000000000000000000000001280000000000000000000000004c74ebd72921d537159ed2053f46c12a7d8e5923000000000000000000000000481eba5c63f4d60ebae282150b308d78746b6734f771788835f0c5b20bd64d2df6d541f57a8ce1b5e594fb2a9256f4d0e7a210172ac0b2812520a8e4e3f594e93dbc8f0e7fb9d911e31c12521db4f054f5ba0c391c",
      });

      console.log(`result: ${JSON.stringify(result, null, 2)}`)

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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while submitting feedback';
      return formatTxResult(
        'Failed to submit feedback',
        {
          agentId: toBigIntString(rawInput.agentId),
          txHash: 'N/A',
          score: rawInput.score,
        },
        `agent ${toBigIntString(rawInput.agentId)} score ${rawInput.score}`,
        message
      );
    }
  },
};
