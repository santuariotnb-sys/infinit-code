import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? 'noreply@infinitcode.app';
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app-infinitcode.netlify.app';

const BRAND = {
  bg:      '#0a0a0a',
  card:    '#111111',
  border:  '#1a1a1a',
  green:   '#00ff88',
  text:    '#e8e8e8',
  muted:   '#555555',
  font:    "'JetBrains Mono', monospace, sans-serif",
};

type EmailType =
  | 'boas_vindas'
  | 'pix_pendente'
  | 'boleto_gerado'
  | 'renovacao_confirmada'
  | 'pagamento_falhou'
  | 'cancelamento_confirmado'
  | 'reativacao';

interface EmailPayload {
  to:           string;
  name?:        string;
  licenseKey?:  string;
  pixQrCode?:   string;
  pixExpires?:  string;
  boletoUrl?:   string;
  nextDate?:    string;
  amount?:      string;
}

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="background:${BRAND.bg};font-family:${BRAND.font};color:${BRAND.text};padding:40px;max-width:560px;margin:0 auto">
  <div style="text-align:center;margin-bottom:32px">
    <div style="width:56px;height:56px;background:${BRAND.green};border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;color:#000;font-weight:700">∞</div>
    <h1 style="font-size:18px;margin:16px 0 4px;letter-spacing:-0.5px">Infinit Code Pro</h1>
  </div>
  ${content}
  <p style="font-size:11px;color:${BRAND.muted};text-align:center;margin-top:32px">
    Dúvidas? Responda este email.<br/>
    <a href="${APP}" style="color:${BRAND.green}">${APP.replace('https://', '')}</a>
  </p>
</body>
</html>`;
}

function keyBlock(key: string): string {
  return `
    <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;padding:28px;margin-bottom:24px">
      <p style="font-size:11px;color:${BRAND.muted};letter-spacing:3px;text-transform:uppercase;margin:0 0 12px">CHAVE DE LICENÇA</p>
      <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:8px;padding:20px;font-size:20px;letter-spacing:4px;color:${BRAND.green};text-align:center">
        ${key}
      </div>
    </div>`;
}

export async function sendEmail(type: EmailType, payload: EmailPayload): Promise<void> {
  const name = payload.name ?? 'dev';

  const templates: Record<EmailType, { subject: string; html: string }> = {

    boas_vindas: {
      subject: '🎉 Bem-vindo ao Infinit Code Pro!',
      html: wrap(`
        <h2 style="margin-bottom:8px">Tudo pronto, ${name}!</h2>
        <p style="color:${BRAND.muted}">Sua chave de ativação está abaixo.</p>
        ${keyBlock(payload.licenseKey ?? '')}
        <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;padding:24px;margin-bottom:24px">
          <p style="font-weight:700;margin:0 0 16px">Ativar em 3 passos:</p>
          <div style="color:#aaa;font-size:13px;line-height:2.4">
            <div>1. Abra o app Infinit Code</div>
            <div>2. Acesse <span style="background:${BRAND.border};color:#5B6CF9;padding:2px 8px;border-radius:4px">Configurações → Licença</span></div>
            <div>3. Cole a chave e pressione Ativar</div>
          </div>
        </div>
        <div style="text-align:center">
          <a href="${APP}/download" style="background:${BRAND.green};color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
            Baixar o app →
          </a>
        </div>
      `),
    },

    pix_pendente: {
      subject: '⚡ PIX gerado — pague em até 24h',
      html: wrap(`
        <h2>Seu PIX está pronto</h2>
        <div style="text-align:center;margin:24px 0">
          <img src="${payload.pixQrCode}" width="200" alt="QR Code PIX" style="border-radius:8px"/>
        </div>
        <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:8px;padding:16px;font-size:13px;color:${BRAND.muted}">
          Válido até: <strong style="color:${BRAND.text}">${payload.pixExpires}</strong>
        </div>
        <p style="color:${BRAND.muted};font-size:13px;margin-top:16px">
          Após o pagamento, sua chave chegará por email em até 2 minutos.
        </p>
      `),
    },

    boleto_gerado: {
      subject: '📄 Boleto gerado — vence em 3 dias',
      html: wrap(`
        <h2>Seu boleto está pronto</h2>
        <div style="text-align:center;margin:28px 0">
          <a href="${payload.boletoUrl}" style="background:${BRAND.green};color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
            Ver e pagar boleto →
          </a>
        </div>
        <p style="color:${BRAND.muted};font-size:13px">
          Após o pagamento, pode levar até 3 dias úteis para compensar.
          Sua chave será enviada assim que confirmarmos.
        </p>
      `),
    },

    renovacao_confirmada: {
      subject: '✅ Assinatura renovada — Infinit Code Pro',
      html: wrap(`
        <h2>Renovação confirmada! 🚀</h2>
        <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:8px;padding:20px;margin:24px 0">
          <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px">
            <span style="color:${BRAND.muted}">Valor cobrado</span>
            <strong>${payload.amount}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:14px">
            <span style="color:${BRAND.muted}">Próxima cobrança</span>
            <strong>${payload.nextDate}</strong>
          </div>
        </div>
        <p style="color:${BRAND.muted};font-size:13px">Seu acesso continua ativo. Bom trabalho!</p>
      `),
    },

    pagamento_falhou: {
      subject: '⚠️ Problema no pagamento — ação necessária',
      html: wrap(`
        <h2>Não conseguimos processar seu pagamento</h2>
        <p style="color:${BRAND.muted}">
          Isso pode acontecer por cartão vencido, limite insuficiente ou dados desatualizados.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="${APP}/billing" style="background:#ff4444;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
            Atualizar forma de pagamento →
          </a>
        </div>
        <div style="background:${BRAND.card};border:1px solid #ff4444;border-radius:8px;padding:16px;font-size:13px;color:${BRAND.muted}">
          ⚠️ Você tem <strong style="color:${BRAND.text}">7 dias</strong> antes de perder o acesso.
        </div>
      `),
    },

    cancelamento_confirmado: {
      subject: 'Assinatura cancelada — Infinit Code',
      html: wrap(`
        <h2>Assinatura cancelada</h2>
        <p style="color:${BRAND.muted}">
          Seu acesso permanece ativo até o fim do período pago.
        </p>
        <div style="text-align:center;margin:28px 0">
          <a href="${APP}/checkout" style="background:${BRAND.card};border:1px solid ${BRAND.border};color:${BRAND.text};padding:12px 28px;border-radius:8px;text-decoration:none">
            Mudou de ideia? Reativar →
          </a>
        </div>
      `),
    },

    reativacao: {
      subject: '🎉 Bem-vindo de volta ao Infinit Code Pro!',
      html: wrap(`
        <h2>Ficamos felizes em ter você de volta, ${name}!</h2>
        ${keyBlock(payload.licenseKey ?? '')}
        <div style="text-align:center">
          <a href="${APP}/download" style="background:${BRAND.green};color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">
            Baixar o app →
          </a>
        </div>
      `),
    },
  };

  const { subject, html } = templates[type];

  await resend.emails.send({ from: FROM, to: payload.to, subject, html });
}
