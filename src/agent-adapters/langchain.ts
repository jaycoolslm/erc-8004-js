import type { AgentContext } from '../agent-tools/context';
import { createAgentTools, type CreateAgentToolsOptions } from '../agent-tools';
import type { ToolDefinition } from '../agent-tools/types';

export type LangChainToolFactory = (definition: ToolDefinition, context: AgentContext) => Promise<unknown>;

export interface LangChainAdapterOptions extends CreateAgentToolsOptions {
  hydrateSummary?: boolean;
}

async function toStructuredTool(
  definition: ToolDefinition,
  context: AgentContext,
  hydrateSummary: boolean
): Promise<unknown> {
  const mod = await import('@langchain/core/tools');
  const { StructuredTool } = mod as { StructuredTool: new () => any };

  class AgentStructuredTool extends StructuredTool {
    name = definition.name;
    description = definition.description;
    schema = definition.schema;

    async _call(input: unknown) {
      const parsed = definition.schema.parse(input);
      const result = await definition.execute(context, parsed);

      if (context.adapterMode === 'return-bytes') {
        return result.data;
      }

      if (!hydrateSummary) {
        return result.data;
      }

      if (result.summary) {
        return result.summary;
      }

      return JSON.stringify(result.data);
    }
  }

  return new AgentStructuredTool();
}

export async function createLangChainTools(
  context: AgentContext,
  options: LangChainAdapterOptions = {}
): Promise<unknown[]> {
  const { hydrateSummary, ...selection } = options;
  const definitions = createAgentTools(selection);
  const shouldHydrate = hydrateSummary ?? true;

  const tools: unknown[] = [];
  for (const definition of definitions) {
    tools.push(await toStructuredTool(definition, context, shouldHydrate));
  }
  return tools;
}
