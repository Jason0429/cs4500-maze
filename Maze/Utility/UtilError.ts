/**
 * Represents an error that could occur in any of the util methods.
 */
export class UtilError extends Error {
  readonly message: string;
  readonly code: UtilErrorCode;
  constructor(params: { message: string, code: UtilErrorCode }) {
    super();
    this.message = params.message;
    this.code = params.code;
  }
}

/**
 * Represents an error code that corresponds to a specific error.
 */
export enum UtilErrorCode {
  FUNCTION_TIMEOUT = 'FUNCTION_TIMEOUT'
}
