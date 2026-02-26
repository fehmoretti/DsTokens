# Design Tokens Manager

Aplicação em React para gerenciar os tokens de design descritos em `STYLE_GUIDE.md` e gerar arquivos JSON por coleção para uso em Figma (ou outras ferramentas).

## Objetivo

- Permitir que designers **definam/ajustem** os valores de todos os tokens:
  - Cores (primária, secundária, terciária, neutros, semânticas, superfícies, texto, bordas)
  - Espaçamento
  - Radius
  - Tipografia
  - Sombras
- Facilitar **importação** de arquivos JSON por coleção (Colors, Spacing, Radius, Typography, Shadows).
- Facilitar **exportação** de arquivos JSON por coleção, em um formato simples que pode ser usado como ponte para criação de coleções de variáveis no Figma.

## Tecnologias

- React 18
- TypeScript
- Vite

## Scripts

Instale as dependências com o gerenciador de sua preferência (`pnpm`, `npm` ou `yarn`):

```bash
pnpm install
# ou
npm install
```

Execute em desenvolvimento:

```bash
pnpm dev
# ou
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Estrutura principal

- `src/tokensConfig.ts`  
  Configuração das coleções (Colors, Spacing, Radius, Typography, Shadows) e lista de tokens baseada no `STYLE_GUIDE.md`.

- `src/App.tsx`  
  Layout principal, seleção de coleção, modo (Light/Dark) e lógica de importação/exportação JSON.

- `src/components/CollectionEditor.tsx`  
  Tabela editável de tokens da coleção atual, mais botões de import/export por coleção.

- `src/styles.css`  
  Estilos da aplicação (UI pensada para facilitar leitura e edição de tokens).

## Formato de JSON por coleção

Cada arquivo JSON corresponde a **uma coleção** e segue o formato:

```json
{
  "collection": "colors",
  "modes": {
    "Light": {
      "color-primary-500": "#1E90FF",
      "color-bg-page": "#FFFFFF"
    },
    "Dark": {
      "color-primary-500": "#62B0FF",
      "color-bg-page": "#050608"
    }
  }
}
```

- `collection`: nome interno da coleção (`colors`, `spacing`, `radius`, `typography`, `shadows`).
- `modes`: objeto com `Light` e `Dark`, cada um contendo os pares `token: valor`.

Este formato é simples, previsível e fácil de transformar em outros formatos esperados por plugins ou integrações de Figma.

