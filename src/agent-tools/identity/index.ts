import type { ToolDefinition } from '../types';
import { getMetadata } from './getMetadata';
import { getOwner } from './getOwner';
import { getRegistrationFile } from './getRegistrationFile';
import { getTokenUri } from './getTokenUri';
import { register } from './register';
import { registerWithMetadata } from './registerWithMetadata';
import { registerWithUri } from './registerWithUri';
import { setAgentUri } from './setAgentUri';
import { setMetadata } from './setMetadata';

export const identityTools = [
  register,
  registerWithUri,
  registerWithMetadata,
  getTokenUri,
  setAgentUri,
  getOwner,
  getMetadata,
  setMetadata,
  getRegistrationFile,
] satisfies ToolDefinition[];

export const identityToolDictionary: Record<string, ToolDefinition> = identityTools.reduce(
  (acc, tool) => {
    acc[tool.name] = tool;
    return acc;
  },
  {} as Record<string, ToolDefinition>
);

export const createIdentityTools = () => [...identityTools];

export {
  register,
  registerWithUri,
  registerWithMetadata,
  getTokenUri,
  setAgentUri,
  getOwner,
  getMetadata,
  setMetadata,
  getRegistrationFile,
};
