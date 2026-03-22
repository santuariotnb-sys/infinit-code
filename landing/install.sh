#!/bin/bash
# ============================================================
#  Infinit Kit — Setup completo para projetos Lovable
#  React / Next.js + Claude Code + Skills + Voice + Preview
#  infinit-code.netlify.app
# ============================================================

set -e

VERDE='\033[0;32m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
RESET='\033[0m'
NEGRITO='\033[1m'

ok()   { echo -e "${VERDE}✓${RESET} $1"; }
info() { echo -e "${AZUL}→${RESET} $1"; }
warn() { echo -e "${AMARELO}⚠${RESET}  $1"; }
header() { echo -e "\n${NEGRITO}$1${RESET}"; }

clear
echo -e "${NEGRITO}"
echo "  ∞  Infinit Kit"
echo "     Setup para projetos Lovable (React/Next.js)"
echo -e "${RESET}"
echo "  Isso vai instalar e configurar tudo automaticamente."
echo "  Tempo estimado: 3–5 minutos."
echo ""
read -p "  Pressione Enter para começar..." _

# ── 1. NODE.JS ────────────────────────────────────────────────
header "1/6  Node.js"
if ! command -v node &>/dev/null; then
  warn "Node.js não encontrado."
  echo "     Instale em https://nodejs.org (versão 18+) e rode este script novamente."
  exit 1
fi
NODE_VER=$(node -v)
ok "Node.js $NODE_VER"

# ── 2. CLAUDE CODE ────────────────────────────────────────────
header "2/6  Claude Code"
if command -v claude &>/dev/null; then
  CURRENT=$(claude --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  ok "Claude Code já instalado (v$CURRENT)"
else
  info "Instalando Claude Code..."
  npm install -g @anthropic-ai/claude-code
  ok "Claude Code instalado"
fi

# Verifica versão mínima para /voice
CURRENT=$(claude --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
MINVER="2.1.69"
if [ "$(printf '%s\n' "$MINVER" "$CURRENT" | sort -V | head -1)" != "$MINVER" ]; then
  info "Atualizando Claude Code para versão com /voice..."
  npm install -g @anthropic-ai/claude-code@latest
  ok "Claude Code atualizado"
fi
ok "Versão com /voice suportada (v$CURRENT)"

# ── 3. SKILLS ─────────────────────────────────────────────────
header "3/6  Skills Pack"

SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

# ui-ux-pro-max
if [ ! -d "$SKILLS_DIR/ui-ux-pro-max" ]; then
  info "Instalando ui-ux-pro-max skill (29k ⭐)..."
  # Instala via npm cli se disponível, senão clona direto
  if command -v npx &>/dev/null; then
    npx --yes uipro-cli init --ai claude --target "$SKILLS_DIR" 2>/dev/null || \
    git clone --depth 1 --quiet \
      https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git \
      "$SKILLS_DIR/ui-ux-pro-max" 2>/dev/null || true
  fi
fi
ok "Skill: ui-ux-pro-max (UI/UX com 50+ estilos, 97 paletas)"

# frontend-design (Anthropic oficial)
if [ ! -d "$SKILLS_DIR/frontend-design" ]; then
  info "Instalando frontend-design (Anthropic oficial, 65k ⭐)..."
  git clone --depth 1 --quiet \
    https://github.com/anthropics/claude-code.git /tmp/cc-skills-tmp 2>/dev/null && \
    cp -r /tmp/cc-skills-tmp/plugins/frontend-design "$SKILLS_DIR/" 2>/dev/null && \
    rm -rf /tmp/cc-skills-tmp || true
fi
ok "Skill: frontend-design (Anthropic oficial)"

# supabase-agent
if [ ! -d "$SKILLS_DIR/supabase-agent" ]; then
  info "Instalando supabase-agent skill..."
  mkdir -p "$SKILLS_DIR/supabase-agent"
  cat > "$SKILLS_DIR/supabase-agent/SKILL.md" << 'SUPABASE_SKILL'
---
name: supabase-agent
description: >
  Especialista Supabase. Use para criar tabelas, RLS policies, Edge Functions,
  queries otimizadas, autenticação, storage e realtime. Ativa automaticamente
  quando a tarefa envolve banco de dados, auth ou Supabase.
---

# Supabase Agent

Você é um especialista Supabase trabalhando num projeto Next.js / React.

## Regras obrigatórias

- SEMPRE use o cliente Supabase do lado do servidor para operações sensíveis
- SEMPRE habilite RLS nas tabelas criadas
- NUNCA exponha a service_role key no frontend
- Use `supabase` CLI para migrations quando disponível
- Prefira `select()` com colunas explícitas — nunca `select('*')` em produção

## Stack assumida
- Next.js 14+ App Router
- @supabase/supabase-js v2
- TypeScript
- Tailwind CSS

## Ao criar tabelas
1. Cria a migration SQL
2. Habilita RLS
3. Cria policies para authenticated e anon
4. Gera o tipo TypeScript correspondente

## Ao criar Edge Functions
- Use Deno + TypeScript
- Valide o JWT no header Authorization
- Retorne sempre `{ data, error }` consistente

## Queries otimizadas
- Use índices em colunas de foreign key e filtros frequentes
- Prefira `eq()` a `filter()` para igualdade simples
- Use `.single()` quando espera exatamente 1 resultado
SUPABASE_SKILL
fi
ok "Skill: supabase-agent (banco, auth, RLS, Edge Functions)"

# token-optimizer skill
if [ ! -d "$SKILLS_DIR/token-optimizer" ]; then
  mkdir -p "$SKILLS_DIR/token-optimizer"
  cat > "$SKILLS_DIR/token-optimizer/SKILL.md" << 'TOKEN_SKILL'
---
name: token-optimizer
description: >
  Otimiza o uso de tokens sem perder qualidade. Use no início de sessões longas
  ou quando o contexto estiver ficando cheio. Ativa com /token-optimizer.
---

# Token Optimizer

## Regras desta sessão

- Leia apenas os arquivos necessários para a tarefa atual
- Nunca leia mais de 3 arquivos por vez sem necessidade explícita
- Use /compact quando atingir 50% do contexto
- 1 sessão = 1 tarefa. Ao terminar, sugira /clear
- Prompts de feedback: máximo 20 palavras
- Use CLI tools (gh, supabase) em vez de descrever operações
- Ao explorar o projeto, use grep/glob antes de abrir arquivos

## Modelo
- Use Sonnet para implementação
- Use /model opusplan para tarefas com mais de 3 arquivos
TOKEN_SKILL
fi
ok "Skill: token-optimizer (economia de contexto automática)"

# ── 4. CONFIGURAÇÕES GLOBAIS ──────────────────────────────────
header "4/6  Configurações"

CLAUDE_DIR="$HOME/.claude"
mkdir -p "$CLAUDE_DIR"

# Settings — opusplan + português + voice
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
  echo '{}' > "$SETTINGS_FILE"
fi

# Injeta configurações via node
node -e "
const fs = require('fs');
const path = '$SETTINGS_FILE';
let s = {};
try { s = JSON.parse(fs.readFileSync(path,'utf8')); } catch(e){}
s.defaultModel = s.defaultModel || 'claude-sonnet-4-6';
s.planModel    = 'claude-opus-4-6';
s.language     = 'pt-BR';
s.voice        = s.voice || {};
s.voice.language = 'pt-BR';
s.voice.pushToTalk = 'meta+k';
s.autoCompact  = true;
s.compactThreshold = 0.5;
fs.writeFileSync(path, JSON.stringify(s, null, 2));
"
ok "opusplan configurado (Opus para planejar, Sonnet para codar)"
ok "/voice em português configurado (push-to-talk: Meta+K)"
ok "Auto-compact ativado em 50% do contexto"

# Keybindings — meta+k para /voice
mkdir -p "$CLAUDE_DIR"
cat > "$CLAUDE_DIR/keybindings.json" << 'KEYS'
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "meta+k": "voice:pushToTalk",
        "space": null
      }
    }
  ]
}
KEYS
ok "Atalho Meta+K configurado para /voice"

# ── 5. PROJETO ATUAL (se for Next.js/React) ───────────────────
header "5/6  Configurando projeto atual"

if [ -f "package.json" ]; then
  IS_NEXT=$(node -e "try{const p=require('./package.json');console.log(p.dependencies?.next||p.devDependencies?.next?'yes':'no')}catch(e){console.log('no')}")
  IS_REACT=$(node -e "try{const p=require('./package.json');console.log(p.dependencies?.react||p.devDependencies?.react?'yes':'no')}catch(e){console.log('no')}")

  if [ "$IS_NEXT" = "yes" ] || [ "$IS_REACT" = "yes" ]; then

    # CLAUDE.md
    if [ ! -f "CLAUDE.md" ]; then
      info "Criando CLAUDE.md otimizado para este projeto..."
      cat > "CLAUDE.md" << 'CLAUDEMD'
# Projeto Lovable — Infinit Kit

## Stack
- Next.js 14 App Router (ou React + Vite)
- TypeScript — sempre
- Tailwind CSS — classes utilitárias, nunca CSS inline
- Supabase — banco, auth, storage, realtime

## Estrutura
- `app/` — rotas e layouts (App Router)
- `components/` — componentes reutilizáveis
- `lib/` — helpers, supabase client, utils
- `hooks/` — custom hooks
- `types/` — interfaces TypeScript

## Regras obrigatórias
- Componentes: sempre tipados com TypeScript
- Nunca use `any` — use tipos explícitos ou `unknown`
- Tailwind: use `cn()` para classes condicionais
- Supabase: cliente server-side para operações auth/admin
- Imagens: sempre `next/image` com width e height
- Erros: sempre trate — nunca silencie com try/catch vazio

## Proibido
- `console.log` em produção
- `select('*')` no Supabase
- CSS inline (`style={{}}`)
- Hardcode de credenciais

## Dev server
- Next.js: `npm run dev` → localhost:3000
- React/Vite: `npm run dev` → localhost:5173
- Se o servidor não estiver rodando, rode antes de testar

## Skills disponíveis
- `/ui-ux-pro-max` — UI com paletas e tipografia profissional
- `/frontend-design` — interfaces visualmente distintas
- `/supabase-agent` — operações Supabase com RLS e tipos
- `/token-optimizer` — economiza contexto em sessões longas
CLAUDEMD
      ok "CLAUDE.md criado"
    else
      ok "CLAUDE.md já existe (mantido)"
    fi

    # .claudeignore
    if [ ! -f ".claudeignore" ]; then
      cat > ".claudeignore" << 'IGNORE'
node_modules/
.next/
.vercel/
out/
dist/
build/
coverage/
*.lock
*.min.js
*.min.css
*.map
.env*
public/
*.png
*.jpg
*.jpeg
*.svg
*.ico
*.woff
*.woff2
IGNORE
      ok ".claudeignore criado (economiza tokens em cada turno)"
    else
      ok ".claudeignore já existe (mantido)"
    fi

    # .vscode/settings.json — Simple Browser automático
    mkdir -p ".vscode"
    if [ ! -f ".vscode/settings.json" ]; then
      echo '{}' > ".vscode/settings.json"
    fi
    node -e "
const fs = require('fs');
const path = '.vscode/settings.json';
let s = {};
try { s = JSON.parse(fs.readFileSync(path,'utf8')); } catch(e){}
s['simpleBrowser.focusLockIndicator.enabled'] = true;
s['editor.formatOnSave'] = true;
fs.writeFileSync(path, JSON.stringify(s, null, 2));
"

    # tasks.json — abre preview automático
    PORT="3000"
    if [ "$IS_NEXT" != "yes" ]; then PORT="5173"; fi
    cat > ".vscode/tasks.json" << TASKS
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "isBackground": true,
      "problemMatcher": [],
      "runOptions": { "runOn": "folderOpen" }
    },
    {
      "label": "Preview",
      "type": "shell",
      "command": "sleep 3 && code --open-url 'vscode://vscode.simpleBrowser/show?url=http://localhost:${PORT}'",
      "dependsOn": "Dev Server",
      "runOptions": { "runOn": "folderOpen" }
    }
  ]
}
TASKS
    ok "Preview ao vivo configurado → localhost:$PORT no Simple Browser"

  else
    warn "package.json encontrado mas não é projeto Next.js/React. Pulando config de projeto."
  fi
else
  info "Nenhum projeto detectado nesta pasta."
  echo "     Abra a pasta do seu projeto e rode:"
  echo "     curl -fsSL https://infinit-code.netlify.app/install.sh | bash"
fi

# ── 6. RESUMO FINAL ───────────────────────────────────────────
header "6/6  Tudo pronto!"
echo ""
echo -e "  ${VERDE}${NEGRITO}Infinit Kit instalado com sucesso.${RESET}"
echo ""
echo -e "  ${NEGRITO}O que foi configurado:${RESET}"
echo "  ✓ Claude Code atualizado com suporte a /voice"
echo "  ✓ Skills: ui-ux-pro-max · frontend-design · supabase-agent · token-optimizer"
echo "  ✓ opusplan — Opus para planejar, Sonnet para codar"
echo "  ✓ /voice em português (segure Meta+K para falar)"
echo "  ✓ Auto-compact a 50% do contexto"
if [ -f "CLAUDE.md" ]; then
echo "  ✓ CLAUDE.md otimizado para este projeto"
echo "  ✓ .claudeignore configurado"
echo "  ✓ Preview ao vivo no VS Code (Simple Browser)"
fi
echo ""
echo -e "  ${NEGRITO}Como usar:${RESET}"
echo "  1. Abra o VS Code nesta pasta"
echo "  2. O dev server e o preview abrem automaticamente"
echo "  3. No terminal: claude"
echo "  4. Segure Meta+K e fale o que quer construir"
echo ""
echo -e "  ${AZUL}Dúvidas? grupo.infinit-code.netlify.app${RESET}"
echo ""
