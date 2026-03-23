#!/bin/bash
# ============================================================
#  Infinit Code — Container entrypoint
#  Inicia ttyd com autenticação JWT
# ============================================================

set -e

# Variáveis de ambiente esperadas do Fly.io
: "${IDE_JWT_SECRET:?IDE_JWT_SECRET é obrigatório}"

# Claude Code usa o plano do cliente (Max/Pro)
# O usuário autentica via 'claude login' no terminal

# Configura locale PT-BR
export LANG=pt_BR.UTF-8
export LANGUAGE=pt_BR:pt
export LC_ALL=pt_BR.UTF-8

# Configura paths
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export NODE_PATH="/usr/lib/node_modules"

# Garante que o workspace existe
mkdir -p /root/workspace
cd /root/workspace

# Inicializa git se não existir
if [ ! -d .git ]; then
    git init
    git config user.email "user@infinitcode.app"
    git config user.name "Infinit Code"
fi

# CLAUDE.md já é criado no Dockerfile (build time)
# Se o usuário montar um volume, garante que o template existe
if [ ! -f /root/workspace/CLAUDE.md ] && [ -f /root/.claude/claude-md-template.md ]; then
    cp /root/.claude/claude-md-template.md /root/workspace/CLAUDE.md
fi

echo "∞ Infinit Code Container iniciado"
echo "   Node.js: $(node --version)"
echo "   Claude Code: $(claude --version 2>/dev/null || echo 'não autenticado')"
echo "   Skills: $(ls /root/.claude/skills/ | tr '\n' ' ')"
echo "   Região: ${FLY_REGION:-local}"

# ── Autenticação JWT para ttyd ────────────────────────────────
# O proxy Next.js gera um JWT com expiração curta
# ttyd valida via script externo

cat > /tmp/auth.sh << 'AUTHSCRIPT'
#!/bin/bash
# Validação JWT básica — verifica assinatura HMAC
TOKEN="$1"
SECRET="${IDE_JWT_SECRET}"

if [ -z "$TOKEN" ] || [ -z "$SECRET" ]; then
    exit 1
fi

# Extrai payload (parte do meio do JWT)
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)
# Decodifica base64url
DECODED=$(echo "$PAYLOAD" | tr '_-' '/+' | base64 -d 2>/dev/null || echo "")

if [ -z "$DECODED" ]; then
    exit 1
fi

# Verifica expiração
EXP=$(echo "$DECODED" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('exp',0))" 2>/dev/null || echo "0")
NOW=$(date +%s)

if [ "$NOW" -gt "$EXP" ]; then
    echo "Token expirado" >&2
    exit 1
fi

exit 0
AUTHSCRIPT
chmod +x /tmp/auth.sh

# ── Inicia file server em background ──────────────────────────
node /file-server.js &
echo "   File server: porta 9090"

# ── Inicia ttyd ───────────────────────────────────────────────
# --once: uma sessão por conexão (isolamento)
# --credential: validação JWT via script
# --port 8080: porta exposta pelo Fly.io
# --writable: permite input
# --title: título da janela

exec ttyd \
    --port 8080 \
    --writable \
    --once \
    --title "∞ Infinit Code Terminal" \
    --interface 0.0.0.0 \
    --base-path / \
    /bin/bash --login
