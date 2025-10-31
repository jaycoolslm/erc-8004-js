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
import { FeedbackAuth } from 'erc-8004-js';
import { hexlify } from 'ethers';

const schema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema.describe(
    'The address of the account that will be authorized to submit feedback. Must be a valid address (0x...).'
  ),
  indexLimit: bigIntSchema,
  expiry: bigIntSchema.describe('Timestamp in seconds'),
  chainId: bigIntSchema
    .optional()
    .describe('The chain ID of the operator client address. Will be injected in the tool call'),
  signerAddress: addressSchema
    .optional()
    .describe('The operator client address. Will be injected in the tool call'),
});

type ReputationCreateAndSignFeedbackAuthInput = z.infer<typeof schema>;

export interface ReputationCreateAndSignFeedbackAuthResult {
  signature: string;
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

export const createAndSignFeedbackAuth: ToolDefinition<ReputationCreateAndSignFeedbackAuthResult> = {
  name: 'reputation_createAndSignFeedbackAuth',
  description:
    'Create and sign a feedback authorization tuple for a given agent/client pair in one step.',
  schema,
  execute: async (ctx, rawInput: ReputationCreateAndSignFeedbackAuthInput) => {
    try {
      const input = SchemaParser.parseParamsWithSchema(rawInput, schema);

      const signerAddress = input.signerAddress ?? ctx.address;
      const chainId = input.chainId ?? BigInt(ctx.chainId!);

      if (!signerAddress) {
        throw new Error(
          'Signer address is required (either input.signerAddress or ctx.address)'
        );
      }
      if (!chainId) {
        throw new Error(
          'Chain ID is required (either input.chainId or ctx.chainId)'
        );
      }

      const auth = ctx.client.reputation.createFeedbackAuth(
        input.agentId,
        input.clientAddress,
        input.indexLimit,
        input.expiry,
        chainId,
        signerAddress
      );

      const feedbackAuth: FeedbackAuth = {
        agentId: BigInt(auth.agentId),
        clientAddress: auth.clientAddress,
        indexLimit: BigInt(auth.indexLimit),
        expiry: BigInt(auth.expiry),
        chainId: BigInt(auth.chainId),
        identityRegistry: auth.identityRegistry,
        signerAddress: auth.signerAddress,
      };

      const rawSignature = await ctx.client.reputation.signFeedbackAuth(feedbackAuth);
      const signature = hexlify(rawSignature);

      return createToolResult(
        {
          signature,
          feedbackAuth: {
            agentId: toBigIntString(feedbackAuth.agentId),
            clientAddress: feedbackAuth.clientAddress,
            indexLimit: toBigIntString(feedbackAuth.indexLimit),
            expiry: toBigIntString(feedbackAuth.expiry),
            chainId: toBigIntString(feedbackAuth.chainId),
            identityRegistry: feedbackAuth.identityRegistry,
            signerAddress: feedbackAuth.signerAddress,
          },
        },
        `Created and signed feedback authorization for agent ${toBigIntString(
          feedbackAuth.agentId
        )}. Signature: ${signature}`
      );
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error while creating and signing feedback authorization';

      return createToolResult(
        {
          signature: 'N/A',
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
        `Failed to create and sign feedback authorization for agent ${toBigIntString(
          rawInput.agentId
        )}.`,
        message
      );
    }
  },
};
