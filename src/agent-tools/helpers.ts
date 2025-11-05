import { z } from 'zod';
import type { ToolExecutionResult } from './types';

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Expected checksum or lower-case EVM address');

export const optionalAddressSchema = addressSchema.optional();

export const bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Expected 32-byte hex string');

export const optionalBytes32Schema = bytes32Schema.optional();

export const agentIdSchema = z
  .coerce
  .bigint()
  .refine(value => value >= 0n, 'Agent ID must be a positive integer');

export const bigIntSchema = z
  .coerce
  .bigint()
  .refine(value => value >= 0n, 'Value must be a positive integer');

export const stringSchema = z.string().min(1, 'Value is required');

export const optionalStringSchema = z.string().min(1).optional();

export const metadataEntrySchema = z.object({
  key: stringSchema,
  value: z.string(),
});

export const metadataArraySchema = z.array(metadataEntrySchema).default([]);

export const uriSchema = z
  .string()
  .min(1)
  .regex(/^(ipfs:\/\/|https?:\/\/|ar:\/\/|data:).+/, 'Expected URI (supports ipfs://, https://, http://, ar://, data:)');

export const optionalUriSchema = uriSchema.optional();

export function toBigIntString(value: bigint | number | string): string {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return BigInt(value).toString();
  }
  return BigInt(value).toString();
}

export function createToolResult<TData>(
  data: TData,
  summary?: string,
  errorMessage?: string
): ToolExecutionResult<TData> {
  const finalSummary = errorMessage ? `${summary ?? ''} | Error: ${errorMessage}` : summary ?? '';
  return { data, summary: finalSummary ?? '', errorMessage };
}

export function formatTxResult<TData extends { txHash: string }>(
  action: string,
  data: TData,
  extraDetails?: string,
  errorMessage?: string
): ToolExecutionResult<TData> {
  const summary = extraDetails
    ? `${action}: ${extraDetails} (tx ${data.txHash || 'n/a'})`
    : `${action}: submitted transaction ${data.txHash || 'n/a'}`;

  return createToolResult(data, summary, errorMessage);
}
