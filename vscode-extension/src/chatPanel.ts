import * as vscode from 'vscode';
import { LicenseManager } from './licenseManager';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, license: LicenseManager) {
    if (ChatPanel.currentPanel) { ChatPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside); return; }
    const panel = vscode.window.createWebviewPanel('infinitChat', '∞ AI Chat', vscode.ViewColumn.Beside, { enableScripts: true });
    ChatPanel.currentPanel = new ChatPanel(panel, license, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, private license: LicenseManager, private extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.webview.html = this._getHtml();

    this._panel.webview.onDidReceiveMessage(async msg => {
      if (msg.command === 'ask') {
        const editor = vscode.window.activeTextEditor;
        const codeContext = editor ? editor.document.getText().slice(0, 2000) : '';
        const key = await license.getKey();

        try {
          const res = await fetch('https://infinitcode.dev/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-License-Key': key || '' },
            body: JSON.stringify({ question: msg.text, codeContext }),
          });
          const data = await res.json() as any;
          this._panel.webview.postMessage({ command: 'reply', text: data.answer || 'No response.' });
        } catch {
          this._panel.webview.postMessage({ command: 'reply', text: '⚠️ Could not connect to AI service.' });
        }
      }
    }, null, this._disposables);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _getHtml(): string {
    return `<!DOCTYPE html><html>
<head><meta charset="UTF-8"/>
<style>
body{font-family:monospace;font-size:12px;background:#0b0f1e;color:#E8EAF6;display:flex;flex-direction:column;height:100vh;margin:0;padding:0}
#header{padding:14px 16px;background:#0f1428;border-bottom:1px solid #1c2340;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
#header span{color:#3EEDB0}
#messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{padding:10px 14px;border-radius:8px;max-width:90%;line-height:1.5;font-size:12px;white-space:pre-wrap}
.msg.user{background:#1c2240;align-self:flex-end;color:#E8EAF6}
.msg.ai{background:#131829;border:1px solid #1c2340;align-self:flex-start;color:#AEB6D8}
#input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #1c2340}
#input{flex:1;background:#0f1428;border:1px solid #1c2340;border-radius:6px;padding:8px 12px;color:#E8EAF6;font-family:monospace;font-size:12px;outline:none}
#input:focus{border-color:#5B6CF9}
#send{background:#5B6CF9;color:#fff;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-family:monospace;font-size:12px;font-weight:700}
#send:hover{background:#4a5ce0}
</style></head>
<body>
<div id="header"><span>∞</span> AI Chat — Ask about your code</div>
<div id="messages"><div class="msg ai">👋 Hi! I can see your active file. Ask me anything about your code.</div></div>
<div id="input-row">
  <input id="input" placeholder="Ask about your code..." />
  <button id="send">Send</button>
</div>
<script>
const vscode=acquireVsCodeApi();
const msgs=document.getElementById('messages');
const inp=document.getElementById('input');
const btn=document.getElementById('send');

function send(){
  const t=inp.value.trim();if(!t)return;
  msgs.innerHTML+=\`<div class="msg user">\${t}</div>\`;
  msgs.innerHTML+=\`<div class="msg ai" id="loading">⏳ Thinking...</div>\`;
  msgs.scrollTop=msgs.scrollHeight;
  vscode.postMessage({command:'ask',text:t});
  inp.value='';
}
btn.addEventListener('click',send);
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
window.addEventListener('message',e=>{
  const d=document.getElementById('loading');if(d)d.remove();
  msgs.innerHTML+=\`<div class="msg ai">\${e.data.text}</div>\`;
  msgs.scrollTop=msgs.scrollHeight;
});
</script>
</body></html>`;
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}
