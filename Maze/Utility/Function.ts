import {UtilError, UtilErrorCode} from './UtilError';

export async function executeMethodOrTimeout<T>(
  methodRef: () => Promise<T>,
  timeout: number
): Promise<T> {
  let timeoutId;

  const promise = new Promise<T>(resolve => resolve(methodRef()));

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new UtilError({message: 'Function timed out.', code: UtilErrorCode.FUNCTION_TIMEOUT}));
    }, timeout);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * A simple `sleep` function, which blocks until `ms` milliseconds have passed
 */
export async function sleep(ms: number): Promise<void> {
  return await new Promise(r => setTimeout(r, ms));
}
