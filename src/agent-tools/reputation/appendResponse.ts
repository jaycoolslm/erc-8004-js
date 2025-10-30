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
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema.describe('The address of the account that submitted the feedback to which the response will be attached. Must be a valid address (0x...).'),
  feedbackIndex: bigIntSchema,
  responseUri: z.string().optional(),
  responseHash: optionalBytes32Schema,
});

type ReputationAppendResponseInput = z.infer<typeof schema>;

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
  execute: async (ctx, rawInput: ReputationAppendResponseInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while appending feedback response';
      return formatTxResult(
        'Failed to append feedback response',
        {
          agentId: toBigIntString(rawInput.agentId),
          clientAddress: rawInput.clientAddress,
          feedbackIndex: toBigIntString(rawInput.feedbackIndex),
          txHash: 'N/A',
        },
        `agent ${toBigIntString(rawInput.agentId)} index ${toBigIntString(rawInput.feedbackIndex)}`,
        message
      );
    }
  },
};
