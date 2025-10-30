import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
  index: bigIntSchema,
});

type ReputationReadFeedbackInput = z.infer<typeof schema>;

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
  execute: async (ctx, rawInput: ReputationReadFeedbackInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
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
        `Read feedback index ${toBigIntString(input.index)} for agent ${toBigIntString(input.agentId)}. Feedback: ${JSON.stringify(feedback, null, 2)}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while reading feedback';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          clientAddress: rawInput.clientAddress,
          index: toBigIntString(rawInput.index),
          score: 0,
          tag1: '',
          tag2: '',
          isRevoked: false,
        },
        `Failed to read feedback index ${toBigIntString(rawInput.index)} for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
