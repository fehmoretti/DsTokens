# AGENTS.MD - Documentação da Base Next.js Frontend React

Propósito

Este arquivo define **regras, padrões obrigatórios e contexto arquitetural** que **agentes automáticos (IA)** devem seguir ao interagir, gerar código ou modificar este repositório frontend **Next.js + React** .
Ele funciona como **fonte única de verdade operacional** para decisões técnicas, estilo de código e estrutura do projeto.

Qualquer saída gerada por agentes **DEVE** respeitar integralmente este documento.

---

## Stack Tecnológica (Obrigatória)

- Next.js 16 (App Router)
- React 19
- TypeScript 5 (`<span>strict: true</span>`)
- Mantine UI 8
- TanStack React Query 5
- NextAuth.js 4 (JWT)
- Zod (validação)
- React Hook Form
- Axios
- PNPM (obrigatório)
- Node.js >= 20

---

## Arquitetura Base

### Regra Fundamental

O projeto utiliza **Feature-Based Architecture** .
Nenhum código novo deve ser criado fora dessa arquitetura.

src/features/[feature]/

├── components/
├── schemas/
├── services/
│ ├── [feature].hooks.ts
│ └── [feature].types.ts
└── index.ts

Cada feature é **autocontida** , sem dependências diretas de outras features.

---

## Estrutura Global do Projeto

src/

├── app/ # Rotas (App Router)
├── components/ # Componentes reutilizáveis globais
├── configs/ # Axios, Mantine, NextAuth
├── constants/ # Rotas e constantes
├── features/ # Features (obrigatório)
├── hooks/ # Hooks compartilhados
├── providers/ # Context Providers
├── types/ # Tipos globais
└── utils/ # Utilitários

Agentes **NÃO DEVEM** :

- Criar lógica de negócio em `<span>components/</span>`
- Criar chamadas de API fora de `<span>features/*/services</span>`

---

## Regras de Código (Obrigatórias)

### TypeScript

- `<span>strict: true</span>`
- Tipagem explícita em funções públicas
- Proibido `<span>any</span>`
- Proibido ignorar erros de tipo

### Nomenclatura

| Tipo             | Padrão                            |
| ---------------- | --------------------------------- |
| Componentes      | PascalCase                        |
| Hooks            | camelCase (`<span>useX</span>`)   |
| Tipos/Interfaces | PascalCase                        |
| Schemas          | PascalCase +`<span>Schema</span>` |
| Constantes       | UPPER_SNAKE_CASE                  |

---

## React & Next.js

### Componentes

- Server Components por padrão
- `<span>'use client'</span>`**somente** quando necessário
- Function components apenas

### Rotas

- `<span>app/(auth)</span>` → rotas públicas
- `<span>app/(private)</span>` → rotas protegidas
- `<span>page.tsx</span>` obrigatório
- `<span>layout.tsx</span>` para layouts compartilhados

---

## API & Estado Assíncrono

### Regra Absoluta

**Toda requisição HTTP deve usar React Query** .

### Padrões

- `<span>useAPIQuery</span>` → GET
- `<span>useAPIMutation</span>` → POST/PUT/PATCH/DELETE
- `<span>request()</span>` obrigatório
- `<span>queryKey</span>` obrigatório
- `<span>invalidateQueryKey</span>` obrigatório em mutations

### Proibido

- Axios direto em componentes
- Fetch manual
- Estado global para dados de API

---

## Validação de Dados

- Zod é obrigatório
- Schemas por feature
- Mensagens em português
- Integração com React Hook Form obrigatória

Nenhum dado deve ser enviado à API sem validação.

---

## Autenticação e Permissões

### Autenticação

- NextAuth.js com JWT
- Sessão acessada via `<span>AuthProvider</span>`

### Permissões (Claims)

- Definidas em `<span>features/auth</span>`
- Verificação via `<span>hasPermission()</span>`
- Rotas privadas exigem `<span>claims</span>`

Agentes **NÃO DEVEM** :

- Exibir ações sem checar permissões
- Ignorar claims em navegação

---

## Estilização

### Ordem de Prioridade

1. Props do Mantine
2. CSS Modules
3. Inline styles (exceção)

### Regras

1. **CSS Modules** por componente (sem estilos globais novos)
2. **Uso obrigatório de tokens de design** para cores, tipografia, espaçamento, radius e sombras
3. **Cores primárias, secundárias e terciárias** devem sempre vir de tokens (nunca hardcoded)
4. **Suporte a tema light e dark** via tokens (nada de condicional manual com hex em componentes)
5. **Uso de variáveis CSS do Mantine** e das variáveis geradas a partir dos tokens
6. Nenhum CSS global novo além do que já existir no projeto

Detalhamento completo de tokens, paleta (primária/secundária/terciária), modo light/dark e mapeamento para Mantine está em:

- `STYLE_GUIDE.md` — referência de tokens e sistema de design
- `FIGMA_TOKENS_SETUP.md` — passo a passo para designers configurarem tokens no Figma alinhados ao código e à IA/MCP

---

## Qualidade e Segurança

### Obrigatório

- Tratar todos os erros de API
- Usar `<span>getResponseError</span>` e `<span>handleFieldErrors</span>`
- Nunca expor secrets
- Usar variáveis de ambiente

### Proibido

- `<span>console.log</span>`
- Hardcode de valores
- Lógica complexa em componentes

---

## Commits e Automação

- Conventional Commits (obrigatório)
- Lint e typecheck antes de commit
- Husky ativo

Agentes **NÃO DEVEM** gerar commits fora do padrão.

---

## Anti‑Padrões (Nunca Fazer)

- ❌ Estado global desnecessário
- ❌ Duplicação de código
- ❌ Validação apenas no frontend
- ❌ Componentes grandes
- ❌ Ignorar erros TypeScript

---

## Responsabilidade do Agente

Ao gerar código, o agente deve:

1. Respeitar esta arquitetura
2. Manter consistência com o projeto existente
3. Priorizar legibilidade e previsibilidade
4. Não introduzir dependências novas sem justificativa
5. Preservar padrões existentes

Se houver conflito entre criatividade e padrão, **o padrão vence** .

## Índice

1. [Visão Geral](#-visão-geral)
2. [Estrutura de Diretórios](#-estrutura-de-diretórios)
3. [Arquitetura e Padrões](#️-arquitetura-e-padrões)
4. [Padrões de Código](#-padrões-de-código)
5. [Boas Práticas](#-boas-práticas)
6. [Configurações Importantes](#-configurações-importantes)
7. [Sistema de Autenticação](#-sistema-de-autenticação)
8. [Configuração do Axios](#-configuração-do-axios)
9. [Hooks Customizados](#-hooks-customizados)
10. [Utilitários de API](#️-utilitários-de-api)
11. [Tipos e Interfaces](#-tipos-e-interfaces-importantes)
12. [Componentes Principais](#-componentes-principais)
13. [Exemplos Completos](#-exemplos-completos-de-código)
14. [Fluxos Comuns](#-fluxos-comuns)
15. [Padrões de Navegação](#-padrões-de-navegação)
16. [Tema Mantine](#-tema-mantine)
17. [Estrutura Detalhada de Features](#-estrutura-detalhada-de-features)
18. [CSS Modules e Estilização](#-css-modules-e-estilização)
19. [Gerenciamento de Estado](#-gerenciamento-de-estado)
20. [Convenções de Nomenclatura](#-convenções-de-nomenclatura)
21. [Scripts Disponíveis](#-scripts-disponíveis)
22. [Docker](#-docker)
23. [Recursos Adicionais](#-recursos-adicionais)
24. [Regras Importantes](#️-regras-importantes)

---

## 🚀 Guia Rápido de Referência

### Criar uma Nova Feature

```bash
# 1. Criar estrutura de pastas
features/my-feature/
├── components/
│   └── index.ts
├── schemas/
│   └── my-feature.schema.ts
├── services/
│   ├── my-feature.hooks.ts
│   └── my-feature.types.ts
└── index.ts

# 2. Definir tipos
# 3. Criar schemas Zod
# 4. Implementar hooks de API
# 5. Criar componentes
# 6. Adicionar rota em constants/routes/
# 7. Criar página em app/(private)/my-feature/page.tsx
```

### Padrão de Hook de API

```typescript
const URL_CONTROLLER = 'my-feature';
const QUERY_KEY = 'my-feature';

export function useMyFeature(query?: Query) {
  return useAPIQuery<Response>({
    url: URL_CONTROLLER,
    queryKey: [QUERY_KEY, query],
    params: query,
  });
}

export function useCreateMyFeature() {
  return useAPIMutation<void, CreateRequest>({
    mutationFn: (data) => request(URL_CONTROLLER, 'POST', { data }),
    successMessage: 'Criado com sucesso',
    errorMessage: 'Falha ao criar',
    invalidateQueryKey: [QUERY_KEY],
  });
}
```

### Padrão de Componente de Página

```typescript
'use client';
import { PageWrapper } from '@/components';
import { privateRoutes } from '@/constants';

export function MyFeaturePage() {
  return (
    <PageWrapper title={privateRoutes.myFeature.name}>
      {/* Conteúdo */}
    </PageWrapper>
  );
}
```

---

## 📋 Visão Geral

Este é um projeto frontend moderno construído com:

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Mantine UI 8** (biblioteca de componentes)
- **TanStack React Query 5** (gerenciamento de estado assíncrono)
- **NextAuth.js 4** (autenticação)
- **Zod** (validação de esquemas)
- **React Hook Form** (formulários)
- **Axios** (cliente HTTP)

**Gerenciador de pacotes:** PNPM (obrigatório)
**Node.js:** >= 20.0.0
**PNPM:** >= 10.0.0

---

## 📁 Estrutura de Diretórios

```
src/
├── app/                    # Rotas e páginas (Next.js App Router)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (private)/         # Grupo de rotas privadas
│   ├── api/               # API Routes do Next.js
│   ├── layout.tsx         # Layout raiz
│   ├── error.tsx          # Página de erro global
│   ├── loading.tsx        # Loading global
│   └── not-found.tsx      # Página 404
│
├── components/            # Componentes reutilizáveis
│   ├── data-display/     # Componentes de exibição de dados
│   ├── forms/            # Componentes de formulário
│   ├── layout/           # Componentes de layout
│   ├── navigation/       # Componentes de navegação
│   ├── providers/        # Wrappers de providers
│   └── index.ts          # Barrel exports
│
├── configs/              # Configurações
│   ├── axios/            # Configuração do Axios e interceptors
│   ├── mantine/          # Configuração do tema Mantine
│   ├── next-auth/        # Configuração do NextAuth
│   └── env/              # Configuração de variáveis de ambiente
│
├── constants/            # Constantes globais
│   └── routes/           # Definições de rotas
│
├── features/             # Módulos funcionais (Feature-based)
│   ├── auth/            # Módulo de autenticação
│   ├── users/           # Módulo de usuários
│   ├── roles/           # Módulo de perfis/roles
│   └── claims/          # Módulo de claims/permissões
│
├── hooks/               # Hooks customizados compartilhados
│   ├── useAPIQuery.ts   # Hook para queries
│   ├── useAPIMutation.ts # Hook para mutations
│   ├── usePageFilters.ts
│   └── useQueryString.ts
│
├── providers/           # Context providers
│   ├── AuthProvider/
│   ├── MantineProvider/
│   └── ReactQueryProvider/
│
├── types/               # Tipagens TypeScript compartilhadas
│   ├── api.types.ts
│   ├── page.types.ts
│   ├── routes.types.ts
│   └── index.ts
│
└── utils/               # Funções utilitárias
    ├── api/             # Utilitários de API
    └── ...              # Outras utilidades
```

---

## 🏗️ Arquitetura e Padrões

### Feature-Based Architecture

O projeto segue uma arquitetura baseada em features. Cada feature é um módulo autocontido com:

```
features/
└── [feature-name]/
    ├── components/      # Componentes específicos da feature
    │   └── index.ts    # Barrel exports
    ├── schemas/         # Schemas Zod para validação
    ├── services/        # Hooks e tipos relacionados à API
    │   ├── [feature].hooks.ts
    │   └── [feature].types.ts
    └── index.ts         # Barrel exports da feature
```

**Exemplo:** `features/users/` contém tudo relacionado a usuários.

### Padrão de Componentes

1. **Estrutura de Componente:**

   ```
   ComponentName/
   ├── index.tsx              # Componente principal
   ├── ComponentName.module.css  # Estilos (CSS Modules)
   └── SubComponent/          # Sub-componentes (se necessário)
   ```

2. **Nomenclatura:**

   - Componentes: PascalCase (`UsersTable`, `PageWrapper`)
   - Arquivos de componente: `index.tsx` dentro da pasta do componente
   - CSS Modules: `[ComponentName].module.css`

3. **Barrel Exports:**
   - Sempre criar `index.ts` para exportar componentes
   - Usar `export * from './ComponentName'` para facilitar imports

### Padrão de Rotas

1. **App Router do Next.js:**

   - Usar grupos de rotas `(auth)` e `(private)` para layouts compartilhados
   - Páginas devem estar em `page.tsx`
   - Layouts devem estar em `layout.tsx`
   - Rotas nunca devem conter o prefixo do grupo

2. **Definição de Rotas:**
   - Rotas privadas: `src/constants/routes/routes.private.ts`
   - Rotas públicas: `src/constants/routes/routes.public.ts`
   - Cada rota deve ter: `path`, `name`, `icon`, `claims` (permissões)

### Padrão de API

1. **Hooks de API:**

   - Usar `useAPIQuery` para GET requests
   - Usar `useAPIMutation` para POST/PUT/PATCH/DELETE
   - Sempre definir `queryKey` para cache do React Query
   - Incluir `invalidateQueryKey` nas mutations para atualizar cache

2. **Estrutura de Hooks:**

   ```typescript
   const URL_CONTROLLER = 'users';
   const QUERY_KEY = 'users';

   export function useUsers(query?: ListUsersQuery) {
     return useAPIQuery<ListUsersResponse>({
       url: URL_CONTROLLER,
       queryKey: [QUERY_KEY, { ...query }],
       enabled: !!query?.page,
       params: { ...query },
     });
   }

   export function useCreateUser() {
     return useAPIMutation<void, CreateUserRequest>({
       mutationFn: (data) => request(URL_CONTROLLER, 'POST', { data }),
       successMessage: 'Usuário criado com sucesso',
       errorMessage: 'Falha ao criar usuário',
       invalidateQueryKey: [QUERY_KEY],
     });
   }
   ```

3. **Request Utility:**
   - Sempre usar `request()` de `@/utils/api/request`
   - Tipar o retorno: `request<ResponseType>(url, method, config)`

### Padrão de Validação

1. **Zod Schemas:**

   - Criar schemas em `features/[feature]/schemas/`
   - Usar `z.object()` para objetos
   - Mensagens de erro em português
   - Reutilizar schemas base quando possível

   ```typescript
   const BaseSchema = z.object({
     name: z.string().min(1, { message: 'Nome é obrigatório' }),
     email: z.string().email({ message: 'Endereço de e-mail inválido' }),
   });

   export const UserCreateSchema = BaseSchema.extend({});
   export const UserEditSchema = BaseSchema.extend({});
   ```

2. **React Hook Form:**
   - Usar `@hookform/resolvers/zod` para integração
   - Sempre tipar o formulário com o schema Zod

---

## 🎨 Padrões de Código

### TypeScript

1. **Configuração:**

   - `strict: true` habilitado
   - Path alias `@/*` aponta para `./src/*`
   - Sempre usar tipos explícitos em funções públicas

2. **Nomenclatura:**

   - Interfaces/Types: PascalCase (`User`, `ListUsersQuery`)
   - Variáveis/Funções: camelCase (`getAllQueryParams`, `toggleModal`)
   - Constantes: UPPER_SNAKE_CASE (`APP_NAME`, `QUERY_KEY`)
   - Enums: PascalCase (`ModalType`, `SortDirection`)

3. **Props de Componentes:**
   - Sempre tipar props com interfaces/types
   - Usar `readonly` quando apropriado
   - Props vazias: `type ComponentProps = {}`

### React

1. **Componentes:**

   - Preferir function components
   - Usar `'use client'` apenas quando necessário (interatividade, hooks)
   - Server Components por padrão (App Router)

2. **Hooks:**

   - Custom hooks devem começar com `use`
   - Sempre retornar objetos/arrays tipados
   - Documentar dependências do `useEffect`

3. **Estado:**
   - Usar `useState` para estado local
   - Usar React Query para estado assíncrono
   - Evitar prop drilling (usar Context quando necessário)

### Imports

1. **Ordem de Imports:**

   ```typescript
   // 1. Bibliotecas externas
   import { useState, useEffect } from 'react';
   import { IconUser } from '@tabler/icons-react';

   // 2. Imports internos (usando path alias @/)
   import { PageWrapper } from '@/components';
   import { useAPIQuery } from '@/hooks/useAPIQuery';
   import { privateRoutes } from '@/constants';

   // 3. Imports relativos da mesma feature
   import { UsersTable } from './UsersTable';
   ```

2. **Path Aliases:**
   - Sempre usar `@/` para imports de `src/`
   - Nunca usar imports relativos longos (`../../../`)

### CSS e Estilização

1. **CSS Modules:**

   - Usar CSS Modules para estilos de componentes
   - Nome do arquivo: `[ComponentName].module.css`
   - Importar como: `import styles from './Component.module.css'`
   - Classes devem consumir **tokens de design** via variáveis CSS (ex: `var(--color-primary-500)`, `var(--space-md)`)

2. **Mantine:**
   - Preferir componentes e props do Mantine para estilização
   - Usar tema customizado em `src/configs/mantine/theme/`, que **mapeia diretamente os tokens definidos em `STYLE_GUIDE.md`**
   - CSS Modules apenas quando necessário
   - Props relacionadas a cores (ex: `color`, `c`, `bg`, `variant`) devem usar **tokens semânticos** (ex: `primary`, `secondary`, `danger`) configurados no tema, nunca hex literal

3. **Proibições de estilização:**

   - Proibido declarar cores diretamente em componentes (`'#1E90FF'`, `'#000'`, etc.)
   - Proibido declarar fontes, espaçamentos ou radius literais fora dos arquivos de tokens/tema
   - Qualquer novo token ou ajuste de paleta deve ser documentado em `STYLE_GUIDE.md` e refletido na configuração do Figma em `FIGMA_TOKENS_SETUP.md`

---

## ✅ Boas Práticas

### Desenvolvimento

1. **Commits:**

   - Seguir [Conventional Commits](https://www.conventionalcommits.org/)
   - Formato: `type(scope): description`
   - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Commits são validados automaticamente via Husky

2. **Linting e Formatação:**

   - Executar `pnpm lint` antes de commitar
   - Usar `pnpm format` para formatar código
   - ESLint e Prettier configurados automaticamente
   - `lint-staged` executa automaticamente no pre-commit

3. **Type Checking:**
   - Executar `pnpm typecheck` antes de commitar
   - Resolver todos os erros de tipo antes de fazer push

### Código

1. **Performance:**

   - Usar React Query para cache e sincronização
   - Implementar paginação em listas grandes
   - Lazy loading de componentes pesados quando necessário

2. **Acessibilidade:**

   - Usar componentes do Mantine (já acessíveis)
   - Sempre incluir `aria-label` em elementos interativos
   - Manter contraste adequado de cores

3. **Segurança:**

   - Validação sempre no cliente E servidor
   - Nunca expor tokens/secrets no código
   - Usar variáveis de ambiente para configurações sensíveis

4. **Tratamento de Erros:**

   - Sempre tratar erros de API
   - Usar `getResponseError()` de `@/utils/api/getResponseError`
   - Exibir mensagens de erro amigáveis ao usuário

5. **Reutilização:**
   - Criar componentes reutilizáveis em `src/components/`
   - Extrair lógica comum para hooks customizados
   - Evitar duplicação de código

### Estrutura de Features

1. **Criando uma Nova Feature:**

   ```
   features/new-feature/
   ├── components/
   │   ├── NewFeatureListPage/
   │   │   ├── index.tsx
   │   │   └── NewFeatureTable/
   │   │       └── index.tsx
   │   └── index.ts
   ├── schemas/
   │   └── new-feature.schema.ts
   ├── services/
   │   ├── new-feature.hooks.ts
   │   └── new-feature.types.ts
   └── index.ts
   ```

2. **Checklist ao Criar Feature:**
   - [ ] Criar estrutura de pastas
   - [ ] Definir tipos em `*.types.ts`
   - [ ] Criar schemas Zod
   - [ ] Implementar hooks de API
   - [ ] Criar componentes
   - [ ] Adicionar rota em `constants/routes/`
   - [ ] Criar página em `app/(private)/[feature]/page.tsx`
   - [ ] Exportar no `index.ts` da feature

---

## 🔧 Configurações Importantes

### ESLint

- Proibido `console.log` (permitido apenas `console.warn` e `console.error`)
- Variáveis não utilizadas são erros (prefixar com `_` para ignorar)
- Imports não utilizados são erros
- Imports cíclicos são erros
- Prettier integrado como regra

### TypeScript

- `strict: true` - modo estrito habilitado
- Path alias `@/*` configurado
- Tipos do Next.js incluídos automaticamente

### Next.js

- Output: `standalone` (para Docker)
- App Router habilitado
- TypeScript estrito

### Autenticação

- NextAuth.js com JWT
- Configuração em `src/configs/next-auth/`
- Claims/permissões em `src/features/claims/`
- Rotas protegidas via middleware/layout

### Variáveis de Ambiente

Variáveis importantes do projeto:

- `NEXT_PUBLIC_API_URL` - URL base da API (cliente)
- `NEXT_SERVER_API_URL` - URL base da API (server-side, para NextAuth)
- `NEXTAUTH_URL` - URL da aplicação
- `NEXTAUTH_SECRET` - Secret para JWT
- `NEXT_PUBLIC_APP_NAME` - Nome da aplicação
- `NEXT_PUBLIC_APP_DESCRIPTION` - Descrição da aplicação
- `NEXT_PUBLIC_APP_LANGUAGE` - Idioma padrão (pt-BR)

Sempre adicionar as variáveis em `src/configs/env/schema` para que haja validação das mesmas.

Deve seguir esse padrão:

```ts
import { z } from 'zod';

export const EnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({ required_error: 'NEXT_PUBLIC_API_URL é obrigatória' })
    .url({ message: 'NEXT_PUBLIC_API_URL inválida' }),
  NEXT_SERVER_API_URL: z
    .string({ required_error: 'NEXT_SERVER_API_URL é obrigatória' })
    .url({ message: 'NEXT_SERVER_API_URL inválida' }),
  NEXTAUTH_URL: z
    .string({ required_error: 'NEXTAUTH_URL é obrigatória' })
    .url({ message: 'NEXTAUTH_URL inválida' }),
  NEXTAUTH_SECRET: z
    .string({ required_error: 'NEXTAUTH_SECRET é obrigatória' })
    .min(1, { message: 'NEXTAUTH_SECRET é obrigatória' }),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('Next Frontend'),
  NEXT_PUBLIC_APP_DESCRIPTION: z
    .string()
    .optional()
    .default('Next Frontend Development'),
  NEXT_PUBLIC_APP_LANGUAGE: z.string().optional().default('pt-BR'),

  // ADICIONE OUTRAS VARIÁVEIS DO PROJETO
});
export type EnvVars = z.infer<typeof EnvSchema>;
```

Para obter as variáveis de ambiente, utilize o `getEnv.ts`.

```ts
import { env } from './configs/env/getEnv';

const secret = env.NEXTAUTH_SECRET;
```

---

## 🧩 Estrutura Detalhada de Features

### Componentes dentro de Features

Componentes de features geralmente seguem esta estrutura:

```
features/users/components/
├── UsersListPage/
│   ├── index.tsx                    # Página principal
│   ├── UsersTable/
│   │   └── index.tsx               # Tabela de listagem
│   ├── UsersCreateOrEditModal/
│   │   └── index.tsx               # Modal de criação/edição
│   └── UsersFilters/
│       └── index.tsx               # Componente de filtros
└── index.ts                         # Barrel exports
```

**Padrões:**

- Página principal: `[Feature]ListPage`
- Tabela: `[Feature]Table`
- Modal: `[Feature]CreateOrEditModal`
- Filtros: `[Feature]Filters`

### Organização de Tipos

```typescript
// users.types.ts
export interface User {
  id?: string;
  name: string;
  email: string;
  role: SimpleResult;
  status: boolean;
}

// Tipos de resposta
export type ListUsersResponse = ListResponse<User>;
export type ListUsersQuery = BaseQuery<User>;

// Tipos de requisição
export interface CreateUserRequest {
  name: string;
  email: string;
  roleId: string;
}

export interface EditUserRequest {
  id?: string;
  name: string;
  email: string;
  roleId: string;
}
```

### Padrão de Schemas

Schemas devem ser específicos para cada operação:

```typescript
// users.schema.ts
import { z } from 'zod';

// Schema base reutilizável
const BaseSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
});

// Schemas específicos
export const UserCreateSchema = BaseSchema.extend({
  roleId: z.string().min(1, { message: 'Perfil é obrigatório' }),
});

export const UserEditSchema = BaseSchema.extend({
  roleId: z.string().min(1, { message: 'Perfil é obrigatório' }),
});
```

---

## 🎨 CSS Modules e Estilização

### CSS Modules

CSS Modules são usados para estilos específicos de componentes:

```css
/* PageWrapper.module.css */
.pageWrapper {
  padding: var(--space-md); /* token de espaçamento do projeto */
}

.title {
  font-size: var(--font-size-xl); /* token de tipografia */
}
```

```typescript
// Uso no componente
import styles from './PageWrapper.module.css';

<div className={styles.pageWrapper}>
  <h1 className={styles.title}>Título</h1>
</div>
```

### Variáveis CSS do Mantine

O Mantine expõe variáveis CSS que podem ser usadas:

```css
.myComponent {
  padding: var(--space-md); /* token de espaçamento do projeto */
  color: var(--color-primary-600); /* token de cor primária (mapeado para Mantine) */
  border-radius: var(--radius-md); /* token de radius */
  font-size: var(--font-size-sm); /* token de tipografia */
}
```

### Preferências de Estilização

1. **Primeira opção:** Props do Mantine (ex: `p="md"`, `c="red"`)
2. **Segunda opção:** CSS Modules para estilos complexos
3. **Terceira opção:** Inline styles apenas quando necessário

### Tokens e Temas (Light/Dark)

- O projeto deve manter **um único conjunto de tokens semânticos** (ex: `color-bg-surface`, `color-fg-primary`, `color-border-subtle`) com **dois modos de tema**: `light` e `dark`.
- Os valores físicos de cor (hex, rgb) vivem apenas:
  - Nos arquivos de tokens (definidos em `STYLE_GUIDE.md` e aplicados em `src/configs/mantine/theme/`)
  - Nos arquivos de configuração de tokens do Figma (ver `FIGMA_TOKENS_SETUP.md`)
- Componentes não devem conhecer se estão em light ou dark; eles apenas usam tokens (`var(--color-bg-surface)`) e o tema aplica o valor correto por modo.

---

## 🔄 Gerenciamento de Estado

### Estado Local

Use `useState` para estado local simples:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<User>();
```

### Estado Assíncrono

Use React Query para dados da API:

```typescript
// Cache automático, refetch, invalidação
const { data, isLoading } = useUsers(filters);
```

### Estado Global

Use Context API para estado compartilhado:

```typescript
// Já implementado: AuthProvider
const { session } = useAuth();
```

### Estado de Formulário

Use React Hook Form:

```typescript
const form = useForm({
  resolver: zodResolver(MySchema),
  defaultValues: { name: '', email: '' },
});
```

---

## 🧪 Testes

### Estrutura de Testes

- Testes E2E: (a definir)
- Testes unitários: (a definir)
- Testes de integração: (a definir)

---

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas

- **Componentes:** PascalCase (`UsersTable`, `PageWrapper`)
- **Hooks:** camelCase com prefixo `use` (`useAPIQuery`, `useUsers`)
- **Utils:** camelCase (`formatDate`, `getResponseError`)
- **Types:** PascalCase (`User`, `ListUsersQuery`)
- **Constantes:** UPPER_SNAKE_CASE (`APP_NAME`, `QUERY_KEY`)
- **Schemas:** PascalCase com sufixo `Schema` (`UserCreateSchema`)

### Variáveis e Funções

- **Variáveis:** camelCase (`selectedUser`, `showModal`)
- **Funções:** camelCase (`toggleModal`, `getAllQueryParams`)
- **Constantes:** UPPER_SNAKE_CASE ou camelCase (dependendo do escopo)
- **Enums:** PascalCase (`ModalType.CREATE`)

### Imports

- Sempre usar path alias `@/` para imports de `src/`
- Agrupar imports: externos → internos (@/) → relativos
- Usar barrel exports quando disponível

---

## 🚀 Scripts Disponíveis

- `pnpm dev` - Inicia servidor de desenvolvimento (porta 3000)
- `pnpm build` - Gera build de produção (otimizado)
- `pnpm start` - Inicia servidor com build de produção
- `pnpm format` - Formata código com Prettier (todos os arquivos)
- `pnpm lint` - Executa ESLint (apenas verifica)
- `pnpm lint:fix` - Corrige problemas de lint automaticamente
- `pnpm typecheck` - Verifica tipos TypeScript (sem gerar arquivos)
- `pnpm prepare` - Instala hooks do Husky (executado automaticamente)

### Scripts Automáticos

- **Pre-commit (Husky):** Executa `lint-staged` (Prettier + ESLint)
- **Commit-msg (Husky):** Valida formato de commit (Conventional Commits)

---

## 🐳 Docker

### Build e Deploy

- **Dockerfile:** Configurado para build standalone do Next.js
- **docker-compose.build.yml:** Arquivo de composição para build
- **Output:** Standalone (otimizado para containers)

### Comandos Docker

```bash
# Build da imagem
docker build -t my-app .

# Build com docker-compose
docker compose -f docker-compose.build.yml up --build

# Executar container
docker run -p 3000:3000 my-app
```

### Variáveis de Ambiente no Docker

Certifique-se de definir todas as variáveis de ambiente necessárias no container.

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Mantine UI:** https://mantine.dev/llms.txt - Componentes e hooks
- **Next.js:** https://nextjs.org/docs/llms-full.txt - Framework React
- **React Query:** https://tanstack.com/query/latest - Gerenciamento de estado assíncrono
- **Zod:** https://zod.dev/ - Validação de schemas
- **NextAuth.js:** https://next-auth.js.org/ - Autenticação
- **React Hook Form:** https://react-hook-form.com/ - Formulários
- **Tabler Icons:** https://tabler.io/icons - Biblioteca de ícones

### Ferramentas

- **TypeScript:** https://www.typescriptlang.org/ - Tipagem estática
- **ESLint:** https://eslint.org/ - Linter
- **Prettier:** https://prettier.io/ - Formatador
- **PNPM:** https://pnpm.io/ - Gerenciador de pacotes

---

## ⚠️ Regras Importantes

### Obrigatórias

1. **NUNCA** commitar sem passar no lint e typecheck
2. **SEMPRE** seguir Conventional Commits (validado automaticamente)
3. **SEMPRE** usar path alias `@/` para imports (nunca `../../../`)
4. **SEMPRE** tipar props e retornos de funções
5. **SEMPRE** criar barrel exports (`index.ts`) para features e componentes
6. **NUNCA** usar `console.log` (apenas `console.warn` ou `console.error`)
7. **SEMPRE** validar dados com Zod antes de enviar à API
8. **SEMPRE** tratar erros de API adequadamente
9. **SEMPRE** usar React Query para requisições assíncronas
10. **SEMPRE** seguir a estrutura de features para novos módulos
11. **SEMPRE** adicionar as variáveis de ambiente no arquivo `src/configs/env/schema.ts` para validação e tipagem
12. **SEMPRE** importar as variáveis de ambiente usando o `src/configs/env/getEnv.ts` ao invés de `process.env`

### Recomendações Fortes

11. **SEMPRE** usar componentes do Mantine quando disponíveis
12. **SEMPRE** usar `PageWrapper` para páginas
13. **SEMPRE** usar `PaginatedTable` para listagens paginadas
14. **SEMPRE** sincronizar filtros com query string
15. **SEMPRE** invalidar cache após mutations
16. **SEMPRE** exibir mensagens de sucesso/erro nas mutations
17. **SEMPRE** usar `handleFieldErrors` para erros de validação da API
18. **SEMPRE** verificar permissões antes de exibir ações
19. **SEMPRE** usar `readonly` em props quando apropriado
20. **SEMPRE** documentar lógica complexa com comentários

### Anti-padrões (Evitar)

- ❌ Imports relativos longos (`../../../`)
- ❌ Estado global desnecessário (preferir React Query)
- ❌ Validação apenas no cliente
- ❌ Hardcode de valores (usar constantes)
- ❌ Componentes muito grandes (quebrar em menores)
- ❌ Lógica de negócio em componentes (extrair para hooks/utils)
- ❌ Duplicação de código (criar componentes/hooks reutilizáveis)
- ❌ Ignorar erros de TypeScript
- ❌ Commits sem mensagem descritiva
- ❌ Utilizar `process.env` diretamente

---

---

## 🔐 Sistema de Autenticação

### NextAuth.js Configuration

A autenticação é gerenciada pelo NextAuth.js com JWT. Configuração em `src/configs/next-auth/index.ts`:

1. **Providers:**

   - `credentials` - Login padrão (email/password)
   - `firstAccess` - Primeiro acesso (troca de senha obrigatória)

2. **Callbacks:**

   - `jwt`: Decodifica o token JWT e armazena informações do usuário
   - `session`: Disponibiliza dados do usuário na sessão
   - `redirect`: Gerencia redirecionamentos (ex: primeiro acesso)

3. **Fluxo de Autenticação:**

   ```
   Login → API retorna token → JWT decodificado → Dados armazenados no token
   → Sessão criada → Usuário autenticado
   ```

4. **Primeiro Acesso:**
   - Se API retorna `403 Forbidden`, redireciona para `/reset-password`
   - Usuário deve trocar senha antes de acessar o sistema

### Estrutura do JWT User

```typescript
interface JWTUser {
  sub: string; // ID do usuário
  name: string; // Nome completo
  email: string; // E-mail
  IsFirstAccess: string; // Flag de primeiro acesso
  Role: string; // Nome do perfil
  Claims: KnownClaims | KnownClaims[]; // Permissões (array ou string)
  exp: number; // Expiração
  iss: string; // Issuer
  aud: string; // Audience
}
```

### AuthProvider

O `AuthProvider` (`src/providers/AuthProvider/`) disponibiliza a sessão via Context:

```typescript
import { useAuth } from '@/providers/AuthProvider';

function MyComponent() {
  const { session } = useAuth();
  // session.user contém os dados do JWT
  // session.token contém o token JWT
}
```

### Sistema de Permissões (Claims)

1. **Definição de Claims:**

   - Claims são definidos em `src/features/auth/services/auth.types.ts`:

   ```typescript
   export enum KnownClaims {
     'list_users' = 'list_users',
     'list_roles' = 'list_roles',
   }
   ```

2. **Verificação de Permissões:**

   - Use `hasPermission()` de `@/utils/hasPermission`:

   ```typescript
   import { hasPermission } from '@/utils/hasPermission';
   import { KnownClaims } from '@/features/auth';

   const canListUsers = hasPermission(session?.user, [KnownClaims.list_users]);
   ```

3. **Rotas Protegidas:**
   - Rotas em `constants/routes/routes.private.ts` têm array `claims`
   - Navegação filtra rotas baseado em permissões via `getNavigationRoutes()`

---

## 🌐 Configuração do Axios

### Instância Base

A instância do Axios está em `src/configs/axios/index.ts`:

- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- Timeout: 60000ms (60 segundos)
- Interceptors configurados automaticamente

### Request Interceptor

O interceptor de requisição (`src/configs/axios/interceptors/request.ts`):

1. Adiciona token JWT no header `Authorization: Bearer {token}`
2. Obtém token da sessão do NextAuth
3. Ignora autenticação para rota `/auth`

```typescript
// Token é adicionado automaticamente em todas as requisições
// exceto para /auth
```

### Response Interceptor

O interceptor de resposta (`src/configs/axios/interceptors/response.tsx`):

1. Detecta erros `401 Unauthorized` ou `403 Forbidden`
2. Desloga usuário automaticamente (exceto em rotas de login)
3. Redireciona para página inicial

**Rotas que não redirecionam:**

- `/login`
- `/reset-password`

---

## 🎣 Hooks Customizados

### useAPIQuery

Hook para requisições GET com React Query:

```typescript
import { useAPIQuery } from '@/hooks/useAPIQuery';

const { data, isLoading, isFetching, error } = useAPIQuery<ResponseType>({
  url: 'users',
  queryKey: ['users', { page: 1 }],
  enabled: true, // Controla se a query executa
  params: { page: 1, search: 'test' },
});
```

**Parâmetros:**

- `url`: Endpoint da API (relativo à baseURL)
- `queryKey`: Chave única para cache do React Query
- `enabled`: Se `false`, query não executa
- `params`: Query params da URL

### useAPIMutation

Hook para requisições POST/PUT/PATCH/DELETE:

```typescript
import { useAPIMutation } from '@/hooks/useAPIMutation';

const { mutateAsync, isPending } = useAPIMutation<void, CreateUserRequest>({
  mutationFn: (data) => request('users', 'POST', { data }),
  successMessage: 'Usuário criado com sucesso',
  errorMessage: 'Falha ao criar usuário',
  invalidateQueryKey: ['users'], // Invalida cache após sucesso
});
```

**Características:**

- Exibe notificação de sucesso/erro automaticamente
- Invalida queries do React Query após sucesso
- Retorna `mutateAsync` para uso em `async/await`
- `isPending` indica estado de carregamento

### useQueryString

Hook para gerenciar query strings da URL:

```typescript
import { useQueryString } from '@/hooks/useQueryString';

const {
  getQueryParam, // Obtém um parâmetro
  getAllQueryParams, // Obtém todos os parâmetros
  setQueryParam, // Define um parâmetro
  setQueryParams, // Define múltiplos parâmetros
  clearQueryParams, // Limpa todos os parâmetros
} = useQueryString();

// Exemplo
const page = getQueryParam('page'); // '1' ou null
setQueryParam('page', '2'); // Atualiza URL e navega
```

**Uso comum:**

- Sincronizar filtros com URL
- Paginação baseada em URL
- Compartilhar estado via URL

### usePageFilters

Hook para gerenciar filtros de página com debounce:

```typescript
import { usePageFilters } from '@/hooks/usePageFilters';

const {
  opened, // Estado do drawer de filtros
  toggleDrawer, // Abre/fecha drawer
  localFilters, // Filtros locais (antes de aplicar)
  setLocalFilters, // Atualiza filtros locais
  updateFilter, // Atualiza um filtro específico
  applyFilters, // Aplica filtros (atualiza URL e estado)
  clearFilters, // Limpa todos os filtros
} = usePageFilters(filters, setFilters, {
  queryKeys: ['search', 'status'], // Chaves que vão para URL
  debounceKey: 'search', // Chave com debounce (opcional)
  defaultValues: { search: '', status: '' },
});
```

**Características:**

- Debounce automático para campo especificado
- Sincroniza com query string
- Gerencia drawer de filtros

---

## 🛠️ Utilitários de API

### request()

Função base para requisições HTTP:

```typescript
import { request } from '@/utils/api/request';

// GET
const users = await request<ListUsersResponse>('users', 'GET', {
  params: { page: 1 },
});

// POST
await request('users', 'POST', { data: { name: 'John' } });

// PUT
await request(`users/${id}`, 'PUT', { data: { name: 'Jane' } });

// PATCH
await request(`users/${id}/ChangeStatus`, 'PATCH');

// DELETE
await request(`users/${id}`, 'DELETE');
```

### getResponseError()

Extrai erros de campo da resposta da API:

```typescript
import { getResponseError } from '@/utils/api/getResponseError';

try {
  await createUser.mutateAsync(data);
} catch (error) {
  const fieldErrors = getResponseError<CreateUserRequest>(error);
  // Retorna: { name?: string, email?: string }
  // Formato compatível com React Hook Form
}
```

### handleFieldErrors()

Aplica erros de campo diretamente no React Hook Form:

```typescript
import { handleFieldErrors, hasFieldErrors } from '@/utils/api';

try {
  await createUser.mutateAsync(data);
} catch (error) {
  if (hasFieldErrors(error)) {
    handleFieldErrors<CreateUserRequest>(error, setError);
    // Erros são aplicados automaticamente nos campos do formulário
  }
}
```

### hasFieldErrors()

Verifica se o erro contém erros de campo:

```typescript
import { hasFieldErrors } from '@/utils/api';

if (hasFieldErrors(error)) {
  // Erro tem estrutura ResponseError com fieldErrors
}
```

---

## 📊 Tipos e Interfaces Importantes

### Tipos de API

```typescript
// Resposta paginada padrão
interface ListResponse<T> {
  items: T[];
  pagination: PaginationResponse;
}

interface PaginationResponse {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

// Query base para listagens
interface BaseQuery<T> {
  search?: string;
  isActive?: boolean | string;
  page?: number | string;
  pageSize?: number | string;
  sortDirection?: SortDirection | string;
  sortingProperty?: keyof T;
}

enum SortDirection {
  ASC = '0',
  DESC = '1',
}

// Erro da API
interface ResponseError<T = unknown> {
  name?: string;
  description?: string;
  fieldErrors?: Record<keyof T, string[]> | null;
  message?: string | null;
  statusCode?: string;
  details?: string | null;
}

// Resultado simples (para selects, etc)
interface SimpleResult {
  id: string;
  name: string;
}
```

### Tipos de Rotas

```typescript
interface RouteConfig {
  group?: string; // Grupo no menu (ex: 'Gestão')
  path: string; // Caminho da rota
  name: string; // Nome exibido
  icon?: React.ComponentType; // Ícone do Tabler Icons
  claims?: KnownClaims[]; // Permissões necessárias
}
```

---

## 🎨 Componentes Principais

### PageWrapper

Wrapper padrão para páginas com título e descrição:

```typescript
import { PageWrapper } from '@/components';

<PageWrapper
  title="Usuários"
  description="Gerencie informações dos usuários"
  rightSection={<Button>Criar</Button>}
>
  {/* Conteúdo da página */}
</PageWrapper>
```

**Props:**

- `title`: Título da página
- `description`: Descrição abaixo do título
- `rightSection`: Conteúdo alinhado à direita (botões, filtros, etc)

### PaginatedTable

Tabela paginada usando `mantine-datatable`:

```typescript
import { PaginatedTable } from '@/components';
import { DataTableColumn } from 'mantine-datatable';

const columns: DataTableColumn<User>[] = [
  { accessor: 'name', title: 'Nome' },
  { accessor: 'email', title: 'E-mail' },
  {
    accessor: 'role',
    title: 'Cargo',
    render: ({ role }) => (role as SimpleResult).name,
  },
];

<PaginatedTable<User, ListUsersQuery>
  filters={filters}
  data={data}
  columns={columns}
  isFetching={isFetching}
  entityName="usuário"
/>
```

**Características:**

- Paginação automática sincronizada com URL
- Loading state
- Empty state customizável
- Integração com React Query

### PrivateAppShell

Layout principal para rotas privadas:

```typescript
// app/(private)/layout.tsx
import { PrivateAppShell } from '@/components';

export default function PrivateLayout({ children }) {
  return <PrivateAppShell>{children}</PrivateAppShell>;
}
```

**Inclui:**

- Navbar lateral (com navegação baseada em permissões)
- Header superior (com menu do usuário)
- Área de conteúdo principal

---

## 🔍 Exemplos Completos de Código

### Exemplo 1: Página de Listagem Completa

```typescript
'use client';
import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components';
import { privateRoutes } from '@/constants';
import { useQueryString } from '@/hooks/useQueryString';
import { ListUsersQuery, User } from '../../services/users.types';
import { UsersTable } from './UsersTable';
import { UsersFilters } from './UsersFilters';
import { UsersCreateOrEditModal } from './UsersCreateOrEditModal';

enum ModalType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export function UsersListPage() {
  const { getAllQueryParams } = useQueryString();
  const [selected, setSelected] = useState<User>();
  const [filters, setFilters] = useState<ListUsersQuery>();
  const [showModal, setShowModal] = useState<ModalType>();

  const toggleModal = (modal?: ModalType) => {
    setShowModal(modal);
    if (!modal) {
      setSelected(undefined);
    }
  };

  // Sincroniza filtros com query string na inicialização
  useEffect(() => {
    const params = getAllQueryParams();
    setFilters({
      ...params,
      page: params.page ? Number(params.page) : 1,
    });
  }, []);

  return (
    <PageWrapper
      title={privateRoutes.users.name}
      description="Gerencie informações, permissões e o status dos usuários."
      rightSection={
        <UsersFilters
          filters={filters}
          setFilters={setFilters}
          toggleCreateModal={() => toggleModal(ModalType.CREATE)}
        />
      }
    >
      <UsersTable
        filters={filters}
        onEdit={(item) => {
          setSelected(item);
          toggleModal(ModalType.EDIT);
        }}
      />

      <UsersCreateOrEditModal
        user={selected}
        opened={showModal === ModalType.EDIT || showModal === ModalType.CREATE}
        toggle={() => toggleModal(undefined)}
      />
    </PageWrapper>
  );
}
```

### Exemplo 2: Tabela com Ações

```typescript
'use client';
import { ActionIcon, Group, Menu, Switch, Text } from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';
import { IconDotsVertical, IconEdit } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { ChangeEvent } from 'react';

import { PaginatedTable } from '@/components';
import { SimpleResult } from '@/types';
import { ListUsersQuery, User } from '../../../services/users.types';
import { useUsers, useUserToggleStatus } from '../../../services/users.hooks';

type UsersTableProps = {
  filters?: ListUsersQuery;
  onEdit: (user: User) => void;
};

export function UsersTable({ filters, onEdit }: UsersTableProps) {
  const { mutateAsync, isPending } = useUserToggleStatus();
  const { data, isFetching } = useUsers(filters);

  const handleToggleStatus = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    modals.openConfirmModal({
      title: 'Alterar status do usuário',
      children: <Text size="sm">Tem certeza que deseja alterar o status?</Text>,
      centered: true,
      labels: { confirm: 'Confirmar', cancel: 'Cancelar' },
      confirmProps: { loading: isPending },
      onConfirm: async () => await mutateAsync(id),
    });
  };

  const columns: DataTableColumn<User>[] = [
    { accessor: 'name', title: 'Nome' },
    { accessor: 'email', title: 'E-mail' },
    {
      accessor: 'role',
      title: 'Cargo',
      render: ({ role }) => (role as SimpleResult).name,
    },
    {
      accessor: 'status',
      title: 'Status',
      render: ({ status, id }) => (
        <Group justify="start">
          <Switch
            data-id={id}
            checked={status}
            onChange={handleToggleStatus}
          />
        </Group>
      ),
    },
    {
      accessor: 'id',
      title: '',
      render: (item) => (
        <Group justify="end">
          <Menu position="left-start">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDotsVertical size={24} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={20} />}
                onClick={() => onEdit(item)}
              >
                Ver detalhes
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  return (
    <PaginatedTable<User, ListUsersQuery>
      filters={filters}
      data={data}
      columns={columns}
      isFetching={isFetching}
      entityName="usuário"
    />
  );
}
```

### Exemplo 3: Modal de Criação/Edição

```typescript
'use client';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { handleFieldErrors, hasFieldErrors } from '@/utils/api';
import { SimpleResult } from '@/types';
import {
  CreateUserRequest,
  EditUserRequest,
  User,
} from '../../../services/users.types';
import { useCreateUser, useEditUser } from '../../../services/users.hooks';
import {
  UserCreateSchema,
  UserEditSchema,
} from '../../../schemas/users.schema';

type CreateOrEditUserRequest = CreateUserRequest | EditUserRequest;

export function UsersCreateOrEditModal({
  opened,
  user,
  toggle,
}: {
  opened: boolean;
  user?: User;
  toggle: () => void;
}) {
  const isEditMode = !!user;

  const form = useForm<CreateOrEditUserRequest>({
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      roleId: (user?.role as SimpleResult)?.id ?? '',
    },
    resolver: zodResolver(isEditMode ? UserEditSchema : UserCreateSchema),
  });

  useEffect(() => {
    form.clearErrors();
  }, [opened, form]);

  const { register, handleSubmit, setError, formState: { errors } } = form;
  const createUser = useCreateUser();
  const editUser = useEditUser();

  const onSubmit = async (values: CreateOrEditUserRequest) => {
    try {
      if (isEditMode) {
        await editUser.mutateAsync({
          ...(values as EditUserRequest),
          id: user!.id,
        });
      } else {
        await createUser.mutateAsync(values as CreateUserRequest);
      }
      toggle();
    } catch (error) {
      if (hasFieldErrors(error)) {
        handleFieldErrors<CreateOrEditUserRequest>(error, setError);
      }
    }
  };

  return (
    <Modal
      opened={opened}
      centered
      onClose={toggle}
      title={isEditMode ? 'Editar Usuário' : 'Cadastrar Usuário'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Digite o nome"
            {...register('name')}
            error={errors.name?.message}
          />
          <TextInput
            label="E-mail"
            placeholder="Digite o e-mail"
            {...register('email')}
            error={errors.email?.message}
          />
          <Group justify="flex-end">
            <Button variant="subtle" type="button" onClick={toggle}>
              Cancelar
            </Button>
            <Button
              variant="filled"
              type="submit"
              loading={isEditMode ? editUser.isPending : createUser.isPending}
            >
              {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

### Exemplo 4: Hooks de API Completos

```typescript
import { useAPIMutation } from '@/hooks/useAPIMutation';
import { useAPIQuery } from '@/hooks/useAPIQuery';
import { request } from '@/utils/api/request';
import { SortDirection } from '@/types';
import {
  ChangeUserPasswordRequest,
  CreateUserRequest,
  EditUserRequest,
  ListUsersQuery,
  ListUsersResponse,
} from './users.types';

const URL_CONTROLLER = 'users';
const QUERY_KEY = 'users';

// Query para listar usuários
export function useUsers(query?: ListUsersQuery) {
  return useAPIQuery<ListUsersResponse>({
    url: URL_CONTROLLER,
    queryKey: [QUERY_KEY, { ...query }],
    enabled: !!query?.page, // Só executa se tiver página
    params: {
      ...query,
      sortingProperty: 'name',
      sortDirection: SortDirection.ASC,
    },
  });
}

// Mutation para criar usuário
export function useCreateUser() {
  return useAPIMutation<void, CreateUserRequest>({
    mutationFn: (data) => request(URL_CONTROLLER, 'POST', { data }),
    successMessage: 'Usuário criado com sucesso',
    errorMessage: 'Falha ao criar usuário',
    invalidateQueryKey: [QUERY_KEY], // Atualiza lista após criar
  });
}

// Mutation para editar usuário
export function useEditUser() {
  return useAPIMutation<void, EditUserRequest>({
    mutationFn: (data) =>
      request(`${URL_CONTROLLER}/${data.id}`, 'PUT', { data }),
    successMessage: 'Usuário atualizado com sucesso',
    errorMessage: 'Falha ao atualizar usuário',
    invalidateQueryKey: [QUERY_KEY],
  });
}

// Mutation para alterar status
export function useUserToggleStatus() {
  return useAPIMutation<void, string>({
    mutationFn: (userId) =>
      request(`${URL_CONTROLLER}/${userId}/ChangeStatus`, 'PATCH'),
    successMessage: 'Status do usuário atualizado com sucesso',
    errorMessage: 'Falha ao atualizar o status do usuário',
    invalidateQueryKey: [QUERY_KEY],
  });
}
```

### Exemplo 5: Schema Zod Completo

```typescript
import { z } from 'zod';

const BaseSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Endereço de e-mail inválido' }),
  roleId: z.string().min(1, { message: 'Perfil é obrigatório' }),
});

export const UserCreateSchema = BaseSchema.extend({});

export const UserEditSchema = BaseSchema.extend({});

// Exemplo com validação customizada
export const PasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
      .regex(/[A-Z]/, {
        message: 'Senha deve conter pelo menos uma letra maiúscula',
      })
      .regex(/[a-z]/, {
        message: 'Senha deve conter pelo menos uma letra minúscula',
      })
      .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });
```

---

## 🔄 Fluxos Comuns

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. NextAuth chama `authorize()` com credentials
4. `fetchFromApi()` faz POST para `auth` endpoint
5. Se sucesso: token JWT retornado → decodificado → armazenado
6. Se 403: redireciona para `/reset-password`
7. Se erro: exibe mensagem de erro

### Fluxo de Listagem com Filtros

1. Página carrega → `useEffect` lê query string
2. Filtros aplicados → `useUsers()` executa query
3. Dados exibidos em `PaginatedTable`
4. Usuário altera filtro → `setQueryParam()` atualiza URL
5. Filtros atualizados → query reexecuta automaticamente
6. Tabela atualiza com novos dados

### Fluxo de Criação/Edição

1. Usuário clica em "Criar" → modal abre
2. Preenche formulário → validação Zod em tempo real
3. Submete → `mutateAsync()` executa
4. Se sucesso: notificação exibida → cache invalidado → lista atualiza → modal fecha
5. Se erro de campo: erros aplicados no formulário
6. Se erro geral: notificação de erro exibida

---

## 🎯 Padrões de Navegação

### Rotas Privadas

Rotas privadas são definidas em `src/constants/routes/routes.private.ts`:

```typescript
import { IconUserCircle, IconLockAccess } from '@tabler/icons-react';
import { KnownClaims } from '@/features/auth/services/auth.types';
import { RouteConfig } from '@/types';

type PrivateRoutes = 'users' | 'roles';

export const privateRoutes: Record<PrivateRoutes, RouteConfig> = {
  users: {
    group: 'Gestão',
    path: '/users',
    name: 'Usuários',
    icon: IconUserCircle,
    claims: [KnownClaims.list_users],
  },
  roles: {
    group: 'Gestão',
    path: '/roles',
    name: 'Perfis',
    icon: IconLockAccess,
    claims: [KnownClaims.list_roles],
  },
} as const;
```

### Navegação Baseada em Permissões

A função `getNavigationRoutes()` filtra rotas baseado nas permissões do usuário:

```typescript
import { getNavigationRoutes } from '@/utils/getNavigationRoutes';
import { useAuth } from '@/providers/AuthProvider';

const { session } = useAuth();
const routes = getNavigationRoutes(session?.user);
// Retorna apenas rotas que o usuário tem permissão
```

---

## 🎨 Tema Mantine

### Configuração

O tema está em `src/configs/mantine/theme/`:

- `theme.tokens.ts` - Tokens de design (cores, espaçamentos, etc)
- `theme.sizes.ts` - Tamanhos customizados
- `theme.components.ts` - Estilos de componentes específicos
- `theme/index.ts` - Tema principal

### Uso

```typescript
import { theme } from '@/configs/mantine/theme';

// Acessar valores do tema com base em tokens
const primaryColor = theme.colors?.primary?.[6]; // token de cor primária
const secondaryColor = theme.colors?.secondary?.[6]; // token de cor secundária
const spacing = theme.spacing?.md; // token de espaçamento
const radius = theme.radius?.md; // token de radius
```

### Regras para o Tema

1. **Cores primárias, secundárias e terciárias**
   - Devem estar definidas em `theme.tokens.ts` como paletas completas (ex: `primary[50..900]`, `secondary[50..900]`, `tertiary[50..900]`).
   - `theme.primaryColor` deve apontar para a cor primária padrão do produto.
   - Nunca usar diretamente paletas internas do Mantine (ex: `red`, `blue`) em componentes de negócio; sempre usar as paletas do projeto.

2. **Modos Light/Dark**
   - O tema deve expor os mesmos tokens semânticos para ambos os modos; apenas os valores mudam.
   - Toda configuração ligada a cores deve ser pensada em **pares** (light/dark) e documentada em `STYLE_GUIDE.md`.

3. **Integração com IA/MCP e Figma**
   - A nomenclatura de tokens em `theme.tokens.ts` deve ser compatível com os tokens configurados no Figma, seguindo os padrões descritos em `FIGMA_TOKENS_SETUP.md`.
   - Qualquer alteração em tokens de cor, tipografia ou espaçamento deve ser sincronizada:
     - Neste arquivo `AGENTS.md` (se impactar regras)
     - Em `STYLE_GUIDE.md` (definição de tokens)
     - No arquivo/projeto de tokens do Figma (ver processo em `FIGMA_TOKENS_SETUP.md`)

---

## 📦 Variáveis de Ambiente

Variáveis importantes:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# App
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_APP_DESCRIPTION=Description
NEXT_PUBLIC_APP_LANGUAGE=pt-BR

# Server-side API (para NextAuth)
NEXT_SERVER_API_URL=http://localhost:5000/api
```

**Sempre** incluir todas as variáveis de ambiente no arquivo `src/configs/env/schema.ts` para validação e tipagem.

Para acessar as variáveis, utilizar o objeto `env` do arquivo `src/configs/env/getEnv.ts`.

**Nunca** utilizar o `process.env` diretamente, seu uso só é permitido em `src/configs/env/getEnv.ts`.

**Nota:** Variáveis `NEXT_PUBLIC_*` são expostas ao cliente. Variáveis sem prefixo são apenas server-side.

---

**Última atualização:** 2026
**Versão do projeto:** 0.1.0
