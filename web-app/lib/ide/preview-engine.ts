export function getHTMLPreview(content: string): string {
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

export function getReactPreview(source: string): string {
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
#error{color:#e74c3c;padding:20px;font-size:12px;background:#fff0f0;border-radius:8px;margin:16px;display:none;white-space:pre-wrap;font-family:monospace}
</style>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet"/>
</head><body>
<div id="bar"><div class="dot"></div> LIVE · React</div>
<div id="root"></div>
<div id="error"></div>
<script type="text/babel" data-presets="react">
try {
${stripped}
const C = typeof __DefaultExport !== 'undefined' ? __DefaultExport : () => React.createElement('p',{style:{color:'#999',fontFamily:'monospace',padding:20}},'Nenhum export default encontrado');
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(C));
} catch(e) {
  const el = document.getElementById('error');
  el.style.display = 'block';
  el.textContent = e.message;
}
<\/script>
</body></html>`;
}

export function getGenericPreview(ext: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{margin:0;font-family:monospace;background:#0b0f1e;color:#5A6080;display:flex;align-items:center;justify-content:center;height:100vh;font-size:13px}</style>
</head><body>Preview não disponível para .${ext}</body></html>`;
}

export function getPreviewHtml(fileName: string, content: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'html') return getHTMLPreview(content);
  if (['tsx', 'jsx'].includes(ext)) return getReactPreview(content);
  return getGenericPreview(ext);
}
