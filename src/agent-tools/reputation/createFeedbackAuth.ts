import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';
import { SchemaParser } from '../schema-parser';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema.describe('The address of the account that will be authorized to submit feedback. Must be a valid address (0x...).'),
  indexLimit: bigIntSchema,
  expiry: bigIntSchema.describe('Timestamp in seconds'),
  chainId: bigIntSchema
    .optional()
    .describe('The chain ID of the operator client address. Will be injected in the tool call'),
  signerAddress: addressSchema.optional()
    .describe('The operator client address. Will be injected in the tool call'),
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

      const signerAddress = input.signerAddress ?? ctx.address;
      const chainId = input.chainId ?? BigInt(ctx.chainId!);

      if (!signerAddress) {
        throw new Error('Signer address is required (either input.signerAddress or ctx.address)');
      }
      if (!chainId) {
        throw new Error('Chain ID is required (either input.chainId or ctx.chainId)');
      }

      const auth = ctx.client.reputation.createFeedbackAuth(
        input.agentId,
        input.clientAddress,
        input.indexLimit,
        input.expiry,
        chainId,
        signerAddress
      );

      const feedbackAuth = {
        agentId: toBigIntString(auth.agentId),
        clientAddress: auth.clientAddress,
        indexLimit: toBigIntString(auth.indexLimit),
        expiry: toBigIntString(auth.expiry),
        chainId: toBigIntString(auth.chainId),
        identityRegistry: auth.identityRegistry,
        signerAddress: auth.signerAddress,
      }

      return createToolResult(
        {
          feedbackAuth
        },
        `Created feedback authorization for agent ${toBigIntString(auth.agentId)}. Feedback authorization: ${JSON.stringify(feedbackAuth, null, 2)}`
      );
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error while creating feedback authorization';

      return createToolResult(
        {
          feedbackAuth: {
            agentId: toBigIntString(rawInput.agentId),
            clientAddress: rawInput.clientAddress ?? 'N/A',
            indexLimit: toBigIntString(rawInput.indexLimit),
            expiry: toBigIntString(rawInput.expiry),
            chainId: toBigIntString(rawInput.chainId ?? 0n),
            identityRegistry: 'N/A',
            signerAddress: rawInput.signerAddress ?? 'N/A',
          },
        },
        `Failed to create feedback authorization for agent ${toBigIntString(rawInput.agentId)}.`,
        message
      );
    }
  },
};
