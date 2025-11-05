import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { formatTxResult, toBigIntString } from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({});

type IdentityRegisterInput = z.infer<typeof schema>;

export interface IdentityRegisterResult {
  agentId: string;
  txHash: string;
}

export const register: ToolDefinition<IdentityRegisterResult> = {
  name: 'identity_register',
  description: 'Register a new agent without a token URI and return the transaction hash.',
  schema,
  execute: async (ctx, rawInput: IdentityRegisterInput) => {
    try {
      SchemaParser.parseParamsWithSchema(rawInput ?? {}, schema);
      const result = await ctx.client.identity.register();
      const data: IdentityRegisterResult = {
        agentId: toBigIntString(result.agentId),
        txHash: result.txHash,
      };
      return formatTxResult(
        'Registered agent',
        data,
        `agent ${data.agentId} on chain ${ctx.chainId}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while registering agent';
      const data: IdentityRegisterResult = {
        agentId: 'N/A',
        txHash: 'N/A',
      };
      return formatTxResult(
        'Failed to register agent',
        data,
        `agent registration on chain ${ctx.chainId}`,
        message
      );
    }
  },
};
