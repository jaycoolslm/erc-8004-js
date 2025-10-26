import type { ZodTypeAny } from 'zod';
import type { AgentContext } from './context';

export interface ToolExecutionResult<TData = unknown> {
  data: TData;
  summary?: string;
}

export interface ToolDefinition<TData = unknown> {
  name: string;
  description: string;
  schema: ZodTypeAny;
  execute: (ctx: AgentContext, input: unknown) => Promise<ToolExecutionResult<TData>>;
}

export type ToolDictionary = Record<string, ToolDefinition>;
