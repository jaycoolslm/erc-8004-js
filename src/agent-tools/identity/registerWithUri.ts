import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { formatTxResult, toBigIntString, uriSchema } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  tokenURI: uriSchema,
});

type IdentityRegisterWithUriInput = z.infer<typeof schema>;

export interface IdentityRegisterWithUriResult {
  agentId: string;
  txHash: string;
  tokenURI: string;
}

export const registerWithUri: ToolDefinition<IdentityRegisterWithUriResult> = {
  name: 'identity_registerWithUri',
  description: 'Register a new agent with the provided token URI and return identifiers.',
  schema,
  execute: async (ctx, rawInput: IdentityRegisterWithUriInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const result = await ctx.client.identity.registerWithURI(input.tokenURI);

      const data: IdentityRegisterWithUriResult = {
        agentId: toBigIntString(result.agentId),
        txHash: result.txHash,
        tokenURI: input.tokenURI,
      };

      return formatTxResult(
        'Registered agent with URI',
        data,
        `agent ${data.agentId} using ${data.tokenURI}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while registering agent with URI';
      return formatTxResult(
        'Failed to register agent with URI',
        {
          agentId: 'N/A',
          txHash: 'N/A',
          tokenURI: rawInput.tokenURI,
        },
        `agent registration with URI`,
        message
      );
    }
  },
};
