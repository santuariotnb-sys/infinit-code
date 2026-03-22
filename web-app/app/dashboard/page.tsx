'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const justActivated = searchParams.get('activated') === '1';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, [status]);

  const copyKey = async () => {
    if (!data?.license?.key) return;
    await navigator.clipboard.writeText(data.license.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading' || loading) return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',color:'#555'}}><span style={{color:'#00ff88'}}>∞</span>&nbsp;Carregando...</div>;
  if (!session) return null;

  const isPro = data?.subscription?.status === 'active';

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#e8e8e8',fontFamily:'monospace'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'0 24px 80px'}}>
        <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 0',borderBottom:'1px solid #1a1a1a',marginBottom:32}}>
          <div style={{fontSize:16,fontWeight:700,color:'#00ff88',letterSpacing:2}}>∞ Infinit Code</div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <span style={{fontSize:12,color:'#555'}}>{session.user?.email}</span>
            <button onClick={() => signOut({callbackUrl:'/'})} style={{background:'none',border:'1px solid #222',borderRadius:4,color:'#555',fontSize:11,padding:'4px 12px',cursor:'pointer',fontFamily:'inherit'}}>Sair</button>
          </div>
        </header>
        {justActivated && <div style={{padding:'12px 16px',borderRadius:6,fontSize:13,marginBottom:24,background:'rgba(0,255,136,.08)',border:'1px solid rgba(0,255,136,.2)',color:'#00ff88'}}>✓ Pagamento confirmado! Sua chave foi enviada por e-mail.</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
          {[{label:'Plano atual',value:isPro?'Pro':'Free',color:isPro?'#00ff88':'#555'},{label:'Status',value:isPro?'Ativa':'Sem assinatura',color:isPro?'#00ff88':'#555'},{label:'Renova em',value:data?.subscription?.currentPeriodEnd?new Date(data.subscription.currentPeriodEnd).toLocaleDateString('pt-BR'):'—',color:'#e8e8e8'}].map(c=>(
            <div key={c.label} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:'16px 20px'}}>
              <div style={{fontSize:11,color:'#555',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>{c.label}</div>
              <div style={{fontSize:18,fontWeight:500,color:c.color}}>{c.value}</div>
            </div>
          ))}
        </div>
        <section style={{marginBottom:32}}>
          <div style={{fontSize:11,color:'#555',letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Chave de licença</div>
          {data?.license ? (
            <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
              <span style={{fontSize:16,letterSpacing:3,color:'#00ff88',flex:1,wordBreak:'break-all'}}>{data.license.key}</span>
              <button onClick={copyKey} style={{background:'rgba(0,255,136,.1)',border:'1px solid rgba(0,255,136,.2)',color:'#00ff88',borderRadius:4,padding:'6px 16px',fontSize:11,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{copied?'✓ Copiado':'Copiar'}</button>
            </div>
          ) : (
            <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:40,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>∞</div>
              <div style={{fontSize:16,fontWeight:500,color:'#e8e8e8',marginBottom:8}}>Nenhuma licença ativa</div>
              <p style={{fontSize:13,color:'#555',lineHeight:1.7,marginBottom:24}}>Assine o plano Pro para receber sua chave por e-mail.</p>
              <button onClick={()=>router.push('/#pricing')} style={{background:'#00ff88',color:'#000',border:'none',borderRadius:6,padding:'12px 28px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Assinar Pro — R$67/mês →</button>
            </div>
          )}
        </section>
        <section>
          <div style={{fontSize:11,color:'#555',letterSpacing:3,textTransform:'uppercase',marginBottom:16}}>Incluído no Pro</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[['⚙️','Auto-setup','Skills, /voice e preview automáticos'],['🧠','Skills Pack','ui-ux-pro-max · frontend-design · supabase'],['🎤','/voice PT-BR','Fale com o Claude — Meta+K'],['👁️','Preview ao vivo','Simple Browser no VS Code'],['🤖','Chat IA','Contexto do arquivo ativo'],['📦','Snippets','Busca e insert no editor']].map(([icon,title,desc])=>(
              <div key={String(title)} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:'16px 18px'}}>
                <div style={{fontSize:18,marginBottom:8}}>{icon}</div>
                <div style={{fontSize:12,fontWeight:500,color:'#e8e8e8',marginBottom:4}}>{title}</div>
                <div style={{fontSize:11,color:'#555',lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',color:'#00ff88',fontFamily:'monospace'}}>∞ Carregando...</div>}><DashboardContent /></Suspense>;
}
