export type ErrorType = 'aborted' | 'timeout' | 'http' | 'unknown';

export function classifyError(_error: unknown): ErrorType {
  throw new Error('not implemented');
}
