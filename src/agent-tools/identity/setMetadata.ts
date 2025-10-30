import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  agentIdSchema,
  formatTxResult,
  stringSchema,
  toBigIntString,
} from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  key: stringSchema,
  value: z.string(),
});

type IdentitySetMetadataInput = z.infer<typeof schema>;

export interface IdentitySetMetadataResult {
  agentId: string;
  key: string;
  txHash: string;
}

export const setMetadata: ToolDefinition<IdentitySetMetadataResult> = {
  name: 'identity_setMetadata',
  description: 'Persist an on-chain metadata key/value pair for an agent.',
  schema,
  execute: async (ctx, rawInput: IdentitySetMetadataInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.identity.setMetadata(input.agentId, input.key, input.value);

      const data: IdentitySetMetadataResult = {
        agentId: toBigIntString(input.agentId),
        key: input.key,
        txHash: result.txHash,
      };

      return formatTxResult(
        'Updated metadata',
        data,
        `agent ${data.agentId} key ${data.key}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while setting metadata';
      return formatTxResult(
        'Failed to update metadata',
        {
          agentId: toBigIntString(rawInput.agentId),
          key: rawInput.key,
          txHash: 'N/A',
        },
        `agent ${toBigIntString(rawInput.agentId)} key ${rawInput.key}`,
        message
      );
    }
  },
};
