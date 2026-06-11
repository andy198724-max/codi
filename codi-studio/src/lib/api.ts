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
  private authKey: string = "";

  constructor(baseUrl?: string, authKey?: string) {
    if (baseUrl) this.baseUrl = baseUrl;
    if (authKey) this.authKey = authKey;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setAuthKey(key: string) {
    this.authKey = key;
  }

  async chat(
    messages: Message[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.authKey}` },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 131072,
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.authKey}` },
      body: JSON.stringify({
        model: "codi-llava",
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 131072,
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

  async agentRun(
    messages: Message[],
    workspace: string,
    onEvent: (event: any) => void,
    options?: { temperature?: number; maxTokens?: number; maxIterations?: number }
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.authKey}` },
      body: JSON.stringify({
        messages,
        workspace,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 4096,
        max_iterations: options?.maxIterations ?? 50,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Agent API error ${response.status}: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          onEvent(parsed);
        } catch {
          // skip parse errors
        }
      }
    }
  }
}

export const api = new CodiApi();
