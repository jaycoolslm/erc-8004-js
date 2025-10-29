import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  formatTxResult,
  metadataArraySchema,
  toBigIntString,
  uriSchema,
} from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  tokenURI: uriSchema,
  metadata: metadataArraySchema.optional(),
});

type IdentityRegisterWithMetadataInput = z.infer<typeof schema>;

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
  execute: async (ctx, rawInput: IdentityRegisterWithMetadataInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while registering agent with metadata';
      return formatTxResult(
        'Failed to register agent with metadata',
        {
          agentId: 'N/A',
          txHash: 'N/A',
          tokenURI: rawInput.tokenURI ?? 'N/A',
          metadataCount: rawInput.metadata?.length ?? 0,
        },
        `agent registration with metadata`,
        message
      );
    }
  },
};
