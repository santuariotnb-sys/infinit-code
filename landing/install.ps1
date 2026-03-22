# ============================================================
#  Infinit Kit — Setup para Windows (PowerShell)
#  React / Next.js + Claude Code + Skills + Voice + Preview
# ============================================================

$ErrorActionPreference = "Stop"

function ok   { Write-Host "✓ $args" -ForegroundColor Green }
function info { Write-Host "→ $args" -ForegroundColor Cyan }
function warn { Write-Host "⚠ $args" -ForegroundColor Yellow }

Clear-Host
Write-Host ""
Write-Host "  ∞  Infinit Kit" -ForegroundColor White
Write-Host "     Setup para projetos Lovable (React/Next.js)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Isso vai instalar e configurar tudo automaticamente."
Write-Host "  Tempo estimado: 3-5 minutos."
Write-Host ""
Read-Host "  Pressione Enter para começar"

# 1. Node.js
Write-Host "`n1/6  Node.js" -ForegroundColor White
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    warn "Node.js não encontrado."
    Write-Host "     Instale em https://nodejs.org (versão 18+) e rode novamente."
    exit 1
}
ok "Node.js $(node -v)"

# 2. Claude Code
Write-Host "`n2/6  Claude Code" -ForegroundColor White
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    info "Instalando Claude Code..."
    npm install -g @anthropic-ai/claude-code
} else {
    info "Atualizando Claude Code..."
    npm install -g @anthropic-ai/claude-code@latest
}
ok "Claude Code instalado com suporte a /voice"

# 3. Skills
Write-Host "`n3/6  Skills Pack" -ForegroundColor White
$skillsDir = "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null

# supabase-agent
$supabaseDir = "$skillsDir\supabase-agent"
if (-not (Test-Path $supabaseDir)) {
    New-Item -ItemType Directory -Force -Path $supabaseDir | Out-Null
    @"
---
name: supabase-agent
description: >
  Especialista Supabase. Use para criar tabelas, RLS, Edge Functions, queries.
  Ativa automaticamente quando a tarefa envolve banco de dados ou auth.
---
# Supabase Agent
- SEMPRE habilite RLS nas tabelas criadas
- NUNCA exponha service_role key no frontend
- Prefira select() com colunas explícitas
- Use tipos TypeScript para todas as queries
"@ | Set-Content "$supabaseDir\SKILL.md"
}
ok "Skill: supabase-agent"

# token-optimizer
$tokenDir = "$skillsDir\token-optimizer"
if (-not (Test-Path $tokenDir)) {
    New-Item -ItemType Directory -Force -Path $tokenDir | Out-Null
    @"
---
name: token-optimizer
description: Otimiza tokens sem perder qualidade. Use no início de sessões longas.
---
# Token Optimizer
- Leia apenas arquivos necessários para a tarefa
- /compact a 50% do contexto
- 1 sessão = 1 tarefa
- Use Sonnet para implementação, opusplan para arquitetura
"@ | Set-Content "$tokenDir\SKILL.md"
}
ok "Skill: token-optimizer"
ok "Skill: ui-ux-pro-max (instale via: npx uipro-cli init --ai claude)"
ok "Skill: frontend-design (instale via: claude /plugin marketplace add anthropics/skills)"

# 4. Configurações
Write-Host "`n4/6  Configurações" -ForegroundColor White
$claudeDir = "$env:USERPROFILE\.claude"
New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null

$settingsPath = "$claudeDir\settings.json"
$settings = if (Test-Path $settingsPath) {
    Get-Content $settingsPath | ConvertFrom-Json
} else { [PSCustomObject]@{} }

$settings | Add-Member -Force -NotePropertyName "defaultModel" -NotePropertyValue "claude-sonnet-4-6"
$settings | Add-Member -Force -NotePropertyName "planModel" -NotePropertyValue "claude-opus-4-6"
$settings | Add-Member -Force -NotePropertyName "language" -NotePropertyValue "pt-BR"
$settings | Add-Member -Force -NotePropertyName "autoCompact" -NotePropertyValue $true
$settings | Add-Member -Force -NotePropertyName "compactThreshold" -NotePropertyValue 0.5
$voice = [PSCustomObject]@{ language = "pt-BR"; pushToTalk = "meta+k" }
$settings | Add-Member -Force -NotePropertyName "voice" -NotePropertyValue $voice
$settings | ConvertTo-Json -Depth 5 | Set-Content $settingsPath

@'
{"bindings":[{"context":"Chat","bindings":{"meta+k":"voice:pushToTalk","space":null}}]}
'@ | Set-Content "$claudeDir\keybindings.json"

ok "opusplan configurado"
ok "/voice em português (Meta+K)"
ok "Auto-compact a 50%"

# 5. Projeto atual
Write-Host "`n5/6  Projeto atual" -ForegroundColor White
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    $isNext = $pkg.dependencies.next -or $pkg.devDependencies.next
    $port = if ($isNext) { "3000" } else { "5173" }

    if (-not (Test-Path "CLAUDE.md")) {
        @"
# Projeto Lovable — Infinit Kit

## Stack
- Next.js 14 App Router / React + Vite
- TypeScript, Tailwind CSS, Supabase

## Regras
- Sempre TypeScript — nunca `any`
- Tailwind: nunca CSS inline
- Supabase: RLS sempre ativo, nunca `select('*')`
- Dev server: npm run dev → localhost:$port

## Skills disponíveis
- /ui-ux-pro-max, /frontend-design, /supabase-agent, /token-optimizer
"@ | Set-Content "CLAUDE.md"
        ok "CLAUDE.md criado"
    }

    if (-not (Test-Path ".claudeignore")) {
        @"
node_modules/
.next/
out/
dist/
*.lock
*.min.js
*.map
.env*
public/
"@ | Set-Content ".claudeignore"
        ok ".claudeignore criado"
    }

    New-Item -ItemType Directory -Force -Path ".vscode" | Out-Null
    @"
{"version":"2.0.0","tasks":[{"label":"Dev Server","type":"shell","command":"npm run dev","isBackground":true,"problemMatcher":[],"runOptions":{"runOn":"folderOpen"}},{"label":"Preview","type":"shell","command":"Start-Sleep 3; code --open-url 'vscode://vscode.simpleBrowser/show?url=http://localhost:$port'","dependsOn":"Dev Server","runOptions":{"runOn":"folderOpen"}}]}
"@ | Set-Content ".vscode\tasks.json"
    ok "Preview ao vivo → localhost:$port"
}

# 6. Resumo
Write-Host "`n6/6  Tudo pronto!" -ForegroundColor White
Write-Host ""
Write-Host "  ✓ Claude Code com /voice" -ForegroundColor Green
Write-Host "  ✓ Skills: supabase-agent · token-optimizer" -ForegroundColor Green
Write-Host "  ✓ opusplan (qualidade máxima, custo mínimo)" -ForegroundColor Green
Write-Host "  ✓ /voice em português — Meta+K para falar" -ForegroundColor Green
Write-Host "  ✓ Preview ao vivo no VS Code" -ForegroundColor Green
Write-Host ""
Write-Host "  Como usar:" -ForegroundColor White
Write-Host "  1. Abra o VS Code nesta pasta"
Write-Host "  2. O preview abre automático"
Write-Host "  3. No terminal: claude"
Write-Host "  4. Segure Meta+K e fale o que quer construir"
Write-Host ""
Write-Host "  Dúvidas? grupo.infinit-code.netlify.app" -ForegroundColor Cyan
