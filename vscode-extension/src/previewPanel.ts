import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LicenseManager } from './licenseManager';

export class PreviewPanel {
  public static currentPanel: PreviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _doc: vscode.TextDocument;

  public static createOrShow(extensionUri: vscode.Uri, doc: vscode.TextDocument, license: LicenseManager) {
    const column = vscode.workspace.getConfiguration('infinit').get('previewColumn') === 'beside'
      ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel._panel.reveal(column);
      PreviewPanel.currentPanel.updateContent(doc);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'infinitPreview', '∞ Live Preview', column,
      { enableScripts: true, localResourceRoots: [extensionUri], retainContextWhenHidden: true }
    );
    PreviewPanel.currentPanel = new PreviewPanel(panel, doc, license, extensionUri);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    doc: vscode.TextDocument,
    private license: LicenseManager,
    private extensionUri: vscode.Uri
  ) {
    this._panel = panel;
    this._doc = doc;
    this._startPreview();

    this._panel.onDidChangeViewState(() => {
      if (this._panel.visible) this._update();
    }, null, this._disposables);

    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === this._doc.uri.toString()) {
        this.updateContent(e.document);
      }
    }, null, this._disposables);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'upgrade')
        vscode.env.openExternal(vscode.Uri.parse('https://infinitcode.netlify.app/#pricing'));
      if (msg.command === 'openBrowser')
        this._openSimpleBrowser(msg.url);
    }, null, this._disposables);
  }

  private async _startPreview() {
    const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const ext = path.extname(this._doc.fileName).replace('.', '');

    if (ws && ['tsx', 'jsx', 'ts', 'js'].includes(ext)) {
      const port = this._detectDevPort(ws);
      if (port) {
        const url = `http://localhost:${port}`;
        this._panel.webview.html = this._getDevServerHtml(url, port);
        await this._openSimpleBrowser(url);
        return;
      }
    }
    this._update();
  }

  private _detectDevPort(ws: string): number | null {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(ws, 'package.json'), 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['next']) return 3000;
      if (deps['vite'] || deps['react-scripts']) return 5173;
      if (deps['@remix-run/react']) return 3000;
      if (deps['astro']) return 4321;
      const viteCfg = path.join(ws, 'vite.config.ts');
      if (fs.existsSync(viteCfg)) {
        const m = fs.readFileSync(viteCfg, 'utf8').match(/port\s*:\s*(\d+)/);
        return m ? parseInt(m[1]) : 5173;
      }
    } catch {}
    return null;
  }

  private async _openSimpleBrowser(url: string) {
    try {
      await vscode.commands.executeCommand('simpleBrowser.show', vscode.Uri.parse(url));
    } catch {}
  }

  public updateContent(doc: vscode.TextDocument) {
    this._doc = doc;
    this._update();
  }

  private _update() {
    const ext = path.extname(this._doc.fileName).replace('.', '');
    const content = this._doc.getText();
    this._panel.title = `∞ ${path.basename(this._doc.fileName)}`;

    if (ext === 'html') {
      this._panel.webview.html = this._getHTMLPreview(content);
    } else if (['tsx', 'jsx'].includes(ext)) {
      this._panel.webview.html = this._getReactPreview(content);
    } else {
      this._panel.webview.html = this._getGenericPreview(ext);
    }
  }

  // ── Templates ────────────────────────────────────────────────

  private _getDevServerHtml(url: string, port: number): string {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{margin:0;font-family:monospace;background:#0b0f1e;color:#E8EAF6;display:flex;flex-direction:column;height:100vh}
#bar{padding:10px 16px;background:#0f1428;border-bottom:1px solid #1c2340;display:flex;align-items:center;gap:8px;font-size:12px}
.dot{width:6px;height:6px;border-radius:50%;background:#3EEDB0;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
#msg{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px;text-align:center}
h2{font-size:16px;font-weight:500;color:#E8EAF6;margin:0}
p{font-size:12px;color:#5A6080;line-height:1.7;max-width:360px;margin:0}
.url{color:#3EEDB0}
.steps{background:#0f1428;border:1px solid #1c2340;border-radius:8px;padding:16px;font-size:12px;color:#AEB6D8;line-height:2;text-align:left;width:100%;max-width:360px}
.steps code{color:#5B6CF9}
button{background:#5B6CF9;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-family:monospace;font-size:12px;cursor:pointer;margin-top:4px}
button:hover{background:#4a5ce0}
</style></head><body>
<div id="bar"><div class="dot"></div><span style="color:#5A6080">∞ Preview →</span><span class="url">${url}</span></div>
<div id="msg">
  <h2>Preview ao vivo</h2>
  <p>Simple Browser aberto apontando para <span class="url">${url}</span>.<br/>Cada mudança do Claude aparece instantaneamente.</p>
  <div class="steps">
    1. <code>npm run dev</code> no terminal<br/>
    2. Aguarde a porta <code>${port}</code> subir<br/>
    3. O preview atualiza automaticamente
  </div>
  <button onclick="open()">Abrir Preview Manual</button>
</div>
<script>
const vscode=acquireVsCodeApi();
function open(){vscode.postMessage({command:'openBrowser',url:'${url}'});}
</script></body></html>`;
  }

  private _getHTMLPreview(content: string): string {
    const srcdoc = content.replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{margin:0}
#bar{position:fixed;top:0;left:0;right:0;padding:6px 14px;background:#0f1428;font-family:monospace;font-size:11px;color:#5A6080;display:flex;align-items:center;gap:6px;z-index:999}
.dot{width:6px;height:6px;border-radius:50%;background:#3EEDB0;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
iframe{position:fixed;top:26px;left:0;right:0;bottom:0;width:100%;height:calc(100% - 26px);border:none;background:#fff}
</style></head><body>
<div id="bar"><div class="dot"></div> LIVE · HTML</div>
<iframe srcdoc="${srcdoc}"></iframe>
</body></html>`;
  }

  private _getReactPreview(source: string): string {
    if (!this.license.isPro()) {
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{margin:0;font-family:monospace;background:#0b0f1e;color:#E8EAF6;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:14px}
h3{font-size:15px;margin:0}.sub{font-size:12px;color:#5A6080}
button{background:#5B6CF9;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-family:monospace;font-size:12px;cursor:pointer}
button:hover{background:#4a5ce0}</style></head><body>
<div style="font-size:28px">∞</div>
<h3>React Preview</h3>
<div class="sub">Disponível no plano Pro</div>
<button onclick="vscode.postMessage({command:'upgrade'})">Ativar Pro →</button>
<script>const vscode=acquireVsCodeApi();</script>
</body></html>`;
    }

    const stripped = source
      .replace(/import\s+.*?from\s+['"][^'"]+['"]\s*;?\n?/g, '')
      .replace(/export\s+default\s+/, 'const __DefaultExport = ')
      .replace(/:\s*\w+(\[\])?(\s*\|[^=,)\n]+)?(?=[,)=\n])/g, '')
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{margin:0;padding:0}
#bar{position:fixed;top:0;left:0;right:0;padding:6px 14px;background:#0f1428;font-family:monospace;font-size:11px;color:#5A6080;display:flex;align-items:center;gap:6px;z-index:999}
.dot{width:6px;height:6px;border-radius:50%;background:#3EEDB0;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
#root{margin-top:26px;padding:16px}
</style>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet"/>
</head><body>
<div id="bar"><div class="dot"></div> LIVE · React · Pro</div>
<div id="root"></div>
<script type="text/babel" data-presets="react">
try {
${stripped}
const C = typeof __DefaultExport !== 'undefined' ? __DefaultExport : () => React.createElement('p',{style:{color:'#999',fontFamily:'monospace',padding:20}},'Nenhum export default encontrado');
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(C));
} catch(e) {
  document.getElementById('root').innerHTML = '<pre style="color:#e74c3c;padding:20px;font-size:12px;background:#fff0f0;border-radius:8px;margin:16px">'+e.message+'</pre>';
}
</script>
</body></html>`;
  }

  private _getGenericPreview(ext: string): string {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{margin:0;font-family:monospace;background:#0b0f1e;color:#5A6080;display:flex;align-items:center;justify-content:center;height:100vh;font-size:13px}</style>
</head><body>Preview não disponível para .${ext}</body></html>`;
  }

  public dispose() {
    PreviewPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}
