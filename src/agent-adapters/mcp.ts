import type { AgentContext } from '../agent-tools/context';
import { createAgentTools, type CreateAgentToolsOptions } from '../agent-tools';

export interface McpAdapterOptions extends CreateAgentToolsOptions {
  hydrateSummary?: boolean;
}

export interface McpServerLike {
  tool(name: string, registration: { description: string; parameters: unknown; handler: (input: unknown) => Promise<unknown> }): void;
}

export function registerAgentToolsWithMcpServer(
  server: McpServerLike,
  context: AgentContext,
  options: McpAdapterOptions = {}
): void {
  const { hydrateSummary, ...selection } = options;
  const definitions = createAgentTools(selection);
  const shouldHydrate = hydrateSummary ?? false;

  for (const definition of definitions) {
    server.tool(definition.name, {
      description: definition.description,
      parameters: definition.schema,
      handler: async (input: unknown) => {
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
  }
}

export async function createMcpServer(
  context: AgentContext,
  serverOptions?: unknown,
  toolOptions: McpAdapterOptions = {}
): Promise<unknown> {
  const mod = await import('@modelcontextprotocol/server');
  const { McpServer } = mod as { McpServer: new (options?: unknown) => McpServerLike };
  const server = new McpServer(serverOptions);
  registerAgentToolsWithMcpServer(server, context, toolOptions);
  return server;
}
