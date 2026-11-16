export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message ?? `HTTP Error ${status}`);
        this.status = status;
        this.name = 'HttpError';
    }
}
//# sourceMappingURL=http-error.js.map