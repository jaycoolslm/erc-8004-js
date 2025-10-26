import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { agentIdSchema, createToolResult, toBigIntString } from '../helpers';
import type { AgentRegistrationFile } from '../../types';

const schema = z.object({
  agentId: agentIdSchema,
});

export interface IdentityGetRegistrationFileResult {
  agentId: string;
  registration: AgentRegistrationFile;
}

export const getRegistrationFile: ToolDefinition<IdentityGetRegistrationFileResult> = {
  name: 'identity_getRegistrationFile',
  description: 'Fetch and return the full registration JSON referenced by the agent token URI.',
  schema,
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const registration = await ctx.client.identity.getRegistrationFile(input.agentId);
    return createToolResult(
      {
        agentId: toBigIntString(input.agentId),
        registration,
      },
      `Fetched registration file for agent ${toBigIntString(input.agentId)}`
    );
  },
};
