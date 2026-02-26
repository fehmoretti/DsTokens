## Configuração de Tokens no Figma para IA/MCP

Este documento descreve o **passo a passo** para designers configurarem o Figma de forma alinhada:

- Ao **style guide de tokens** (`STYLE_GUIDE.md`).
- Ao **tema Mantine**.
- Ao consumo por **IA** e **MCP** (modelos precisam encontrar nomes consistentes).

O objetivo é que, ao olhar para um componente no Figma ou no código, o mesmo token de design esteja sendo utilizado.

---

## Visão Geral

No Figma, usaremos:

- **Variables** (variáveis nativas do Figma) para representar tokens.
- **Coleções** para agrupar tokens por domínio (Cores, Espaçamento, Tipografia…).
- **Modes** para representar os temas `Light` e `Dark`.

Os **nomes das variáveis** devem espelhar exatamente os tokens definidos em `STYLE_GUIDE.md`.

---

## Estrutura Recomendada no Figma

### 1. Arquivo de Design Tokens

1. Crie um arquivo dedicado, por exemplo:  
   **`Design System – Tokens`**
2. Este arquivo será a **fonte de verdade visual** dos tokens.
3. Publique esse arquivo como **Library** para outros arquivos usarem as variáveis.

### 2. Coleções de Variáveis

No painel de **Variables** do Figma, crie as seguintes coleções:

- `Colors`
- `Typography`
- `Spacing`
- `Radius`
- `Shadows`

Dentro de cada coleção, criaremos as variáveis com os mesmos nomes do código.

### 3. Modes (Light/Dark)

Para cada coleção, crie **dois modes**:

- `Light`
- `Dark`

Exemplo (na coleção `Colors`):

- Mode `Light` → valores de cor para tema claro.
- Mode `Dark` → valores de cor para tema escuro.

Os **nomes das variáveis não mudam** entre modos; apenas os **valores** são diferentes.

---

## Mapeamento de Nomes – Cores

### 1. Paletas Principais

Na coleção `Colors`, crie **todas** as variáveis abaixo (para cada uma, defina valor em `Light` e `Dark`):

#### Paleta Primária

| Variável            | Uso principal                           |
| ------------------- | ---------------------------------------- |
| `color-primary-50`  | Tons muito claros (backgrounds sutis)   |
| `color-primary-100` | Background leve / estados muito suaves  |
| `color-primary-200` | Hover leve / bordas suaves              |
| `color-primary-300` | Estados neutros focados                 |
| `color-primary-400` | Hover de botão primário                 |
| `color-primary-500` | Cor base de ação primária (botões)      |
| `color-primary-600` | Estado pressed / foco forte             |
| `color-primary-700` | Texto sobre fundos claros, ícones       |
| `color-primary-800` | Destaques fortes                        |
| `color-primary-900` | Tons mais escuros, ênfase máxima        |

#### Paleta Secundária

| Variável              | Uso principal                                |
| --------------------- | --------------------------------------------- |
| `color-secondary-50`  | Backgrounds sutis secundários                |
| `color-secondary-100` | Estados muito suaves                         |
| `color-secondary-200` | Bordas/ícones secundários suaves             |
| `color-secondary-300` | Badges suaves                                |
| `color-secondary-400` | Hover de botão secundário                    |
| `color-secondary-500` | Ações secundárias (botões, links)            |
| `color-secondary-600` | Estado pressed secundário                    |
| `color-secondary-700` | Ícones secundários / texto de apoio          |
| `color-secondary-800` | Destaques secundários fortes                 |
| `color-secondary-900` | Tons mais escuros de apoio                   |

#### Paleta Terciária

| Variável             | Uso principal                                        |
| -------------------- | ----------------------------------------------------- |
| `color-tertiary-50`  | Fundos muito claros / gráficos                       |
| `color-tertiary-100` | Estados muito suaves                                 |
| `color-tertiary-200` | Bordas/ícones em elementos de destaque               |
| `color-tertiary-300` | Gráficos/badges suaves                               |
| `color-tertiary-400` | Hover de elementos de destaque                       |
| `color-tertiary-500` | Destaques especiais / gráficos / estados alternativos |
| `color-tertiary-600` | Pressed de elementos terciários                      |
| `color-tertiary-700` | Ícones e texto em áreas especiais                    |
| `color-tertiary-800` | Destaques muito fortes                               |
| `color-tertiary-900` | Tons mais escuros de ênfase                          |

#### Paleta Neutra

| Variável            | Uso principal                                           |
| ------------------- | -------------------------------------------------------- |
| `color-neutral-50`  | Fundo de página (light) / superfícies extremamente leves |
| `color-neutral-100` | Fundos muito leves / áreas neutras                      |
| `color-neutral-200` | Bordas sutis                                            |
| `color-neutral-300` | Divisórias e bordas mais visíveis                       |
| `color-neutral-400` | Ícones/descritivos menos importantes                    |
| `color-neutral-500` | Texto secundário                                         |
| `color-neutral-600` | Texto primário em light                                  |
| `color-neutral-700` | Títulos/ícones fortes                                    |
| `color-neutral-800` | Fundo em dark / destaque forte                          |
| `color-neutral-900` | Fundo de página (dark) / máxima densidade               |

Para cada variável:

- Em `Light`, defina a cor conforme a paleta clara.
- Em `Dark`, defina a cor equivalente para o tema escuro (garantindo contraste).

### 2. Cores Semânticas

Também na coleção `Colors`, crie **pelo menos** estas variáveis:

| Variável             | Uso principal                              |
| -------------------- | ------------------------------------------- |
| `color-success-500`  | Sucesso/positivo (estados, badges, alerts) |
| `color-danger-500`   | Erro/crítico                               |
| `color-warning-500`  | Avisos                                     |
| `color-info-500`     | Mensagens informativas                     |

Se desejar mais níveis (para background/hover/borda), siga o mesmo padrão de intensidades (`100`, `200`, `700`, etc.).

### 3. Superfícies e Texto

Na mesma coleção `Colors`, crie as seguintes variáveis semânticas:

#### Fundo

| Variável                 | Uso principal                                      |
| ------------------------ | --------------------------------------------------- |
| `color-bg-page`          | Fundo geral da aplicação                           |
| `color-bg-surface`       | Cards, blocos de conteúdo                          |
| `color-bg-surface-elevated` | Modais, popovers, dropdowns                    |
| `color-bg-backdrop`      | Overlays atrás de modais                           |

#### Texto

| Variável            | Uso principal                                    |
| ------------------- | ----------------------------------------------- |
| `color-fg-primary`  | Texto principal, títulos                         |
| `color-fg-secondary`| Texto de apoio                                   |
| `color-fg-muted`    | Texto desabilitado / pouco importante           |
| `color-fg-on-primary` | Texto sobre fundo primário (botões, chips)   |
| `color-fg-on-danger`  | Texto sobre fundos de erro/alerta crítica     |

#### Bordas

| Variável              | Uso principal                        |
| --------------------- | ------------------------------------- |
| `color-border-subtle` | Divisórias e bordas discretas        |
| `color-border-strong` | Bordas marcadas (inputs, cards)      |
| `color-border-focus`  | Realce de foco (inputs, botões)      |

#### Como escolher os valores

- Em `Light`, normalmente:
  - `color-bg-page` → valor similar a `color-neutral-50`
  - `color-fg-primary` → algo como `color-neutral-900`
  - `color-border-subtle` → próximo de `color-neutral-200`

- Em `Dark`, normalmente:
  - `color-bg-page` → valor próximo de `color-neutral-900`
  - `color-fg-primary` → algo como `color-neutral-50`
  - `color-border-subtle` → próximo de `color-neutral-700`

Esses mapeamentos devem ser coerentes com o que será implementado no tema Mantine.

---

## Mapeamento de Nomes – Espaçamento

Na coleção `Spacing`, crie as variáveis abaixo (valores iguais em `Light` e `Dark`):

| Variável    | Uso sugerido                           |
| ----------- | -------------------------------------- |
| `space-xs`  | Espaços muito pequenos (chips, tags)   |
| `space-sm`  | Espaços pequenos                       |
| `space-md`  | Padding padrão de componentes          |
| `space-lg`  | Gaps entre blocos                      |
| `space-xl`  | Seções maiores                         |
| `space-2xl` | Blocos de layout muito espaçados       |

Use valores em `px` (ou `rem` se preferir, mas mantenha consistente com o código).

Em geral, esses valores **não precisam mudar entre Light/Dark**, então você pode manter os mesmos números nos dois modes.

---

## Mapeamento de Nomes – Radius

Na coleção `Radius`, crie:

| Variável     | Uso sugerido                                  |
| ------------ | --------------------------------------------- |
| `radius-xs`  | Tabelas, inputs com cantos quase retos        |
| `radius-sm`  | Inputs e campos simples                       |
| `radius-md`  | Botões e cards padrão                         |
| `radius-lg`  | Cards mais suaves / layouts especiais         |
| `radius-full`| Pills, badges totalmente arredondados         |

Exemplo de valores:

- `radius-xs`: 2px
- `radius-sm`: 4px
- `radius-md`: 8px
- `radius-lg`: 12px
- `radius-full`: 9999px

Assim como o espaçamento, normalmente esses valores são iguais em Light/Dark.

---

## Mapeamento de Nomes – Tipografia

Na coleção `Typography`, crie ao menos as variáveis abaixo:

### Tamanhos

| Variável        | Uso sugerido                       |
| --------------- | ---------------------------------- |
| `font-size-xs`  | Legendas, helper text             |
| `font-size-sm`  | Labels, textos de suporte         |
| `font-size-md`  | Texto padrão de UI                |
| `font-size-lg`  | Títulos pequenos / destaques      |
| `font-size-xl`  | Títulos médios                    |
| `font-size-2xl` | Títulos grandes / hero            |

### Alturas de linha

| Variável            | Uso sugerido                    |
| ------------------- | ------------------------------ |
| `line-height-tight` | Títulos, textos curtos         |
| `line-height-normal`| Corpo de texto padrão          |
| `line-height-relaxed`| Textos longos, parágrafos    |

### Pesos (opcional como variável numérica)

| Variável             | Valor típico | Uso sugerido      |
| -------------------- | ----------- | ----------------- |
| `font-weight-regular` | 400         | Texto padrão      |
| `font-weight-medium`  | 500         | Títulos médios    |
| `font-weight-semibold`| 600         | Ênfase forte      |
| `font-weight-bold`    | 700         | Destaques extremos |

### Família tipográfica

Você pode configurar a família de fonte via **Text Styles** do Figma, mas, se desejar alinhamento máximo com código:

- Crie variáveis adicionais como:

| Variável          | Uso sugerido                 |
| ----------------- | --------------------------- |
| `font-family-base`| Fonte principal da interface |

E utilize-as nos estilos de texto.

---

## Como Aplicar Tokens nos Componentes do Figma

### 1. Cores

Ao configurar o `Fill`/`Stroke` de um elemento:

1. Clique no ícone de variável no seletor de cor.
2. Escolha a variável correspondente:
   - Exemplo: para o fundo de um botão primário → `color-primary-500`.
   - Exemplo: para o texto sobre o botão primário → `color-fg-on-primary`.

### 2. Espaçamento

Para componentes com Auto Layout:

1. Use variáveis nos campos de `Padding` e `Gap`.
2. Selecione, por exemplo, `space-md` para paddings horizontais e `space-sm` para verticais.

### 3. Radius

1. Selecione o componente.
2. Em `Corner radius`, aplique a variável desejada (`radius-md`, `radius-lg`, etc.).

### 4. Tipografia

1. Crie **Text Styles** baseados nas variáveis de `font-size-*`, `line-height-*`, etc.
2. Use esses estilos em todos os textos de UI (títulos, labels, textos de botão).

---

## Sincronização com o Código e IA/MCP

### 1. Alinhamento de Nomes

- Os nomes das variáveis no Figma DEVEM ser idênticos aos tokens descritos em:
  - `STYLE_GUIDE.md`
  - `AGENTS.md` (se houver menções diretas)
  - Arquivos de tema (`theme.tokens.ts`, `theme/index.ts`)

### 2. Atualizações de Tokens

Sempre que houver uma alteração de token:

1. Atualizar o `STYLE_GUIDE.md`.
2. Atualizar as variáveis no Figma (mesmo nome, novo valor).
3. Atualizar o tema Mantine.

### 3. IA/MCP

Para tirar mais proveito de IA/MCP:

- Mantenha tokens com nomes **claros e consistentes** (`color-primary-500`, `space-md`, etc.).
- Evite abreviações obscuras ou nomes específicos de tela.
- Se possível, documente na descrição da variável no Figma:
  - Uso previsto (botão primário, fundo de página, etc.).
  - Referência ao token no código (ex.: `theme.colors.primary[5]`).

Isso ajuda agentes a correlacionarem o que veem no Figma com o que precisam gerar no código.

---

## Checklist para o Designer

1. **Criar/abrir** o arquivo `Design System – Tokens`.
2. **Criar coleções de variáveis**:
   - `Colors`, `Typography`, `Spacing`, `Radius`, `Shadows`.
3. **Criar modes**:
   - Adicionar `Light` e `Dark` para todas as coleções.
4. **Cadastrar variáveis** seguindo exatamente os nomes de `STYLE_GUIDE.md`.
5. **Definir valores** de light/dark para cada variável, garantindo contraste.
6. **Aplicar variáveis** em todos os componentes de UI (fill, stroke, padding, gap, radius, tipografia).
7. **Publicar como Library** para que outros arquivos possam usar os tokens.
8. **Avisar o time de desenvolvimento** sempre que tokens forem criados/alterados/removidos.

Seguindo estes passos, o projeto terá:

- Um **style guide centralizado** (`STYLE_GUIDE.md`).
- Tokens espelhados no Figma, prontos para IA/MCP.
- Tema Mantine alinhado com o design, suportando **cores primárias, secundárias, terciárias** e **modo light/dark** de forma previsível.

