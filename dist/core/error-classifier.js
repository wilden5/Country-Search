import { HttpError } from './http-error.js';
export function classifyError(error) {
    if (error instanceof HttpError)
        return 'http';
    if (error instanceof Error) {
        if (error.name === 'AbortError')
            return 'aborted';
        if (error.name === 'TimeoutError')
            return 'timeout';
    }
    return 'unknown';
}
//# sourceMappingURL=error-classifier.js.map