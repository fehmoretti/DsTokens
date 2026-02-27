# Configuração de Tokens no Figma — Guia para Designers

Este documento descreve o **passo a passo completo** para designers configurarem o Figma de forma alinhada ao sistema de design tokens do projeto.

**Objetivo:** garantir que código (Mantine + CSS), Figma e IA/MCP compartilhem **os mesmos nomes e valores de tokens**, eliminando divergências entre implementação e layout.

---

## Visão Geral

O projeto possui um **Design Tokens Manager** (aplicação web) que permite configurar visualmente todos os tokens e exportar arquivos JSON prontos para importação no Figma.

### Fluxo de Trabalho

```
Design Tokens Manager → Exportar JSON → Importar no Figma → Publicar como Library
```

### Coleções de Variáveis

O Figma deve conter as seguintes coleções de variáveis:

| Coleção | Tipo | Modos | Descrição |
|---|---|---|---|
| **Colors** | `COLOR` | Light / Dark | Paletas base + tokens semânticos |
| **Spacing** | `FLOAT` | Default | Espaçamento (padding, margin, gap) |
| **Radius** | `FLOAT` | Default | Arredondamento de cantos |
| **Typography** | `FLOAT` / `STRING` | Default | Tamanhos, pesos, alturas de linha, famílias |
| **Shadows** | `STRING` | Light / Dark | Níveis de elevação (box-shadow) |
| **Glows** | `STRING` | Light / Dark | Efeitos de brilho (box-shadow colorido) |
| **Motion** | `STRING` / `FLOAT` | Default | Durações e curvas de animação |

---

## Pré-requisitos

1. Acesso ao **Design Tokens Manager** (aplicação web do projeto)
2. Plugin **Variables Import/Export** instalado no Figma (ou uso da API REST do Figma)
3. Arquivo dedicado no Figma: **`Design System – Tokens`**

---

## Passo 1 — Exportar os JSONs do Design Tokens Manager

No Design Tokens Manager:

1. Navegue até cada seção (Cores, Espaçamento, Radius, Tipografia)
2. Configure os valores desejados para cada token
3. Clique em **"Exportar JSON para o Figma"** em cada seção
4. Salve os arquivos gerados:
   - `Colors.json`
   - `Spacing.json`
   - `Radius.json`
   - `Typography.json`

### Exportação do STYLE_GUIDE.md

Clique em **"Exportar STYLE_GUIDE.md"** para gerar a documentação atualizada com todos os valores configurados. Este arquivo serve como referência tanto para desenvolvedores quanto para designers.

---

## Passo 2 — Criar o Arquivo no Figma

1. Crie um novo arquivo chamado **`Design System – Tokens`**
2. Este arquivo será a **fonte de verdade visual** dos tokens
3. Após configurar tudo, publique como **Library** para que outros arquivos usem as variáveis

---

## Passo 3 — Importar Coleção de Cores

### Estrutura do JSON de Cores

O `Colors.json` contém:

- **Dois modos:** `Light` e `Dark`
- **Paletas base** (valores estáticos):
  - `color/primary/0` a `color/primary/9`
  - `color/secondary/0` a `color/secondary/9` (se habilitada)
  - `color/tertiary/0` a `color/tertiary/9` (se habilitada)
  - `color/neutral/0` a `color/neutral/9`
  - `color/dark/0` a `color/dark/9`
- **Tokens semânticos** (variam entre Light e Dark):
  - `semantic/bg/*` — backgrounds
  - `semantic/text/*` — cores de texto
  - `semantic/border/*` — cores de borda
  - `semantic/icon/*` — cores de ícone

### Como importar

1. Abra o painel **Variables** no Figma
2. Use o plugin de importação ou a API do Figma
3. Importe o `Colors.json`
4. Verifique se os dois modos (`Light` e `Dark`) foram criados
5. Confirme que os tokens semânticos apontam para as paletas base via **alias**

### Aliases (referências)

Os tokens semânticos são configurados como **aliases** (referências) para os tokens de paleta base. Por exemplo:

| Token Semântico | Light aponta para | Dark aponta para |
|---|---|---|
| `semantic/bg/brand-default` | `color/primary/6` | `color/primary/5` |
| `semantic/bg/brand-hover` | `color/primary/7` | `color/primary/6` |
| `semantic/text/primary` | `color/neutral/9` | `color/dark/0` |
| `semantic/border/default` | `color/neutral/3` | `color/dark/4` |

Quando você alterar uma cor na paleta base, todos os tokens semânticos que a referenciam serão atualizados automaticamente.

### Escopos (Scopes)

Cada token semântico tem um **escopo** que controla onde ele pode ser aplicado:

| Prefixo | Escopo no Figma | Onde usar |
|---|---|---|
| `semantic/bg/*` | `FRAME_FILL` | Fill de frames e shapes |
| `semantic/text/*` | `TEXT_FILL` | Cor de texto |
| `semantic/border/*` | `STROKE_COLOR` | Cor de borda/stroke |
| `semantic/icon/*` | `SHAPE_FILL` | Fill de ícones (shapes) |

---

## Passo 4 — Importar Espaçamento

### Estrutura

O `Spacing.json` contém variáveis do tipo `FLOAT` com um único modo (`Default`):

| Token | Valor típico | Uso |
|---|---|---|
| `space-xs` | 4 | Chips, tags, espaços mínimos |
| `space-sm` | 8 | Espaços pequenos entre elementos |
| `space-md` | 16 | Padding padrão de componentes |
| `space-lg` | 24 | Gap entre blocos |
| `space-xl` | 32 | Seções maiores |
| `space-2xl` | 48 | Blocos de layout muito espaçados |

### Como aplicar

Em componentes com **Auto Layout**:
- Use variáveis nos campos de **Padding** (horizontal e vertical)
- Use variáveis no campo de **Gap** (espaço entre itens)

---

## Passo 5 — Importar Radius

### Estrutura

O `Radius.json` contém variáveis do tipo `FLOAT` com um único modo:

| Token | Valor típico | Uso |
|---|---|---|
| `radius-xs` | 2 | Tabelas, inputs com cantos quase retos |
| `radius-sm` | 4 | Inputs e campos simples |
| `radius-md` | 8 | Botões e cards padrão |
| `radius-lg` | 12 | Cards mais suaves |
| `radius-xl` | 16 | Layouts especiais |
| `radius-full` | 9999 | Pills, badges totalmente arredondados |

### Como aplicar

Selecione o elemento e no campo **Corner radius**, aplique a variável desejada.

---

## Passo 6 — Importar Tipografia

### Estrutura

O `Typography.json` contém:

- **Variáveis primitivas** (base):
  - `Typeface/Family/*` — famílias de fonte (`STRING`)
  - `Typeface/Size/*` — tamanhos (`FLOAT`, em px)
  - `Typeface/Weight/*` — pesos (`FLOAT`)
  - `Typeface/Line/*` — alturas de linha (`FLOAT`)

- **Variáveis de estilo** (Typescale, com alias para as primitivas):
  - `Typescale/Heading H1/*` — Font Family, Size, Line, Weight Regular/Medium/Bold
  - `Typescale/Body S/*` — idem
  - etc.

### Como criar Text Styles

Após importar as variáveis de tipografia:

1. Crie **Text Styles** no Figma para cada estilo de texto
2. Vincule o tamanho, peso e altura de linha às variáveis correspondentes
3. Nomeie os Text Styles seguindo o padrão: `Heading/H1`, `Body/S`, `Caption/XXXS`, etc.

### Famílias de fonte

| Token | Valor | Uso |
|---|---|---|
| `font-family-base` | Inter, sans-serif | Textos de interface |
| `font-family-mono` | JetBrains Mono, monospace | Código e dados técnicos |

Instale as fontes no Figma antes de aplicar os estilos.

---

## Passo 7 — Configurar Sombras (Manual)

As sombras não são importadas via JSON de variáveis no Figma (variáveis Figma não suportam `box-shadow` nativamente). Configure-as como **Effect Styles**:

### Valores de Referência

| Token | Light | Dark |
|---|---|---|
| `shadow/xs` | `0 1px 2px rgba(0,0,0,0.30)` | `0 1px 2px rgba(0,0,0,0.30)` |
| `shadow/sm` | `0 1px 3px rgba(0,0,0,0.40)` | `0 1px 3px rgba(0,0,0,0.40)` |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.45)` | `0 4px 6px rgba(0,0,0,0.45)` |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.50)` | `0 10px 15px rgba(0,0,0,0.50)` |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.55)` | `0 20px 25px rgba(0,0,0,0.55)` |

### Como criar no Figma

1. Selecione um frame de referência
2. Adicione um **Drop Shadow** com os valores acima
3. Salve como **Effect Style** com o nome `shadow/xs`, `shadow/sm`, etc.
4. Para o modo Dark, crie versões separadas (`shadow/xs-dark`) ou use o mesmo valor se forem iguais

---

## Passo 8 — Configurar Brilho / Glow (Manual)

Assim como sombras, os glows são configurados como **Effect Styles**:

### Valores de Referência

| Token | Light | Dark |
|---|---|---|
| `glow/xs` | `0 0 4px rgba(122,234,243,0.30)` | `0 0 4px rgba(122,234,243,0.30)` |
| `glow/sm` | `0 0 8px rgba(122,234,243,0.40)` | `0 0 8px rgba(122,234,243,0.40)` |
| `glow/md` | `0 0 16px rgba(122,234,243,0.45)` | `0 0 16px rgba(122,234,243,0.45)` |
| `glow/lg` | `0 0 24px rgba(122,234,243,0.50)` | `0 0 24px rgba(122,234,243,0.50)` |
| `glow/xl` | `0 0 36px rgba(122,234,243,0.55)` | `0 0 36px rgba(122,234,243,0.55)` |

### Como criar no Figma

1. Selecione um frame de referência
2. Adicione um **Drop Shadow** com offset X=0, Y=0, e o blur/cor indicados
3. Salve como **Effect Style** com o nome `glow/xs`, `glow/sm`, etc.

> **Nota:** Glows são úteis para estados de foco, elementos em destaque e feedback visual.

---

## Passo 9 — Configurar Motion (Referência)

Os tokens de motion não são importáveis como variáveis no Figma, mas devem ser documentados para referência de prototipagem:

| Token | Valor | Uso |
|---|---|---|
| `motion/duration/fast` | `100ms` | Hovers, toggles rápidos |
| `motion/duration/default` | `200ms` | Transições padrão |
| `motion/duration/slow` | `300ms` | Modais, expansões |
| `motion/easing/default` | `ease` | Transições gerais |
| `motion/easing/in-out` | `ease-in-out` | Entradas e saídas suaves |

Use esses valores ao configurar protótipos e animações no Figma (Smart Animate, transições de tela).

---

## Passo 10 — Aplicar Tokens nos Componentes

### Cores

Ao configurar o **Fill** ou **Stroke** de um elemento:

1. Clique no ícone de variável (losango) no seletor de cor
2. Escolha a variável semântica correspondente:
   - Fundo de botão primário → `semantic/bg/brand-default`
   - Texto do botão → `semantic/text/inverse`
   - Borda de input → `semantic/border/default`
   - Ícone → `semantic/icon/default`

> **Regra:** nunca aplique cores da paleta base diretamente em componentes. Sempre use tokens semânticos para que o modo Light/Dark funcione automaticamente.

### Espaçamento

Em componentes com **Auto Layout**:

1. No campo de **Padding**, clique no ícone de variável
2. Selecione o token desejado (ex: `space-md`)
3. No campo de **Gap**, aplique da mesma forma

### Radius

1. Selecione o componente
2. No campo **Corner radius**, clique no ícone de variável
3. Selecione o token (ex: `radius-md`)

### Tipografia

1. Selecione o texto
2. Aplique o **Text Style** correspondente (ex: `Body/S`)
3. A cor do texto deve vir de `semantic/text/primary` (variável, não hardcoded)

### Sombras e Glows

1. Selecione o componente
2. Aplique o **Effect Style** correspondente (ex: `shadow/md` ou `glow/sm`)

---

## Sincronização com o Código

### Regra de Ouro

Os nomes das variáveis no Figma **DEVEM ser idênticos** aos tokens definidos no `STYLE_GUIDE.md` e no tema Mantine.

### Fluxo de Atualização

Sempre que um token for criado, alterado ou removido:

1. Atualizar no **Design Tokens Manager** (aplicação web)
2. Exportar novo **STYLE_GUIDE.md** e **JSONs para o Figma**
3. Reimportar as variáveis no Figma
4. Verificar componentes afetados
5. Publicar a Library atualizada
6. Avisar o time de desenvolvimento

### Compatibilidade com IA/MCP

Para que a IA consiga correlacionar design e código:

- Mantenha nomes **claros e consistentes** (ex: `semantic/bg/brand-default`)
- Evite abreviações obscuras
- Na descrição da variável no Figma, documente o uso previsto e a referência ao código (ex: `light-dark(primary-6, primary-5)`)

---

## Checklist Resumido

- [ ] Criar arquivo **`Design System – Tokens`** no Figma
- [ ] Exportar JSONs do Design Tokens Manager (Colors, Spacing, Radius, Typography)
- [ ] Importar `Colors.json` — verificar modos Light/Dark e aliases
- [ ] Importar `Spacing.json` — verificar valores
- [ ] Importar `Radius.json` — verificar valores
- [ ] Importar `Typography.json` — criar Text Styles vinculados
- [ ] Criar **Effect Styles** para sombras (`shadow/xs` a `shadow/xl`)
- [ ] Criar **Effect Styles** para glows (`glow/xs` a `glow/xl`)
- [ ] Documentar tokens de Motion para referência de protótipos
- [ ] Aplicar variáveis em todos os componentes (fill, stroke, padding, gap, radius, text)
- [ ] Publicar como **Library**
- [ ] Comunicar o time sobre a disponibilidade da Library

---

**Última atualização:** 2026
**Relação:** Complemento operacional do `STYLE_GUIDE.md` e `AGENTS.md`.
