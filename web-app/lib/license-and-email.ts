// lib/license.ts
import crypto from 'crypto';

/** Gera chave no formato INFT-XXXX-XXXX-XXXX-XXXX */
export function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INFT-${seg()}-${seg()}-${seg()}-${seg()}`;
}

// ─────────────────────────────────────────────────────────────

// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendLicenseEmail({ email, key }: { email: string; key: string }) {
  await resend.emails.send({
    from: 'Infinit Code <noreply@infinitcode.netlify.app>',
    to: email,
    subject: '∞ Sua chave Infinit Code Pro',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="background:#0a0a0a;font-family:'JetBrains Mono',monospace,sans-serif;color:#e8e8e8;padding:40px;max-width:560px;margin:0 auto">

  <div style="text-align:center;margin-bottom:32px">
    <div style="width:56px;height:56px;background:#00ff88;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;color:#000;font-weight:700">∞</div>
    <h1 style="font-size:20px;margin:16px 0 4px;letter-spacing:-0.5px;color:#e8e8e8">Infinit Code Pro</h1>
    <p style="color:#555;font-size:13px;margin:0">Sua chave de licença está pronta</p>
  </div>

  <div style="background:#111;border:1px solid #222;border-radius:12px;padding:28px;margin-bottom:24px">
    <p style="font-size:11px;color:#555;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px">CHAVE DE LICENÇA</p>
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:20px;font-size:20px;letter-spacing:4px;color:#00ff88;text-align:center;word-break:break-all">
      ${key}
    </div>
  </div>

  <div style="background:#111;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:24px">
    <p style="font-weight:700;margin:0 0 16px;color:#e8e8e8">Ativar em 3 passos:</p>
    <div style="color:#aaa;font-size:13px;line-height:2.2">
      <div>1. Abra o VS Code</div>
      <div>2. Pressione <span style="background:#1a1a1a;color:#5B6CF9;padding:2px 8px;border-radius:4px">Ctrl+Shift+P</span> e busque <span style="background:#1a1a1a;color:#5B6CF9;padding:2px 8px;border-radius:4px">Infinit: Activate License Key</span></div>
      <div>3. Cole a chave acima e pressione Enter</div>
    </div>
    <div style="margin-top:16px;padding:12px;background:#0a0a0a;border-radius:6px;font-size:12px;color:#555;line-height:1.6">
      O setup completo roda automaticamente na primeira ativação:<br/>
      skills, /voice em português, preview ao vivo — tudo sem configuração manual.
    </div>
  </div>

  <p style="font-size:11px;color:#333;text-align:center;line-height:1.8">
    Dúvidas? Responda este e-mail.<br/>
    <a href="https://infinitcode.netlify.app" style="color:#00ff88">infinitcode.netlify.app</a>
  </p>

</body>
</html>`,
  });
}
