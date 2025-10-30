import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';
import { FeedbackAuth } from 'erc-8004-js';
import { hexlify } from "ethers";

const feedbackAuthSchema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema
    .describe('The address of the account that will be authorized to submit feedback. Must be a valid address (0x...).'),
  indexLimit: bigIntSchema,
  expiry: bigIntSchema.describe('Timestamp in seconds'),
  chainId: bigIntSchema
    .optional()
    .describe('The chain ID of the operator client address. Will be injected in the tool call'),
  identityRegistry: addressSchema,
  signerAddress: addressSchema
    .optional()
    .describe('The operator client address. Will be injected in the tool call'),
});

const schema = z.object({
  feedbackAuth: feedbackAuthSchema,
});

type ReputationSignFeedbackAuthInput = z.infer<typeof schema>;

export interface ReputationSignFeedbackAuthResult {
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

export const signFeedbackAuth: ToolDefinition<ReputationSignFeedbackAuthResult> = {
  name: 'reputation_signFeedbackAuth',
  description: 'Sign an existing feedback authorization tuple using the configured signer.',
  schema,
  execute: async (ctx, rawInput: ReputationSignFeedbackAuthInput) => {
    try {
      const input = schema.parse(rawInput);

      const signerAddress = input.feedbackAuth.signerAddress ?? ctx.address;
      const chainId = input.feedbackAuth.chainId ?? ctx.chainId;

      if (!signerAddress) {
        throw new Error('Signer address is required (either input.signerAddress or ctx.address)');
      }
      if (!chainId) {
        throw new Error('Chain ID is required (either input.chainId or ctx.chainId)');
      }

      const parsedFeedbackAuth: FeedbackAuth = {
        agentId: BigInt(input.feedbackAuth.agentId),
        clientAddress: input.feedbackAuth.clientAddress,
        indexLimit: BigInt(input.feedbackAuth.indexLimit),
        expiry: BigInt(input.feedbackAuth.expiry),
        chainId: BigInt(chainId),
        identityRegistry: input.feedbackAuth.identityRegistry,
        signerAddress,
      };

      const rawSignature = await ctx.client.reputation.signFeedbackAuth(parsedFeedbackAuth);

      const signature = hexlify(rawSignature);

      return createToolResult(
        {
          signature,
          feedbackAuth: {
            agentId: toBigIntString(parsedFeedbackAuth.agentId),
            clientAddress: parsedFeedbackAuth.clientAddress,
            indexLimit: toBigIntString(parsedFeedbackAuth.indexLimit),
            expiry: toBigIntString(parsedFeedbackAuth.expiry),
            chainId: toBigIntString(parsedFeedbackAuth.chainId),
            identityRegistry: parsedFeedbackAuth.identityRegistry,
            signerAddress: parsedFeedbackAuth.signerAddress,
          },
        },
        `Signed feedback authorization for agent ${toBigIntString(parsedFeedbackAuth.agentId)}. Feedback bytes: ${signature}`
      );
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error while signing feedback authorization';

      return createToolResult(
        {
          signature: 'N/A',
          feedbackAuth: {
            agentId: toBigIntString(rawInput.feedbackAuth.agentId),
            clientAddress: rawInput.feedbackAuth.clientAddress ?? 'N/A',
            indexLimit: toBigIntString(rawInput.feedbackAuth.indexLimit),
            expiry: toBigIntString(rawInput.feedbackAuth.expiry),
            chainId: toBigIntString(rawInput.feedbackAuth.chainId ?? 0n),
            identityRegistry: rawInput.feedbackAuth.identityRegistry,
            signerAddress: rawInput.feedbackAuth.signerAddress ?? 'N/A',
          },
        },
        `Failed to sign feedback authorization for agent ${toBigIntString(
          rawInput.feedbackAuth.agentId
        )}.`,
        message
      );
    }
  },
};
