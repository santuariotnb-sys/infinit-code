import * as vscode from 'vscode';
import { PreviewPanel } from './previewPanel';
import { LicenseManager } from './licenseManager';
import { ChatPanel } from './chatPanel';
import { SnippetsPanel } from './snippetsPanel';
import { SetupManager } from './setupManager';

export async function activate(context: vscode.ExtensionContext) {
  const license = new LicenseManager(context);
  await license.checkOnStartup();

  // ── LIVE PREVIEW ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('infinit.preview', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Open an HTML or TSX/JSX file first.');
        return;
      }
      PreviewPanel.createOrShow(context.extensionUri, editor.document, license);
    })
  );

  // ── ACTIVATE LICENSE ──────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('infinit.activateLicense', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'Enter your Infinit Code Pro license key',
        placeHolder: 'INFT-XXXX-XXXX-XXXX-XXXX',
        password: false,
      });
      if (!key) return;
      const result = await license.activate(key);
      if (result.success) {
        vscode.commands.executeCommand('setContext', 'infinit.isPro', true);

        // Primeira ativação — roda o setup completo automaticamente
        const alreadySetup = context.globalState.get<boolean>('infinit.setupDone', false);
        if (!alreadySetup) {
          const setup = new SetupManager();
          const setupResult = await setup.run(context);
          SetupManager.showReport(setupResult);
        } else {
          vscode.window.showInformationMessage('✅ Infinit Code Pro ativado!');
        }
      } else {
        vscode.window.showErrorMessage(`❌ ${result.message}`);
      }
    })
  );

  // ── AI CHAT (PRO) ─────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('infinit.openChat', () => {
      if (!license.isPro()) {
        vscode.window.showWarningMessage('AI Chat requires Infinit Code Pro.', 'Upgrade').then(v => {
          if (v) vscode.env.openExternal(vscode.Uri.parse('https://infinitcode.netlify.app/#pricing'));
        });
        return;
      }
      ChatPanel.createOrShow(context.extensionUri, license);
    })
  );

  // ── SNIPPETS (PRO) ────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('infinit.openSnippets', () => {
      if (!license.isPro()) {
        vscode.window.showWarningMessage('Snippets library requires Infinit Code Pro.', 'Upgrade').then(v => {
          if (v) vscode.env.openExternal(vscode.Uri.parse('https://infinitcode.netlify.app/#pricing'));
        });
        return;
      }
      SnippetsPanel.createOrShow(context.extensionUri, license);
    })
  );

  // ── SETUP MANUAL (re-rodar a qualquer momento) ────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('infinit.setup', async () => {
      if (!license.isPro()) {
        vscode.window.showWarningMessage('Setup Pro requer licença ativa.', 'Ativar').then(v => {
          if (v) vscode.commands.executeCommand('infinit.activateLicense');
        });
        return;
      }
      const setup = new SetupManager();
      const result = await setup.run(context);
      SetupManager.showReport(result);
    })
  );

  // Set context for menus
  vscode.commands.executeCommand('setContext', 'infinit.isPro', license.isPro());

  // Auto-open preview when a supported file opens (optional UX)
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (!editor) return;
    const ext = editor.document.fileName.split('.').pop();
    if (['html', 'tsx', 'jsx'].includes(ext || '') && PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel.updateContent(editor.document);
    }
  });
}

export function deactivate() {
  PreviewPanel.currentPanel?.dispose();
}
