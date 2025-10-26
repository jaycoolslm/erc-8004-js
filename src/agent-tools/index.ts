import { identityToolDictionary, identityTools } from './identity';
import { reputationToolDictionary, reputationTools } from './reputation';
import type { ToolDefinition } from './types';

export * from './context';
export * from './helpers';
export * from './types';
export * from './identity';
export * from './reputation';

export type AgentToolCategory = 'identity' | 'reputation';

export interface CreateAgentToolsOptions {
  categories?: AgentToolCategory[];
  include?: string[];
  exclude?: string[];
}

const categoryMap: Record<AgentToolCategory, ToolDefinition[]> = {
  identity: identityTools,
  reputation: reputationTools,
};

const dictionaryMap: Record<AgentToolCategory, Record<string, ToolDefinition>> = {
  identity: identityToolDictionary,
  reputation: reputationToolDictionary,
};

export function createAgentTools(options: CreateAgentToolsOptions = {}): ToolDefinition[] {
  const categories = options.categories && options.categories.length > 0
    ? options.categories
    : (['identity', 'reputation'] as AgentToolCategory[]);

  const tools: ToolDefinition[] = [];
  const seen = new Set<string>();

  for (const category of categories) {
    for (const tool of categoryMap[category]) {
      if (!seen.has(tool.name)) {
        tools.push(tool);
        seen.add(tool.name);
      }
    }
  }

  const includeSet = options.include ? new Set(options.include) : undefined;
  const excludeSet = options.exclude ? new Set(options.exclude) : undefined;

  return tools.filter(tool => {
    if (includeSet && !includeSet.has(tool.name)) {
      return false;
    }
    if (excludeSet && excludeSet.has(tool.name)) {
      return false;
    }
    return true;
  });
}

export function getToolByName(name: string): ToolDefinition | undefined {
  if (identityToolDictionary[name]) {
    return identityToolDictionary[name];
  }
  if (reputationToolDictionary[name]) {
    return reputationToolDictionary[name];
  }
  return undefined;
}
