import { Logger } from '@nestjs/common';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function logErrorWithContext(logger: Logger, context: string, error: unknown): void {
  const errorMessage = getErrorMessage(error);
  logger.error(`${context}: ${errorMessage}`);
}
