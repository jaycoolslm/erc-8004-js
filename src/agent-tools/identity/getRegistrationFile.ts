import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import { AgentRegistrationFile } from "erc-8004-js";
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
});

type IdentityGetRegistrationFileInput = z.infer<typeof schema>;

export interface IdentityGetRegistrationFileResult {
  agentId: string;
  registration: AgentRegistrationFile;
}

export const getRegistrationFile: ToolDefinition<IdentityGetRegistrationFileResult> = {
  name: 'identity_getRegistrationFile',
  description: 'Fetch and return the full registration JSON referenced by the agent token URI.',
  schema,
  execute: async (ctx, rawInput: IdentityGetRegistrationFileInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const registration = await ctx.client.identity.getRegistrationFile(input.agentId);

      return createToolResult(
        {
          agentId: toBigIntString(input.agentId),
          registration,
        },
        `Fetched registration file for agent ${toBigIntString(input.agentId)}. Registration: ${JSON.stringify(registration, null, 2)}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching registration file';
      return createToolResult(
        {
          agentId: toBigIntString(rawInput.agentId),
          registration: {} as AgentRegistrationFile,
        },
        `Failed to fetch registration file for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
