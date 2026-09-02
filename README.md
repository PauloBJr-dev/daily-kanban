# 📋 DailyFlow Kanban

> Uma aplicação moderna, limpa e focada em respiro visual para organização de tarefas diárias, com foco diário, persistência local e timer Pomodoro integrado.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React%2019-20232A?logo=react&logoColor=61DAFB)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)

---

## ✨ Características

- 🌬️ **Respiro Visual & Design Limpo**: Interface pensada para bater o olho e identificar exatamente o status das suas tarefas diárias sem poluição ou sobrecarga de informação.
- 🎯 **Foco Diário**: Indicador em tempo real de metas diárias cumpridas, progresso percentual e alertas para tarefas de hoje ou atrasadas.
- ⏱️ **Timer Pomodoro Integrado**: Bloco de foco de 25 minutos e pausas de 5 minutos com associação direta à tarefa que você estiver executando.
- 🔄 **Arrastar e Soltar (Drag & Drop)**: Movimentação fluida entre colunas com indicação visual sutil da área de soltura.
- ✅ **Checklist de Subtarefas**: Acompanhamento detalhado do progresso de tarefas maiores com barra percentual e checkboxes rápidos.
- 🏷️ **Prioridades e Etiquetas**: Classificação por níveis de urgência (_Urgente_, _Alta_, _Média_, _Baixa_) e tags personalizadas.
- 💾 **Persistência & Portabilidade**: Salva automaticamente no navegador (`localStorage`) com suporte a exportação e importação de backups em formato JSON.
- 🌓 **Tema Claro e Escuro**: Transição suave adaptada para conforto visual em qualquer momento do dia.
- 🛡️ **Qualidade & Governança**: Setup completo com TypeScript estrito, Vitest, Prettier, ESLint/oxlint, GitHub Actions CI/CD, CodeQL, Dependabot e padrões de Conventional Commits.

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 20+
- `npm` versão 10+

### Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/PauloBJr-dev/daily-kanban.git
cd daily-kanban

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação no navegador em `http://localhost:5173`.

---

## 🧪 Scripts Disponíveis

| Comando                | Descrição                                           |
| :--------------------- | :-------------------------------------------------- |
| `npm run dev`          | Inicia o servidor Vite para desenvolvimento         |
| `npm run build`        | Compila o projeto para produção                     |
| `npm run preview`      | Visualiza o build de produção localmente            |
| `npm run typecheck`    | Executa a validação estática de tipos TypeScript    |
| `npm run lint`         | Executa o linter para garantia de qualidade         |
| `npm run format:check` | Verifica a formatação do código com Prettier        |
| `npm run format`       | Corrige e formata automaticamente todos os arquivos |
| `npm run test`         | Executa os testes unitários interativos             |
| `npm run test:run`     | Executa os testes unitários uma vez (modo CI)       |

---

## 📁 Estrutura do Projeto

```
daily-kanban/
├── .agents/               # Regras e diretrizes do projeto
├── .github/               # Workflows de CI/CD, CodeQL, Dependabot e templates de PR/Issue
├── src/
│   ├── components/        # Componentes reutilizáveis (Header, Board, Column, TaskCard, etc.)
│   ├── hooks/             # Custom Hooks (useKanban, usePomodoro)
│   ├── services/          # Persistência em localStorage e dados iniciais
│   ├── types/             # Tipagens TypeScript estritas
│   ├── tests/             # Testes unitários com Vitest e Testing Library
│   ├── App.tsx            # Componente raiz da aplicação
│   └── main.tsx           # Ponto de entrada
└── ...
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
