import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  formatTxResult,
  optionalBytes32Schema,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
  feedbackIndex: bigIntSchema,
  responseUri: z.string().optional(),
  responseHash: optionalBytes32Schema,
});

export interface ReputationAppendResponseResult {
  agentId: string;
  clientAddress: string;
  feedbackIndex: string;
  txHash: string;
}

export const appendResponse: ToolDefinition<ReputationAppendResponseResult> = {
  name: 'reputation_appendResponse',
  description: 'Attach a response URI or hash to an existing feedback entry.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const result = await ctx.client.reputation.appendResponse(
      input.agentId,
      input.clientAddress,
      input.feedbackIndex,
      input.responseUri ?? '',
      input.responseHash
    );

    const data: ReputationAppendResponseResult = {
      agentId: toBigIntString(input.agentId),
      clientAddress: input.clientAddress,
      feedbackIndex: toBigIntString(input.feedbackIndex),
      txHash: result.txHash,
    };

    return formatTxResult(
      'Appended feedback response',
      data,
      `agent ${data.agentId} index ${data.feedbackIndex}`
    );
  },
};
