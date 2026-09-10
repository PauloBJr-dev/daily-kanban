---
name: vercel
description: 'Use when deploying, monitoring, troubleshooting builds, inspecting logs, or managing environment variables for DailyFlow / daily-kanban on Vercel via Vercel MCP or Vercel CLI.'
metadata:
  author: devops
  version: '1.0.0'
---

# Vercel Deployment & Operations Guide — DailyFlow / OrganoCat

Este guia estabelece os padrões operacionais, fluxos automatizados e procedimentos de resolução de incidentes para o projeto **DailyFlow / OrganoCat** na infraestrutura da Vercel, utilizando a integração oficial do **Vercel MCP (Model Context Protocol)** e o **Vercel CLI**.

---

## 1. Visão Geral e Arquitetura

### 1.1 Metadados do Projeto

- **Projeto**: `daily-kanban`
- **Organização / Time**: `contatopborgesj-8577s-projects`
- **Project ID**: `prj_VjGnhNj9atS1lQgMKSklPDSBjTkF`
- **Framework**: Vite + React 19 + TypeScript + Tailwind CSS
- **MCP Endpoint Oficial**: `https://mcp.vercel.com/contatopborgesj-8577s-projects/daily-kanban`

### 1.2 Como Funciona o Vercel MCP

O **Vercel MCP Server** conecta agentes de IA diretamente à API de gerenciamento da Vercel com escopo restrito ao projeto `daily-kanban`. Ele oferece:

1. **Inspeção de Deployments**: Acompanhamento do status de builds e deployments em tempo real (Production e Previews gerados por Pull Requests).
2. **Logs em Tempo Real**: Leitura direta dos logs de compilação (`build logs`) e de execução (`runtime logs`), permitindo diagnósticos de falha instantâneos.
3. **Gestão Segura de Variáveis de Ambiente**: Verificação da existência e escopo das variáveis (ex.: chaves do Supabase) sem expor segredos no código-fonte.
4. **Governança Segura**: Autenticação gerenciada via OAuth 2.0 / Personal Access Token, eliminando a necessidade de credenciais em texto puro no repositório.

---

## 2. Ferramentas do Vercel MCP

Quando a conexão com o endpoint MCP da Vercel estiver ativa, as seguintes capacidades ficam disponíveis para os agentes:

| Ferramenta MCP          | Descrição                                                    | Caso de Uso Típico                                           |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `list_deployments`      | Lista os deployments recentes do projeto com status e branch | Verificar se o deploy da branch/PR foi concluído com sucesso |
| `get_deployment`        | Recupera detalhes completos de um deployment por ID ou URL   | Checar status exato, commit associado e URLs de preview      |
| `get_deployment_events` | Retorna os eventos e logs passo a passo do processo de build | Analisar erros de compilação ou timeouts no deploy           |
| `list_project_env_vars` | Lista as variáveis de ambiente configuradas no projeto       | Garantir que variáveis de produção/preview estão presentes   |
| `get_project`           | Retorna configurações de build, framework e domínios         | Validar se o build command e output dir estão corretos       |

---

## 3. Comandos Automatizados via Vercel CLI

Caso o MCP necessite de suporte local via terminal ou em scripts CI/CD, utilize a Vercel CLI:

### 3.1 Listagem e Inspeção de Deployments

```bash
# Listar os últimos deployments do projeto
npx vercel ls

# Inspecionar detalhes de um deployment específico
npx vercel inspect <deployment-url>

# Visualizar logs em tempo real do deployment
npx vercel logs <deployment-url>
```

### 3.2 Gerenciamento de Variáveis de Ambiente

```bash
# Listar todas as variáveis de ambiente cadastradas
npx vercel env ls

# Baixar variáveis de ambiente para o arquivo local .env.local (nunca comitar!)
npx vercel env pull .env.local

# Adicionar uma nova variável com escopo
npx vercel env add <NOME_DA_VARIAVEL> production preview development
```

### 3.3 Build e Deploy Local / Pré-compilado

```bash
# Simular compilação exata da Vercel localmente
npx vercel build

# Publicar build pré-compilado sem re-compilar na nuvem
npx vercel deploy --prebuilt
```

---

## 4. Runbook de Resolução de Problemas (Troubleshooting & Incident Response)

### 4.1 Falha de Build (TypeScript / Vite / Oxlint)

- **Sintoma**: Deployment com status `ERROR` na etapa de compilação.
- **Diagnóstico**:
  1. No MCP: Chamar `get_deployment_events` com o ID do deployment que falhou.
  2. No CLI: Executar `npx vercel logs <url>`.
- **Ações de Resolução**:
  1. Executar localmente na raiz do projeto:
     ```bash
     npm run lint        # Validação com oxlint (deve ter 0 erros e 0 warnings)
     npm run typecheck   # Validação com tsc --noEmit (deve ter 0 erros)
     npm run test:run    # Execução das 32 suítes com vitest (100% passando)
     npm run build       # Compilação de produção
     ```
  2. Corrigir eventuais importações ausentes, tipos incorretos ou dependências não listadas no `package.json`.
  3. Fazer novo commit seguindo Conventional Commits e push para a branch.

### 4.2 Variáveis de Ambiente do Supabase Ausentes

- **Sintoma**: A aplicação carrega uma tela branca ou gera erro de console: `Supabase configuration missing`.
- **Diagnóstico**:
  1. Verificar no MCP via `list_project_env_vars`.
  2. Ou via CLI: `npx vercel env ls`.
- **Ações de Resolução**:
  1. Certificar que as seguintes variáveis estão configuradas para todos os ambientes (`Production`, `Preview`, `Development`):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
  2. Caso falte alguma, cadastrar via Vercel Dashboard ou `npx vercel env add`.
  3. Disparar um redeploy para que as novas variáveis entrem em vigor no bundle do cliente.

### 4.3 Roteamento SPA (Erro 404 em recarregamento de página)

- **Sintoma**: Ao acessar rotas profundas diretamente ou recarregar a página no navegador, a Vercel retorna erro 404.
- **Diagnóstico**: O projeto é uma Single Page Application (SPA). Sem regra de reescrita, o servidor da Vercel busca arquivos físicos no caminho da URL.
- **Ações de Resolução**:
  1. Garantir que o `vercel.json` contenha o rewrite padrão de SPA:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```

### 4.4 Alerta de Tamanho de Chunks no Build (> 500 kB)

- **Sintoma**: O Vite exibe aviso de chunks volumosos durante o `npm run build`.
- **Diagnóstico**: Módulos pesados importados estaticamente no mesmo bundle.
- **Ações de Resolução**:
  1. Utilizar importações dinâmicas (`React.lazy` ou `import()`) para componentes que não precisam estar na carga inicial.
  2. Configurar a divisão de vendors no `vite.config.ts` se necessário.

### 4.5 Falha de Autenticação no Vercel MCP

- **Sintoma**: O MCP retorna `401 Unauthorized` ou ferramentas não aparecem.
- **Diagnóstico**: Token expirado ou sessão OAuth necessitando de renovação.
- **Ações de Resolução**:
  1. Reiniciar a conexão no cliente MCP.
  2. Confirmar a autorização na tela do navegador Vercel.
  3. Validar se o endpoint do projeto está correto: `https://mcp.vercel.com/contatopborgesj-8577s-projects/daily-kanban`.

---

## 5. Regras Rígidas de Segurança e Governança

1. **Zero Segredos no Repositório**:
   - O diretório `.vercel` e todos os arquivos `.env*` estão obrigatoriamente protegidos no `.gitignore`.
   - **Nunca** comite arquivos com sufixo `.env`, `.env.local` ou qualquer diretório interno da Vercel.
2. **Ciclo de Qualidade Obrigatório**:
   - Todo deployment deve ser validado localmente com:
     - `npm run lint` (0 erros, 0 warnings)
     - `npm run typecheck` (0 erros de tipagem)
     - `npm run test:run` (100% dos testes passando)
     - `npm run build` (compilação limpa)
3. **Fluxo Git**:
   - Nunca realize push direto para a branch `main`.
   - Crie branches semânticas (`feat/...`, `fix/...`, `chore/...`), abra Pull Request e acompanhe os checks do GitHub Actions e o Preview da Vercel antes do merge.
