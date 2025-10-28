import type { AgentContext } from '../agent-tools/context';
import { createAgentTools, type CreateAgentToolsOptions } from '../agent-tools';

export interface AiSdkAdapterOptions extends CreateAgentToolsOptions {
  hydrateSummary?: boolean;
}

export async function createAiSdkTools(
  context: AgentContext,
  options: AiSdkAdapterOptions = {}
): Promise<Record<string, unknown>> {
  const { hydrateSummary, ...selection } = options;
  const definitions = createAgentTools(selection);
  const shouldHydrate = hydrateSummary ?? false;

  const mod = await import('ai');
  const { tool } = mod as { tool: (config: any) => unknown };

  return Object.fromEntries(
    definitions.map(definition => {
      const handler = tool({
        name: definition.name,
        description: definition.description,
        parameters: definition.schema,
        execute: async (input: unknown) => {
          const parsed = definition.schema.parse(input);
          const result = await definition.execute(context, parsed);

          if (context.adapterMode === 'return-bytes') {
            return result.data;
          }

          if (shouldHydrate && result.summary) {
            return result.summary;
          }

          return result.data;
        },
      });

      return [definition.name, handler];
    })
  );
}
