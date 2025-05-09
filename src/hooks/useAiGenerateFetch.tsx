import { useState } from "react";

const useAiGenerateFetch = (fetchFunction: () => Promise<string>) => {
  // const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchFunction(); // no return value expected
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return [loading, fetchData] as const;
};

export default useAiGenerateFetch;
