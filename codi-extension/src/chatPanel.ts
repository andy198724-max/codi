import * as vscode from "vscode";
import { CodiApi } from "./api";

export class ChatPanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _messages: { role: string; content: any[] }[] = [];
  private _abortController?: AbortController;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _api: CodiApi
  ) {
    this._messages.push({
      role: "system",
      content: [
        {
          type: "text",
          text: "You are CODI, an advanced AI coding assistant with vision capabilities (LLaVA-1.6 34B) integrated into VS Code.",
        },
      ],
    });
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlContent();

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "sendMessage":
          this._handleUserMessage(data.text, data.images);
          break;
        case "applyCode":
          this._applyCode(data.code, data.language);
          break;
        case "openFile":
          this._openFile(data.path);
          break;
        case "insertAtCursor":
          this._insertAtCursor(data.text);
          break;
      }
    });
  }

  private async _handleUserMessage(text: string, images: string[] = []) {
    if (!text.trim() && !images.length) return;

    const parts: any[] = [{ type: "text", text: text || "Analyze this image" }];
    for (const img of images) {
      parts.push({ type: "image_url", image_url: { url: img } });
    }

    const context = this._getEditorContext();

    const userMessage = {
      role: "user" as const,
      content: [
        ...(context ? [{ type: "text" as const, text: context }] : []),
        ...parts,
      ],
    };

    this._messages.push(userMessage as any);
    this._postMessage({ type: "addMessage", role: "user", content: text, images });

    this._postMessage({ type: "setLoading", loading: true });

    try {
      const assistantMsg = { role: "assistant", content: "" };
      this._postMessage({ type: "startAssistant" });

      let fullContent = "";
      await this._api.chatStream(
        this._messages as any,
        (chunk) => {
          fullContent += chunk;
          this._postMessage({ type: "streamChunk", chunk });
        }
      );

      this._messages.push({
        role: "assistant",
        content: [{ type: "text", text: fullContent }],
      });

      this._postMessage({ type: "endAssistant" });
    } catch (err: any) {
      this._postMessage({
        type: "error",
        message: `Error: ${err.message}`,
      });
    } finally {
      this._postMessage({ type: "setLoading", loading: false });
    }
  }

  private _getEditorContext(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return undefined;

    const doc = editor.document;
    const filePath = doc.fileName;
    const language = doc.languageId;
    const selection = editor.selection;
    const selectedText = doc.getText(selection);
    const lineCount = doc.lineCount;

    let context = `Active file: ${filePath}\nLanguage: ${language}\nTotal lines: ${lineCount}`;

    if (selectedText) {
      context += `\nSelected code (lines ${selection.start.line + 1}-${selection.end.line + 1}):\n\`\`\`${language}\n${selectedText}\n\`\`\``;
    }

    return context;
  }

  private _applyCode(code: string, language: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor");
      return;
    }

    editor.edit((editBuilder) => {
      if (editor.selection.isEmpty) {
        editBuilder.insert(editor.selection.active, code);
      } else {
        editBuilder.replace(editor.selection, code);
      }
    });
  }

  private _insertAtCursor(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, text);
    });
  }

  private _openFile(path: string) {
    vscode.workspace.openTextDocument(path).then(
      (doc) => vscode.window.showTextDocument(doc),
      () => vscode.window.showErrorMessage(`Could not open file: ${path}`)
    );
  }

  private _postMessage(message: any) {
    this._view?.webview.postMessage(message);
  }

  sendMessage(text: string) {
    this._postMessage({ type: "setInput", text });
  }

  clear() {
    this._messages = [
      {
        role: "system",
        content: [
          {
            type: "text",
          text: "You are CODI, an advanced AI coding assistant with vision capabilities (LLaVA-1.6 34B) integrated into VS Code.",
          },
        ],
      },
    ];
    this._postMessage({ type: "clearChat" });
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; img-src data:; font-src 'none';" />
  <script src="https://cdn.jsdelivr.net/npm/marked@12.0.1/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
  <style>
    :root {
      --codi-500: #4f6af5;
      --codi-600: #3b52e0;
      --bg: var(--vscode-sideBar-background, #1e1e1e);
      --fg: var(--vscode-sideBar-foreground, #cccccc);
      --border: var(--vscode-sideBar-border, #333333);
      --input-bg: var(--vscode-input-background, #3c3c3c);
      --input-fg: var(--vscode-input-foreground, #cccccc);
      --btn-bg: var(--vscode-button-background, #0e639c);
      --btn-fg: var(--vscode-button-foreground, #ffffff);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, -apple-system, sans-serif);
      font-size: 13px;
      background: var(--bg);
      color: var(--fg);
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .message {
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 6px;
    }
    .message.user {
      background: var(--vscode-textBlockQuote-background, #2d2d2d);
    }
    .message.assistant {
      background: transparent;
    }
    .msg-role {
      font-size: 11px;
      font-weight: 600;
      color: var(--codi-500);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .msg-content {
      line-height: 1.5;
      word-wrap: break-word;
    }
    .msg-content p {
      margin: 4px 0;
    }
    .msg-content ul, .msg-content ol {
      padding-left: 20px;
      margin: 4px 0;
    }
    .msg-content li {
      margin: 2px 0;
    }
    .msg-content h1, .msg-content h2, .msg-content h3, .msg-content h4 {
      margin: 8px 0 4px;
      font-weight: 600;
    }
    .msg-content h1 { font-size: 16px; }
    .msg-content h2 { font-size: 14px; }
    .msg-content h3 { font-size: 13px; }
    .msg-content code {
      font-family: var(--vscode-editor-font-family, 'Cascadia Code', monospace);
      font-size: 12px;
      padding: 1px 4px;
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      border-radius: 3px;
    }
    .msg-content pre {
      background: var(--vscode-textCodeBlock-background, #1e1e1e);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 6px 0;
    }
    .msg-content pre code {
      background: none;
      padding: 0;
      font-size: 12px;
      line-height: 1.4;
    }
    .msg-content blockquote {
      border-left: 3px solid var(--codi-500);
      padding-left: 8px;
      margin: 4px 0;
      opacity: 0.85;
    }
    .msg-content table {
      border-collapse: collapse;
      margin: 4px 0;
      font-size: 12px;
    }
    .msg-content th, .msg-content td {
      border: 1px solid var(--border);
      padding: 4px 8px;
      text-align: left;
    }
    .msg-content th {
      background: var(--vscode-textBlockQuote-background, #2d2d2d);
    }
    .msg-content img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
      margin: 4px 0;
    }
    .msg-content a {
      color: var(--codi-500);
      text-decoration: none;
    }
    .msg-content a:hover {
      text-decoration: underline;
    }
    .actions {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }
    .actions button {
      background: none;
      border: 1px solid var(--border);
      color: var(--fg);
      padding: 2px 8px;
      font-size: 11px;
      border-radius: 3px;
      cursor: pointer;
    }
    .actions button:hover {
      background: var(--btn-bg);
      color: var(--btn-fg);
    }
    #input-area {
      padding: 8px;
      border-top: 1px solid var(--border);
    }
    #input-row {
      display: flex;
      gap: 6px;
      align-items: flex-end;
    }
    #input {
      flex: 1;
      background: var(--input-bg);
      color: var(--input-fg);
      border: 1px solid var(--border);
      padding: 6px 8px;
      border-radius: 4px;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: 13px;
      resize: none;
      min-height: 32px;
      max-height: 120px;
    }
    #input:focus {
      outline: none;
      border-color: var(--codi-500);
    }
    #send-btn {
      background: var(--btn-bg);
      color: var(--btn-fg);
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      height: 32px;
    }
    #send-btn:disabled {
      opacity: 0.5;
      cursor: default;
    }
    #image-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--fg);
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #image-btn:hover {
      border-color: var(--codi-500);
    }
    #image-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 6px;
    }
    #image-preview img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
    }
    .loading {
      text-align: center;
      padding: 16px;
      color: var(--codi-500);
      font-size: 12px;
    }
    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid var(--border);
      border-top-color: var(--codi-500);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error {
      padding: 8px;
      margin: 8px;
      background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      border-radius: 4px;
      color: var(--vscode-inputValidation-errorForeground, #ffeaea);
      font-size: 12px;
    }
    #file-context {
      font-size: 11px;
      padding: 4px 8px;
      background: var(--vscode-badge-background, #4d4d4d);
      color: var(--vscode-badge-foreground, #ffffff);
      border-radius: 3px;
      margin-bottom: 6px;
      display: none;
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <div id="input-area">
    <div id="image-preview"></div>
    <div id="input-row">
      <textarea id="input" placeholder="Ask CODI anything..." rows="1"></textarea>
      <button id="image-btn" title="Attach Image">🖼</button>
      <button id="send-btn">Send</button>
    </div>
  </div>
  <input type="file" id="file-input" accept="image/*" multiple style="display:none" />

  <script>
    (function() {
      const vscode = acquireVsCodeApi();
      const messagesEl = document.getElementById('messages');
      const inputEl = document.getElementById('input');
      const sendBtn = document.getElementById('send-btn');
      const imageBtn = document.getElementById('image-btn');
      const fileInput = document.getElementById('file-input');
      const imagePreview = document.getElementById('image-preview');
      let images = [];
      let isLoading = false;

      if (typeof marked !== 'undefined') {
        marked.setOptions({
          breaks: true,
          gfm: true,
          highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return hljs.highlight(code, { language: lang }).value;
              } catch (e) {}
            }
            return code;
          }
        });
      }

      inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
      });

      inputEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });

      inputEl.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                images.push(ev.target.result);
                updateImagePreview();
              };
              reader.readAsDataURL(file);
            }
          }
        }
      });

      sendBtn.addEventListener('click', sendMessage);
      imageBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              images.push(ev.target.result);
              updateImagePreview();
            };
            reader.readAsDataURL(file);
          }
        }
        fileInput.value = '';
      });

      function sendMessage() {
        const text = inputEl.value.trim();
        if (!text && images.length === 0) return;
        if (isLoading) return;

        vscode.postMessage({ type: 'sendMessage', text, images });
        inputEl.value = '';
        inputEl.style.height = 'auto';
        images = [];
        updateImagePreview();
      }

      function updateImagePreview() {
        imagePreview.innerHTML = images.map((img, i) =>
          '<img src="' + img + '" onclick="removeImage(' + i + ')" />'
        ).join('');
      }

      window.removeImage = function(i) {
        images.splice(i, 1);
        updateImagePreview();
      };

      window.addEventListener('message', (event) => {
        const msg = event.data;
        switch (msg.type) {
          case 'addMessage':
            addMessage(msg.role, msg.content, msg.images);
            break;
          case 'startAssistant':
            startAssistantMessage();
            break;
          case 'streamChunk':
            appendToLastMessage(msg.chunk);
            break;
          case 'endAssistant':
            endAssistantMessage();
            break;
          case 'setLoading':
            isLoading = msg.loading;
            sendBtn.disabled = isLoading;
            if (isLoading) showLoading();
            else hideLoading();
            break;
          case 'error':
            showError(msg.message);
            break;
          case 'clearChat':
            messagesEl.innerHTML = '';
            break;
          case 'setInput':
            inputEl.value = msg.text;
            inputEl.focus();
            break;
        }
      });

      function addMessage(role, content, imgs) {
        const div = document.createElement('div');
        div.className = 'message ' + role;
        const body = imgs && imgs.length
          ? imgs.map(i => '<img src="' + i + '" />').join('')
          : '';
        div.innerHTML = '<div class="msg-role">' + role + '</div>' +
          body +
          '<div class="msg-content">' + renderMarkdown(content) + '</div>';
        messagesEl.appendChild(div);
        scrollToBottom();
      }

      let assistantDiv = null;
      let assistantContent = null;

      function startAssistantMessage() {
        assistantDiv = document.createElement('div');
        assistantDiv.className = 'message assistant';
        assistantDiv.innerHTML = '<div class="msg-role">CODI</div><div class="msg-content"></div>';
        messagesEl.appendChild(assistantDiv);
        assistantContent = assistantDiv.querySelector('.msg-content');
        scrollToBottom();
      }

      function appendToLastMessage(chunk) {
        if (assistantContent) {
          assistantContent.innerHTML = renderMarkdown(assistantContent.textContent + chunk);
          scrollToBottom();
        }
      }

      function endAssistantMessage() {
        if (assistantDiv) {
          const codeEls = assistantDiv.querySelectorAll('pre code');
          if (typeof hljs !== 'undefined' && hljs) {
            try { codeEls.forEach((block) => hljs.highlightElement(block)); } catch (e) {}
          }
          const actions = document.createElement('div');
          actions.className = 'actions';
          actions.innerHTML = '<button onclick="applyCode()">Apply</button><button onclick="copyCode()">Copy</button>';
          assistantDiv.appendChild(actions);
        }
        assistantDiv = null;
        assistantContent = null;
      }

      function showLoading() {
        const existing = document.querySelector('.loading');
        if (!existing) {
          const div = document.createElement('div');
          div.className = 'loading';
          div.innerHTML = '<span class="spinner"></span>Thinking...';
          messagesEl.appendChild(div);
          scrollToBottom();
        }
      }

      function hideLoading() {
        const el = document.querySelector('.loading');
        if (el) el.remove();
      }

      function showError(msg) {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = msg;
        messagesEl.appendChild(div);
        scrollToBottom();
      }

      function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
      }

      function renderMarkdown(text) {
        if (typeof marked !== 'undefined') {
          return marked.parse(text);
        }
        return escapeHtml(text)
          .replace(/### (.+)/g, '<h3>$1</h3>')
          .replace(/## (.+)/g, '<h2>$1</h2>')
          .replace(/# (.+)/g, '<h1>$1</h1>')
          .replace(/\\\`\\\`\\\`(\\w*)\\n([\\s\\S]*?)\\n\\\`\\\`\\\`/g, '<pre><code class="language-$1">$2</code></pre>')
          .replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          .replace(/\\n/g, '<br />');
      }

      window.applyCode = function() {
        const text = assistantContent ? assistantContent.textContent : '';
        const match = text.match(/\\\`\\\`\\\`(\\w*)\\n([\\s\\S]*?)\\\`\\\`\\\`/);
        if (match) {
          vscode.postMessage({ type: 'applyCode', code: match[2], language: match[1] });
        } else {
          vscode.postMessage({ type: 'insertAtCursor', text: text });
        }
      };

      window.copyCode = function() {
        const text = assistantContent ? assistantContent.textContent : '';
        navigator.clipboard.writeText(text);
      };
    })();
  </script>
</body>
</html>`;
  }
}
