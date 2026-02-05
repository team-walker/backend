import { Logger } from '@nestjs/common';

/**
 * Extracts the error message from an error object.
 * @param error The error object to extract the message from.
 * @returns The extracted error message.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Logs an error message using the provided logger.
 * @param logger The logger instance to use.
 * @param context A description of the context where the error occurred.
 * @param error The error object to log.
 */
export function logError(logger: Logger, context: string, error: unknown): void {
  const errorMessage = extractErrorMessage(error);
  logger.error(`${context}: ${errorMessage}`);
}
