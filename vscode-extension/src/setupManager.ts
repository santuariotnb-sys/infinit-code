import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ── Conteúdo das Skills ────────────────────────────────────────

const SKILL_SUPABASE = `---
name: supabase-agent
description: >
  Especialista Supabase. Use para criar tabelas, RLS policies, Edge Functions,
  queries otimizadas, autenticação, storage e realtime. Ativa automaticamente
  quando a tarefa envolve banco de dados, auth ou Supabase.
---

# Supabase Agent

Você é um especialista Supabase trabalhando num projeto Next.js / React.

## Regras obrigatórias
- SEMPRE habilite RLS nas tabelas criadas
- NUNCA exponha a service_role key no frontend
- Prefira select() com colunas explícitas — nunca select('*') em produção
- Use tipos TypeScript gerados pelo Supabase CLI

## Stack assumida
- Next.js 14+ App Router · @supabase/supabase-js v2 · TypeScript · Tailwind

## Ao criar tabelas
1. Escreve a migration SQL
2. Habilita RLS
3. Cria policies para authenticated e anon
4. Gera o tipo TypeScript correspondente

## Ao criar Edge Functions
- Use Deno + TypeScript
- Valide o JWT no header Authorization
- Retorne sempre { data, error } consistente

## Queries otimizadas
- Use índices em colunas de FK e filtros frequentes
- Prefira eq() a filter() para igualdade simples
- Use .single() quando espera exatamente 1 resultado
`;

const SKILL_TOKEN_OPTIMIZER = `---
name: token-optimizer
description: >
  Otimiza uso de tokens sem perder qualidade. Use no início de sessões longas
  ou quando o contexto estiver ficando cheio. Ativa com /token-optimizer.
---

# Token Optimizer

## Regras desta sessão
- Leia apenas os arquivos necessários para a tarefa atual
- Nunca leia mais de 3 arquivos por vez sem necessidade explícita
- Use /compact quando atingir 50% do contexto
- 1 sessão = 1 tarefa. Ao terminar, sugira /clear
- Feedback em no máximo 20 palavras
- Use CLI tools (gh, supabase) em vez de descrever operações
- Ao explorar o projeto, use grep/glob antes de abrir arquivos

## Modelo
- Sonnet para implementação (padrão)
- /model opusplan para tarefas que tocam mais de 3 arquivos
`;

const CLAUDE_MD_NEXTJS = `# Projeto Lovable — Infinit Code

## Stack
- Next.js 14 App Router
- TypeScript — sempre, nunca \`any\`
- Tailwind CSS — nunca CSS inline
- Supabase — banco, auth, storage, realtime

## Estrutura
- \`app/\` — rotas e layouts (App Router)
- \`components/\` — componentes reutilizáveis
- \`lib/\` — helpers, supabase client, utils
- \`hooks/\` — custom hooks
- \`types/\` — interfaces TypeScript

## Regras obrigatórias
- Componentes: sempre tipados com TypeScript
- Tailwind: use \`cn()\` para classes condicionais
- Supabase: cliente server-side para operações auth/admin
- Imagens: sempre \`next/image\` com width e height
- Erros: sempre trate — nunca silencie com try/catch vazio

## Proibido
- \`console.log\` em produção
- \`select('*')\` no Supabase
- CSS inline (\`style={{}}\`)
- Hardcode de credenciais

## Dev server
- \`npm run dev\` → localhost:3000
- Se não estiver rodando, sobe antes de testar

## Skills disponíveis
- \`/ui-ux-pro-max\` — UI com paletas e tipografia profissional
- \`/frontend-design\` — interfaces visualmente distintas
- \`/supabase-agent\` — operações Supabase com RLS e tipos
- \`/token-optimizer\` — economiza contexto em sessões longas
`;

const CLAUDEIGNORE = `node_modules/
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
.env.local
public/
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.ico
*.woff
*.woff2
*.ttf
*.eot
`;

// ── SetupManager ───────────────────────────────────────────────

export interface SetupResult {
  success: boolean;
  steps: { label: string; ok: boolean; msg?: string }[];
}

export class SetupManager {
  private skillsDir = path.join(os.homedir(), '.claude', 'skills');
  private claudeDir = path.join(os.homedir(), '.claude');

  /** Ponto de entrada — chamado após ativar a licença Pro */
  async run(context: vscode.ExtensionContext): Promise<SetupResult> {
    const steps: SetupResult['steps'] = [];

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '∞ Infinit Code — Configurando Pro',
        cancellable: false,
      },
      async (progress) => {

        // 1. Verifica Claude Code instalado
        progress.report({ message: 'Verificando Claude Code...', increment: 10 });
        const ccOk = await this._checkClaudeCode();
        steps.push({ label: 'Claude Code instalado', ok: ccOk, msg: ccOk ? undefined : 'Instale em: npm i -g @anthropic-ai/claude-code' });

        // 2. Cria ~/.claude/skills
        progress.report({ message: 'Criando pasta de skills...', increment: 10 });
        try {
          fs.mkdirSync(this.skillsDir, { recursive: true });
          steps.push({ label: 'Pasta ~/.claude/skills criada', ok: true });
        } catch (e: any) {
          steps.push({ label: 'Pasta de skills', ok: false, msg: e.message });
        }

        // 3. Skills
        progress.report({ message: 'Instalando skills...', increment: 20 });
        steps.push(this._writeSkill('supabase-agent', SKILL_SUPABASE));
        steps.push(this._writeSkill('token-optimizer', SKILL_TOKEN_OPTIMIZER));
        steps.push(await this._installSkillFromNpm('ui-ux-pro-max'));
        steps.push(await this._installSkillFromGit(
          'frontend-design',
          'https://github.com/anthropics/claude-code.git',
          'plugins/frontend-design'
        ));

        // 4. /voice + opusplan no settings.json global
        progress.report({ message: 'Configurando /voice e opusplan...', increment: 15 });
        steps.push(this._writeClaudeSettings());
        steps.push(this._writeKeybindings());

        // 5. Projeto atual (se for Next.js/React)
        progress.report({ message: 'Configurando projeto...', increment: 25 });
        const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (ws) {
          steps.push(this._writeCLAUDEmd(ws));
          steps.push(this._writeClaudeIgnore(ws));
          steps.push(this._writeVSCodeTasks(ws));
        } else {
          steps.push({ label: 'Projeto: nenhuma pasta aberta (abra um projeto e rode /infinit.setup)', ok: true });
        }

        // 6. Marca setup como concluído
        await context.globalState.update('infinit.setupDone', true);
        progress.report({ message: 'Pronto!', increment: 20 });
      }
    );

    const allOk = steps.every(s => s.ok);
    return { success: allOk, steps };
  }

  // ── Helpers privados ──────────────────────────────────────────

  private async _checkClaudeCode(): Promise<boolean> {
    try {
      await execAsync('claude --version');
      return true;
    } catch {
      return false;
    }
  }

  private _writeSkill(name: string, content: string): SetupResult['steps'][0] {
    try {
      const dir = path.join(this.skillsDir, name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'), content, 'utf8');
      return { label: `Skill: ${name}`, ok: true };
    } catch (e: any) {
      return { label: `Skill: ${name}`, ok: false, msg: e.message };
    }
  }

  private async _installSkillFromNpm(name: string): Promise<SetupResult['steps'][0]> {
    const dir = path.join(this.skillsDir, name);
    if (fs.existsSync(dir)) {
      return { label: `Skill: ${name} (já instalado)`, ok: true };
    }
    try {
      // Tenta instalar via uipro-cli
      await execAsync(`npx --yes uipro-cli init --ai claude --target "${this.skillsDir}" --offline`);
      return { label: `Skill: ${name}`, ok: true };
    } catch {
      // Fallback: cria um SKILL.md mínimo funcional
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'), `---
name: ${name}
description: >
  Design intelligence para UI/UX profissional. Use para criar interfaces
  com paletas, tipografia e estilos curados. Ativa em tarefas de UI/UX.
---

# UI/UX Pro Max

Ao criar qualquer interface, siga estas diretrizes:

## Estética
- Nunca use Inter, Roboto ou Arial — escolha fontes com personalidade
- Evite gradientes roxos em fundo branco (clichê de IA)
- Prefira layouts assimétricos com hierarquia visual clara
- Use CSS variables para consistência de cores

## Processo
1. Defina o tom antes de codar (minimalista, editorial, brutalist, etc.)
2. Escolha 1 fonte display + 1 fonte corpo distintas
3. Use no máximo 2 cores primárias + 1 acento
4. Espaçamento generoso > elementos comprimidos
`, 'utf8');
      return { label: `Skill: ${name} (versão local)`, ok: true };
    }
  }

  private async _installSkillFromGit(
    name: string,
    repo: string,
    subpath: string
  ): Promise<SetupResult['steps'][0]> {
    const dir = path.join(this.skillsDir, name);
    if (fs.existsSync(dir)) {
      return { label: `Skill: ${name} (já instalado)`, ok: true };
    }
    try {
      const tmp = path.join(os.tmpdir(), `infinit-skill-${Date.now()}`);
      await execAsync(`git clone --depth 1 --quiet "${repo}" "${tmp}"`);
      const src = path.join(tmp, subpath);
      if (fs.existsSync(src)) {
        fs.cpSync(src, dir, { recursive: true });
      }
      fs.rmSync(tmp, { recursive: true, force: true });
      return { label: `Skill: ${name}`, ok: true };
    } catch {
      // Fallback: escreve skill mínima
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'), `---
name: ${name}
description: >
  Cria interfaces frontend visualmente distintas. Use ao construir
  componentes, páginas ou qualquer UI. Evita estética genérica de IA.
---

# Frontend Design

Antes de qualquer código, defina:
1. Propósito — quem usa e por quê
2. Tom — minimalista, editorial, brutalist, orgânico, etc.
3. Diferencial — o que torna esta interface inesquecível

## Regras
- Fontes: nunca Inter/Roboto/Arial — use Google Fonts com personalidade
- Cores: CSS variables, máximo 3 ramps
- Layout: quebre a grade — assimetria, sobreposição, diagonais
- Motion: 1 animação de entrada orquestrada vale mais que 10 micro-interações
`, 'utf8');
      return { label: `Skill: ${name} (versão local)`, ok: true };
    }
  }

  private _writeClaudeSettings(): SetupResult['steps'][0] {
    try {
      const settingsPath = path.join(this.claudeDir, 'settings.json');
      let settings: Record<string, any> = {};
      if (fs.existsSync(settingsPath)) {
        try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch {}
      }
      settings.defaultModel   = settings.defaultModel || 'claude-sonnet-4-6';
      settings.planModel      = 'claude-opus-4-6';
      settings.language       = 'pt-BR';
      settings.autoCompact    = true;
      settings.compactThreshold = 0.5;
      settings.voice          = { language: 'pt-BR', pushToTalk: 'meta+k', ...settings.voice };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      return { label: '/voice em PT-BR + opusplan configurados', ok: true };
    } catch (e: any) {
      return { label: 'Configurações Claude Code', ok: false, msg: e.message };
    }
  }

  private _writeKeybindings(): SetupResult['steps'][0] {
    try {
      const kbPath = path.join(this.claudeDir, 'keybindings.json');
      const kb = {
        bindings: [{
          context: 'Chat',
          bindings: { 'meta+k': 'voice:pushToTalk', space: null }
        }]
      };
      fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2), 'utf8');
      return { label: 'Atalho Meta+K para /voice', ok: true };
    } catch (e: any) {
      return { label: 'Keybindings', ok: false, msg: e.message };
    }
  }

  private _writeCLAUDEmd(ws: string): SetupResult['steps'][0] {
    try {
      const dest = path.join(ws, 'CLAUDE.md');
      if (fs.existsSync(dest)) {
        return { label: 'CLAUDE.md já existe (mantido)', ok: true };
      }
      // Detecta stack do projeto
      const pkg = this._readPackageJson(ws);
      const isNext = !!(pkg?.dependencies?.next || pkg?.devDependencies?.next);
      fs.writeFileSync(dest, isNext ? CLAUDE_MD_NEXTJS : CLAUDE_MD_NEXTJS.replace('Next.js 14 App Router', 'React + Vite').replace('localhost:3000', 'localhost:5173'), 'utf8');
      return { label: 'CLAUDE.md otimizado criado', ok: true };
    } catch (e: any) {
      return { label: 'CLAUDE.md', ok: false, msg: e.message };
    }
  }

  private _writeClaudeIgnore(ws: string): SetupResult['steps'][0] {
    try {
      const dest = path.join(ws, '.claudeignore');
      if (fs.existsSync(dest)) {
        return { label: '.claudeignore já existe (mantido)', ok: true };
      }
      fs.writeFileSync(dest, CLAUDEIGNORE, 'utf8');
      return { label: '.claudeignore criado', ok: true };
    } catch (e: any) {
      return { label: '.claudeignore', ok: false, msg: e.message };
    }
  }

  private _writeVSCodeTasks(ws: string): SetupResult['steps'][0] {
    try {
      const pkg = this._readPackageJson(ws);
      const isNext = !!(pkg?.dependencies?.next || pkg?.devDependencies?.next);
      const port = isNext ? 3000 : 5173;
      const vscodeDir = path.join(ws, '.vscode');
      fs.mkdirSync(vscodeDir, { recursive: true });
      const tasksPath = path.join(vscodeDir, 'tasks.json');
      if (fs.existsSync(tasksPath)) {
        return { label: 'Preview ao vivo (.vscode/tasks.json já existe)', ok: true };
      }
      const tasks = {
        version: '2.0.0',
        tasks: [
          {
            label: 'Dev Server',
            type: 'shell',
            command: 'npm run dev',
            isBackground: true,
            problemMatcher: [],
            runOptions: { runOn: 'folderOpen' }
          },
          {
            label: '∞ Preview',
            type: 'shell',
            command: `sleep 3 && code --open-url "vscode://vscode.simpleBrowser/show?url=http://localhost:${port}"`,
            dependsOn: 'Dev Server',
            runOptions: { runOn: 'folderOpen' }
          }
        ]
      };
      fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');
      return { label: `Preview ao vivo → localhost:${port}`, ok: true };
    } catch (e: any) {
      return { label: 'Preview ao vivo', ok: false, msg: e.message };
    }
  }

  private _readPackageJson(ws: string): any {
    try {
      return JSON.parse(fs.readFileSync(path.join(ws, 'package.json'), 'utf8'));
    } catch { return null; }
  }

  /** Mostra painel com resultado do setup */
  static showReport(result: SetupResult) {
    const lines = result.steps.map(s =>
      `${s.ok ? '✓' : '✗'} ${s.label}${s.msg ? `\n    → ${s.msg}` : ''}`
    ).join('\n');

    const msg = result.success
      ? `∞ Infinit Code Pro ativado com sucesso!\n\n${lines}\n\nAbra o terminal e digite: claude\nSegure Meta+K para falar com o Claude.`
      : `∞ Setup concluído com avisos:\n\n${lines}`;

    const action = result.success ? 'Abrir terminal' : 'Ver documentação';
    vscode.window.showInformationMessage(msg, action).then(v => {
      if (v === 'Abrir terminal') {
        vscode.commands.executeCommand('workbench.action.terminal.new');
      } else if (v === 'Ver documentação') {
        vscode.env.openExternal(vscode.Uri.parse('https://infinitcode.netlify.app'));
      }
    });
  }
}
