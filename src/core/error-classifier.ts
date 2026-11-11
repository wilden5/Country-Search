import { HttpError } from './http-error.js';

export type ErrorType = 'aborted' | 'timeout' | 'http' | 'unknown';

export function classifyError(error: unknown): ErrorType {
  if (error instanceof HttpError) return 'http';

  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'aborted';

    if (error.name === 'TimeoutError') return 'timeout';
  }

  return 'unknown';
}
