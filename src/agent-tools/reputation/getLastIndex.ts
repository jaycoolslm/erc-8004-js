import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { addressSchema, agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
});

type ReputationGetLastIndexInput = z.infer<typeof schema>;

export interface ReputationGetLastIndexResult {
  agentId: string;
  clientAddress: string;
  lastIndex: string;
}

export const getLastIndex: ToolDefinition<ReputationGetLastIndexResult> = {
  name: 'reputation_getLastIndex',
  description: 'Return the latest feedback index for a client/agent pair.',
  schema,
  execute: async (ctx, rawInput: ReputationGetLastIndexInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const lastIndex = await ctx.client.reputation.getLastIndex(input.agentId, input.clientAddress);

      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          clientAddress: input.clientAddress,
          lastIndex: toBigIntString(lastIndex),
        },
        `Last feedback index for client ${input.clientAddress} is ${toBigIntString(lastIndex)}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching last feedback index';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          clientAddress: rawInput.clientAddress,
          lastIndex: 'N/A',
        },
        `Failed to fetch last feedback index for client ${rawInput.clientAddress}`,
        message
      );
    }
  },
};
