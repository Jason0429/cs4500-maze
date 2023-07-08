export class JsonDeserializeError extends Error {
  readonly message: string;
  constructor(message: string, obj?: unknown) {
    super(message);
    let objMsg;
    try {
      objMsg = `(${JSON.stringify(obj)}`;
    } catch {
      objMsg = obj;
    }
    this.message = `${message} ${obj !== undefined ? objMsg : ''}`;
  }
}

/**
 * Checks if the given object is a boolean
 */
export function isBoolean(obj: unknown): obj is boolean {
  return typeof obj === 'boolean';
}

/**
 * Checks if the given object is a non-null object
 */
export function isNonNullObject(obj: unknown): obj is object {
  return obj !== null && typeof obj === 'object';
}

/**
 * Checks if the given object is an string
 */
export function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}

/**
 * Checks if the given object is an number
 */
export function isNumber(obj: unknown): obj is number {
  return typeof obj === 'number';
}

/**
 * Checks that the given object is an array
 */
export function isArray(obj: unknown): obj is Array<unknown> {
  return Array.isArray(obj);
}

/**
 * Checks that the given object has the given keys; throws an error otherwise
 */
export function assertHasKeys(obj: unknown, keys: string[]): void {
  const hasKeys = isNonNullObject(obj) && keys.every(key => key in obj);
  if (!hasKeys) {
    throw new Error('The given data is not an object or does not contain all expected keys');
  }
}

/**
 * Checks if the given object is an array with length `len`
 */
export function isArrayOfLength(
  obj: unknown,
  len: number
): obj is Array<unknown> {
  return isArray(obj) && obj.length === len;
}

/**
 * Checks if the given `value` is a value of the string enum `e`
 */
export function isEnumMember<T extends {[k: string]: string}>(
  e: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(e).includes(value as T[keyof T]);
}
