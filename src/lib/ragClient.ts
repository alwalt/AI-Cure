// src/lib/ragClient.ts
export interface RagResponse {
  [key: string]: string | string[];
}

export async function generateWithTemplate(
  csvNames: string[],
  template: "biophysics" | "geology",
  model = "llama3.1",
  top_k = 5,
  extra_instructions: string | null = null
): Promise<RagResponse> {
  const res = await fetch(
    "http://localhost:8000/api/generate_rag_with_template",
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csv_names: csvNames,
        template: template,
        model,
        top_k,
        extra_instructions,
      }),
    }
  );

  if (!res.ok) {
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
