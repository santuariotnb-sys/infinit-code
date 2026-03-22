// app/api/license/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { key, source } = await req.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, message: 'Missing key' }, { status: 400 });
    }

    const normalized = key.trim().toUpperCase();

    // Validate format
    if (!/^INFT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
      return NextResponse.json({ valid: false, plan: 'free', message: 'Invalid key format' });
    }

    // Look up in database
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*, subscriptions(status, current_period_end)')
      .eq('key', normalized)
      .single();

    if (error || !license) {
      return NextResponse.json({ valid: false, plan: 'free', message: 'License not found' });
    }

    // Check subscription is active
    const sub = license.subscriptions;
    const isActive = sub?.status === 'active' &&
      new Date(sub.current_period_end) > new Date();

    // Log validation attempt
    await supabase.from('license_validations').insert({
      license_id: license.id,
      source: source || 'unknown',
      ip: req.headers.get('x-forwarded-for') || req.ip,
      validated_at: new Date().toISOString(),
    });

    if (!isActive) {
      return NextResponse.json({
        valid: false,
        plan: 'free',
        message: 'Subscription expired or inactive',
      });
    }

    return NextResponse.json({
      valid: true,
      plan: 'pro',
      expiresAt: sub.current_period_end,
      message: 'License valid',
    });

  } catch (err) {
    console.error('[license/validate]', err);
    return NextResponse.json({ valid: false, message: 'Internal error' }, { status: 500 });
  }
}
