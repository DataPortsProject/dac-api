class CustomError extends Error {
  constructor(message, type, name) {
    super(message);
    this.message = message;
    this.type = type;
    this.name = name || 'Error';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this);
  }
}
export default CustomError;
