export class ResponseParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResponseParsingError";
  }
}
