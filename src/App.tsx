import { Fragment, useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

type SectionId = 'colors' | 'spacing' | 'radius' | 'typography' | 'shadows';

type TokenRow = {
  readonly token: string;
  readonly light: string;
  readonly dark: string;
  readonly mantineVar?: string;
  readonly group?: string;
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
        token: 'color/primary/0',
        light: '#EFF6FF',
        dark: '#EFF6FF',
        mantineVar: 'theme.colors.primary[0]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/1',
        light: '#DBEAFE',
        dark: '#DBEAFE',
        mantineVar: 'theme.colors.primary[1]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/2',
        light: '#BFDBFE',
        dark: '#BFDBFE',
        mantineVar: 'theme.colors.primary[2]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/3',
        light: '#93C5FD',
        dark: '#93C5FD',
        mantineVar: 'theme.colors.primary[3]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/4',
        light: '#60A5FA',
        dark: '#60A5FA',
        mantineVar: 'theme.colors.primary[4]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/5',
        light: '#3B82F6',
        dark: '#3B82F6',
        mantineVar: 'theme.colors.primary[5]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/6',
        light: '#2563EB',
        dark: '#2563EB',
        mantineVar: 'theme.colors.primary[6]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/7',
        light: '#1D4ED8',
        dark: '#1D4ED8',
        mantineVar: 'theme.colors.primary[7]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/8',
        light: '#1E40AF',
        dark: '#1E40AF',
        mantineVar: 'theme.colors.primary[8]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/primary/9',
        light: '#1E3A8A',
        dark: '#1E3A8A',
        mantineVar: 'theme.colors.primary[9]',
        group: 'Paleta · Primárias',
      },
      {
        token: 'color/secondary/0',
        light: '#F5F3FF',
        dark: '#F5F3FF',
        mantineVar: 'theme.colors.secondary[0]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/1',
        light: '#EDE9FE',
        dark: '#EDE9FE',
        mantineVar: 'theme.colors.secondary[1]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/2',
        light: '#DDD6FE',
        dark: '#DDD6FE',
        mantineVar: 'theme.colors.secondary[2]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/3',
        light: '#C4B5FD',
        dark: '#C4B5FD',
        mantineVar: 'theme.colors.secondary[3]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/4',
        light: '#A78BFA',
        dark: '#A78BFA',
        mantineVar: 'theme.colors.secondary[4]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/5',
        light: '#8B5CF6',
        dark: '#8B5CF6',
        mantineVar: 'theme.colors.secondary[5]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/6',
        light: '#7C3AED',
        dark: '#7C3AED',
        mantineVar: 'theme.colors.secondary[6]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/7',
        light: '#6D28D9',
        dark: '#6D28D9',
        mantineVar: 'theme.colors.secondary[7]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/8',
        light: '#5B21B6',
        dark: '#5B21B6',
        mantineVar: 'theme.colors.secondary[8]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/secondary/9',
        light: '#4C1D95',
        dark: '#4C1D95',
        mantineVar: 'theme.colors.secondary[9]',
        group: 'Paleta · Secundárias',
      },
      {
        token: 'color/tertiary/0',
        light: '#ECFDF5',
        dark: '#ECFDF5',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/1',
        light: '#DCFCE7',
        dark: '#DCFCE7',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/2',
        light: '#BBF7D0',
        dark: '#BBF7D0',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/3',
        light: '#86EFAC',
        dark: '#86EFAC',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/4',
        light: '#4ADE80',
        dark: '#4ADE80',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/5',
        light: '#22C55E',
        dark: '#22C55E',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/6',
        light: '#16A34A',
        dark: '#16A34A',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/7',
        light: '#15803D',
        dark: '#15803D',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/8',
        light: '#166534',
        dark: '#166534',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/tertiary/9',
        light: '#14532D',
        dark: '#14532D',
        group: 'Paleta · Terciárias',
      },
      {
        token: 'color/neutral/0',
        light: '#F9FAFB',
        dark: '#F9FAFB',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/1',
        light: '#F3F4F6',
        dark: '#F3F4F6',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/2',
        light: '#E5E7EB',
        dark: '#E5E7EB',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/3',
        light: '#D1D5DB',
        dark: '#D1D5DB',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/4',
        light: '#9CA3AF',
        dark: '#9CA3AF',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/5',
        light: '#6B7280',
        dark: '#6B7280',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/6',
        light: '#4B5563',
        dark: '#4B5563',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/7',
        light: '#374151',
        dark: '#374151',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/8',
        light: '#1F2937',
        dark: '#1F2937',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/neutral/9',
        light: '#111827',
        dark: '#111827',
        group: 'Paleta · Neutras',
      },
      {
        token: 'color/dark/0',
        light: '#C1C2C5',
        dark: '#C1C2C5',
        mantineVar: 'theme.colors.dark[0]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/1',
        light: '#A6A7AB',
        dark: '#A6A7AB',
        mantineVar: 'theme.colors.dark[1]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/2',
        light: '#909296',
        dark: '#909296',
        mantineVar: 'theme.colors.dark[2]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/3',
        light: '#5C5F66',
        dark: '#5C5F66',
        mantineVar: 'theme.colors.dark[3]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/4',
        light: '#373A40',
        dark: '#373A40',
        mantineVar: 'theme.colors.dark[4]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/5',
        light: '#2C2E33',
        dark: '#2C2E33',
        mantineVar: 'theme.colors.dark[5]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/6',
        light: '#25262B',
        dark: '#25262B',
        mantineVar: 'theme.colors.dark[6]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/7',
        light: '#1A1B1E',
        dark: '#1A1B1E',
        mantineVar: 'theme.colors.dark[7]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/8',
        light: '#141517',
        dark: '#141517',
        mantineVar: 'theme.colors.dark[8]',
        group: 'Paleta · Dark',
      },
      {
        token: 'color/dark/9',
        light: '#101113',
        dark: '#101113',
        mantineVar: 'theme.colors.dark[9]',
        group: 'Paleta · Dark',
      },
      {
        token: 'semantic/bg/body',
        light: '#F9FAFB',
        dark: '#1A1B1E',
        mantineVar: 'var(--mantine-color-body)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/surface',
        light: '#F9FAFB',
        dark: '#25262B',
        mantineVar: 'var(--mantine-color-default)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/subtle',
        light: '#F9FAFB',
        dark: '#141517',
        mantineVar: 'light-dark(gray-0, dark-8)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/muted',
        light: '#F3F4F6',
        dark: '#1A1B1E',
        mantineVar: 'light-dark(gray-1, dark-7)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/overlay',
        light: 'rgba(0,0,0,0.45)',
        dark: 'rgba(0,0,0,0.65)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/hover',
        light: '#F3F4F6',
        dark: '#25262B',
        mantineVar: 'light-dark(gray-1, dark-6)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/selected',
        light: '#EFF6FF',
        dark: '#1E3A8A',
        mantineVar: 'light-dark(primary-0, primary-9)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/input',
        light: '#F3F4F6',
        dark: '#25262B',
        mantineVar: 'var(--mantine-color-default)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/brand-default',
        light: '#2563EB',
        dark: '#3B82F6',
        mantineVar: 'light-dark(primary-6, primary-5)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/brand-hover',
        light: '#1D4ED8',
        dark: '#2563EB',
        mantineVar: 'light-dark(primary-7, primary-6)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/brand-subtle',
        light: '#DBEAFE',
        dark: '#1E3A8A',
        mantineVar: 'light-dark(primary-1, primary-9)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/accent-default',
        light: '#7C3AED',
        dark: '#8B5CF6',
        mantineVar: 'light-dark(secondary-6, secondary-5)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/accent-hover',
        light: '#6D28D9',
        dark: '#7C3AED',
        mantineVar: 'light-dark(secondary-7, secondary-6)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/accent-subtle',
        light: '#EDE9FE',
        dark: '#4C1D95',
        mantineVar: 'light-dark(secondary-1, secondary-9)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/tertiary-default',
        light: '#16A34A',
        dark: '#22C55E',
        mantineVar: 'light-dark(tertiary-6, tertiary-5)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/tertiary-hover',
        light: '#15803D',
        dark: '#16A34A',
        mantineVar: 'light-dark(tertiary-7, tertiary-6)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/tertiary-subtle',
        light: '#DCFCE7',
        dark: '#14532D',
        mantineVar: 'light-dark(tertiary-1, tertiary-9)',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/success-bg',
        light: '#DCFCE7',
        dark: '#052E16',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/error-bg',
        light: '#FEE2E2',
        dark: '#3B0000',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/warning-bg',
        light: '#FEF9C3',
        dark: '#2D1B00',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/bg/info-bg',
        light: '#DBEAFE',
        dark: '#0F172A',
        group: 'Semânticas · Background',
      },
      {
        token: 'semantic/text/primary',
        light: '#111827',
        dark: '#C1C2C5',
        mantineVar: 'var(--mantine-color-text)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/secondary',
        light: '#4B5563',
        dark: '#909296',
        mantineVar: 'var(--mantine-color-dimmed)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/disabled',
        light: '#6B7280',
        dark: '#5C5F66',
        mantineVar: 'light-dark(gray-5, dark-3)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/placeholder',
        light: '#9CA3AF',
        dark: '#909296',
        mantineVar: 'light-dark(gray-4, dark-2)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/inverse',
        light: '#F9FAFB',
        dark: '#111827',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/link',
        light: '#2563EB',
        dark: '#60A5FA',
        mantineVar: 'light-dark(primary-6, primary-4)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/error-text',
        light: '#DC2626',
        dark: '#F87171',
        mantineVar: 'light-dark(red-6, red-4)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/success-text',
        light: '#16A34A',
        dark: '#4ADE80',
        mantineVar: 'light-dark(green-6, green-4)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/warning-text',
        light: '#854D0E',
        dark: '#FCD34D',
        mantineVar: 'light-dark(yellow-7, yellow-4)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/brand-subtle',
        light: '#1D4ED8',
        dark: '#93C5FD',
        mantineVar: 'light-dark(primary-7, primary-3)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/accent-subtle',
        light: '#6D28D9',
        dark: '#C4B5FD',
        mantineVar: 'light-dark(secondary-7, secondary-3)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/text/tertiary-subtle',
        light: '#15803D',
        dark: '#86EFAC',
        mantineVar: 'light-dark(tertiary-7, tertiary-3)',
        group: 'Semânticas · Texto',
      },
      {
        token: 'semantic/border/default',
        light: '#D1D5DB',
        dark: '#373A40',
        mantineVar: 'light-dark(gray-3, dark-4)',
        group: 'Semânticas · Borda',
      },
      {
        token: 'semantic/border/subtle',
        light: '#E5E7EB',
        dark: '#2C2E33',
        mantineVar: 'light-dark(gray-2, dark-5)',
        group: 'Semânticas · Borda',
      },
      {
        token: 'semantic/border/strong',
        light: '#6B7280',
        dark: '#5C5F66',
        mantineVar: 'light-dark(gray-5, dark-3)',
        group: 'Semânticas · Borda',
      },
      {
        token: 'semantic/border/focus',
        light: '#2563EB',
        dark: '#60A5FA',
        mantineVar: 'light-dark(primary-6, primary-4)',
        group: 'Semânticas · Borda',
      },
      {
        token: 'semantic/border/error-border',
        light: '#DC2626',
        dark: '#EF4444',
        mantineVar: 'light-dark(red-6, red-5)',
        group: 'Semânticas · Borda',
      },
      {
        token: 'semantic/icon/default',
        light: '#111827',
        dark: '#C1C2C5',
        mantineVar: 'light-dark(neutral-9, dark-0)',
        group: 'Semânticas · Ícone',
      },
      {
        token: 'semantic/icon/muted',
        light: '#4B5563',
        dark: '#909296',
        mantineVar: 'light-dark(neutral-6, dark-2)',
        group: 'Semânticas · Ícone',
      },
      {
        token: 'semantic/icon/brand',
        light: '#2563EB',
        dark: '#3B82F6',
        mantineVar: 'light-dark(primary-6, primary-5)',
        group: 'Semânticas · Ícone',
      },
      {
        token: 'semantic/icon/accent',
        light: '#7C3AED',
        dark: '#8B5CF6',
        mantineVar: 'light-dark(secondary-6, secondary-5)',
        group: 'Semânticas · Ícone',
      },
      {
        token: 'semantic/icon/tertiary',
        light: '#16A34A',
        dark: '#22C55E',
        mantineVar: 'light-dark(tertiary-6, tertiary-5)',
        group: 'Semânticas · Ícone',
      },
    ],
  },
  {
    id: 'spacing',
    name: 'Espaçamento',
    description: 'Configure valores definidos para padding, margin, gap e outros.',
    rows: [
      { token: 'space-xs', light: '4px', dark: '4px', mantineVar: 'theme.spacing.xs' },
      { token: 'space-sm', light: '8px', dark: '8px', mantineVar: 'theme.spacing.sm' },
      { token: 'space-md', light: '16px', dark: '16px', mantineVar: 'theme.spacing.md' },
      { token: 'space-lg', light: '24px', dark: '24px', mantineVar: 'theme.spacing.lg' },
      { token: 'space-xl', light: '32px', dark: '32px', mantineVar: 'theme.spacing.xl' },
      { token: 'space-2xl', light: '48px', dark: '48px', mantineVar: 'theme.spacing.xxl' },
    ],
  },
  {
    id: 'radius',
    name: 'Radius',
    description: 'Arredondamento de cantos para inputs, cards, buttons e pills.',
    rows: [
      { token: 'radius-xs', light: '2px', dark: '2px', mantineVar: 'theme.radius.xs' },
      { token: 'radius-sm', light: '4px', dark: '4px', mantineVar: 'theme.radius.sm' },
      { token: 'radius-md', light: '8px', dark: '8px', mantineVar: 'theme.radius.md' },
      { token: 'radius-lg', light: '12px', dark: '12px', mantineVar: 'theme.radius.lg' },
      { token: 'radius-xl', light: '16px', dark: '16px', mantineVar: 'theme.radius.xl' },
      { token: 'radius-full', light: '9999px', dark: '9999px', mantineVar: 'theme.radius.full' },
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

function isAccentToken(token: string): boolean {
  return (
    token.startsWith('color/secondary/') ||
    token === 'semantic/bg/accent-default' ||
    token === 'semantic/bg/accent-hover' ||
    token === 'semantic/bg/accent-subtle' ||
    token === 'semantic/text/accent-subtle' ||
    token === 'semantic/icon/accent'
  );
}

function isTertiaryToken(token: string): boolean {
  return (
    token.startsWith('color/tertiary/') ||
    token === 'semantic/bg/tertiary-default' ||
    token === 'semantic/bg/tertiary-hover' ||
    token === 'semantic/bg/tertiary-subtle' ||
    token === 'semantic/text/tertiary-subtle' ||
    token === 'semantic/icon/tertiary'
  );
}

export function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('colors');
  const [search, setSearch] = useState('');
  const [useSecondary, setUseSecondary] = useState(true);
  const [useTertiary, setUseTertiary] = useState(true);

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

  const basePaletteOptions = useMemo(
    () =>
      SECTIONS.find((section) => section.id === 'colors')?.rows.filter(
        (row) =>
          row.token.startsWith('color/primary/') ||
          row.token.startsWith('color/neutral/') ||
          row.token.startsWith('color/dark/') ||
          (useSecondary && row.token.startsWith('color/secondary/')) ||
          (useTertiary && row.token.startsWith('color/tertiary/')),
      ) ?? [],
    [useSecondary, useTertiary],
  );

  const handleExportStyleGuide = (): void => {
    const link = document.createElement('a');
    link.href = '/STYLE_GUIDE.md';
    link.download = 'STYLE_GUIDE.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFigmaJson = (): void => {
    if (activeSectionId !== 'colors') {
      alert('Por enquanto, a exportação para o Figma está disponível apenas para a seção de cores.');
      return;
    }

    const toFigmaColor = (value: string): { r: number; g: number; b: number; a: number } => {
      const trimmed = value.trim();

      if (trimmed.startsWith('#')) {
        const hex = trimmed.replace('#', '');
        const full =
          hex.length === 3
            ? hex
                .split('')
                .map((ch) => ch + ch)
                .join('')
            : hex;

        const r = Number.parseInt(full.slice(0, 2), 16) || 0;
        const g = Number.parseInt(full.slice(2, 4), 16) || 0;
        const b = Number.parseInt(full.slice(4, 6), 16) || 0;

        return {
          r: r / 255,
          g: g / 255,
          b: b / 255,
          a: 1,
        };
      }

      const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
      if (rgbaMatch) {
        const parts = rgbaMatch[1]
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean);

        const [rRaw, gRaw, bRaw, aRaw] = parts;
        const r = Number.parseFloat(rRaw ?? '0');
        const g = Number.parseFloat(gRaw ?? '0');
        const b = Number.parseFloat(bRaw ?? '0');
        const a =
          parts.length >= 4 && aRaw !== undefined ? Number.parseFloat(aRaw) || 1 : 1;

        return {
          r: r / 255,
          g: g / 255,
          b: b / 255,
          a,
        };
      }

      return { r: 0, g: 0, b: 0, a: 1 };
    };

    const colorsSection = SECTIONS.find((section) => section.id === 'colors');
    if (!colorsSection) {
      return;
    }

    const exportRows = colorsSection.rows.filter(
      (row) =>
        (!isAccentToken(row.token) || useSecondary) &&
        (!isTertiaryToken(row.token) || useTertiary),
    );

    // Padrão do Figma: prefixo numérico da coleção, modos como "X:0" e "X:1", variable IDs sequenciais
    const collectionPrefix = '1';
    const modeLightKey = `${collectionPrefix}:0`;
    const modeDarkKey = `${collectionPrefix}:1`;

    const variableIds: string[] = [];
    const tokenToId: Record<string, string> = {};

    const getScopesForToken = (token: string): string[] => {
      if (!token.startsWith('semantic/')) {
        return ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
      }
      if (token.startsWith('semantic/bg/')) return ['FRAME_FILL', 'SHAPE_FILL'];
      if (token.startsWith('semantic/text/')) return ['TEXT_FILL'];
      if (token.startsWith('semantic/border/')) return ['STROKE_COLOR'];
      if (token.startsWith('semantic/icon/')) return ['SHAPE_FILL'];
      return ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR'];
    };

    const variables = exportRows.map((row, index) => {
      const variableId = `VariableID:${collectionPrefix}:${index + 1}`;
      const variableName = row.token;

      variableIds.push(variableId);
      tokenToId[row.token] = variableId;

      const lightValue = lightColors[row.token] ?? row.light;
      const darkValue = darkColors[row.token] ?? row.dark;
      const lightColor = toFigmaColor(lightValue);
      const darkColor = toFigmaColor(darkValue);

      return {
        id: variableId,
        name: variableName,
        description: '',
        type: 'COLOR',
        valuesByMode: {
          [modeLightKey]: lightColor,
          [modeDarkKey]: darkColor,
        },
        resolvedValuesByMode: {
          [modeLightKey]: { resolvedValue: lightColor, alias: null },
          [modeDarkKey]: { resolvedValue: darkColor, alias: null },
        },
        scopes: getScopesForToken(row.token),
        hiddenFromPublishing: false,
        codeSyntax: {},
      };
    });

    const basePaletteTokens = exportRows
      .filter((row) =>
        row.token.startsWith('color/primary/') ||
        row.token.startsWith('color/secondary/') ||
        row.token.startsWith('color/tertiary/') ||
        row.token.startsWith('color/neutral/') ||
        row.token.startsWith('color/dark/'),
      )
      .map((row) => row.token);

    const isOverlayOrFeedbackSemantic = (token: string): boolean =>
      token === 'semantic/bg/overlay' ||
      token === 'semantic/border/error-border' ||
      token === 'semantic/text/success-text' ||
      token === 'semantic/text/warning-text' ||
      token === 'semantic/text/error-text' ||
      token === 'semantic/bg/success-bg' ||
      token === 'semantic/bg/error-bg' ||
      token === 'semantic/bg/warning-bg' ||
      token === 'semantic/bg/info-bg';

    const figmaAlias = (id: string): { type: 'VARIABLE_ALIAS'; id: string } => ({
      type: 'VARIABLE_ALIAS',
      id,
    });

    variables.forEach((variable) => {
      const token = variable.name;
      if (!token.startsWith('semantic/')) {
        return;
      }

      if (isOverlayOrFeedbackSemantic(token)) {
        return;
      }

      const lightResolved = variable.resolvedValuesByMode[modeLightKey].resolvedValue;
      const darkResolved = variable.resolvedValuesByMode[modeDarkKey].resolvedValue;

      const findBaseTokenForMode = (
        resolved: { r: number; g: number; b: number; a: number },
        getBaseValue: (baseToken: string) => string,
      ): string | undefined =>
        basePaletteTokens.find((baseToken) => {
          const baseValue = getBaseValue(baseToken);
          const baseColor = toFigmaColor(baseValue);
          return (
            Math.abs(baseColor.r - resolved.r) < 0.0001 &&
            Math.abs(baseColor.g - resolved.g) < 0.0001 &&
            Math.abs(baseColor.b - resolved.b) < 0.0001 &&
            Math.abs(baseColor.a - resolved.a) < 0.0001
          );
        });

      const baseTokenLight = findBaseTokenForMode(lightResolved, (baseToken) =>
        lightColors[baseToken] ??
        exportRows.find((row) => row.token === baseToken)?.light ??
        '',
      );
      const baseTokenDark = findBaseTokenForMode(darkResolved, (baseToken) =>
        darkColors[baseToken] ??
        exportRows.find((row) => row.token === baseToken)?.dark ??
        '',
      );

      const baseIdLight = baseTokenLight ? tokenToId[baseTokenLight] : null;
      const baseIdDark = baseTokenDark ? tokenToId[baseTokenDark] : null;

      if (baseIdLight) {
        variable.valuesByMode[modeLightKey] = figmaAlias(baseIdLight);
        const resolvedLight = variable.resolvedValuesByMode[modeLightKey] as {
          resolvedValue: { r: number; g: number; b: number; a: number };
          alias: string | null;
          aliasName?: string;
        };
        resolvedLight.alias = baseIdLight;
        resolvedLight.aliasName = baseTokenLight;
      }
      if (baseIdDark) {
        variable.valuesByMode[modeDarkKey] = figmaAlias(baseIdDark);
        const resolvedDark = variable.resolvedValuesByMode[modeDarkKey] as {
          resolvedValue: { r: number; g: number; b: number; a: number };
          alias: string | null;
          aliasName?: string;
        };
        resolvedDark.alias = baseIdDark;
        resolvedDark.aliasName = baseTokenDark;
      }
    });

    const collection = {
      id: `VariableCollectionId:${collectionPrefix}:0`,
      name: 'Cores',
      modes: {
        [modeLightKey]: 'Light',
        [modeDarkKey]: 'Dark',
      },
      variableIds,
      variables,
    };

    const json = JSON.stringify(collection, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Cores.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFigmaSpacingJson = (): void => {
    if (activeSectionId !== 'spacing') {
      alert('A exportação de espaçamento para o Figma está disponível apenas na seção de espaçamento.');
      return;
    }

    const spacingSection = SECTIONS.find((section) => section.id === 'spacing');
    if (!spacingSection) {
      return;
    }

    const toFigmaSpacingValue = (value: string): number => {
      const numeric = Number.parseFloat(value);
      if (Number.isNaN(numeric)) {
        return 0;
      }
      return numeric;
    };

    const collectionPrefix = '2';
    const modeKey = `${collectionPrefix}:0`;

    const variableIds: string[] = [];

    const variables = spacingSection.rows.map((row, index) => {
      const variableId = `VariableID:${collectionPrefix}:${index + 1}`;
      const variableName = row.token;

      variableIds.push(variableId);

      const otherKey = `${spacingSection.id}:${row.token}`;
      const rawValue = otherValues[otherKey] ?? row.light;
      const value = toFigmaSpacingValue(rawValue);

      return {
        id: variableId,
        name: variableName,
        description: '',
        type: 'FLOAT',
        valuesByMode: {
          [modeKey]: value,
        },
        resolvedValuesByMode: {
          [modeKey]: { resolvedValue: value, alias: null },
        },
        scopes: [],
        hiddenFromPublishing: false,
        codeSyntax: {},
      };
    });

    const collection = {
      id: `VariableCollectionId:${collectionPrefix}:0`,
      name: 'Espaçamento',
      modes: {
        [modeKey]: 'Default',
      },
      variableIds,
      variables,
    };

    const json = JSON.stringify(collection, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Espacamento.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFigmaRadiusJson = (): void => {
    if (activeSectionId !== 'radius') {
      alert('A exportação de radius para o Figma está disponível apenas na seção de radius.');
      return;
    }

    const radiusSection = SECTIONS.find((section) => section.id === 'radius');
    if (!radiusSection) {
      return;
    }

    const toRadiusNumber = (value: string): number => {
      const numeric = Number.parseFloat(value);
      if (Number.isNaN(numeric)) {
        return 0;
      }
      return numeric;
    };

    const tokens: Record<
      string,
      {
        $type: 'number';
        $value: number;
        $extensions: {
          'com.figma.scopes': string[];
        };
      }
    > = {};

    radiusSection.rows.forEach((row) => {
      const otherKey = `${radiusSection.id}:${row.token}`;
      const rawValue = otherValues[otherKey] ?? row.light;
      const value = toRadiusNumber(rawValue);

      tokens[row.token] = {
        $type: 'number',
        $value: value,
        $extensions: {
          'com.figma.scopes': ['CORNER_RADIUS'],
        },
      };
    });

    const json = JSON.stringify(
      {
        ...tokens,
        $extensions: {
          'com.figma.modeName': 'Dark',
        },
      },
      null,
      2,
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Radius.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const allPrimitivePaletteColumns = [
    { key: 'primary', label: 'Primárias', tokenPrefix: 'color/primary/' },
    { key: 'secondary', label: 'Secundárias', tokenPrefix: 'color/secondary/' },
    { key: 'tertiary', label: 'Terciárias', tokenPrefix: 'color/tertiary/' },
    { key: 'neutral', label: 'Neutral Light', tokenPrefix: 'color/neutral/' },
    { key: 'dark', label: 'Neutral Dark', tokenPrefix: 'color/dark/' },
  ] as const;

  const primitivePaletteColumns = allPrimitivePaletteColumns.filter(
    (col) =>
      col.key === 'primary' ||
      col.key === 'neutral' ||
      col.key === 'dark' ||
      (col.key === 'secondary' && useSecondary) ||
      (col.key === 'tertiary' && useTertiary),
  );

  const colorsSection =
    activeSectionId === 'colors'
      ? SECTIONS.find((s) => s.id === 'colors')
      : null;

  const primitiveRowIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const filteredPrimitiveRowIndices =
    colorsSection && search.trim()
      ? primitiveRowIndices.filter((i) => {
          const term = search.trim().toLowerCase();
          return primitivePaletteColumns.some((col) => {
            const token = `${col.tokenPrefix}${i}`;
            const row = colorsSection.rows.find((r) => r.token === token);
            if (!row) return false;
            return (
              token.toLowerCase().includes(term) ||
              row.light.toLowerCase().includes(term) ||
              row.dark.toLowerCase().includes(term)
            );
          });
        })
      : primitiveRowIndices;

  const semanticRows =
    activeSectionId === 'colors'
      ? filteredRows
          .filter((row) => row.token.startsWith('semantic/'))
          .filter(
            (row) =>
              (!isAccentToken(row.token) || useSecondary) &&
              (!isTertiaryToken(row.token) || useTertiary),
          )
      : filteredRows;

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
            <button
              type="button"
              className="secondary-button"
              onClick={handleExportStyleGuide}
            >
              Exportar STYLE_GUIDE.md
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={
                activeSectionId === 'spacing'
                    ? handleExportFigmaSpacingJson
                    : activeSectionId === 'radius'
                      ? handleExportFigmaRadiusJson
                      : handleExportFigmaJson
              }
            >
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

          {activeSectionId === 'colors' && colorsSection ? (
            <div className="primitive-palettes-wrapper">
              <div className="palette-options">
                <span className="palette-options-label">Incluir no projeto:</span>
                <label className="palette-option-checkbox">
                  <input
                    type="checkbox"
                    checked={useSecondary}
                    onChange={(e) => setUseSecondary(e.target.checked)}
                  />
                  Secundárias (accent)
                </label>
                <label className="palette-option-checkbox">
                  <input
                    type="checkbox"
                    checked={useTertiary}
                    onChange={(e) => setUseTertiary(e.target.checked)}
                  />
                  Terciárias
                </label>
              </div>
              <h3 className="primitive-palettes-title">Paletas primitivas</h3>
              <div className="tokens-table-wrapper">
                <table className="tokens-table primitive-palettes-table">
                <thead>
                  <tr>
                    {primitivePaletteColumns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPrimitiveRowIndices.map((i) => (
                    <tr key={`primitive-row-${i}`}>
                      {primitivePaletteColumns.map((col) => {
                        const token = `${col.tokenPrefix}${i}`;
                        const row = colorsSection.rows.find(
                          (r) => r.token === token,
                        );
                        const value =
                          lightColors[token] ??
                          darkColors[token] ??
                          row?.light ??
                          '#000000';
                        return (
                          <td key={col.key} className="primitive-cell">
                            <code className="token-pill">{token}</code>
                            <ColorField
                              color={value}
                              onChange={(nextColor) => {
                                setLightColors((prev) => ({
                                  ...prev,
                                  [token]: nextColor,
                                }));
                                setDarkColors((prev) => ({
                                  ...prev,
                                  [token]: nextColor,
                                }));
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : null}

          {activeSectionId === 'colors' ? (
            <h3 className="semantic-tokens-title">Cores semânticas</h3>
          ) : null}

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
                  activeSectionId === 'sizes' ||
                  activeSectionId === 'radius' ||
                  activeSectionId === 'typography' ? (
                    <th>Preview</th>
                  ) : null}
                  {activeSectionId !== 'colors' ? <th>Var Mantine</th> : null}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastColorGroup: string | undefined;
                  const rowsToRender =
                    activeSectionId === 'colors' ? semanticRows : filteredRows;
                  return rowsToRender.map((row) => {
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
                    const isSemanticToken = row.token.startsWith('semantic/');
                    const isOverlayOrFeedbackSemantic =
                      row.token === 'semantic/bg/overlay' ||
                      row.token === 'semantic/border/error-border' ||
                      row.token === 'semantic/text/success-text' ||
                      row.token === 'semantic/text/warning-text' ||
                      row.token === 'semantic/text/error-text' ||
                      row.token === 'semantic/bg/success-bg' ||
                      row.token === 'semantic/bg/error-bg' ||
                      row.token === 'semantic/bg/warning-bg' ||
                      row.token === 'semantic/bg/info-bg';

                    const showGroupHeader =
                      typeof row.group === 'string' && row.group !== lastColorGroup;
                    if (row.group) {
                      lastColorGroup = row.group;
                    }

                    const selectedLightBase = basePaletteOptions.find(
                      (baseRow) =>
                        baseRow.light.toLowerCase() === lightColor.toLowerCase(),
                    );
                    const selectedDarkBase = basePaletteOptions.find(
                      (baseRow) =>
                        baseRow.dark.toLowerCase() === darkColor.toLowerCase(),
                    );

                    return (
                      <Fragment key={row.token}>
                        {showGroupHeader ? (
                          <tr>
                            <td colSpan={3} className="token-group-row">
                              {row.group}
                            </td>
                          </tr>
                        ) : null}
                        <tr>
                          <td className="token-name">
                            <code>{row.token}</code>
                          </td>
                          {isSemanticToken && !isOverlayOrFeedbackSemantic ? (
                            <>
                              <td>
                                <div className="token-select-wrapper">
                                  <select
                                    className="token-select"
                                    value={selectedLightBase?.token ?? ''}
                                    onChange={(event) => {
                                      const baseToken = basePaletteOptions.find(
                                        (baseRow) => baseRow.token === event.target.value,
                                      );
                                      if (!baseToken) return;
                                      setLightColors((previous) => ({
                                        ...previous,
                                        [row.token]: baseToken.light,
                                      }));
                                    }}
                                  >
                                    <option value="">Custom</option>
                                    {basePaletteOptions.map((baseRow) => (
                                      <option key={baseRow.token} value={baseRow.token}>
                                        {baseRow.token}
                                      </option>
                                    ))}
                                  </select>
                                  <span
                                    className="token-select-preview"
                                    style={{
                                      backgroundColor:
                                        selectedLightBase?.light ?? lightColor,
                                    }}
                                  />
                                </div>
                              </td>
                              <td>
                                <div className="token-select-wrapper">
                                  <select
                                    className="token-select"
                                    value={selectedDarkBase?.token ?? ''}
                                    onChange={(event) => {
                                      const baseToken = basePaletteOptions.find(
                                        (baseRow) => baseRow.token === event.target.value,
                                      );
                                      if (!baseToken) return;
                                      setDarkColors((previous) => ({
                                        ...previous,
                                        [row.token]: baseToken.dark,
                                      }));
                                    }}
                                  >
                                    <option value="">Custom</option>
                                    {basePaletteOptions.map((baseRow) => (
                                      <option key={baseRow.token} value={baseRow.token}>
                                        {baseRow.token}
                                      </option>
                                    ))}
                                  </select>
                                  <span
                                    className="token-select-preview"
                                    style={{
                                      backgroundColor:
                                        selectedDarkBase?.dark ?? darkColor,
                                    }}
                                  />
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </tr>
                      </Fragment>
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
                  });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

