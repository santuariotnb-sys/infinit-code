# ============================================================
#  Infinit Code — Container de desenvolvimento
#  Node.js 22 + Claude Code + 6 Skills + ttyd WebSocket
#  Deploy: fly deploy --config fly.machines.toml
# ============================================================

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=pt_BR.UTF-8
ENV LANGUAGE=pt_BR:pt
ENV LC_ALL=pt_BR.UTF-8
ENV NODE_VERSION=22
ENV HOME=/root

# ── 1. Sistema base ──────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    curl wget git unzip zip \
    build-essential python3 python3-pip \
    locales \
    ca-certificates gnupg \
    sox libsox-fmt-all \
    pulseaudio-utils \
    jq ripgrep fd-find \
    && locale-gen pt_BR.UTF-8 \
    && update-locale LANG=pt_BR.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# ── 2. Node.js 22 via NodeSource ─────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && node --version \
    && npm --version

# ── 3. ttyd — terminal WebSocket ─────────────────────────────
RUN curl -fsSL "https://github.com/tsl0922/ttyd/releases/latest/download/ttyd.x86_64" \
       -o /usr/local/bin/ttyd \
    && chmod +x /usr/local/bin/ttyd \
    && ttyd --version || echo "ttyd instalado"

# ── 4. Claude Code ───────────────────────────────────────────
RUN npm install -g @anthropic-ai/claude-code@latest \
    && claude --version

# ── 5. Ferramentas de desenvolvimento ────────────────────────
RUN npm install -g \
    typescript \
    tsx \
    vite \
    create-next-app \
    vercel \
    prettier \
    eslint \
    nodemon

# ── 6. Skills do Claude Code ─────────────────────────────────
COPY skills/ /root/.claude/skills/

# ── 7. Configurações globais do Claude Code ──────────────────
COPY config/settings.json /root/.claude/settings.json
COPY config/keybindings.json /root/.claude/keybindings.json

# ── 8. CLAUDE.md padrão para novos projetos ──────────────────
COPY config/CLAUDE.md /root/.claude/claude-md-template.md
RUN mkdir -p /root/workspace && \
    cp /root/.claude/claude-md-template.md /root/workspace/CLAUDE.md

# ── 9. Mensagem de boas-vindas ───────────────────────────────
RUN printf '\n\
echo ""\n\
echo "  ∞  Bem-vindo ao Infinit Code"\n\
echo ""\n\
if ! claude auth status &>/dev/null; then\n\
    echo "  ⚡ Para começar, faça login com seu plano Claude:"\n\
    echo "     claude login"\n\
    echo ""\n\
else\n\
    echo "  ✓  Claude Code autenticado — digite claude para iniciar"\n\
    echo ""\n\
fi\n' >> /root/.bashrc

# ── 10. File server API ────────────────────────────────────
COPY file-server.js /file-server.js

# ── 11. Script de entrada ────────────────────────────────────
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /root/workspace

EXPOSE 8080 9090

ENTRYPOINT ["/entrypoint.sh"]
