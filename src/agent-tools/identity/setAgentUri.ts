import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, formatTxResult, toBigIntString, uriSchema } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  tokenURI: uriSchema,
});

type IdentitySetAgentUriInput = z.infer<typeof schema>;

export interface IdentitySetAgentUriResult {
  agentId: string;
  txHash: string;
  tokenURI: string;
}

export const setAgentUri: ToolDefinition<IdentitySetAgentUriResult> = {
  name: 'identity_setAgentUri',
  description: 'Update the token URI associated with an agent.',
  schema,
  execute: async (ctx, rawInput: IdentitySetAgentUriInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.identity.setAgentUri(input.agentId, input.tokenURI);

      const data: IdentitySetAgentUriResult = {
        agentId: toBigIntString(input.agentId),
        txHash: result.txHash,
        tokenURI: input.tokenURI,
      };

      return formatTxResult(
        'Updated agent URI',
        data,
        `agent ${data.agentId} set to ${data.tokenURI}`
      );
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'Unknown error while updating agent URI';

      const data: IdentitySetAgentUriResult = {
        agentId: toBigIntString(rawInput.agentId),
        txHash: 'N/A',
        tokenURI: rawInput.tokenURI,
      };

      return formatTxResult(
        'Failed to update agent URI',
        data,
        `agent ${data.agentId} set to ${data.tokenURI}`,
        message
      );
    }
  },
};
