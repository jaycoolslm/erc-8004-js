import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  formatTxResult,
  metadataArraySchema,
  toBigIntString,
  uriSchema,
} from '../helpers';

const schema = z.object({
  tokenURI: uriSchema,
  metadata: metadataArraySchema.optional(),
});

export interface IdentityRegisterWithMetadataResult {
  agentId: string;
  txHash: string;
  tokenURI: string;
  metadataCount: number;
}

export const registerWithMetadata: ToolDefinition<IdentityRegisterWithMetadataResult> = {
  name: 'identity_registerWithMetadata',
  description: 'Register a new agent with a token URI plus metadata entries.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const metadata = input.metadata ?? [];
    const result = await ctx.client.identity.registerWithMetadata(input.tokenURI, metadata);

    const data: IdentityRegisterWithMetadataResult = {
      agentId: toBigIntString(result.agentId),
      txHash: result.txHash,
      tokenURI: input.tokenURI,
      metadataCount: metadata.length,
    };

    return formatTxResult(
      'Registered agent with metadata',
      data,
      `agent ${data.agentId} with ${metadata.length} metadata entries`
    );
  },
};
