# Infinit Code — Container Fly.io

Container isolado por usuário com Node.js 22 + Claude Code + 6 Skills + ttyd WebSocket.

## Pré-requisitos

```bash
# Instala Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

## Deploy da imagem

```bash
cd infinit-container/

# 1. Cria o app (só na primeira vez)
fly apps create infinitcode-machines

# 2. Configura os secrets (sem API key — usuário autentica via 'claude login')
fly secrets set IDE_JWT_SECRET="$(openssl rand -base64 32)" \
               --app infinitcode-machines

# 3. Build e push da imagem
fly deploy --app infinitcode-machines --strategy immediate

# 4. Anota o nome da imagem gerada
fly releases --app infinitcode-machines
# → registry.fly.io/infinitcode-machines:deployment-XXXXXXXX
```

## Atualizar FLY_IMAGE_REF no Next.js

Após o deploy, atualize a variável no Netlify:

```
FLY_IMAGE_REF=registry.fly.io/infinitcode-machines:deployment-XXXXXXXX
```

E no `fly-machines.ts`, a linha:
```ts
image: process.env.FLY_IMAGE_REF || `registry.fly.io/infinitcode-machines:deployment-XXXXXXXX`,
```

## Variáveis de ambiente necessárias no Next.js (Netlify)

```
FLY_API_TOKEN=...         # fly tokens create deploy -a infinitcode-machines
FLY_APP_NAME=infinitcode-machines
FLY_IMAGE_REF=registry.fly.io/infinitcode-machines:deployment-XXXX
FLY_WS_PROXY_URL=https://...  # URL do proxy WebSocket
IDE_JWT_SECRET=...        # mesmo valor dos secrets do Fly
```

## Arquitetura do WebSocket

```
Browser (xterm.js)
    ↓ WebSocket
Next.js API (/api/ide/ws-token)
    → gera JWT (60s expiry)
    → retorna wsUrl = FLY_WS_PROXY_URL?token=JWT&machine=PRIVATE_IP
    ↓
WS Proxy (Fly.io ou outro)
    → valida JWT
    → conecta ao container via IP privado (10.x.x.x:8080)
    ↓
Container ttyd (porta 8080)
    → /bin/bash com Claude Code
```

## Testando localmente

```bash
# Build local
docker build -t infinitcode-local .

# Roda com variáveis
docker run -p 8080:8080 \
  -e IDE_JWT_SECRET="test-secret-123" \
  infinitcode-local

# Acessa em: http://localhost:8080
# No terminal, rode 'claude login' para autenticar com seu plano
```

## Skills pré-instaladas

| Skill | Comando | O que faz |
|---|---|---|
| frontend-design | /frontend-design | UIs únicas e memoráveis |
| ui-ux-pro-max | /ui-ux-pro-max | Design system profissional |
| landing-page | /landing-page | Landing pages de conversão |
| supabase-agent | /supabase-agent | Banco, auth, RLS |
| code-quality | /code-quality | Reviews e boas práticas |
| token-optimizer | /token-optimizer | Economia de contexto |

## /voice no container

O Claude Code v2.1.69+ suporta /voice nativo.
No container, a voz vem via WebSocket do browser:
- Browser captura microfone
- Envia áudio via WebSocket
- Container recebe e processa com /voice

Para ativar: tipo `/voice` no terminal → segura Meta+K → fala.
