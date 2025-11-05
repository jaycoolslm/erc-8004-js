import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, stringSchema, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  key: stringSchema,
});

type IdentityGetMetadataInput = z.infer<typeof schema>;

export interface IdentityGetMetadataResult {
  agentId: string;
  key: string;
  value: string;
}

export const getMetadata: ToolDefinition<IdentityGetMetadataResult> = {
  name: 'identity_getMetadata',
  description: 'Read an on-chain metadata value by key for the given agent. User MUST provide a valid key of metadata JSON. If no key was passed reply with request to specify it. If no value is found, return "N/A".',
  schema,
  execute: async (ctx, rawInput: IdentityGetMetadataInput) => {
    console.log(`identity_getMetadata called`);
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const value = await ctx.client.identity.getMetadata(input.agentId, input.key) || 'N/A';
      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          key: input.key,
          value,
        },
        `Read metadata ${input.key} for agent ${toBigIntString(input.agentId)}. The value is ${value}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while reading metadata';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          key: rawInput.key,
          value: 'N/A',
        },
        `Failed to read metadata ${rawInput.key} for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
