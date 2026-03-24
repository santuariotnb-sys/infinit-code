import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Gera chave no formato INFT-XXXX-XXXX-XXXX-XXXX
function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  return `INFT-${seg()}-${seg()}-${seg()}-${seg()}`;
}

export async function createLicenseKey(userId: string): Promise<string> {
  let key = generateKey();
  let attempts = 0;

  // Garante unicidade
  while (attempts < 10) {
    const { data } = await supabase
      .from('license_keys')
      .select('id')
      .eq('key', key)
      .single();

    if (!data) break; // key disponível
    key = generateKey();
    attempts++;
  }

  const { error } = await supabase.from('license_keys').insert({
    user_id:    userId,
    key,
    status:     'active',
    created_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Erro ao criar licença: ${error.message}`);

  return key;
}

export async function revokeLicenseKey(userId: string): Promise<void> {
  await supabase
    .from('license_keys')
    .update({ status: 'revoked' })
    .eq('user_id', userId)
    .eq('status', 'active');
}

export async function validateLicenseKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  plan?: string;
  grace?: boolean;
  expiresAt?: string;
}> {
  const normalized = key.trim().toUpperCase();

  if (!/^INFT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
    return { valid: false };
  }

  const { data } = await supabase
    .from('license_keys')
    .select('id, user_id, status, subscriptions(status, period_end)')
    .eq('key', normalized)
    .eq('status', 'active')
    .single();

  if (!data) return { valid: false };

  const sub = (data as { subscriptions: { status: string; period_end: string } | null }).subscriptions;
  const now = Date.now();

  const GRACE_MS = 7 * 24 * 60 * 60 * 1000;
  const periodEnd = sub?.period_end ? new Date(sub.period_end).getTime() : 0;

  const isActive = sub?.status === 'active' && periodEnd > now;
  const isInGrace = !isActive && periodEnd > 0 && periodEnd + GRACE_MS > now;

  const valid = isActive || isInGrace;

  if (valid) {
    await supabase
      .from('license_keys')
      .update({ validated_at: new Date().toISOString() })
      .eq('key', normalized);
  }

  return {
    valid,
    userId:    data.user_id as string,
    plan:      'pro',
    grace:     isInGrace,
    expiresAt: sub?.period_end,
  };
}
