# Regras do Projeto — DailyFlow Kanban

Este projeto é um Kanban minimalista e moderno voltado à organização de tarefas diárias com foco em clareza, alta legibilidade e respiro visual.

## Diretrizes de Qualidade e Desenvolvimento

1. **Linter & Tipos**: Todo código deve compilar sem erros de tipo (`npm run typecheck`) e respeitar o linter (`npm run lint`).
2. **Formatação**: Código deve seguir as regras do Prettier (`npm run format:check` / `npm run format`).
3. **Testes**: Novas funcionalidades devem ter testes unitários com Vitest (`npm run test:run`).
4. **Build**: O build de produção deve sempre compilar perfeitamente (`npm run build`).
5. **Padrão de Commits**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
6. **Design & UX**: Priorize clareza, tipografia limpa, hierarquia visual nítida, respiro visual (whitespace), ausência de ruído visual e transições suaves.
