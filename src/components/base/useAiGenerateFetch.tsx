import { useState } from "react";

const useAiGenerateFetch = (fetchFunction: () => Promise<string>) => {
  const [data, setData] = useState<string>("");

  const fetchData = async () => {
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (error) {
      console.error("Error fetching LLM data:", error);
    }
  };

  return [data, fetchData] as const; // Return the data and the fetch function
};

export default useAiGenerateFetch;
