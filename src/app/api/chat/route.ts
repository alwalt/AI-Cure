<<<<<<< HEAD
import { NextRequest } from 'next/server';
import { apiBase } from "@/lib/api";
||||||| 4bbf6836
import { NextRequest } from 'next/server';
=======
import { apiBase } from "@/lib/api";
import { NextRequest } from "next/server";
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

export async function POST(req: NextRequest) {
<<<<<<< HEAD
||||||| 4bbf6836
  try {
    const { messages, isSearchMode = false, model = 'llama3.1' } = await req.json();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Get session ID from cookies 
    const sessionId = req.cookies.get('user_session')?.value || 'default';
    
    let endpoint = '';
    let body = {};
    
    if (isSearchMode) {
      // OSDR search endpoint 
      endpoint = 'http://localhost:8000/api/mcp_query';
      body = { query: lastMessage.content };
    } else {
      // Regular chat endpoint
      endpoint = `http://localhost:8000/api/get_chat_response/${sessionId}`;
      body = { 
        query: lastMessage.content,
        model: model
      };
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward cookies to FastAPI backend
    const cookies = req.cookies.toString();
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

=======
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

>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb
    try {
<<<<<<< HEAD
        const { messages, isSearchMode = false, model = 'llama3.1' } = await req.json();
||||||| 4bbf6836
      const fastApiResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
        signal: controller.signal,
      });
=======
      const fastApiResponse = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
        signal: controller.signal,
      });
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

        // Get the last user message
        const lastMessage = messages[messages.length - 1];

<<<<<<< HEAD
        // Get session ID from cookies 
        const sessionId = req.cookies.get('user_session')?.value || 'default';

        let endpoint = '';
        let body = {};

        if (isSearchMode) {
            // OSDR search endpoint 
            endpoint = `${apiBase}/api/mcp_query`;
            body = { query: lastMessage.content };
        } else {
            // Regular chat endpoint
            endpoint = `${apiBase}/api/get_chat_response/${sessionId}`;
            body = {
                query: lastMessage.content,
                model: model
            };
||||||| 4bbf6836
      if (!fastApiResponse.ok) {
        const errorText = await fastApiResponse.text();
        console.error(`FastAPI error ${fastApiResponse.status}:`, errorText);
        
        if (errorText.includes('model') || errorText.includes('not found')) {
          throw new Error(`Model "${model}" might not be available. Please try a different model.`);
=======
      if (!fastApiResponse.ok) {
        const errorText = await fastApiResponse.text();
        console.error(`FastAPI error ${fastApiResponse.status}:`, errorText);

        if (errorText.includes("model") || errorText.includes("not found")) {
          throw new Error(
            `Model "${model}" might not be available. Please try a different model.`
          );
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb
        }
<<<<<<< HEAD
||||||| 4bbf6836
        
        throw new Error(`FastAPI error: ${fastApiResponse.status} - ${errorText}`);
      }
=======

        throw new Error(
          `FastAPI error: ${fastApiResponse.status} - ${errorText}`
        );
      }
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

<<<<<<< HEAD
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
||||||| 4bbf6836
      const responseData = await fastApiResponse.json();
      
      let aiResponse = '';
      if (isSearchMode) {
        aiResponse = responseData.response || 'No search results found';
      } else {
        aiResponse = responseData.answer || responseData.response || 'No response from AI';
      }
=======
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
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

<<<<<<< HEAD
        // Forward cookies to FastAPI backend
        const cookies = req.cookies.toString();
        if (cookies) {
            headers['Cookie'] = cookies;
        }
||||||| 4bbf6836
      // Create the response
      const response = Response.json({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
      });
=======
      // Create the response
      const response = Response.json({
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse,
        isSearchResult: mode === "search" || mode === "viz",
      });
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

<<<<<<< HEAD
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
||||||| 4bbf6836
      // Forward any cookie headers from FastAPI to the client
      const setCookieHeader = fastApiResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        response.headers.set('Set-Cookie', setCookieHeader);
      }
=======
      // Forward any cookie headers from FastAPI to the client
      const setCookieHeader = fastApiResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("Set-Cookie", setCookieHeader);
      }
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb

<<<<<<< HEAD
        try {
            const fastApiResponse = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                credentials: 'include',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!fastApiResponse.ok) {
                const errorText = await fastApiResponse.text();
                console.error(`FastAPI error ${fastApiResponse.status}:`, errorText);

                if (errorText.includes('model') || errorText.includes('not found')) {
                    throw new Error(`Model "${model}" might not be available. Please try a different model.`);
                }

                throw new Error(`FastAPI error: ${fastApiResponse.status} - ${errorText}`);
            }

            const responseData = await fastApiResponse.json();

            let aiResponse = '';
            if (isSearchMode) {
                aiResponse = responseData.response || 'No search results found';
            } else {
                aiResponse = responseData.answer || responseData.response || 'No response from AI';
            }

            // Create the response
            const response = Response.json({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: aiResponse,
            });

            // Forward any cookie headers from FastAPI to the client
            const setCookieHeader = fastApiResponse.headers.get('set-cookie');
            if (setCookieHeader) {
                response.headers.set('Set-Cookie', setCookieHeader);
            }

            return response;
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error(`Request timed out. Model "${model}" is taking too long to respond. Try a different model.`);
            }

            throw fetchError;
        }

    } catch (error) {
        console.error('Chat API error:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Failed to process chat request' },
            { status: 500 }
        );
||||||| 4bbf6836
      return response;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error(`Request timed out. Model "${model}" is taking too long to respond. Try a different model.`);
      }
      
      throw fetchError;
=======
      return response;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error(
          `Request timed out. Model "${model}" is taking too long to respond. Try a different model.`
        );
      }

      throw fetchError;
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb
    }
<<<<<<< HEAD
||||||| 4bbf6836

  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' }, 
      { status: 500 }
    );
  }
}
=======
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
>>>>>>> b20ad378ed6004c2a010373220764a97fd025feb
}
