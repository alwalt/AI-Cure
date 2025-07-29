import { RagResponse } from "@/types/files";
import { apiBase } from "@/lib/api";

// Single RAG call
export type SingleRagResponse = {
  description?: string;
  title?: string;
  keywords?: string[];
  assays?: string;
};

// call `/api/generate_rag_with_description` or `/generate_rag_with_title` etc.
export async function generateSingleRag(
  section: "description" | "title" | "keywords" | "assays",
  fileNames: string[],
  sessionId: string
): Promise<string | string[]> {
  const payload = {
    session_id: sessionId,
    file_names: fileNames,
    model: "llama3.1", // match your backend default
    top_k: 3, // or push this through from UI if you like
  };
  console.log("single RAG call, section,", section);
  console.log("single RAG call, cookie,", sessionId);
  const res = await fetch(`${apiBase}/api/generate_rag_with_${section}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`RAG ${section} call failed: ${res.statusText}`);
  }
  const data: SingleRagResponse = await res.json();
  const value = data[section];
  if (value === undefined) {
    throw new Error(`No "${section}" field in response`);
  }
  return value;
}

// Old whole obj 1 shot api call
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
