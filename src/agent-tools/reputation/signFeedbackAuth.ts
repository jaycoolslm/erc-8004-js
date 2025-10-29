import { z } from 'zod';
import type { ToolDefinition } from '../types';
import {
  addressSchema,
  agentIdSchema,
  bigIntSchema,
  createToolResult,
  toBigIntString,
} from '../helpers';
import { FeedbackAuth } from "erc-8004-js";

const feedbackAuthSchema = z.object({
  agentId: agentIdSchema,
  clientAddress: addressSchema,
  indexLimit: bigIntSchema,
  expiry: bigIntSchema,
  chainId: bigIntSchema,
  identityRegistry: addressSchema,
  signerAddress: addressSchema,
});

const schema = z.object({
  feedbackAuth: feedbackAuthSchema,
});

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
  execute: async (ctx, rawInput) => {
    const input = schema.parse(rawInput);
    const signature = await ctx.client.reputation.signFeedbackAuth(input.feedbackAuth as FeedbackAuth);

    return createToolResult(
      {
        signature,
        feedbackAuth: {
          agentId: toBigIntString(input.feedbackAuth.agentId),
          clientAddress: input.feedbackAuth.clientAddress,
          indexLimit: toBigIntString(input.feedbackAuth.indexLimit),
          expiry: toBigIntString(input.feedbackAuth.expiry),
          chainId: toBigIntString(input.feedbackAuth.chainId),
          identityRegistry: input.feedbackAuth.identityRegistry,
          signerAddress: input.feedbackAuth.signerAddress,
        },
      },
      `Signed feedback authorization for agent ${toBigIntString(input.feedbackAuth.agentId)}`
    );
  },
};
