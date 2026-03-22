'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace'}}>
      <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:12,padding:'40px 48px',textAlign:'center',maxWidth:360,width:'100%'}}>
        <div style={{fontSize:32,marginBottom:16}}>∞</div>
        <h1 style={{fontSize:18,color:'#e8e8e8',margin:'0 0 8px',fontWeight:500}}>Infinit Code</h1>
        <p style={{fontSize:12,color:'#555',margin:'0 0 32px',lineHeight:1.6}}>Entre para acessar sua chave de licença.</p>
        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',background:'#e8e8e8',color:'#000',border:'none',borderRadius:6,padding:'12px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
