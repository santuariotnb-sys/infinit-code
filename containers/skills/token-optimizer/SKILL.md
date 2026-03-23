---
name: token-optimizer
description: >
  Otimiza tokens sem perder qualidade. Use no início de sessões
  longas ou quando o contexto estiver ficando cheio.
---

# Token Optimizer

## Regras
- Leia apenas arquivos necessários para a tarefa
- Nunca mais de 3 arquivos por vez
- /compact a 50% do contexto
- 1 sessão = 1 tarefa
- Use grep/glob antes de abrir arquivos

## Modelo
- Sonnet para implementação
- /model opusplan para tarefas complexas
