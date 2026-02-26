import { useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

type SectionId = 'colors' | 'spacing' | 'radius' | 'typography' | 'shadows';

type TokenRow = {
  readonly token: string;
  readonly light: string;
  readonly dark: string;
  readonly mantineVar?: string;
};

type SectionConfig = {
  readonly id: SectionId;
  readonly name: string;
  readonly description: string;
  readonly rows: TokenRow[];
};

type ColorFieldProps = {
  readonly color: string;
  readonly onChange: (nextColor: string) => void;
};

function ColorField({ color, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(color);

  useEffect(() => {
    setDraft(color);
  }, [color]);

  const handleSave = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <div className="color-field">
      <button
        type="button"
        className="color-swatch-button"
        style={{ backgroundColor: draft }}
        onClick={() => setOpen((previous) => !previous)}
      />
      <input
        type="text"
        className="color-field-input"
        value={draft.toUpperCase()}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
      />
      {open ? (
        <div className="color-popover" onClick={(event) => event.stopPropagation()}>
          <HexColorPicker color={draft} onChange={setDraft} />
          <button type="button" className="color-save-button" onClick={handleSave}>
            Salvar cor
          </button>
        </div>
      ) : null}
    </div>
  );
}

type ShadowFieldProps = {
  readonly value: string;
  readonly onChange: (nextValue: string) => void;
};

function ShadowField({ value, onChange }: ShadowFieldProps) {
  const parseComponents = (shadow: string): {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
  } => {
    const [lengthsPart] = shadow.split(/rgba?\(/);
    if (!lengthsPart) {
      return { offsetX: 0, offsetY: 0, blur: 0, spread: 0 };
    }

    const tokens = lengthsPart
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const values: number[] = [];

    tokens.forEach((token) => {
      if (token.endsWith('px')) {
        const numeric = Number.parseFloat(token.replace('px', ''));
        if (!Number.isNaN(numeric)) {
          values.push(numeric);
        }
      } else {
        const numeric = Number.parseFloat(token);
        if (!Number.isNaN(numeric)) {
          values.push(numeric);
        }
      }
    });

    const [offsetX, offsetY, blur, spread] = values;

    return {
      offsetX: offsetX ?? 0,
      offsetY: offsetY ?? 0,
      blur: blur ?? 0,
      spread: spread ?? 0,
    };
  };

  const applyComponents = (
    shadow: string,
    next: Partial<{ offsetX: number; offsetY: number; blur: number; spread: number }>,
  ): string => {
    const current = parseComponents(shadow);
    const merged = {
      ...current,
      ...next,
    };

    const colorMatch = shadow.match(/(rgba?\([^)]*\).*)$/);
    const colorPart = colorMatch ? colorMatch[1] : '';

    const parts: string[] = [];
    parts.push(`${merged.offsetX}px`);
    parts.push(`${merged.offsetY}px`);
    parts.push(`${merged.blur}px`);
    if (merged.spread !== 0) {
      parts.push(`${merged.spread}px`);
    }

    const lengths = parts.join(' ');
    return `${lengths}${colorPart ? ` ${colorPart}` : ''}`;
  };

  const parseOpacity = (shadow: string): number | null => {
    const match = shadow.match(/rgba?\([^,]+,[^,]+,[^,]+,([0-9.]+)\)/);
    if (!match) return null;
    const alpha = Number.parseFloat(match[1]);
    return Number.isNaN(alpha) ? null : alpha;
  };

  const applyOpacity = (shadow: string, alpha: number): string => {
    const clamped = Math.max(0, Math.min(1, alpha));
    if (shadow.includes('rgba(')) {
      return shadow.replace(/rgba\(([^)]+)\)/, (full, inner) => {
        const parts = inner.split(',').map((part: string) => part.trim());
        if (parts.length < 4) return full;
        parts[3] = clamped.toString();
        return `rgba(${parts.join(', ')})`;
      });
    }
    if (shadow.includes('rgb(')) {
      return shadow.replace(/rgb\(([^)]+)\)/, (full, inner) => {
        return `rgba(${inner}, ${clamped})`;
      });
    }
    return shadow;
  };

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [opacity, setOpacity] = useState(() => parseOpacity(value) ?? 1);
  const [colorHex, setColorHex] = useState('#000000');

  useEffect(() => {
    setDraft(value);
    setOpacity(parseOpacity(value) ?? 1);
  }, [value]);

  const handleOpacityChange = (next: number) => {
    setOpacity(next);
    setDraft((current) => applyOpacity(current, next));
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const normalized = hex.trim().replace('#', '');
    if (![3, 6].includes(normalized.length)) return null;
    const full =
      normalized.length === 3
        ? normalized
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : normalized;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  };

  const applyColor = (shadow: string, hex: string, alphaForColor: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return shadow;
    const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaForColor})`;

    if (shadow.includes('rgba(')) {
      return shadow.replace(/rgba\(([^)]+)\)/, rgbaString);
    }

    if (shadow.includes('rgb(')) {
      // Troca rgb existente por rgba mantendo offsets/blur
      return shadow.replace(/rgb\(([^)]+)\)/, rgbaString);
    }

    // Se não tiver cor, apenas adiciona a cor no final
    return `${shadow.trim()} ${rgbaString}`;
  };

  const handleSave = () => {
    onChange(draft);
    setOpen(false);
  };

  const { offsetX, offsetY, blur, spread } = parseComponents(draft);

  const handleComponentChange = (
    component: 'offsetX' | 'offsetY' | 'blur' | 'spread',
    numericValue: number,
  ) => {
    setDraft((current) =>
      applyComponents(current, {
        [component]: numericValue,
      }),
    );
  };

  return (
    <div className="shadow-field">
      <button
        type="button"
        className="shadow-swatch-button"
        style={{ boxShadow: draft }}
        onClick={() => setOpen((previous) => !previous)}
      />
      <input
        type="text"
        className="shadow-field-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
      />
      {open ? (
        <div className="shadow-popover" onClick={(event) => event.stopPropagation()}>
          <div className="shadow-color-section">
            <HexColorPicker
              color={colorHex}
              onChange={(nextHex) => {
                setColorHex(nextHex);
                setDraft((current) => applyColor(current, nextHex, opacity));
              }}
            />
          </div>
          <div className="shadow-dimensions">
            <div className="shadow-dimension-row">
              <span className="shadow-popover-title">Horizontal (X)</span>
              <input
                type="number"
                className="shadow-dimension-input"
                value={offsetX}
                onChange={(event) =>
                  handleComponentChange('offsetX', Number.parseFloat(event.target.value) || 0)
                }
              />
            </div>
            <div className="shadow-dimension-row">
              <span className="shadow-popover-title">Vertical (Y)</span>
              <input
                type="number"
                className="shadow-dimension-input"
                value={offsetY}
                onChange={(event) =>
                  handleComponentChange('offsetY', Number.parseFloat(event.target.value) || 0)
                }
              />
            </div>
            <div className="shadow-dimension-row">
              <span className="shadow-popover-title">Blur</span>
              <input
                type="number"
                className="shadow-dimension-input"
                value={blur}
                onChange={(event) =>
                  handleComponentChange('blur', Number.parseFloat(event.target.value) || 0)
                }
              />
            </div>
            <div className="shadow-dimension-row">
              <span className="shadow-popover-title">Spread</span>
              <input
                type="number"
                className="shadow-dimension-input"
                value={spread}
                onChange={(event) =>
                  handleComponentChange('spread', Number.parseFloat(event.target.value) || 0)
                }
              />
            </div>
          </div>
          <div className="shadow-popover-info">
            <p className="shadow-popover-title">Opacidade</p>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(event) => handleOpacityChange(Number.parseFloat(event.target.value))}
            />
            <span className="shadow-opacity-label">{opacity.toFixed(2)}</span>
          </div>
          <p className="shadow-popover-current">Box-shadow atual:</p>
          <p className="shadow-popover-code">{draft}</p>
          <button type="button" className="shadow-save-button" onClick={handleSave}>
            Salvar sombra
          </button>
        </div>
      ) : null}
    </div>
  );
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'colors',
    name: 'Cores',
    description:
      'Defina primária, secundária, terciária, neutros, semântica e significados/tons/shades.',
    rows: [
      {
        token: 'color-primary-50',
        light: '#EBF5FF',
        dark: '#1E3A5F',
        mantineVar: 'theme.colors.primary[0]',
      },
      {
        token: 'color-primary-500',
        light: '#2563EB',
        dark: '#60A5FA',
        mantineVar: 'theme.colors.primary[5]',
      },
      {
        token: 'color-neutral-900',
        light: '#0F172A',
        dark: '#E5E7EB',
        mantineVar: 'theme.colors.dark[9]',
      },
    ],
  },
  {
    id: 'spacing',
    name: 'Espaçamento',
    description: 'Configure valores definidos para padding, margin, gap e outros.',
    rows: [
      { token: 'space-xs', light: '4px', dark: '4px', mantineVar: 'theme.spacing.xs' },
      { token: 'space-md', light: '12px', dark: '12px', mantineVar: 'theme.spacing.md' },
      { token: 'space-xl', light: '24px', dark: '24px', mantineVar: 'theme.spacing.xl' },
    ],
  },
  {
    id: 'radius',
    name: 'Radius',
    description: 'Arredondamento de cantos para inputs, cards, buttons e pills.',
    rows: [
      { token: 'radius-sm', light: '6px', dark: '6px', mantineVar: 'theme.radius.sm' },
      { token: 'radius-md', light: '10px', dark: '10px', mantineVar: 'theme.radius.md' },
      { token: 'radius-full', light: '999px', dark: '999px', mantineVar: 'theme.radius.xl' },
    ],
  },
  {
    id: 'typography',
    name: 'Tipografia',
    description: 'Tamanhos de fontes, line height, peso e família base.',
    rows: [
      {
        token: 'font-size-sm',
        light: '14px',
        dark: '14px',
        mantineVar: 'theme.fontSizes.sm',
      },
      {
        token: 'font-size-lg',
        light: '18px',
        dark: '18px',
        mantineVar: 'theme.fontSizes.lg',
      },
      {
        token: 'font-family-base',
        light: 'Inter, system-ui',
        dark: 'Inter, system-ui',
        mantineVar: 'theme.fontFamily',
      },
    ],
  },
  {
    id: 'shadows',
    name: 'Sombras',
    description: 'Níveis de elevação e profundidade visual.',
    rows: [
      {
        token: 'shadow-xs',
        light: '0 1px 2px rgba(0,0,0,0.08)',
        dark: '0 1px 2px rgba(0,0,0,0.7)',
        mantineVar: 'theme.shadows.xs',
      },
      {
        token: 'shadow-md',
        light: '0 10px 15px rgba(15,23,42,0.1)',
        dark: '0 10px 25px rgba(0,0,0,0.7)',
        mantineVar: 'theme.shadows.md',
      },
      {
        token: 'shadow-lg',
        light: '0 20px 25px rgba(15,23,42,0.15)',
        dark: '0 24px 40px rgba(0,0,0,0.8)',
        mantineVar: 'theme.shadows.lg',
      },
    ],
  },
];

export function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('colors');
  const [search, setSearch] = useState('');

  const initialLightColors = useMemo(() => {
    const colorsSection = SECTIONS.find((section) => section.id === 'colors');
    if (!colorsSection) return {};

    const map: Record<string, string> = {};
    colorsSection.rows.forEach((row) => {
      map[row.token] = row.light;
    });

    return map;
  }, []);

  const initialDarkColors = useMemo(() => {
    const colorsSection = SECTIONS.find((section) => section.id === 'colors');
    if (!colorsSection) return {};

    const map: Record<string, string> = {};
    colorsSection.rows.forEach((row) => {
      map[row.token] = row.dark;
    });

    return map;
  }, []);

  const [lightColors, setLightColors] = useState<Record<string, string>>(initialLightColors);
  const [darkColors, setDarkColors] = useState<Record<string, string>>(initialDarkColors);

  const initialLightShadows = useMemo(() => {
    const shadowsSection = SECTIONS.find((section) => section.id === 'shadows');
    if (!shadowsSection) return {};

    const map: Record<string, string> = {};
    shadowsSection.rows.forEach((row) => {
      map[row.token] = row.light;
    });

    return map;
  }, []);

  const initialDarkShadows = useMemo(() => {
    const shadowsSection = SECTIONS.find((section) => section.id === 'shadows');
    if (!shadowsSection) return {};

    const map: Record<string, string> = {};
    shadowsSection.rows.forEach((row) => {
      map[row.token] = row.dark;
    });

    return map;
  }, []);

  const [lightShadows, setLightShadows] =
    useState<Record<string, string>>(initialLightShadows);
  const [darkShadows, setDarkShadows] =
    useState<Record<string, string>>(initialDarkShadows);
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});

  const activeSection = SECTIONS.find((section) => section.id === activeSectionId)!;

  const filteredRows = activeSection.rows.filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      row.token.toLowerCase().includes(term) ||
      row.light.toLowerCase().includes(term) ||
      row.dark.toLowerCase().includes(term)
    );
  });

  return (
    <div className="app-root">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1 className="app-title">Design Tokens Manager</h1>
          <p className="app-subtitle">
            Configure os valores dos tokens definidos em <code>STYLE_GUIDE.md</code> e
            gere uma base consistente para implementação em código e Figma.
          </p>
        </header>

        <nav className="collections-nav">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                section.id === activeSectionId ? 'nav-button active' : 'nav-button'
              }
              onClick={() => setActiveSectionId(section.id)}
            >
              <span className="nav-button-title">{section.name}</span>
              <span className="nav-button-description">{section.description}</span>
            </button>
          ))}
        </nav>

        <section className="help-panel">
          <h2>Como usar este painel</h2>
          <p>
            As colunas <strong>Valor (Light)</strong> e <strong>Valor (Dark)</strong> representam
            os dois modos obrigatórios descritos no style guide.
          </p>
          <p>
            Use este painel como referência visual para revisar nomes de tokens, categorias
            e exemplos de valores antes de configurar de fato as coleções no Figma.
          </p>
        </section>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar tokens..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="main-actions">
            <button type="button" className="secondary-button">
              Importar JSON do Figma
            </button>
            <button type="button" className="secondary-button">
              Exportar STYLE_GUIDE.md
            </button>
            <button type="button" className="primary-button">
              Exportar JSON para o Figma
            </button>
          </div>
        </header>

        <section className="collection-section">
          <header className="collection-header">
            <div>
              <h2 className="collection-title">{activeSection.name}</h2>
              <p className="collection-description">{activeSection.description}</p>
            </div>
          </header>

          <div className="tokens-table-wrapper">
            <table className="tokens-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>
                    {activeSectionId === 'colors' || activeSectionId === 'shadows'
                      ? 'Valor (Light)'
                      : 'Valor'}
                  </th>
                  {activeSectionId === 'colors' || activeSectionId === 'shadows' ? (
                    <th>Valor (Dark)</th>
                  ) : null}
                  {activeSectionId === 'spacing' ||
                  activeSectionId === 'radius' ||
                  activeSectionId === 'typography' ? (
                    <th>Preview</th>
                  ) : null}
                  <th>Var Mantine</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const isColorSection = activeSectionId === 'colors';
                  const isSpacingSection = activeSectionId === 'spacing';
                  const isRadiusSection = activeSectionId === 'radius';
                  const isTypographySection = activeSectionId === 'typography';
                  const isShadowsSection = activeSectionId === 'shadows';
                  const lightColor =
                    (isColorSection && lightColors[row.token]) || row.light;
                  const darkColor =
                    (isColorSection && darkColors[row.token]) || row.dark;
                  const otherKey = `${activeSection.id}:${row.token}`;
                  const otherValue = otherValues[otherKey] ?? row.light;

                  if (isColorSection) {
                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <ColorField
                            color={lightColor}
                            onChange={(nextColor) =>
                              setLightColors((previous) => ({
                                ...previous,
                                [row.token]: nextColor,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <ColorField
                            color={darkColor}
                            onChange={(nextColor) =>
                              setDarkColors((previous) => ({
                                ...previous,
                                [row.token]: nextColor,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                        </td>
                      </tr>
                    );
                  }

                  if (isSpacingSection) {
                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={otherValue}
                            onChange={(event) =>
                              setOtherValues((previous) => ({
                                ...previous,
                                [otherKey]: event.target.value,
                              }))
                            }
                            spellCheck={false}
                            className="token-input"
                          />
                        </td>
                        <td>
                          <div className="spacing-preview">
                            <div
                              className="spacing-preview-bar"
                              style={{
                                width:
                                  Number.parseFloat(otherValue) > 0
                                    ? `${Number.parseFloat(otherValue)}px`
                                    : '4px',
                              }}
                            />
                            <span className="spacing-preview-label">
                              {otherValue}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                        </td>
                      </tr>
                    );
                  }

                  if (isRadiusSection) {
                    const radiusValue = otherValue || '0px';

                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={otherValue}
                            onChange={(event) =>
                              setOtherValues((previous) => ({
                                ...previous,
                                [otherKey]: event.target.value,
                              }))
                            }
                            spellCheck={false}
                            className="token-input"
                          />
                        </td>
                        <td>
                          <div className="radius-preview">
                            <div
                              className="radius-preview-box"
                              style={{ borderRadius: radiusValue }}
                            />
                            <span className="radius-preview-label">{radiusValue}</span>
                          </div>
                        </td>
                        <td>
                          <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                        </td>
                      </tr>
                    );
                  }

                  if (isTypographySection) {
                    const typographyValue = otherValue || '';
                    const tokenName = row.token;

                    let previewContent: JSX.Element;

                    if (tokenName.startsWith('font-size-')) {
                      previewContent = (
                        <span
                          className="typography-preview-text"
                          style={{ fontSize: typographyValue || '14px' }}
                        >
                          Aa
                        </span>
                      );
                    } else if (tokenName.startsWith('line-height-')) {
                      previewContent = (
                        <span
                          className="typography-preview-text-multiline"
                          style={{ lineHeight: typographyValue || '1.4' }}
                        >
                          Line 1
                          <br />
                          Line 2
                        </span>
                      );
                    } else if (tokenName.startsWith('font-weight-')) {
                      previewContent = (
                        <span
                          className="typography-preview-text"
                          style={{ fontWeight: typographyValue || '400' }}
                        >
                          The quick brown fox
                        </span>
                      );
                    } else {
                      previewContent = (
                        <span
                          className="typography-preview-text"
                          style={{ fontFamily: typographyValue || 'inherit' }}
                        >
                          The quick brown fox
                        </span>
                      );
                    }

                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={otherValue}
                            onChange={(event) =>
                              setOtherValues((previous) => ({
                                ...previous,
                                [otherKey]: event.target.value,
                              }))
                            }
                            spellCheck={false}
                            className="token-input"
                          />
                        </td>
                        <td>
                          <div className="typography-preview">{previewContent}</div>
                        </td>
                        <td>
                          <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                        </td>
                      </tr>
                    );
                  }

                  if (isShadowsSection) {
                    const shadowLight = lightShadows[row.token] ?? row.light;
                    const shadowDark = darkShadows[row.token] ?? row.dark;

                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <ShadowField
                            value={shadowLight}
                            onChange={(nextValue) =>
                              setLightShadows((previous) => ({
                                ...previous,
                                [row.token]: nextValue,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <ShadowField
                            value={shadowDark}
                            onChange={(nextValue) =>
                              setDarkShadows((previous) => ({
                                ...previous,
                                [row.token]: nextValue,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.token}>
                      <td className="token-name">
                        <code>{row.token}</code>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={otherValue}
                          onChange={(event) =>
                            setOtherValues((previous) => ({
                              ...previous,
                              [otherKey]: event.target.value,
                            }))
                          }
                          spellCheck={false}
                          className="token-input"
                        />
                      </td>
                      <td>
                        <span className="mantine-var">{row.mantineVar ?? '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

