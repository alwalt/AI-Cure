import { apiBase } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      isSearchMode = false,
      model = "llama3.1",
      mode: incomingMode,
    } = await req.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    // Get session ID from cookies
    const sessionId = req.cookies.get("user_session")?.value || "default";

    let endpoint = "";
    let body = {};

    const mode: "chat" | "search" | "viz" = incomingMode
      ? incomingMode
      : isSearchMode
      ? "search"
      : "chat";

    if (mode === "search") {
      // OSDR search endpoint
      endpoint = `${apiBase}/api/mcp_query`;
      body = { query: lastMessage.content };
    } else if (mode === "viz") {
      // OSDR visualization endpoint
      endpoint = `${apiBase}/api/mcp_query/viz`;
      body = { query: lastMessage.content };
    } else {
      // Regular chat endpoint
      endpoint = `${apiBase}/api/get_chat_response/${sessionId}`;
      body = {
        query: lastMessage.content,
        model: model,
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Forward cookies to FastAPI backend
    const cookies = req.cookies.toString();
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

    try {
      const fastApiResponse = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!fastApiResponse.ok) {
        const errorText = await fastApiResponse.text();
        console.error(`FastAPI error ${fastApiResponse.status}:`, errorText);

        if (errorText.includes("model") || errorText.includes("not found")) {
          throw new Error(
            `Model "${model}" might not be available. Please try a different model.`
          );
        }

        throw new Error(
          `FastAPI error: ${fastApiResponse.status} - ${errorText}`
        );
      }

      const responseData = await fastApiResponse.json();

      let aiResponse = "";
      if (mode === "search") {
        aiResponse = responseData.response || "No search results found";
      } else if (mode === "viz") {
        let summary = responseData.summary as string | undefined;
        let plotFile = responseData.plot_file as string | undefined;

        const raw = responseData.response || "";
        if (!summary || !plotFile) {
          try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            summary = summary || parsed?.summary;
            plotFile = plotFile || parsed?.plot_file;
          } catch {
            // Try regex extraction for plot_file from raw text
            if (typeof raw === "string") {
              let plotMatch = raw.match(/plot_file\"?\s*[:=]\s*\"([^\"]+\.png)\"/i);
              if (!plotMatch) {
                plotMatch = raw.match(/(\S+\.png)/i);
              }
              if (plotMatch) plotFile = plotMatch[1];
              const sumMatch = raw.match(/summary\"?\s*[:=]\s*\"([\s\S]*?)\"\s*(,|})/i);
              if (sumMatch) summary = sumMatch[1];
            }
          }
        }

        let contentMd = summary || "Plot generated.";
        if (plotFile) {
          const filename = (plotFile as string).split("/").pop();
          if (filename) {
            const plotUrl = `${apiBase}/api/get_plot/${encodeURIComponent(
              filename
            )}`;
            contentMd += `\n\n![OSDR Plot](${plotUrl})`;
          }
        }
        aiResponse = contentMd;
      } else {
        aiResponse =
          responseData.answer || responseData.response || "No response from AI";
      }

      // Create the response
      const response = Response.json({
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        isSearchResult: mode === "search" || mode === "viz",
      });

      // Forward any cookie headers from FastAPI to the client
      const setCookieHeader = fastApiResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("Set-Cookie", setCookieHeader);
      }

      return response;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error(
          `Request timed out. Model "${model}" is taking too long to respond. Try a different model.`
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process chat request",
      },
      { status: 500 }
    );
  }
}
