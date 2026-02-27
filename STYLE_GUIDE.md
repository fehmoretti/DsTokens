## Style Guide – Tokens de Design do Projeto

Este documento define o **sistema de design tokens** utilizado pelo frontend (Mantine, CSS Modules) e pelo Figma, servindo como base para trabalho com **IA** e **MCP**.

- **Público-alvo:** devs, IAs e designers.
- **Objetivo:** garantir que código, tema Mantine e Figma compartilhem **os mesmos nomes de tokens**, evitando divergências entre implementação e layout.

---

## Visão Geral de Tokens

Os tokens são divididos em:

- **Cores:** paletas primária, secundária, terciária, neutros e semânticas (sucesso/erro/aviso/info).
- **Superfícies:** fundo de página, superfícies elevadas, bordas, estados de foco/hover.
- **Tipografia:** família, pesos, tamanhos e alturas de linha.
- **Espaçamento:** escala de espaçamento (margem/padding/gap).
- **Radius:** curva de cantos.
- **Sombras:** níveis de elevação.
- **Breakpoints:** responsividade.

Todos os tokens devem existir em **dois modos**:

- `light`
- `dark`

Os nomes são sempre os mesmos; apenas os **valores** mudam entre modos.

---

## Convenções de Nomenclatura

### Estrutura Geral

No código e no Figma, use a mesma estrutura semântica:

- `color-{categoria}-{intensidade}`
- `color-{uso}-{estado?}`
- `space-{tamanho}`
- `font-size-{tamanho}`
- `radius-{tamanho}`
- `shadow-{nível}`

### Exemplos

- **Paletas:**
  - `color-primary-50` … `color-primary-900`
  - `color-secondary-50` … `color-secondary-900`
  - `color-tertiary-50` … `color-tertiary-900`
  - `color-neutral-50` … `color-neutral-900`

- **Semânticas:**
  - `color-success-500`
  - `color-danger-500`
  - `color-warning-500`
  - `color-info-500`

- **Superfícies/Texto:**
  - `color-bg-page`
  - `color-bg-surface`
  - `color-bg-surface-elevated`
  - `color-border-subtle`
  - `color-border-strong`
  - `color-fg-primary`
  - `color-fg-secondary`
  - `color-fg-muted`
  - `color-fg-on-primary` (texto sobre botão primário)

- **Espaçamento:**
  - `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`, `space-2xl`

- **Radius:**
  - `radius-xs`, `radius-sm`, `radius-md`, `radius-lg`, `radius-full`

- **Tipografia (tamanhos):**
  - `font-size-xs`, `font-size-sm`, `font-size-md`, `font-size-lg`, `font-size-xl`, `font-size-2xl`

- **Sombras:**
  - `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`

---

## Tokens de Cor

### Regras de agrupamento e nomenclatura (cores semânticas)

As cores semânticas seguem **duas regras obrigatórias** para evitar conflitos e manter consistência entre código, tema Mantine e Figma.

#### 1. Agrupamento por uso (não segregado)

Todos os tokens semânticos de cor pertencem a **um único grupo por tipo de uso**:

| Grupo | Prefixo | Escopo típico (Figma) |
|-------|---------|------------------------|
| **Background** | `semantic/bg/*` | FRAME_FILL |
| **Texto** | `semantic/text/*` | TEXT_FILL |
| **Borda** | `semantic/border/*` | STROKE_COLOR |
| **Ícone** | `semantic/icon/*` | SHAPE_FILL |

- **Brand, accent e tertiary** não formam grupos próprios: ficam **dentro** de Background, Texto e Ícone (ex.: `semantic/bg/brand-default`, `semantic/text/brand-subtle`, `semantic/icon/brand`).
- **Feedback** (success, error, warning, info) também fica nos grupos de uso: backgrounds em `semantic/bg/*`, texto em `semantic/text/*`, borda em `semantic/border/*`.

#### 2. Nomenclatura sem conflito (sufixos obrigatórios)

Para que um mesmo “tipo” (ex.: brand) não gere vários tokens com o mesmo nome em grupos diferentes, usa-se **sufixo explícito** no nome do token:

- **Brand / Accent / Tertiary**
  - Background: `brand-default`, `brand-hover`, `brand-subtle` (e equivalente `accent-*`, `tertiary-*`).
  - Texto: `brand-subtle`, `accent-subtle`, `tertiary-subtle` (em `semantic/text/*`).
  - Ícone: `brand`, `accent`, `tertiary` (em `semantic/icon/*`; uma variante por cor).

- **Feedback (success, error, warning, info)**
  - Background: `success-bg`, `error-bg`, `warning-bg`, `info-bg` (em `semantic/bg/*`).
  - Texto: `success-text`, `error-text`, `warning-text` (em `semantic/text/*`).
  - Borda: `error-border` (em `semantic/border/*`).

Assim não há ambiguidade entre, por exemplo, “default” de brand e “default” de accent, nem entre “success” como bg e como texto.

---

### Paletas Principais

As paletas abaixo são **exemplo de referência**. Ajuste as cores exatas conforme a identidade visual do produto, mantendo a estrutura e intensidades.

#### Primária – `color-primary-*`

- Uso: ações principais, botões primários, elementos de foco.
- Mapa típico (light):
  - `color-primary-50`: tom mais claro
  - `color-primary-100`
  - `color-primary-200`
  - `color-primary-300`
  - `color-primary-400`
  - `color-primary-500`: cor base (default)
  - `color-primary-600`
  - `color-primary-700`
  - `color-primary-800`
  - `color-primary-900`: tom mais escuro

No **modo dark**, as intensidades podem ser remapeadas (por exemplo, usar valores mais claros para `500` para garantir contraste), mas o **nome do token permanece igual**.

#### Secundária – `color-secondary-*`

- Uso: ações secundárias, elementos de apoio, etiquetas.
- Mesma estrutura de intensidades que a paleta primária.

#### Terciária – `color-tertiary-*`

- Uso: estados de destaque especiais, gráficos ou áreas de branding.
- Mesma estrutura de intensidades.

### Paleta Neutra – `color-neutral-*`

- Uso: backgrounds, bordas, textos neutros.
- Deve cobrir desde fundos claros até textos escuros, com foco em acessibilidade:
  - `color-neutral-50`/`100`: fundos claros
  - `color-neutral-200`/`300`: bordas sutis
  - `color-neutral-600`/`700`: texto primário
  - `color-neutral-800`/`900`: texto mais forte, ícones

### Cores Semânticas

- No **código e no Figma** as cores semânticas de uso (sucesso, erro, aviso, info, brand, accent, tertiary) seguem o esquema **agrupado por uso** com **nomes sem conflito**: `semantic/bg/success-bg`, `semantic/text/error-text`, `semantic/border/error-border`, `semantic/bg/brand-default`, etc. Ver **Regras de agrupamento e nomenclatura** acima.
- Em referências genéricas à paleta de feedback: sucesso, erro/crítico, aviso, informação podem ter variações (bg, texto, borda) sempre com sufixo explícito (`-bg`, `-text`, `-border`).

---

## Tokens de Superfície e Texto

Esses tokens são **semânticos** e apontam para paletas:

- **Fundo:**
  - `color-bg-page`
  - `color-bg-surface`
  - `color-bg-surface-elevated`
  - `color-bg-backdrop` (modais, overlays)

- **Texto:**
  - `color-fg-primary`
  - `color-fg-secondary`
  - `color-fg-muted`
  - `color-fg-on-primary`
  - `color-fg-on-danger`

- **Bordas:**
  - `color-border-subtle`
  - `color-border-strong`
  - `color-border-focus`

### Light vs Dark

- No **modo light**, `color-bg-page` tende a apontar para um neutro muito claro (ex.: `color-neutral-50`).
- No **modo dark**, `color-bg-page` tende a apontar para um neutro escuro (ex.: `color-neutral-900`), mas o **nome do token é o mesmo**.

---

## Tokens de Tipografia

### Família e Pesos

- Família principal (exemplo): `font-family-base = 'Inter', system-ui, sans-serif`
- Pesos:
  - `font-weight-regular = 400`
  - `font-weight-medium = 500`
  - `font-weight-semibold = 600`
  - `font-weight-bold = 700`

### Tamanhos e Alturas de Linha

- Tamanhos:
  - `font-size-xs`
  - `font-size-sm`
  - `font-size-md`
  - `font-size-lg`
  - `font-size-xl`
  - `font-size-2xl`

- Line-height:
  - `line-height-tight`
  - `line-height-normal`
  - `line-height-relaxed`

No código, esses tokens devem ser expostos via Mantine (`theme.fontSizes`, `theme.lineHeights`) e via variáveis CSS (`--font-size-md`, etc.).

---

## Tokens de Espaçamento

Escala uniforme (exemplo):

- `space-xs`
- `space-sm`
- `space-md`
- `space-lg`
- `space-xl`
- `space-2xl`

No CSS, usar:

```css
padding: var(--space-md);
gap: var(--space-lg);
```

No Mantine, alinhar `theme.spacing` a esses tokens.

---

## Tokens de Radius

Escala:

- `radius-xs` – cantos quase retos.
- `radius-sm` – cards simples.
- `radius-md` – botões e campos padrão.
- `radius-lg` – componentes mais "macios".
- `radius-full` – pills, badges, elementos totalmente arredondados.

No CSS:

```css
border-radius: var(--radius-md);
```

---

## Tokens de Sombras

- `shadow-xs` – borda/leitura suave.
- `shadow-sm` – elevação leve.
- `shadow-md` – cards principais.
- `shadow-lg` – modais e overlays.

Essas sombras podem ter variações entre light/dark (por exemplo, sombras mais sutis no dark).

---

## Integração com Mantine

No código (exemplo conceitual):

```ts
// theme.tokens.ts (conceito, não implementação exata)
export const designTokens = {
  colors: {
    primary: {
      50: '...',
      100: '...',
      500: '...',
    },
    secondary: { /* ... */ },
    tertiary: { /* ... */ },
    neutral: { /* ... */ },
    success: { /* ... */ },
    danger: { /* ... */ },
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};
```

O tema Mantine (`theme/index.ts`) deve:

- Configurar `primaryColor` = `'primary'`.
- Popular `theme.colors.primary`, `theme.colors.secondary`, `theme.colors.tertiary` a partir dos tokens.
- Mapear `theme.spacing`, `theme.radius`, `theme.shadows`, `theme.fontSizes` com base nos mesmos nomes.

---

## Uso em CSS Modules

Sempre que possível:

- Utilizar **variáveis CSS** derivadas dos tokens:

```css
.buttonPrimary {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background-color: var(--color-primary-500);
  color: var(--color-fg-on-primary);
}
```

Nenhuma cor hexadecimal ou valor numérico de espaçamento deve ser declarado diretamente em componentes; se for necessário um novo valor, primeiro crie/atualize um token e depois consuma-o.

---

## Sincronização com Figma e IA/MCP

Para garantir que IAs e MCPs consigam operar bem entre código e design:

- **Os nomes de tokens definidos aqui são a fonte da verdade.**
- O arquivo/projeto de tokens no Figma deve:
  - Repetir **os mesmos nomes** (`color-primary-500`, `space-md`, etc.).
  - Expor modos `Light` e `Dark`.
  - Ser documentado seguindo o passo a passo descrito em `FIGMA_TOKENS_SETUP.md`.

Sempre que um token for criado, alterado ou removido:

1. Atualizar este `STYLE_GUIDE.md`.
2. Ajustar a configuração do tema Mantine.
3. Sincronizar o arquivo de tokens do Figma.

# STYLE_GUIDE.md — Design System · Next.js + Mantine UI

> **Relação com AGENTS.md:** Este documento é o espelho de design do `AGENTS.md`. Enquanto o `AGENTS.md` define as regras técnicas para agentes e devs, o `STYLE_GUIDE.md` define as regras visuais e de tokens que alimentam o tema Mantine (`src/configs/mantine/theme/`) e o projeto Figma. Toda decisão de design DEVE ser refletida em código no tema Mantine.

---

## Índice

1. Princípios de Design
2. Sistema de Temas (Light / Dark)
3. Tokens de Cor — Paleta Base
4. Tokens Semânticos por Tema
5. Tipografia
6. Espaçamento
7. Bordas e Raios
8. Sombras por Tema
9. Breakpoints
10. Componentes — Padrões Visuais
11. Ícones
12. Motion & Animação
13. Código Mantine — theme.tokens.ts Completo
14. Mapeamento Figma → Código
15. Regras para IA e MCP

---

## 1. Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **Consistência** | Todo componente visual tem um equivalente no tema Mantine. Nenhum valor é hardcoded. |
| **Acessibilidade** | Contraste mínimo WCAG AA (4.5:1) em todos os textos, em ambos os modos. |
| **Previsibilidade** | O designer e o agente usam os mesmos nomes de token. |
| **Dualidade** | Todo token semântico tem valor definido para Light e Dark. Não existe token sem os dois modos. |
| **Feature-first** | Variações visuais específicas de uma feature ficam no CSS Module dessa feature, não no tema global. |

---

## 2. Sistema de Temas (Light / Dark)

O projeto suporta dois modos visuais controlados pelo `ColorSchemeProvider` do Mantine.

### Variável CSS de controle

```css
[data-mantine-color-scheme="light"] { ... }
[data-mantine-color-scheme="dark"]  { ... }
```

### Função CSS para alternância

```css
.element {
  background: light-dark(#FFFFFF, #1A1B1E);
  border-color: light-dark(
    var(--mantine-color-gray-3),
    var(--mantine-color-dark-4)
  );
}
```

### Regra absoluta

**Todo token semântico DEVE ter valor para Light e Dark.** Tokens de paleta base (primary-0..9) são estáticos — os tokens semânticos que os referenciam é que mudam.

---

## 3. Tokens de Cor — Paleta Base

> Estáticos. Não mudam entre Light e Dark.

### Primary (Azul)

| Token | Shade | HEX |
|---|---|---|
| `color/primary/0` | primary-0 | `#EFF6FF` |
| `color/primary/1` | primary-1 | `#DBEAFE` |
| `color/primary/2` | primary-2 | `#BFDBFE` |
| `color/primary/3` | primary-3 | `#93C5FD` |
| `color/primary/4` | primary-4 | `#60A5FA` |
| `color/primary/5` | primary-5 | `#3B82F6` |
| `color/primary/6` ← DEFAULT Light | primary-6 | `#2563EB` |
| `color/primary/7` | primary-7 | `#1D4ED8` |
| `color/primary/8` | primary-8 | `#1E40AF` |
| `color/primary/9` | primary-9 | `#1E3A8A` |

> `primaryShade.dark = 5` → Mantine usa `primary-5` (#3B82F6) no dark mode automaticamente.

### Neutral (Cinza — Light)

| Token | Shade | HEX |
|---|---|---|
| `color/neutral/0` | gray-0 | `#F9FAFB` |
| `color/neutral/1` | gray-1 | `#F3F4F6` |
| `color/neutral/2` | gray-2 | `#E5E7EB` |
| `color/neutral/3` | gray-3 | `#D1D5DB` |
| `color/neutral/4` | gray-4 | `#9CA3AF` |
| `color/neutral/5` | gray-5 | `#6B7280` |
| `color/neutral/6` | gray-6 | `#4B5563` |
| `color/neutral/7` | gray-7 | `#374151` |
| `color/neutral/8` | gray-8 | `#1F2937` |
| `color/neutral/9` | gray-9 | `#111827` |

### Dark (Superfícies — Dark Mode)

| Token | Shade | HEX |
|---|---|---|
| `color/dark/0` | dark-0 | `#C1C2C5` |
| `color/dark/1` | dark-1 | `#A6A7AB` |
| `color/dark/2` | dark-2 | `#909296` |
| `color/dark/3` | dark-3 | `#5C5F66` |
| `color/dark/4` | dark-4 | `#373A40` |
| `color/dark/5` | dark-5 | `#2C2E33` |
| `color/dark/6` | dark-6 | `#25262B` |
| `color/dark/7` | dark-7 | `#1A1B1E` |
| `color/dark/8` | dark-8 | `#141517` |
| `color/dark/9` | dark-9 | `#101113` |

### Semântica (paletas de suporte)

| Família | Shade 1 (bg) | Shade 6 (default) | Shade 8 (hover) |
|---|---|---|---|
| green | `#DCFCE7` | `#16A34A` | `#166534` |
| red | `#FEE2E2` | `#DC2626` | `#991B1B` |
| yellow | `#FEF9C3` | `#CA8A04` | `#854D0E` |
| blue | `#DBEAFE` | `#2563EB` | `#1E40AF` |

---

## 4. Tokens Semânticos por Tema

> Estes tokens mudam conforme o modo ativo.
> **Figma:** Variables com modo `Light` e modo `Dark`.
> **Código:** `var(--mantine-color-*)` ou `light-dark()` em CSS Modules.

### 4.1 Background

| Token Figma | Light | Dark | Variável / Função |
|---|---|---|---|
| `semantic/bg/body` | `#FFFFFF` | `#1A1B1E` | `var(--mantine-color-body)` |
| `semantic/bg/surface` | `#FFFFFF` | `#25262B` | `var(--mantine-color-default)` |
| `semantic/bg/subtle` | `#F9FAFB` | `#141517` | `light-dark(gray-0, dark-8)` |
| `semantic/bg/muted` | `#F3F4F6` | `#1A1B1E` | `light-dark(gray-1, dark-7)` |
| `semantic/bg/overlay` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.65)` | inline |
| `semantic/bg/hover` | `#F3F4F6` | `#25262B` | `light-dark(gray-1, dark-6)` |
| `semantic/bg/selected` | `#EFF6FF` | `#1E3A8A` | `light-dark(primary-0, primary-9)` |
| `semantic/bg/input` | `#FFFFFF` | `#25262B` | `var(--mantine-color-default)` |
| `semantic/bg/brand-default` | `#2563EB` | `#3B82F6` | `light-dark(primary-6, primary-5)` |
| `semantic/bg/brand-hover` | `#1D4ED8` | `#2563EB` | `light-dark(primary-7, primary-6)` |
| `semantic/bg/brand-subtle` | `#DBEAFE` | `#1E3A8A` | `light-dark(primary-1, primary-9)` |
| `semantic/bg/accent-default` | `#7C3AED` | `#8B5CF6` | `light-dark(secondary-6, secondary-5)` |
| `semantic/bg/accent-hover` | `#6D28D9` | `#7C3AED` | `light-dark(secondary-7, secondary-6)` |
| `semantic/bg/accent-subtle` | `#EDE9FE` | `#4C1D95` | `light-dark(secondary-1, secondary-9)` |
| `semantic/bg/tertiary-default` | `#16A34A` | `#22C55E` | `light-dark(tertiary-6, tertiary-5)` |
| `semantic/bg/tertiary-hover` | `#15803D` | `#16A34A` | `light-dark(tertiary-7, tertiary-6)` |
| `semantic/bg/tertiary-subtle` | `#DCFCE7` | `#14532D` | `light-dark(tertiary-1, tertiary-9)` |
| `semantic/bg/success-bg` | `#DCFCE7` | `#052E16` | feedback (cor explícita) |
| `semantic/bg/error-bg` | `#FEE2E2` | `#3B0000` | feedback (cor explícita) |
| `semantic/bg/warning-bg` | `#FEF9C3` | `#2D1B00` | feedback (cor explícita) |
| `semantic/bg/info-bg` | `#DBEAFE` | `#0F172A` | feedback (cor explícita) |

### 4.2 Texto

| Token Figma | Light | Dark | Variável / Função |
|---|---|---|---|
| `semantic/text/primary` | `#111827` | `#C1C2C5` | `var(--mantine-color-text)` |
| `semantic/text/secondary` | `#4B5563` | `#909296` | `var(--mantine-color-dimmed)` |
| `semantic/text/disabled` | `#6B7280` | `#5C5F66` | `light-dark(gray-5, dark-3)` |
| `semantic/text/placeholder` | `#9CA3AF` | `#909296` | `light-dark(gray-4, dark-2)` |
| `semantic/text/inverse` | `#FFFFFF` | `#111827` | inline |
| `semantic/text/link` | `#2563EB` | `#60A5FA` | `light-dark(primary-6, primary-4)` |
| `semantic/text/error-text` | `#DC2626` | `#F87171` | `light-dark(red-6, red-4)` |
| `semantic/text/success-text` | `#16A34A` | `#4ADE80` | `light-dark(green-6, green-4)` |
| `semantic/text/warning-text` | `#854D0E` | `#FCD34D` | `light-dark(yellow-7, yellow-4)` |
| `semantic/text/brand-subtle` | `#1D4ED8` | `#93C5FD` | `light-dark(primary-7, primary-3)` |
| `semantic/text/accent-subtle` | `#6D28D9` | `#C4B5FD` | `light-dark(secondary-7, secondary-3)` |
| `semantic/text/tertiary-subtle` | `#15803D` | `#86EFAC` | `light-dark(tertiary-7, tertiary-3)` |

### 4.3 Borda

| Token Figma | Light | Dark | Variável / Função |
|---|---|---|---|
| `semantic/border/default` | `#D1D5DB` | `#373A40` | `light-dark(gray-3, dark-4)` |
| `semantic/border/subtle` | `#E5E7EB` | `#2C2E33` | `light-dark(gray-2, dark-5)` |
| `semantic/border/strong` | `#6B7280` | `#5C5F66` | `light-dark(gray-5, dark-3)` |
| `semantic/border/focus` | `#2563EB` | `#60A5FA` | `light-dark(primary-6, primary-4)` |
| `semantic/border/error-border` | `#DC2626` | `#EF4444` | `light-dark(red-6, red-5)` |

### 4.4 Ícone

| Token Figma | Light | Dark | Variável / Função |
|---|---|---|---|
| `semantic/icon/default` | `#111827` | `#C1C2C5` | `light-dark(neutral-9, dark-0)` |
| `semantic/icon/muted` | `#4B5563` | `#909296` | `light-dark(neutral-6, dark-2)` |
| `semantic/icon/brand` | `#2563EB` | `#3B82F6` | `light-dark(primary-6, primary-5)` |
| `semantic/icon/accent` | `#7C3AED` | `#8B5CF6` | `light-dark(secondary-6, secondary-5)` |
| `semantic/icon/tertiary` | `#16A34A` | `#22C55E` | `light-dark(tertiary-6, tertiary-5)` |

> Brand, accent e tertiary em **background** e **texto** estão nas tabelas 4.1 e 4.2 (tokens `semantic/bg/*` e `semantic/text/*`). Feedback em background está em 4.1 (`success-bg`, `error-bg`, `warning-bg`, `info-bg`); em texto em 4.2 (`success-text`, `error-text`, `warning-text`); em borda em 4.3 (`error-border`).

---

## 5. Tipografia

> Estática. A **cor** sempre referencia tokens semânticos de texto.

```ts
fontFamily: 'Inter, sans-serif',
fontFamilyMonospace: 'JetBrains Mono, monospace',
```

| Token | Variável CSS | Valor |
|---|---|---|
| `typography/size/xs` | `--mantine-font-size-xs` | 12px |
| `typography/size/sm` | `--mantine-font-size-sm` | 14px |
| `typography/size/md` | `--mantine-font-size-md` | 16px |
| `typography/size/lg` | `--mantine-font-size-lg` | 18px |
| `typography/size/xl` | `--mantine-font-size-xl` | 20px |

### Text Styles (Figma) — cor vinculada a semantic/text/primary

| Nome | Size | Weight | Line Height |
|---|---|---|---|
| `Heading/H1` | 32px | 700 | 1.3 |
| `Heading/H2` | 24px | 700 | 1.35 |
| `Heading/H3` | 20px | 600 | 1.4 |
| `Heading/H4` | 18px | 600 | 1.4 |
| `Body/Large` | 16px | 400 | 1.55 |
| `Body/Default` | 14px | 400 | 1.45 |
| `Body/Small` | 12px | 400 | 1.4 |
| `Label/Default` | 14px | 500 | 1.45 |
| `Label/Small` | 12px | 500 | 1.4 |
| `Code/Default` | 13px | 400 | 1.5 |

---

## 6. Espaçamento

> Estático — não muda entre temas.

```ts
spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' }
```

---

## 7. Bordas e Raios

> Raios estáticos. Cores sempre referenciar `semantic/border/*`.

```ts
radius: { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' }
```

---

## 8. Sombras por Tema

| Token | Light | Dark |
|---|---|---|
| `shadow/xs` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.30)` |
| `shadow/sm` | `0 1px 3px rgba(0,0,0,0.10)` | `0 1px 3px rgba(0,0,0,0.40)` |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 6px rgba(0,0,0,0.45)` |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.10)` | `0 10px 15px rgba(0,0,0,0.50)` |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.10)` | `0 20px 25px rgba(0,0,0,0.55)` |
| `shadow/xs` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.30)` |
| `shadow/sm` | `0 1px 3px rgba(0,0,0,0.10)` | `0 1px 3px rgba(0,0,0,0.40)` |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 6px rgba(0,0,0,0.35)` |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.10)` | `0 10px 15px rgba(0,0,0,0.45)` |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.10)` | `0 20px 25px rgba(0,0,0,0.50)` |

---

## 9. Breakpoints

| Token | Largura | Uso |
|---|---|---|
| `breakpoint/mobile` | 480px | Mobile |
| `breakpoint/tablet` | 768px | Tablet |
| `breakpoint/desktop-sm` | 1024px | Desktop pequeno |
| `breakpoint/desktop` | 1440px | Desktop padrão |

---

## 10. Componentes — Padrões Visuais

### Button

| Variante | Light | Dark |
|---|---|---|
| `filled` | bg `#2563EB`, texto branco | bg `#3B82F6`, texto branco |
| `light` | bg `#DBEAFE`, texto `#1D4ED8` | bg `#1E3A8A`, texto `#93C5FD` |
| `subtle` | transparente, texto `#2563EB` | transparente, texto `#60A5FA` |
| `outline` | borda+texto `#2563EB` | borda+texto `#60A5FA` |

### TextInput / Select

| Estado | Light | Dark |
|---|---|---|
| Default | borda `#D1D5DB`, bg `#FFFFFF` | borda `#373A40`, bg `#25262B` |
| Focus | borda `#2563EB` | borda `#60A5FA` |
| Error | borda+texto `#DC2626` | borda `#EF4444`, texto `#F87171` |
| Disabled | bg `#F9FAFB`, texto `#6B7280` | bg `#141517`, texto `#5C5F66` |

### Navbar / Sidebar

| Elemento | Light | Dark |
|---|---|---|
| Background | `#F9FAFB` | `#141517` |
| Item padrão | texto `#4B5563` | texto `#909296` |
| Item ativo | bg `#EFF6FF`, texto `#2563EB` | bg `#1E3A8A`, texto `#93C5FD` |
| Item hover | bg `#F3F4F6` | bg `#25262B` |

### Table

| Elemento | Light | Dark |
|---|---|---|
| Header bg | `#F3F4F6` | `#141517` |
| Row bg | `#FFFFFF` | `#25262B` |
| Row hover | `#F3F4F6` | `#2C2E33` |
| Borda | `#D1D5DB` | `#373A40` |

### Badge feedback

| Variante | Light bg/texto | Dark bg/texto |
|---|---|---|
| success | `#DCFCE7` / `#166534` | `#052E16` / `#4ADE80` |
| error | `#FEE2E2` / `#991B1B` | `#3B0000` / `#F87171` |
| warning | `#FEF9C3` / `#854D0E` | `#2D1B00` / `#FCD34D` |
| info | `#DBEAFE` / `#1E40AF` | `#0F172A` / `#93C5FD` |

---

## 11. Ícones

> **Biblioteca:** `@tabler/icons-react` · **Stroke:** `1.5px` · **Cor:** herdar de `semantic/text/primary`

| Tamanho | Valor | Uso |
|---|---|---|
| `icon/sm` | 16px | Badges, labels |
| `icon/md` | 20px | Botões, inputs |
| `icon/lg` | 24px | Navegação, títulos |
| `icon/xl` | 32px | Estados vazios |

---

## 12. Motion & Animação

| Token | Valor |
|---|---|
| `motion/duration/fast` | `100ms` |
| `motion/duration/default` | `200ms` |
| `motion/duration/slow` | `300ms` |
| `motion/easing/default` | `ease` |
| `motion/easing/in-out` | `ease-in-out` |

---

## 13. Código Mantine — theme.tokens.ts Completo

```ts
// src/configs/mantine/theme/theme.tokens.ts
import { MantineThemeOverride } from '@mantine/core';

export const themeTokens: MantineThemeOverride = {
  primaryColor: 'primary',
  primaryShade: { light: 6, dark: 5 }, // primary-6 no light, primary-5 no dark

  fontFamily: 'Inter, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',

  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
  },

  lineHeights: { xs: '1.4', sm: '1.45', md: '1.55', lg: '1.6' },

  spacing: {
    xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem',
  },

  radius: {
    xs: '0.125rem', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem',
  },

  breakpoints: {
    xs: '30em', sm: '48em', md: '64em', lg: '74em', xl: '90em',
  },

  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)',
  },

  colors: {
    primary: [
      '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD',
      '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8',
      '#1E40AF', '#1E3A8A',
    ],
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66',
      '#373A40', '#2C2E33', '#25262B', '#1A1B1E',
      '#141517', '#101113',
    ],
  },
};
```

### CSS Modules — Padrão com Light/Dark

```css
/* src/features/[feature]/components/MyComponent.module.css */

.container {
  background-color: var(--mantine-color-body);
  border: 1px solid light-dark(
    var(--mantine-color-gray-3),
    var(--mantine-color-dark-4)
  );
  color: var(--mantine-color-text);
  box-shadow: light-dark(
    var(--mantine-shadow-sm),
    0 1px 3px rgba(0,0,0,0.4)
  );
}

.label {
  color: var(--mantine-color-dimmed);
  font-size: var(--mantine-font-size-sm);
}

.active {
  background: light-dark(
    var(--mantine-color-primary-0),
    var(--mantine-color-primary-9)
  );
  color: light-dark(
    var(--mantine-color-primary-7),
    var(--mantine-color-primary-3)
  );
}
```

### Alternativa com seletor de atributo

```css
.sidebar { background: var(--mantine-color-gray-0); }

[data-mantine-color-scheme="dark"] .sidebar {
  background: var(--mantine-color-dark-8);
}
```

---

## 14. Mapeamento Figma → Código

| Token Figma | Código | Obs |
|---|---|---|
| `semantic/bg/body` | `var(--mantine-color-body)` | Automático |
| `semantic/bg/surface` | `var(--mantine-color-default)` | Automático |
| `semantic/bg/subtle` | `light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))` | CSS Module |
| `semantic/text/primary` | `var(--mantine-color-text)` | Automático |
| `semantic/text/secondary` | `var(--mantine-color-dimmed)` | Automático |
| `semantic/text/link` | `light-dark(var(--mantine-color-primary-6), var(--mantine-color-primary-4))` | CSS Module |
| `semantic/border/default` | `light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))` | CSS Module |
| `semantic/border/focus` | `light-dark(var(--mantine-color-primary-6), var(--mantine-color-primary-4))` | CSS Module |
| `semantic/bg/brand-default` | `color="primary"` (prop Mantine) | `primaryShade` automático |
| `color/primary/6` | `theme.colors.primary[6]` | Paleta base estática |
| `spacing/4` | `theme.spacing.md` | Estático |
| `radius/md` | `theme.radius.md` | Estático |

---

## 15. Regras para IA e MCP

### Regras Absolutas

- **Sempre usar tokens semânticos** (`semantic/*`) — nunca paleta base diretamente.
- **Toda cor DEVE ter valor para Light e Dark** — usar `light-dark()` ou variáveis automáticas do Mantine.
- **NÃO usar HEX, RGB ou valores hardcoded** em arquivos de componente.
- **`primaryShade` é `{ light: 6, dark: 5 }`** — respeitar ao gerar código.
- **`light-dark()`** é a função preferida em CSS Modules.
- **Novos tokens** exigem atualização de `theme.tokens.ts` + este arquivo.

### Ordem de Estilização (idêntica ao AGENTS.md)

1. Props nativas do Mantine (`color="primary"`, `variant="light"`, `size="md"`)
2. CSS Modules com `light-dark()` ou `[data-mantine-color-scheme]`
3. Inline styles apenas em casos excepcionais documentados

### O que o Agente PODE fazer

- Usar `light-dark()` em CSS Modules para alternância automática de tema
- Usar `var(--mantine-color-body/text/dimmed/default)` diretamente
- Consultar a seção 4 para o token semântico correto de cada uso
- Sugerir novos tokens seguindo o padrão `semantic/categoria/variante` (categoria = `bg` \| `text` \| `border` \| `icon`; variante com sufixo sem conflito: ex. `brand-default`, `success-bg`, `error-text` — ver seção **Regras de agrupamento e nomenclatura** em Tokens de Cor)

### O que o Agente NÃO PODE fazer

- Usar HEX ou RGB hardcoded em arquivos de componente
- Criar CSS global novo
- Ignorar o Dark mode ao criar novos tokens
- Introduzir novas bibliotecas de ícones (apenas `@tabler/icons-react`)
- Sobrescrever o tema Mantine sem atualizar `theme.components.ts`

---

**Última atualização:** 2026
**Versão:** 2.0.0 — Light/Dark
**Relação:** Complemento visual do `AGENTS.md`. Ambos devem ser atualizados em conjunto.
