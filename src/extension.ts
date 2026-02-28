import * as vscode from "vscode";
import * as path from "path";

let lastPlayed = 0;

console.log("🔥 My Terminal Error Sound Extension Loaded");

export function activate(context: vscode.ExtensionContext) {
  console.log("Terminal Sound Extension Activated 🚀");

  vscode.window.onDidStartTerminalShellExecution(async (event) => {
    const config = vscode.workspace.getConfiguration("soundEffects");
    const selectedSound =
      config.get<string>("terminalErrorSound") || "rooster_scream.mp3";
    const volume = config.get<number>("volume") ?? 0.7;
    const cooldown = config.get<number>("cooldown") ?? 3000;

    try {
      for await (const chunk of event.execution.read()) {
        const text = chunk.toLowerCase();

        const errorKeywords = [
          "error",
          "failed",
          "exception",
          "not found",
          "not recognized",
          "cannot find",
          "no such file",
          "commandnotfoundexception",
        ];

        const containsError = errorKeywords.some((keyword) =>
          text.includes(keyword),
        );

        const now = Date.now();

        if (containsError && now - lastPlayed > cooldown) {
          lastPlayed = now;
          playSound(context, selectedSound, volume);
        }
      }
    } catch (err) {
      console.error("Terminal read error:", err);
    }
  });

  vscode.window.showInformationMessage(
    "Real-Time Terminal Error Sound Active 🔊",
  );
}

function playSound(
  context: vscode.ExtensionContext,
  fileName: string,
  volume: number,
) {
  const panel = vscode.window.createWebviewPanel(
    "soundPlayer",
    "",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );

  const soundPath = vscode.Uri.file(
    path.join(context.extensionPath, "media", fileName),
  );

  const soundUri = panel.webview.asWebviewUri(soundPath);

  panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <body>
            <audio autoplay>
                <source src="${soundUri}" type="audio/mpeg">
            </audio>
            <script>
                const audio = document.querySelector("audio");
                audio.volume = ${volume};
            </script>
        </body>
        </html>
    `;

  setTimeout(() => panel.dispose(), 2000);
}

export function deactivate() {}

vscode.window.onDidStartTerminalShellExecution((event) => {
    console.log("🔥 Terminal execution detected!");
});