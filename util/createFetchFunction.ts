import { generateWithTemplate } from "@/lib/ragClient";

export default function createFetchFunction(sectionName: string) {
  return async () => {
    // 1) hit the single RAG endpoint with the right template & csv names
    const full = await generateWithTemplate(
      /* csvNames */ selectedCsvNames,
      /* template */ "biophysics",
      /* rest defaulted */
    );
    // 2) pull out just the bit you need
    if (!(sectionName in full)) {
      throw new Error(`Missing field ${sectionName} in RAG response`);
    }
    return full[sectionName] as string;
  };
}
