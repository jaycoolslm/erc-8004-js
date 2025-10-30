import { z } from "zod";

export class SchemaParser {
  /**
   * Parses parameters with a Zod schema, throws with formatted error messages.
   */
  static parseParamsWithSchema<T extends z.ZodTypeAny>(
    params: unknown,
    schema: T
  ): z.infer<T> {
    let parsedParams: z.infer<T>;
    try {
      parsedParams = schema.parse(params);
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        const issues = this.formatZodIssues(e);
        throw new Error(`Invalid parameters: ${issues}`);
      }
      throw e;
    }
    return parsedParams;
  }

  private static formatZodIssues(error: z.ZodError): string {
    return error.errors.map(err => `${err.path.join('.')} - ${err.message}`).join('; ');
  }
}