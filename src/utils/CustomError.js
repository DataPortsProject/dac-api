class CustomError extends Error {
	constructor(message, type) {
		super(message);
		this.message = message;
		this.type = type;
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, CustomError.prototype);
		Error.captureStackTrace(this);
	}
}
export default CustomError;