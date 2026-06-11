import * as vscode from "vscode";

interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: "system" | "user" | "assistant";
  content: ContentPart[];
}

interface ChatResponse {
  choices: { message: { content: string } }[];
}

export class CodiApi {
  constructor(private baseUrl: string) {}

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async chat(
    messages: Message[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration("codi");
    const temperature = options?.temperature ?? config.get("temperature", 0.7);
    const maxTokens = options?.maxTokens ?? config.get("maxTokens", 4096);

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer codi-secret-key-2026" },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data: ChatResponse = await response.json();
    return data.choices[0].message.content;
  }

  async chatStream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration("codi");
    const temperature = options?.temperature ?? config.get("temperature", 0.7);
    const maxTokens = options?.maxTokens ?? config.get("maxTokens", 4096);

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer codi-secret-key-2026" },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch {}
      }
    }

    return fullContent;
  }
}
