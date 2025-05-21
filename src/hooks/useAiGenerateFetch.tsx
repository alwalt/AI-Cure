import { useState, useCallback } from "react";


const useAiGenerateFetch = <TData = unknown, TError = Error>(
  fetchFunction: () => Promise<TData> // The function that performs the async operation
) => {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const executeFetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (e: any) {
      console.error("Error in useAiGenerateFetch:", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]); 
  return { data, isLoading, error, executeFetch };
};

export default useAiGenerateFetch;