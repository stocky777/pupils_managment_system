import { useCallback, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T;
  error: Error | null;
  isLoading: boolean;
  reload: () => void;
}

/** Loads asynchronous data and exposes explicit loading and error states. */
export function useAsyncData<T>(loader: () => Promise<T>, initialValue: T): AsyncDataState<T> {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestNumber, setRequestNumber] = useState(0);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRequestNumber((current) => current + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    loader()
      .then((value) => { if (isCurrent) setData(value); })
      .catch((reason: unknown) => {
        if (isCurrent) setError(reason instanceof Error ? reason : new Error("Unable to load data"));
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });

    return () => { isCurrent = false; };
  }, [loader, requestNumber]);

  return { data, error, isLoading, reload };
}
