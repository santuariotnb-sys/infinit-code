---
name: code-quality
description: >
  Melhora qualidade do código. Use para reviews, refatorações
  e implementações que precisam seguir boas práticas.
---

# Code Quality

## Antes de escrever
1. Leia os arquivos relevantes primeiro
2. Planeje antes de implementar
3. Considere edge cases

## Padrões obrigatórios
- TypeScript strict — nunca `any`
- Funções máximo 50 linhas
- Nomes descritivos que revelam intenção
- Tratamento de erro explícito

## React
- Componentes puros quando possível
- Loading + error states em toda chamada async
- Separação: UI components vs container components
