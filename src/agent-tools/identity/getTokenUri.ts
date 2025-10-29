import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
});

type IdentityGetTokenUriInput = z.infer<typeof schema>;

export interface IdentityGetTokenUriResult {
  agentId: string;
  tokenURI: string;
}

export const getTokenUri: ToolDefinition<IdentityGetTokenUriResult> = {
  name: 'identity_getTokenUri',
  description: 'Fetch the token URI associated with an agent ID. If no token URI is set respond with relevant information.',
  schema,
  execute: async (ctx, rawInput: IdentityGetTokenUriInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const agentId = input.agentId;
      const tokenURI = await ctx.client.identity.getTokenURI(agentId);

      const summary =
        tokenURI.length > 0
          ? `Retrieved token URI for agent ${toBigIntString(agentId)}: Token URI: ${tokenURI}`
          : `No token URI set for agent ${toBigIntString(agentId)}`;

      return createToolResult(
        {
          agentId: toBigIntString(agentId),
          tokenURI,
        },
        summary
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching token URI';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          tokenURI: '',
        },
        `Failed to retrieve token URI for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
