import { RagResponse } from "@/types/files";
import { apiBase } from "@/lib/api";

export async function generateWithTemplate(
  fileNames: string[],
  template: "biophysics",
  model = "llama3.1",
  top_k = 5,
  extra_instructions: string | null = null
): Promise<RagResponse> {
  const res = await fetch(`${apiBase}/api/generate_rag_with_template`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_names: fileNames,
      template: template,
      model,
      top_k,
      extra_instructions,
    }),
  });

  if (!res.ok) {
    console.log("RETURNED res from rag ", res);
    let errBody = {};
    try {
      errBody = await res.json();
    } catch {}
    throw new Error(
      `RAG request failed (${res.status}): ${JSON.stringify(errBody)}`
    );
  }

  return res.json();
}
