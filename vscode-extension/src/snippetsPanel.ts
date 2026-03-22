import * as vscode from 'vscode';
import { LicenseManager } from './licenseManager';

export class SnippetsPanel {
  public static currentPanel: SnippetsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, license: LicenseManager) {
    if (SnippetsPanel.currentPanel) { SnippetsPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside); return; }
    const panel = vscode.window.createWebviewPanel('infinitSnippets', '∞ Snippets', vscode.ViewColumn.Beside, { enableScripts: true });
    SnippetsPanel.currentPanel = new SnippetsPanel(panel, license);
  }

  private constructor(panel: vscode.WebviewPanel, private license: LicenseManager) {
    this._panel = panel;
    this._panel.webview.html = this._getHtml();
    this._panel.webview.onDidReceiveMessage(async msg => {
      if (msg.command === 'insert') {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.insertSnippet(new vscode.SnippetString(msg.code));
          vscode.window.showInformationMessage('∞ Snippet inserted!');
        }
      }
    }, null, this._disposables);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _getHtml(): string {
    const snippets = [
      { label: 'React Card Component',  lang: 'tsx', code: 'function Card({ title, description }: { title: string; description: string }) {\n  return (\n    <div className="rounded-xl border p-6 shadow-sm">\n      <h3 className="text-lg font-semibold">{title}</h3>\n      <p className="mt-2 text-sm text-gray-500">{description}</p>\n    </div>\n  );\n}' },
      { label: 'Tailwind Button',       lang: 'tsx', code: '<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">\n  Click me\n</button>' },
      { label: 'CSS Flex Center',       lang: 'css', code: '.center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}' },
      { label: 'useLocalStorage Hook', lang: 'tsx', code: "function useLocalStorage<T>(key: string, init: T) {\n  const [val, setVal] = React.useState<T>(() => {\n    try { return JSON.parse(localStorage.getItem(key) ?? '') as T; }\n    catch { return init; }\n  });\n  const set = (v: T) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };\n  return [val, set] as const;\n}" },
      { label: 'HTML Base Template',   lang: 'html', code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8"/>\n  <meta name="viewport" content="width=device-width,initial-scale=1"/>\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>' },
      { label: 'CSS Variables Theme',  lang: 'css', code: ':root {\n  --color-bg: #ffffff;\n  --color-text: #111111;\n  --color-accent: #5b6cf9;\n  --radius: 8px;\n  --font: system-ui, sans-serif;\n}' },
      { label: 'React useEffect Fetch', lang: 'tsx', code: "const [data, setData] = React.useState(null);\nconst [loading, setLoading] = React.useState(true);\n\nReact.useEffect(() => {\n  fetch('/api/data')\n    .then(r => r.json())\n    .then(d => { setData(d); setLoading(false); })\n    .catch(() => setLoading(false));\n}, []);" },
    ];

    const items = snippets.map((s, i) => `
      <div class="snippet">
        <div class="snippet-header">
          <span class="snippet-label">${s.label}</span>
          <span class="snippet-lang">${s.lang}</span>
          <button onclick="insert(${i})">Insert →</button>
        </div>
        <pre class="snippet-code">${s.code.replace(/</g, '&lt;')}</pre>
      </div>
    `).join('');

    return `<!DOCTYPE html><html>
<head><meta charset="UTF-8"/>
<style>
body{font-family:monospace;font-size:12px;background:#0b0f1e;color:#E8EAF6;margin:0;padding:0}
#header{padding:14px 16px;background:#0f1428;border-bottom:1px solid #1c2340;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
#header span{color:#3EEDB0}
#search{width:100%;background:#0f1428;border:none;border-bottom:1px solid #1c2340;padding:10px 16px;color:#E8EAF6;font-family:monospace;font-size:12px;outline:none}
#search::placeholder{color:#3a4060}
#list{padding:12px 16px;display:flex;flex-direction:column;gap:12px}
.snippet{background:#0f1428;border:1px solid #1c2340;border-radius:8px;overflow:hidden}
.snippet-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#131829;border-bottom:1px solid #1c2340}
.snippet-label{flex:1;font-weight:700;color:#E8EAF6}
.snippet-lang{color:#5B6CF9;font-size:10px;background:rgba(91,108,249,.12);padding:2px 6px;border-radius:4px}
.snippet-header button{background:#3EEDB0;color:#050710;border:none;border-radius:4px;padding:3px 10px;cursor:pointer;font-family:monospace;font-size:11px;font-weight:700}
.snippet-code{padding:12px;font-size:11px;line-height:1.6;color:#8892b0;overflow-x:auto;white-space:pre;margin:0}
</style></head>
<body>
<div id="header"><span>∞</span> Snippets Library</div>
<input id="search" placeholder="Search snippets..." oninput="filter(this.value)"/>
<div id="list">${items}</div>
<script>
const vscode=acquireVsCodeApi();
const allCode=${JSON.stringify(snippets.map(s => s.code))};
function insert(i){vscode.postMessage({command:'insert',code:allCode[i]});}
function filter(q){
  const els=document.querySelectorAll('.snippet');
  const labels=${JSON.stringify(snippets.map(s => s.label.toLowerCase()))};
  els.forEach((el,i)=>{el.style.display=labels[i].includes(q.toLowerCase())?'block':'none';});
}
</script>
</body></html>`;
  }

  public dispose() {
    SnippetsPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}
