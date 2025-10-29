import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';
import { SchemaParser } from "../schema-parser";

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
  indexLimit: bigIntSchema,
  expiry: bigIntSchema,
  chainId: bigIntSchema,
  signerAddress: addressSchema,
});

type ReputationCreateFeedbackAuthInput = z.infer<typeof schema>;

export interface ReputationCreateFeedbackAuthResult {
  feedbackAuth: {
    agentId: string;
    clientAddress: string;
    indexLimit: string;
    expiry: string;
    chainId: string;
    identityRegistry: string;
    signerAddress: string;
  };
}

export const createFeedbackAuth: ToolDefinition<ReputationCreateFeedbackAuthResult> = {
  name: 'reputation_createFeedbackAuth',
  description: 'Generate a feedback authorization tuple for a given agent/client pair.',
  schema,
  execute: async (ctx, rawInput: ReputationCreateFeedbackAuthInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);
      const auth = ctx.client.reputation.createFeedbackAuth(
        input.agentId,
        input.clientAddress,
        input.indexLimit,
        input.expiry,
        input.chainId,
        input.signerAddress
      );

      return createToolResult(
        {
          feedbackAuth: {
            agentId: toBigIntString(auth.agentId),
            clientAddress: auth.clientAddress,
            indexLimit: toBigIntString(auth.indexLimit),
            expiry: toBigIntString(auth.expiry),
            chainId: toBigIntString(auth.chainId),
            identityRegistry: auth.identityRegistry,
            signerAddress: auth.signerAddress,
          },
        },
        `Created feedback authorization for agent ${toBigIntString(auth.agentId)}`
      );
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Unknown error while creating feedback authorization';
      return createToolResult(
        {
          feedbackAuth: {
            agentId: toBigIntString(rawInput.agentId),
            clientAddress: rawInput.clientAddress,
            indexLimit: toBigIntString(rawInput.indexLimit),
            expiry: toBigIntString(rawInput.expiry),
            chainId: toBigIntString(rawInput.chainId),
            identityRegistry: 'N/A',
            signerAddress: rawInput.signerAddress,
          },
        },
        `Failed to create feedback authorization for agent ${toBigIntString(rawInput.agentId)}`,
        message
      );
    }
  },
};
