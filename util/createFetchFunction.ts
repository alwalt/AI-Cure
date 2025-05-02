const createFetchFunction = (sectionName: string) => {
  return async () => {
    /* PREP WORK FOR REAL API CALL
    const response = await fetch(`/api/generate_section_${sectionName}`, {
      method: "POST",
      body: JSON.stringify({ section: sectionName }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data.generatedText;
    */
    console.log(`From section: ${sectionName}`);
    return `Generated ${sectionName} from AI.`; // Simulated LLM response
  };
};

export default createFetchFunction;
