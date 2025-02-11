// src/utils/initialization.ts

type InitializationResult<T> = {
  success: boolean;
  value?: T;
  error?: string;
};

export async function initializeState<T>(
  initValue: string,
  options = {
    maxRetries: 10,
    retryInterval: 100,
  },
): Promise<InitializationResult<T>> {
  const tryInitialize = (): InitializationResult<T> => {
    try {
      // First try to parse as JSON
      const parsed = JSON.parse(initValue);
      return { success: true, value: parsed };
    } catch (_) {
      // If JSON parsing fails, try to get from window
      if (window[initValue] === undefined) {
        return { success: false };
      }
      const value =
        typeof window[initValue] === "function"
          ? window[initValue]()
          : window[initValue];
      return { success: true, value };
    }
  };

  return new Promise((resolve) => {
    let retryCount = 0;

    const retry = () => {
      const result = tryInitialize();

      if (result.success) {
        resolve(result);
        return;
      }

      if (retryCount >= options.maxRetries) {
        resolve({
          success: false,
          error: `Failed to initialize state after ${options.maxRetries} attempts`,
        });
        return;
      }

      retryCount++;
      setTimeout(retry, options.retryInterval);
    };

    retry();
  });
}
