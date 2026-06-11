import { invoke } from "@tauri-apps/api/core";

export interface Message {
  role: "system" | "user" | "assistant";
  content: ContentPart[];
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
}

export class CodiApi {
  private baseUrl: string = "https://bq4k3y1q9e6tds.api.runpod.ai";

  constructor(baseUrl?: string) {
    if (baseUrl) this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async chat(
    messages: Message[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer codi-secret-key-2026" },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 8192,
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
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer codi-secret-key-2026" },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 8192,
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
        } catch {
          // skip parse errors
        }
      }
    }

    return fullContent;
  }

  async readFile(path: string): Promise<string> {
    return await invoke<string>("read_file", { path });
  }

  async writeFile(path: string, content: string): Promise<void> {
    return await invoke("write_file", { path, content });
  }

  async listDirectory(path: string): Promise<FileEntry[]> {
    return await invoke<FileEntry[]>("list_directory", { path });
  }

  async setApiUrl(url: string): Promise<void> {
    return await invoke("set_api_url", { url });
  }
}

export const api = new CodiApi();
