# Contributing to DailyFlow Kanban

Thank you for your interest in contributing to DailyFlow Kanban! We welcome contributions from everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branching & Commit Standards](#branching--commit-standards)
- [Testing & Quality Checks](#testing--quality-checks)
- [Pull Request Workflow](#pull-request-workflow)

## Code of Conduct

All contributors are expected to be respectful and constructive. Harassment or abusive behavior will not be tolerated.

## How to Contribute

1. **Report Bugs**: Use our Bug Report issue template.
2. **Suggest Features**: Use our Feature Request issue template.
3. **Submit Improvements**: Create a branch and submit a PR following our standards.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/PauloBJr-dev/daily-kanban.git
cd daily-kanban

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

## Branching & Commit Standards

### Branch Naming

- Features: `feat/short-description`
- Bug fixes: `fix/short-description`
- Documentation: `docs/short-description`
- Maintenance: `chore/short-description`

### Conventional Commits

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `style:` Formatting changes
- `chore:` Build scripts, dependencies, CI

## Testing & Quality Checks

Before submitting a PR, ensure all checks pass locally:

```bash
# Format check
npm run format:check

# Lint
npm run lint

# Type check
npm run typecheck

# Tests
npm run test:run

# Build
npm run build
```

## Pull Request Workflow

1. Push your branch to GitHub.
2. Open a PR against the `main` branch.
3. Fill in all sections of the PR template.
4. Ensure all CI checks pass.
