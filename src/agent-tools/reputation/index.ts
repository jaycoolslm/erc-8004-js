import type { ToolDefinition } from '../types';
import { appendResponse } from './appendResponse';
import { createFeedbackAuth } from './createFeedbackAuth';
import { getClients } from './getClients';
import { getIdentityRegistry } from './getIdentityRegistry';
import { getLastIndex } from './getLastIndex';
import { getResponseCount } from './getResponseCount';
import { getSummary } from './getSummary';
import { giveFeedback } from './giveFeedback';
import { readAllFeedback } from './readAllFeedback';
import { readFeedback } from './readFeedback';
import { revokeFeedback } from './revokeFeedback';
import { signFeedbackAuth } from './signFeedbackAuth';

export const reputationTools = [
  createFeedbackAuth,
  signFeedbackAuth,
  giveFeedback,
  revokeFeedback,
  appendResponse,
  getIdentityRegistry,
  getSummary,
  readFeedback,
  readAllFeedback,
  getResponseCount,
  getClients,
  getLastIndex,
] satisfies ToolDefinition[];

export const reputationToolDictionary: Record<string, ToolDefinition> = reputationTools.reduce(
  (acc, tool) => {
    acc[tool.name] = tool;
    return acc;
  },
  {} as Record<string, ToolDefinition>
);

export const createReputationTools = () => [...reputationTools];

export {
  createFeedbackAuth,
  signFeedbackAuth,
  giveFeedback,
  revokeFeedback,
  appendResponse,
  getIdentityRegistry,
  getSummary,
  readFeedback,
  readAllFeedback,
  getResponseCount,
  getClients,
  getLastIndex,
};
