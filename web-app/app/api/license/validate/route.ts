import { NextRequest, NextResponse } from 'next/server';
import { validateLicenseKey }        from '@/lib/license';
import { createClient }              from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { key, email, deviceId, source } = await req.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, error: 'key obrigatório' }, { status: 400 });
    }

    const result = await validateLicenseKey(key);

    // Log da tentativa de validação
    if (result.userId) {
      await supabase.from('events').insert({
        user_id:  result.userId,
        type:     'license_validated',
        metadata: {
          key:       key.substring(0, 9) + '****', // mascara a chave no log
          device_id: deviceId ?? null,
          source:    source ?? 'desktop',
          ip:        req.headers.get('x-forwarded-for') ?? null,
          valid:     result.valid,
          grace:     result.grace ?? false,
        },
      });
    }

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        error: 'Chave inválida, revogada ou expirada',
      });
    }

    return NextResponse.json({
      valid:     true,
      plan:      result.plan,
      expiresAt: result.expiresAt,
      grace:     result.grace ?? false,
    });

  } catch (err) {
    console.error('[license/validate]', err);
    return NextResponse.json({ valid: false, error: 'Erro interno' }, { status: 500 });
  }
}
