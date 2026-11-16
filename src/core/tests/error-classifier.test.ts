import { describe, it, expect } from 'vitest';
import { HttpError } from '../http-error.js';
import { classifyError } from '../error-classifier.js';

describe('Error Classifier Tests', () => {
  it('should classify HttpError as http', () => {
    const error = new HttpError(500);

    expect(classifyError(error)).toBe('http');
  });

  it('should classify AbortError as aborted', () => {
    const exception = new DOMException('aborted', 'AbortError');

    expect(classifyError(exception)).toBe('aborted');
  });

  it('should classify TimeoutError as timeout', () => {
    const exception = new DOMException('timed out', 'TimeoutError');

    expect(classifyError(exception)).toBe('timeout');
  });

  it('should classify network and generic errors as unknown', () => {
    expect(classifyError(new TypeError('fetch failed'))).toBe('unknown');
    expect(classifyError(new Error('error'))).toBe('unknown');
  });
});
