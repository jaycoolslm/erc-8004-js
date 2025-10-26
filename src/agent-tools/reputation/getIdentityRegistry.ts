import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { createToolResult } from '../helpers';

const schema = z.object({});

export interface ReputationGetIdentityRegistryResult {
  identityRegistry: string;
}

export const getIdentityRegistry: ToolDefinition<ReputationGetIdentityRegistryResult> = {
  name: 'reputation_getIdentityRegistry',
  description: 'Return the identity registry address that the reputation registry references.',
  schema,
  execute: async (ctx, rawInput) => {
    schema.parse(rawInput ?? {});
    const identityRegistry = await ctx.client.reputation.getIdentityRegistry();
    return createToolResult(
      { identityRegistry },
      'Fetched reputation identity registry address'
    );
  },
};
