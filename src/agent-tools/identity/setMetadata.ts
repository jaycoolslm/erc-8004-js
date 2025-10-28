import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  agentIdSchema,
  formatTxResult,
  stringSchema,
  toBigIntString,
} from '../helpers';

const schema = z.object({
  agentId: agentIdSchema,
  key: stringSchema,
  value: z.string(),
});

export interface IdentitySetMetadataResult {
  agentId: string;
  key: string;
  txHash: string;
}

export const setMetadata: ToolDefinition<IdentitySetMetadataResult> = {
  name: 'identity_setMetadata',
  description: 'Persist an on-chain metadata key/value pair for an agent.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
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
  },
};
