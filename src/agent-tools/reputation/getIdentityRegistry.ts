import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { createToolResult } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({});

type ReputationGetIdentityRegistryInput = z.infer<typeof schema>;

export interface ReputationGetIdentityRegistryResult {
  identityRegistry: string;
}

export const getIdentityRegistry: ToolDefinition<ReputationGetIdentityRegistryResult> = {
  name: 'reputation_getIdentityRegistry',
  description: 'Return the identity registry address that the reputation registry references. Returns the address or information if no address was found.',
  schema,
  execute: async (ctx, rawInput: ReputationGetIdentityRegistryInput) => {
    try {
      SchemaParser.parseParamsWithSchema(rawInput ?? {}, schema);
      const identityRegistry = await ctx.client.reputation.getIdentityRegistry();

      return createToolResult(
        { identityRegistry },
        `Fetched reputation identity registry address: ${identityRegistry}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while fetching identity registry';
      return createToolResult(
        { identityRegistry: 'N/A' },
        'Failed to fetch reputation identity registry address',
        message
      );
    }
  },
};
