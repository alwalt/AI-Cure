import { NextRequest } from "next/server";

type SuggestionsPayload = {
  template?: string; // e.g., "western-blot"
  column: string; // column name
  query?: string; // user typed filter
  max?: number; // max count
};

// Mock suggestion source for Western Blot POC
const WESTERN_BLOT_SUGGESTIONS: Record<string, string[]> = {
  "Sample Name": [
    "Control_1",
    "Control_2",
    "Treatment_A_1",
    "Treatment_A_2",
    "Treatment_B_1",
    "Replicate_1",
    "Replicate_2",
  ],
  Protein: [
    "β-actin",
    "GAPDH",
    "p53",
    "Tubulin",
    "Vimentin",
    "HSP90",
  ],
  "Imaging Method": [
    "Chemiluminescence",
    "Fluorescence",
    "Infrared",
  ],
  "Blocking Duration": [
    "30 min",
    "1 hour",
    "2 hours",
    "Overnight",
  ],
  "Block Concentration": [
    "3% BSA TBST",
    "5% BSA TBST",
    "5% milk TBST",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestionsPayload;
    const template = (body.template || "western-blot").toLowerCase();
    const column = body.column || "";
    const query = (body.query || "").toLowerCase();
    const max = Math.min(Math.max(body.max || 8, 1), 50);

    // Currently only the western-blot template is mocked
    const source = template === "western-blot" ? WESTERN_BLOT_SUGGESTIONS : {};
    const options = source[column] || [];

    const filtered = query
      ? options.filter((opt) => opt.toLowerCase().includes(query))
      : options;

    return Response.json({
      column,
      template,
      suggestions: filtered.slice(0, max),
    });
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}


