import * as vscode from "vscode";
import { ChatPanelProvider } from "./chatPanel";
import { CodiApi } from "./api";

let api: CodiApi;

export function activate(context: vscode.ExtensionContext) {
  console.log("CODI Extension activating...");

  const config = vscode.workspace.getConfiguration("codi");
  const apiUrl = config.get<string>("apiUrl", "https://wgdlxekgnbcyfo-8000.proxy.runpod.ai");
  api = new CodiApi(apiUrl);

  const provider = new ChatPanelProvider(context.extensionUri, api);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("codi.chatPanel", provider)
  );

  const commands = [
    vscode.commands.registerCommand("codi.openChat", () => {
      vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
    }),

    vscode.commands.registerCommand("codi.clearChat", () => {
      provider.clear();
    }),

    vscode.commands.registerCommand("codi.explain", async () => {
      const code = getSelectedText();
      if (code) {
        provider.sendMessage(`Explain this code:\n\n\`\`\`\n${code}\n\`\`\``);
        vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
      }
    }),

    vscode.commands.registerCommand("codi.refactor", async () => {
      const code = getSelectedText();
      if (code) {
        provider.sendMessage(`Refactor this code:\n\n\`\`\`\n${code}\n\`\`\``);
        vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
      }
    }),

    vscode.commands.registerCommand("codi.generate", async () => {
      const editor = vscode.window.activeTextEditor;
      const context = editor ? `File: ${editor.document.fileName}` : "";
      provider.sendMessage(
        `Generate a function for this context:\n${context}`
      );
      vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
    }),

    vscode.commands.registerCommand("codi.fix", async () => {
      const code = getSelectedText();
      const editor = vscode.window.activeTextEditor;
      if (code) {
        const diagnostics = getDiagnostics(editor?.document);
        const diagText = diagnostics.length
          ? `\nErrors:\n${diagnostics.join("\n")}`
          : "";
        provider.sendMessage(
          `Fix this code:${diagText}\n\n\`\`\`\n${code}\n\`\`\``
        );
        vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
      }
    }),

    vscode.commands.registerCommand("codi.optimize", async () => {
      const code = getSelectedText();
      if (code) {
        provider.sendMessage(`Optimize this code for performance:\n\n\`\`\`\n${code}\n\`\`\``);
        vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
      }
    }),

    vscode.commands.registerCommand("codi.document", async () => {
      const code = getSelectedText();
      if (code) {
        provider.sendMessage(`Add documentation to this code:\n\n\`\`\`\n${code}\n\`\`\``);
        vscode.commands.executeCommand("workbench.view.extension.codi-sidebar");
      }
    }),

    vscode.commands.registerCommand("codi.syncFromR2", async () => {
      const config = vscode.workspace.getConfiguration("codi");
      const r2Config = config.get<Record<string, string>>("r2", {});
      if (!r2Config.accountId) {
        const setup = await vscode.window.showInformationMessage(
          "CODI: Configure R2 settings first?",
          "Open Settings"
        );
        if (setup) {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "@ext:codi-extension"
          );
        }
        return;
      }
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Syncing model from Cloudflare R2...",
          cancellable: false,
        },
        async () => {
          const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "codi-llava",
              messages: [{ role: "user", content: [{ type: "text", text: "ping" }] }],
              max_tokens: 1,
              stream: false,
            }),
          });
          if (response.ok) {
            vscode.window.showInformationMessage("CODI: Model is running");
          } else {
            vscode.window.showErrorMessage("CODI: API server not reachable. Ensure codi-core is running.");
          }
        }
      );
    }),
  ];

  context.subscriptions.push(...commands);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("codi")) {
        const config = vscode.workspace.getConfiguration("codi");
        api.setBaseUrl(config.get<string>("apiUrl", "https://wgdlxekgnbcyfo-8000.proxy.runpod.ai"));
      }
    })
  );

  console.log("CODI Extension activated ✓");
}

export function deactivate() {
  console.log("CODI Extension deactivated");
}

function getSelectedText(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No active editor");
    return undefined;
  }
  return editor.document.getText(editor.selection);
}

function getDiagnostics(document?: vscode.TextDocument): string[] {
  if (!document) return [];
  const diagnostics = vscode.languages.getDiagnostics(document.uri);
  return diagnostics.map((d) => `  ${d.message} (${d.range.start.line}:${d.range.start.character})`);
}
