// import type { ZodTypeAny } from 'zod';
//
// declare module '@langchain/core/tools' {
//   export class StructuredTool {
//     name: string;
//     description: string;
//     schema: ZodTypeAny;
//     constructor(...args: unknown[]);
//     call(input: unknown, config?: unknown): Promise<unknown>;
//     _call(input: unknown, config?: unknown): Promise<unknown>;
//   }
// }
//
// declare module 'ai' {
//   import type { ZodTypeAny } from 'zod';
//
//   export function tool<TSchema extends ZodTypeAny, TResult>(config: {
//     name?: string;
//     description: string;
//     parameters: TSchema;
//     execute: (input: import('zod').infer<TSchema>) => Promise<TResult>;
//   }): unknown;
// }
//
// declare module '@modelcontextprotocol/server' {
//   import type { ZodTypeAny } from 'zod';
//
//   export class McpServer {
//     constructor(options?: unknown);
//     tool<TSchema extends ZodTypeAny>(
//       name: string,
//       registration: {
//         description: string;
//         parameters: TSchema;
//         handler: (input: import('zod').infer<TSchema>) => Promise<unknown>;
//       }
//     ): void;
//   }
// }
//
// export {};
//
