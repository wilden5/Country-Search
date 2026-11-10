export class HttpError extends Error {
  private status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP Error ${status}`);
    this.status = status;
    this.name = 'HTTP Error';
  }
}
