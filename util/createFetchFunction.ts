const createFetchFunction = (sectionName: string) => {
  return async () => {
    // * PREP WORK FOR REAL API CALL
    const response = await fetch(`/api/generate-section-${sectionName}`, {
      method: "POST",
      body: JSON.stringify({ section: sectionName }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data.generatedText;

    // This is where you’d make a real API call
    // return `Generated ${sectionName} from AI.`; // Simulated LLM response
  };
};

export default createFetchFunction;
