import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { IconPalette, IconBoxPadding, IconTypography, IconShadow, IconSparkles, IconPlayerPlay, IconArrowRight, IconFileExport, IconBrandFigma, IconCode, IconDownload, IconUpload } from '@tabler/icons-react';
import { HexColorPicker } from 'react-colorful';
import JSZip from 'jszip';

type SectionId = 'colors' | 'spacing' | 'radius' | 'typography' | 'shadows' | 'glows' | 'motion';

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

type TypographyStyleRow = {
  readonly name: string;
  readonly size: string;
  readonly weight: string;
  readonly lineHeight: string;
};

type TypographyStyleConfig = {
  readonly fontToken: string;
  readonly sizeToken: string;
  readonly weightToken: string;
  readonly lineHeightToken: string;
};

type ProjectConfig = {
  version: 1;
  lightColors: Record<string, string>;
  darkColors: Record<string, string>;
  lightShadows: Record<string, string>;
  darkShadows: Record<string, string>;
  lightGlows: Record<string, string>;
  darkGlows: Record<string, string>;
  otherValues: Record<string, string>;
  typographyStylesConfig: Record<string, TypographyStyleConfig>;
  useSecondary: boolean;
  useTertiary: boolean;
};

function getSectionIcon(id: SectionId): ReactNode {
  if (id === 'colors') return <IconPalette size={18} stroke={1.7} />;
  if (id === 'spacing') return <IconBoxPadding size={18} stroke={1.7} />;
  if (id === 'radius') return <IconBoxPadding size={18} stroke={1.7} />;
  if (id === 'typography') return <IconTypography size={18} stroke={1.7} />;
  if (id === 'shadows') return <IconShadow size={18} stroke={1.7} />;
  if (id === 'glows') return <IconSparkles size={18} stroke={1.7} />;
  if (id === 'motion') return <IconPlayerPlay size={18} stroke={1.7} />;
  return null;
}

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
        token: 'font-family-base',
        light: 'Inter, sans-serif',
        dark: 'Inter, sans-serif',
        mantineVar: 'theme.fontFamily',
      },
      {
        token: 'font-family-mono',
        light: 'JetBrains Mono, monospace',
        dark: 'JetBrains Mono, monospace',
        mantineVar: 'theme.fontFamilyMonospace',
      },
      {
        token: 'typography/size/xs',
        light: '10px',
        dark: '10px',
        mantineVar: '--mantine-font-size-xs',
      },
      {
        token: 'typography/size/sm',
        light: '12px',
        dark: '12px',
        mantineVar: '--mantine-font-size-sm',
      },
      {
        token: 'typography/size/md',
        light: '14px',
        dark: '14px',
        mantineVar: '--mantine-font-size-md',
      },
      {
        token: 'typography/size/lg',
        light: '16px',
        dark: '16px',
        mantineVar: '--mantine-font-size-lg',
      },
      {
        token: 'typography/size/xl',
        light: '18px',
        dark: '18px',
        mantineVar: '--mantine-font-size-xl',
      },
      {
        token: 'typography/size/2xl',
        light: '20px',
        dark: '20px',
      },
      {
        token: 'typography/size/3xl',
        light: '24px',
        dark: '24px',
      },
      {
        token: 'typography/size/4xl',
        light: '34px',
        dark: '34px',
      },
      {
        token: 'typography/size/5xl',
        light: '48px',
        dark: '48px',
      },
      {
        token: 'typography/size/6xl',
        light: '60px',
        dark: '60px',
      },
      {
        token: 'line-height-tight',
        light: '1.3',
        dark: '1.3',
      },
      {
        token: 'line-height-normal',
        light: '1.45',
        dark: '1.45',
      },
      {
        token: 'line-height-relaxed',
        light: '1.6',
        dark: '1.6',
      },
      {
        token: 'font-weight-regular',
        light: '400',
        dark: '400',
      },
      {
        token: 'font-weight-medium',
        light: '500',
        dark: '500',
      },
      {
        token: 'font-weight-bold',
        light: '700',
        dark: '700',
      },
    ],
  },
  {
    id: 'shadows',
    name: 'Sombras',
    description: 'Níveis de elevação e profundidade visual.',
    rows: [
      {
        token: 'shadow/xs',
        light: '0 1px 2px rgba(0,0,0,0.30)',
        dark: '0 1px 2px rgba(0,0,0,0.30)',
        mantineVar: 'theme.shadows.xs',
      },
      {
        token: 'shadow/sm',
        light: '0 1px 3px rgba(0,0,0,0.40)',
        dark: '0 1px 3px rgba(0,0,0,0.40)',
        mantineVar: 'theme.shadows.sm',
      },
      {
        token: 'shadow/md',
        light: '0 4px 6px rgba(0,0,0,0.45)',
        dark: '0 4px 6px rgba(0,0,0,0.45)',
        mantineVar: 'theme.shadows.md',
      },
      {
        token: 'shadow/lg',
        light: '0 10px 15px rgba(0,0,0,0.50)',
        dark: '0 10px 15px rgba(0,0,0,0.50)',
        mantineVar: 'theme.shadows.lg',
      },
      {
        token: 'shadow/xl',
        light: '0 20px 25px rgba(0,0,0,0.55)',
        dark: '0 20px 25px rgba(0,0,0,0.55)',
        mantineVar: 'theme.shadows.xl',
      },
    ],
  },
  {
    id: 'glows',
    name: 'Brilho',
    description: 'Efeitos de glow para destaque, foco e ênfase visual.',
    rows: [
      {
        token: 'glow/xs',
        light: '0 0 4px rgba(122,234,243,0.30)',
        dark: '0 0 4px rgba(122,234,243,0.30)',
        mantineVar: 'theme.glows.xs',
      },
      {
        token: 'glow/sm',
        light: '0 0 8px rgba(122,234,243,0.40)',
        dark: '0 0 8px rgba(122,234,243,0.40)',
        mantineVar: 'theme.glows.sm',
      },
      {
        token: 'glow/md',
        light: '0 0 16px rgba(122,234,243,0.45)',
        dark: '0 0 16px rgba(122,234,243,0.45)',
        mantineVar: 'theme.glows.md',
      },
      {
        token: 'glow/lg',
        light: '0 0 24px rgba(122,234,243,0.50)',
        dark: '0 0 24px rgba(122,234,243,0.50)',
        mantineVar: 'theme.glows.lg',
      },
      {
        token: 'glow/xl',
        light: '0 0 36px rgba(122,234,243,0.55)',
        dark: '0 0 36px rgba(122,234,243,0.55)',
        mantineVar: 'theme.glows.xl',
      },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    description: 'Durações e curvas de animação para transições e micro-interações.',
    rows: [
      {
        token: 'motion/duration/fast',
        light: '100ms',
        dark: '100ms',
      },
      {
        token: 'motion/duration/default',
        light: '200ms',
        dark: '200ms',
      },
      {
        token: 'motion/duration/slow',
        light: '300ms',
        dark: '300ms',
      },
      {
        token: 'motion/easing/default',
        light: 'ease',
        dark: 'ease',
      },
      {
        token: 'motion/easing/in-out',
        light: 'ease-in-out',
        dark: 'ease-in-out',
      },
    ],
  },
];

const SECTION_HELP: Record<SectionId, { title: string; tips: string[] }> = {
  colors: {
    title: 'Cores',
    tips: [
      'Defina as paletas primitivas (primary, secondary, tertiary, neutral) e as cores semânticas (success, warning, danger, info).',
      'As colunas Light e Dark permitem configurar valores distintos para cada modo de tema. Use formatos hex (#RRGGBB) ou rgba().',
      'Tokens semânticos como bg-surface, fg-primary e border-subtle são derivados das paletas e garantem consistência entre componentes.',
    ],
  },
  spacing: {
    title: 'Espaçamento',
    tips: [
      'Configure a escala de espaçamento usada em padding, margin e gap dos componentes.',
      'Valores em px. A escala segue progressão consistente (xs → 3xl) para manter ritmo visual uniforme.',
      'No Mantine, esses tokens mapeiam para props como p="md", m="lg" e gap="sm".',
    ],
  },
  radius: {
    title: 'Radius',
    tips: [
      'Defina os raios de borda para botões, cards, inputs e outros elementos.',
      'Valores em px. Use escalas menores (xs, sm) para inputs e maiores (lg, xl) para cards e modais.',
      'No Mantine, esses tokens mapeiam para a prop radius="md" dos componentes.',
    ],
  },
  typography: {
    title: 'Tipografia',
    tips: [
      'Configure famílias de fonte, tamanhos, pesos e alturas de linha para toda a aplicação.',
      'Os estilos de texto (heading, body, caption, etc.) combinam esses tokens em presets prontos para uso.',
      'Mantenha a escala tipográfica coerente para garantir hierarquia visual clara.',
    ],
  },
  shadows: {
    title: 'Sombras',
    tips: [
      'Configure as sombras de elevação para simular profundidade entre camadas da interface.',
      'O formato segue o padrão CSS box-shadow: offsetX offsetY blur spread cor.',
      'Use escalas menores (xs, sm) para botões e inputs, e maiores (lg, xl) para modais e popovers.',
    ],
  },
  glows: {
    title: 'Brilho',
    tips: [
      'Defina efeitos de glow para destaque, foco e ênfase visual em elementos interativos.',
      'Glows usam o mesmo formato de box-shadow, porém com blur maior e sem offset.',
      'Ideal para estados de foco, elementos selecionados e destaques em modo dark.',
    ],
  },
  motion: {
    title: 'Motion',
    tips: [
      'Configure durações e curvas de animação para transições e micro-interações.',
      'Durações em milissegundos (ms). Use valores menores (fast) para feedbacks rápidos e maiores (slow) para transições elaboradas.',
      'As curvas de easing controlam a aceleração da animação. Selecione no dropdown a curva mais adequada para cada contexto.',
    ],
  },
};

const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Smooth (Material)' },
  { value: 'cubic-bezier(0.4, 0, 1, 1)', label: 'Accelerate' },
  { value: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Decelerate' },
  { value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', label: 'Bounce (Back)' },
] as const;

const TYPOGRAPHY_FONT_OPTIONS = [
  { token: 'font-family-base', label: 'Base · Inter, sans-serif' },
  { token: 'font-family-mono', label: 'Mono · JetBrains Mono' },
] as const;

const TYPOGRAPHY_SIZE_OPTIONS = [
  { token: 'typography/size/xs', label: 'XS · 10px' },
  { token: 'typography/size/sm', label: 'SM · 12px' },
  { token: 'typography/size/md', label: 'MD · 14px' },
  { token: 'typography/size/lg', label: 'LG · 16px' },
  { token: 'typography/size/xl', label: 'XL · 18px' },
  { token: 'typography/size/2xl', label: '2XL · 20px' },
  { token: 'typography/size/3xl', label: '3XL · 24px' },
  { token: 'typography/size/4xl', label: '4XL · 34px' },
  { token: 'typography/size/5xl', label: '5XL · 48px' },
  { token: 'typography/size/6xl', label: '6XL · 60px' },
] as const;

const TYPOGRAPHY_WEIGHT_OPTIONS = [
  { token: 'font-weight-regular', label: 'Regular · 400' },
  { token: 'font-weight-medium', label: 'Medium · 500' },
  { token: 'font-weight-bold', label: 'Bold · 700' },
] as const;

const TYPOGRAPHY_LINE_HEIGHT_OPTIONS = [
  { token: 'line-height-tight', label: 'Tight · 1.3' },
  { token: 'line-height-normal', label: 'Normal · 1.45' },
  { token: 'line-height-relaxed', label: 'Relaxed · 1.55' },
] as const;

const TYPOGRAPHY_STYLES: TypographyStyleRow[] = [
  // Heading
  { name: 'Heading/H1', size: '60px', weight: '700', lineHeight: '1.3' }, // 60/78 ≈ 1.3
  { name: 'Heading/H2', size: '48px', weight: '700', lineHeight: '1.33' }, // 48/64
  { name: 'Heading/H3', size: '34px', weight: '700', lineHeight: '1.41' }, // 34/48

  // Title
  { name: 'Title/XL', size: '24px', weight: '700', lineHeight: '1.42' }, // 24/34
  { name: 'Title/L', size: '18px', weight: '700', lineHeight: '1.55' }, // 18/28

  // Body
  { name: 'Body/M', size: '16px', weight: '400', lineHeight: '1.75' }, // 16/28
  { name: 'Body/S', size: '14px', weight: '400', lineHeight: '1.71' }, // 14/24
  { name: 'Body/XS', size: '12px', weight: '400', lineHeight: '1.67' }, // 12/20
  { name: 'Body/XXS', size: '10px', weight: '400', lineHeight: '1.4' }, // 10/14

  // Caption
  { name: 'Caption/XXXS', size: '10px', weight: '400', lineHeight: '1.4' }, // 10/14

  // Code
  { name: 'Code/Default', size: '13px', weight: '400', lineHeight: '1.5' },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
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

  const initialLightGlows = useMemo(() => {
    const glowsSection = SECTIONS.find((section) => section.id === 'glows');
    if (!glowsSection) return {};

    const map: Record<string, string> = {};
    glowsSection.rows.forEach((row) => {
      map[row.token] = row.light;
    });

    return map;
  }, []);

  const initialDarkGlows = useMemo(() => {
    const glowsSection = SECTIONS.find((section) => section.id === 'glows');
    if (!glowsSection) return {};

    const map: Record<string, string> = {};
    glowsSection.rows.forEach((row) => {
      map[row.token] = row.dark;
    });

    return map;
  }, []);

  const [lightGlows, setLightGlows] =
    useState<Record<string, string>>(initialLightGlows);
  const [darkGlows, setDarkGlows] =
    useState<Record<string, string>>(initialDarkGlows);

  const [otherValues, setOtherValues] = useState<Record<string, string>>({});

  const [typographyStylesConfig, setTypographyStylesConfig] = useState<
    Record<string, TypographyStyleConfig>
  >({
    // Heading
    'Heading/H1': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/6xl',
      weightToken: 'font-weight-bold',
      lineHeightToken: 'line-height-tight',
    },
    'Heading/H2': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/5xl',
      weightToken: 'font-weight-bold',
      lineHeightToken: 'line-height-tight',
    },
    'Heading/H3': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/4xl',
      weightToken: 'font-weight-bold',
      lineHeightToken: 'line-height-tight',
    },

    // Title
    'Title/XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/3xl',
      weightToken: 'font-weight-bold',
      lineHeightToken: 'line-height-normal',
    },
    'Title/L': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/xl',
      weightToken: 'font-weight-bold',
      lineHeightToken: 'line-height-normal',
    },

    // Body
    'Body/M': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/lg',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Body/S': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/md',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Body/XS': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/sm',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },
    'Body/XXS': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/xs',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },

    // Caption
    'Caption/XXXS': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/xs',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },

    // Code
    'Code/Default': {
      fontToken: 'font-family-mono',
      sizeToken: 'typography/size/sm',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },

    // Genéricos por tamanho (Text/XS ... Text/6XL)
    'Text/XS': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/xs',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },
    'Text/SM': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/sm',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },
    'Text/MD': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/md',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },
    'Text/LG': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/lg',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-normal',
    },
    'Text/XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Text/2XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/2xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Text/3XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/3xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Text/4XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/4xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Text/5XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/5xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
    'Text/6XL': {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/6xl',
      weightToken: 'font-weight-regular',
      lineHeightToken: 'line-height-relaxed',
    },
  });

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

  const generateStyleGuideContent = (): string => {
    const colorsSection = SECTIONS.find((s) => s.id === 'colors');
    const spacingSection = SECTIONS.find((s) => s.id === 'spacing');
    const radiusSection = SECTIONS.find((s) => s.id === 'radius');
    const typoSection = SECTIONS.find((s) => s.id === 'typography');
    const shadowsSection = SECTIONS.find((s) => s.id === 'shadows');
    const glowsSection = SECTIONS.find((s) => s.id === 'glows');
    const motionSection = SECTIONS.find((s) => s.id === 'motion');

    const getColor = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightColors : darkColors;
      const row = colorsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };

    const getOther = (sectionId: string, token: string): string => {
      const key = `${sectionId}:${token}`;
      const section = SECTIONS.find((s) => s.id === sectionId);
      const row = section?.rows.find((r) => r.token === token);
      return otherValues[key] ?? row?.light ?? '';
    };

    const getShadow = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightShadows : darkShadows;
      const row = shadowsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };

    const getGlow = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightGlows : darkGlows;
      const row = glowsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };

    const buildPaletteTable = (prefix: string, label: string): string => {
      const rows = colorsSection?.rows.filter((r) => r.token.startsWith(prefix)) ?? [];
      if (rows.length === 0) return '';
      const lines: string[] = [];
      lines.push(`### ${label}\n`);
      lines.push('| Token | HEX |');
      lines.push('|---|---|');
      rows.forEach((r) => {
        lines.push(`| \`${r.token}\` | \`${getColor(r.token, 'light')}\` |`);
      });
      lines.push('');
      return lines.join('\n');
    };

    const buildSemanticTable = (prefix: string, title: string): string => {
      const rows = colorsSection?.rows.filter((r) => r.token.startsWith(prefix)) ?? [];
      if (rows.length === 0) return '';
      const filtered = rows.filter(
        (r) =>
          (!isAccentToken(r.token) || useSecondary) &&
          (!isTertiaryToken(r.token) || useTertiary),
      );
      if (filtered.length === 0) return '';
      const lines: string[] = [];
      lines.push(`### ${title}\n`);
      lines.push('| Token | Light | Dark | Var Mantine |');
      lines.push('|---|---|---|---|');
      filtered.forEach((r) => {
        lines.push(
          `| \`${r.token}\` | \`${getColor(r.token, 'light')}\` | \`${getColor(r.token, 'dark')}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
        );
      });
      lines.push('');
      return lines.join('\n');
    };

    const md: string[] = [];

    md.push('# STYLE_GUIDE.md — Design System · Tokens de Design\n');
    md.push('> Gerado automaticamente pelo **Design Tokens Manager**.\n');
    md.push('---\n');

    // Cores — Paletas base
    md.push('## 1. Tokens de Cor — Paleta Base\n');
    md.push('> Estáticos. Mesmos valores em Light e Dark.\n');
    md.push(buildPaletteTable('color/primary/', 'Primary'));
    if (useSecondary) md.push(buildPaletteTable('color/secondary/', 'Secondary'));
    if (useTertiary) md.push(buildPaletteTable('color/tertiary/', 'Tertiary'));
    md.push(buildPaletteTable('color/neutral/', 'Neutral'));
    md.push(buildPaletteTable('color/dark/', 'Dark'));

    // Cores — Semânticas
    md.push('## 2. Tokens Semânticos por Tema\n');
    md.push('> Estes tokens mudam conforme o modo ativo (Light / Dark).\n');
    md.push(buildSemanticTable('semantic/bg/', '2.1 Background'));
    md.push(buildSemanticTable('semantic/text/', '2.2 Texto'));
    md.push(buildSemanticTable('semantic/border/', '2.3 Borda'));
    md.push(buildSemanticTable('semantic/icon/', '2.4 Ícone'));

    // Tipografia
    md.push('## 3. Tipografia\n');

    const fontBase = getOther('typography', 'font-family-base');
    const fontMono = getOther('typography', 'font-family-mono');
    md.push('### Famílias\n');
    md.push(`| Token | Valor | Var Mantine |`);
    md.push(`|---|---|---|`);
    md.push(`| \`font-family-base\` | \`${fontBase}\` | \`theme.fontFamily\` |`);
    md.push(`| \`font-family-mono\` | \`${fontMono}\` | \`theme.fontFamilyMonospace\` |\n`);

    md.push('### Tamanhos de fonte\n');
    md.push('| Token | Valor | Var Mantine |');
    md.push('|---|---|---|');
    typoSection?.rows
      .filter((r) => r.token.startsWith('typography/size/'))
      .forEach((r) => {
        md.push(
          `| \`${r.token}\` | \`${getOther('typography', r.token)}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
        );
      });
    md.push('');

    md.push('### Pesos\n');
    md.push('| Token | Valor |');
    md.push('|---|---|');
    typoSection?.rows
      .filter((r) => r.token.startsWith('font-weight-'))
      .forEach((r) => {
        md.push(`| \`${r.token}\` | \`${getOther('typography', r.token)}\` |`);
      });
    md.push('');

    md.push('### Alturas de linha\n');
    md.push('| Token | Valor |');
    md.push('|---|---|');
    typoSection?.rows
      .filter((r) => r.token.startsWith('line-height-'))
      .forEach((r) => {
        md.push(`| \`${r.token}\` | \`${getOther('typography', r.token)}\` |`);
      });
    md.push('');

    md.push('### Estilos de Texto (Figma Text Styles)\n');
    md.push('| Nome | Fonte | Size | Weight | Line Height |');
    md.push('|---|---|---|---|---|');
    TYPOGRAPHY_STYLES.forEach((style) => {
      const config = typographyStylesConfig[style.name];
      if (!config) return;
      const font = getOther('typography', config.fontToken);
      const size = getOther('typography', config.sizeToken);
      const weight = getOther('typography', config.weightToken ?? 'font-weight-regular');
      const lh = getOther('typography', config.lineHeightToken);
      md.push(`| \`${style.name}\` | \`${font}\` | \`${size}\` | \`${weight}\` | \`${lh}\` |`);
    });
    md.push('');

    // Espaçamento
    md.push('## 4. Espaçamento\n');
    md.push('> Estático — não muda entre temas.\n');
    md.push('| Token | Valor | Var Mantine |');
    md.push('|---|---|---|');
    spacingSection?.rows.forEach((r) => {
      md.push(
        `| \`${r.token}\` | \`${getOther('spacing', r.token)}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
      );
    });
    md.push('');

    // Radius
    md.push('## 5. Bordas e Raios\n');
    md.push('> Estático — não muda entre temas.\n');
    md.push('| Token | Valor | Var Mantine |');
    md.push('|---|---|---|');
    radiusSection?.rows.forEach((r) => {
      md.push(
        `| \`${r.token}\` | \`${getOther('radius', r.token)}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
      );
    });
    md.push('');

    // Sombras
    md.push('## 6. Sombras por Tema\n');
    md.push('| Token | Light | Dark | Var Mantine |');
    md.push('|---|---|---|---|');
    shadowsSection?.rows.forEach((r) => {
      md.push(
        `| \`${r.token}\` | \`${getShadow(r.token, 'light')}\` | \`${getShadow(r.token, 'dark')}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
      );
    });
    md.push('');

    // Brilho
    md.push('## 7. Brilho (Glow) por Tema\n');
    md.push('| Token | Light | Dark | Var Mantine |');
    md.push('|---|---|---|---|');
    glowsSection?.rows.forEach((r) => {
      md.push(
        `| \`${r.token}\` | \`${getGlow(r.token, 'light')}\` | \`${getGlow(r.token, 'dark')}\` | ${r.mantineVar ? `\`${r.mantineVar}\`` : '-'} |`,
      );
    });
    md.push('');

    // Motion
    md.push('## 8. Motion & Animação\n');
    md.push('| Token | Valor |');
    md.push('|---|---|');
    motionSection?.rows.forEach((r) => {
      md.push(`| \`${r.token}\` | \`${getOther('motion', r.token)}\` |`);
    });
    md.push('');

    // Regras para IA
    md.push('---\n');
    md.push('## 9. Regras para IA e MCP\n');
    md.push('- **Sempre usar tokens semânticos** (`semantic/*`) — nunca paleta base diretamente em componentes.');
    md.push('- **Toda cor DEVE ter valor para Light e Dark** — usar `light-dark()` ou variáveis automáticas do Mantine.');
    md.push('- **NÃO usar HEX, RGB ou valores hardcoded** em arquivos de componente.');
    md.push('- **Novos tokens** exigem atualização de `theme.tokens.ts` + este arquivo.\n');
    md.push('---\n');
    md.push(`**Gerado em:** ${new Date().toISOString().split('T')[0]}`);

    return md.join('\n');
  };

  const generateFigmaTokensSetupContent = (): string => {
    const colorsSection = SECTIONS.find((s) => s.id === 'colors');
    const spacingSection = SECTIONS.find((s) => s.id === 'spacing');
    const radiusSection = SECTIONS.find((s) => s.id === 'radius');
    const typoSection = SECTIONS.find((s) => s.id === 'typography');
    const shadowsSection = SECTIONS.find((s) => s.id === 'shadows');
    const glowsSection = SECTIONS.find((s) => s.id === 'glows');
    const motionSection = SECTIONS.find((s) => s.id === 'motion');

    const getColor = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightColors : darkColors;
      const row = colorsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };
    const getOther = (sectionId: string, token: string): string => {
      const key = `${sectionId}:${token}`;
      const section = SECTIONS.find((s) => s.id === sectionId);
      const row = section?.rows.find((r) => r.token === token);
      return otherValues[key] ?? row?.light ?? '';
    };
    const getShadow = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightShadows : darkShadows;
      const row = shadowsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };
    const getGlow = (token: string, mode: 'light' | 'dark'): string => {
      const map = mode === 'light' ? lightGlows : darkGlows;
      const row = glowsSection?.rows.find((r) => r.token === token);
      return map[token] ?? (mode === 'light' ? row?.light : row?.dark) ?? '';
    };

    const esc = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tbl = 'border-collapse:collapse;width:100%;margin-bottom:16px;';
    const thS = 'border:1px solid #D1D5DB;padding:8px 12px;background:#F3F4F6;text-align:left;font-size:13px;font-weight:600;';
    const tdS = 'border:1px solid #D1D5DB;padding:8px 12px;font-size:13px;';
    const cdS = 'background:#F3F4F6;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;';
    const swS = (c: string): string => `display:inline-block;width:16px;height:16px;border-radius:3px;border:1px solid #ccc;vertical-align:middle;margin-right:6px;background:${c};`;
    const cd = (t: string): string => `<code style="${cdS}">${esc(t)}</code>`;
    const h1 = (t: string): string => `<h1 style="font-size:24px;margin:32px 0 8px;">${t}</h1>`;
    const h2 = (t: string): string => `<h2 style="font-size:20px;margin:28px 0 8px;border-bottom:2px solid #2563EB;padding-bottom:4px;">${t}</h2>`;
    const h3 = (t: string): string => `<h3 style="font-size:16px;margin:20px 0 6px;">${t}</h3>`;
    const p = (t: string): string => `<p style="font-size:14px;line-height:1.6;margin:6px 0;">${t}</p>`;
    const note = (t: string): string => `<p style="color:#6B7280;font-size:13px;font-style:italic;margin:4px 0 12px;">${t}</p>`;
    const tO = (): string => `<table style="${tbl}"><thead>`;
    const tC = (): string => '</tbody></table>';
    const th = (c: string[]): string => `<tr>${c.map((x) => `<th style="${thS}">${x}</th>`).join('')}</tr></thead><tbody>`;
    const tr = (c: string[]): string => `<tr>${c.map((x) => `<td style="${tdS}">${x}</td>`).join('')}</tr>`;
    const cc = (hex: string): string => `<span style="${swS(hex)}"></span>${cd(hex)}`;
    const ul = (items: string[]): string => `<ul style="margin:6px 0 16px;">${items.map((i) => `<li style="margin-bottom:4px;font-size:14px;">${i}</li>`).join('')}</ul>`;
    const ol = (items: string[]): string => `<ol style="margin:6px 0 16px;">${items.map((i) => `<li style="margin-bottom:6px;font-size:14px;">${i}</li>`).join('')}</ol>`;
    const hr = (): string => '<hr style="margin:24px 0;border:none;border-top:1px solid #D1D5DB;">';

    const o: string[] = [];

    o.push(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`);
    o.push(`<head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;color:#111827;padding:24px 32px;max-width:900px;}</style></head><body>`);

    // TÍTULO
    o.push(h1('Configuração de Tokens no Figma para IA/MCP'));
    o.push(p('Este documento descreve o <strong>passo a passo</strong> para designers configurarem o Figma de forma alinhada:'));
    o.push(ul([
      'Ao <strong>style guide de tokens</strong> (<code>STYLE_GUIDE.md</code>).',
      'Ao <strong>tema Mantine</strong>.',
      'Ao consumo por <strong>IA</strong> e <strong>MCP</strong> (modelos precisam encontrar nomes consistentes).',
    ]));
    o.push(p('O objetivo é que, ao olhar para um componente no Figma ou no código, o mesmo token de design esteja sendo utilizado.'));
    o.push(hr());

    // VISÃO GERAL
    o.push(h2('Visão Geral'));
    o.push(p('No Figma, usaremos:'));
    o.push(ul([
      '<strong>Variables</strong> (variáveis nativas do Figma) para representar tokens.',
      '<strong>Coleções</strong> para agrupar tokens por domínio (Cores, Espaçamento, Tipografia…).',
      '<strong>Modes</strong> para representar os temas <code>Light</code> e <code>Dark</code>.',
    ]));
    o.push(p('Os <strong>nomes das variáveis</strong> devem espelhar exatamente os tokens definidos em <code>STYLE_GUIDE.md</code>.'));
    o.push(hr());

    // ESTRUTURA RECOMENDADA
    o.push(h2('Estrutura Recomendada no Figma'));

    o.push(h3('1. Arquivo de Design Tokens'));
    o.push(ol([
      'Crie um arquivo dedicado, por exemplo: <strong>Design System – Tokens</strong>.',
      'Este arquivo será a <strong>fonte de verdade visual</strong> dos tokens.',
      'Publique esse arquivo como <strong>Library</strong> para outros arquivos usarem as variáveis.',
    ]));

    o.push(h3('2. Coleções de Variáveis'));
    o.push(p('No painel de <strong>Variables</strong> do Figma, crie as seguintes coleções:'));
    const collections = ['Colors', 'Typography', 'Spacing', 'Radius', 'Shadows', 'Glows', 'Motion'];
    o.push(ul(collections.map((c) => `<code>${c}</code>`)));
    o.push(p('Dentro de cada coleção, criaremos as variáveis com os mesmos nomes do código.'));

    o.push(h3('3. Modes (Light/Dark)'));
    o.push(p('Para as coleções que possuem variação por tema, crie <strong>dois modes</strong>:'));
    o.push(ul(['<code>Light</code>', '<code>Dark</code>']));
    o.push(p('Os <strong>nomes das variáveis não mudam</strong> entre modos; apenas os <strong>valores</strong> são diferentes.'));
    o.push(hr());

    // MAPEAMENTO — CORES
    o.push(h2('Mapeamento de Nomes – Cores'));

    const pluginNoticeS = 'background:#F3E8FF;border:1px solid #D8B4FE;border-radius:8px;padding:12px 16px;margin:12px 0 20px;';
    const pluginLink = '<a href="https://www.figma.com/community/plugin/1256972111705530093/export-import-variables" style="color:#7C3AED;font-weight:600;">Export/Import Variables</a>';
    const pluginFile = (name: string): string => `<code style="background:#EDE9FE;padding:1px 6px;border-radius:4px;font-size:12px;">figma-tokens/${name}.json</code>`;
    const pushPluginNotice = (fileName: string): void => {
      o.push(`<div style="${pluginNoticeS}">`);
      o.push(p(`<strong>⚡ Plugin necessário:</strong> Para importar no Figma, utilize o plugin ${pluginLink}.`));
      o.push(p(`Após exportar o projeto pelo Design Tokens Manager, importe o arquivo ${pluginFile(fileName)} diretamente pelo plugin.`));
      o.push('</div>');
    };
    pushPluginNotice('Colors');

    o.push(h3('1. Paletas Principais'));
    o.push(p('Na coleção <code>Colors</code>, crie <strong>todas</strong> as variáveis abaixo. Para cada uma, defina valor em <code>Light</code> e <code>Dark</code>.'));

    const buildPalette = (prefix: string, label: string): void => {
      const rows = colorsSection?.rows.filter((r) => r.token.startsWith(prefix)) ?? [];
      if (rows.length === 0) return;
      o.push(h3(label));
      o.push(tO());
      o.push(th(['Variável', 'HEX', 'Uso principal']));
      rows.forEach((r, i) => {
        const hex = getColor(r.token, 'light');
        let uso = '';
        if (i <= 1) uso = 'Backgrounds sutis, tons muito claros';
        else if (i <= 3) uso = 'Bordas suaves, hover leve, estados neutros';
        else if (i <= 5) uso = 'Cor base de ação, botões, ícones';
        else if (i <= 7) uso = 'Pressed / foco forte, texto sobre fundos claros';
        else uso = 'Ênfase máxima, tons mais escuros';
        o.push(tr([cd(r.token), cc(hex), uso]));
      });
      o.push(tC());
    };

    buildPalette('color/primary/', 'Paleta Primária');
    if (useSecondary) buildPalette('color/secondary/', 'Paleta Secundária');
    if (useTertiary) buildPalette('color/tertiary/', 'Paleta Terciária');
    buildPalette('color/neutral/', 'Paleta Neutra');
    buildPalette('color/dark/', 'Paleta Dark (Superfícies Dark Mode)');

    o.push(p('Para cada variável:'));
    o.push(ul([
      'Em <code>Light</code>, defina a cor conforme a paleta clara.',
      'Em <code>Dark</code>, defina a cor equivalente para o tema escuro (garantindo contraste).',
    ]));

    o.push(h3('2. Cores Semânticas — Superfícies e Texto'));
    o.push(p('Também na coleção <code>Colors</code>, crie as variáveis semânticas. Estes tokens <strong>mudam conforme o modo ativo</strong>.'));

    const buildSemantic = (prefix: string, title: string, scope: string): void => {
      const rows = colorsSection?.rows.filter((r) => r.token.startsWith(prefix)) ?? [];
      const filtered = rows.filter(
        (r) =>
          (!isAccentToken(r.token) || useSecondary) &&
          (!isTertiaryToken(r.token) || useTertiary),
      );
      if (filtered.length === 0) return;
      o.push(`<h4 style="font-size:14px;margin:16px 0 6px;">${title} — Escopo Figma: <code>${scope}</code></h4>`);
      o.push(tO());
      o.push(th(['Variável', 'Light', 'Dark']));
      filtered.forEach((r) => {
        o.push(tr([cd(r.token), cc(getColor(r.token, 'light')), cc(getColor(r.token, 'dark'))]));
      });
      o.push(tC());
    };

    buildSemantic('semantic/bg/', 'Fundo', 'FRAME_FILL');
    buildSemantic('semantic/text/', 'Texto', 'TEXT_FILL');
    buildSemantic('semantic/border/', 'Bordas', 'STROKE_COLOR');
    buildSemantic('semantic/icon/', 'Ícones', 'SHAPE_FILL');

    o.push(h3('Como escolher os valores'));
    const bgBody = getColor('semantic/bg/body', 'light');
    const bgBodyDark = getColor('semantic/bg/body', 'dark');
    const textPrimary = getColor('semantic/text/primary', 'light');
    const textPrimaryDark = getColor('semantic/text/primary', 'dark');
    const borderDefault = getColor('semantic/border/default', 'light');
    const borderDefaultDark = getColor('semantic/border/default', 'dark');
    o.push(ul([
      `Em <strong>Light</strong>: <code>semantic/bg/body</code> → <code>${bgBody}</code>, <code>semantic/text/primary</code> → <code>${textPrimary}</code>, <code>semantic/border/default</code> → <code>${borderDefault}</code>.`,
      `Em <strong>Dark</strong>: <code>semantic/bg/body</code> → <code>${bgBodyDark}</code>, <code>semantic/text/primary</code> → <code>${textPrimaryDark}</code>, <code>semantic/border/default</code> → <code>${borderDefaultDark}</code>.`,
    ]));
    o.push(p('Esses mapeamentos devem ser coerentes com o que será implementado no tema Mantine.'));
    o.push(hr());

    // MAPEAMENTO — ESPAÇAMENTO
    o.push(h2('Mapeamento de Nomes – Espaçamento'));
    pushPluginNotice('Spacing');
    o.push(p('Na coleção <code>Spacing</code>, crie as variáveis abaixo (valores iguais em <code>Light</code> e <code>Dark</code>):'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const spacingUsage: Record<string, string> = {
      'space-xs': 'Espaços muito pequenos (chips, tags)',
      'space-sm': 'Espaços pequenos',
      'space-md': 'Padding padrão de componentes',
      'space-lg': 'Gaps entre blocos',
      'space-xl': 'Seções maiores',
      'space-2xl': 'Blocos de layout muito espaçados',
    };
    spacingSection?.rows.forEach((r) => {
      o.push(tr([cd(r.token), cd(getOther('spacing', r.token)), spacingUsage[r.token] ?? '']));
    });
    o.push(tC());
    o.push(p('Use valores em <code>px</code>. Esses valores <strong>não precisam mudar entre Light/Dark</strong>.'));
    o.push(hr());

    // MAPEAMENTO — RADIUS
    o.push(h2('Mapeamento de Nomes – Radius'));
    pushPluginNotice('Radius');
    o.push(p('Na coleção <code>Radius</code>, crie:'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const radiusUsage: Record<string, string> = {
      'radius-xs': 'Tabelas, inputs com cantos quase retos',
      'radius-sm': 'Inputs e campos simples',
      'radius-md': 'Botões e cards padrão',
      'radius-lg': 'Cards mais suaves / layouts especiais',
      'radius-xl': 'Layouts arredondados',
      'radius-full': 'Pills, badges totalmente arredondados',
    };
    radiusSection?.rows.forEach((r) => {
      o.push(tr([cd(r.token), cd(getOther('radius', r.token)), radiusUsage[r.token] ?? '']));
    });
    o.push(tC());
    o.push(p('Assim como o espaçamento, normalmente esses valores são iguais em Light/Dark.'));
    o.push(hr());

    // MAPEAMENTO — TIPOGRAFIA
    o.push(h2('Mapeamento de Nomes – Tipografia'));
    pushPluginNotice('Typography');
    o.push(p('Na coleção <code>Typography</code>, crie ao menos as variáveis abaixo:'));

    o.push(h3('Família tipográfica'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    o.push(tr([cd('font-family-base'), cd(getOther('typography', 'font-family-base')), 'Fonte principal da interface']));
    o.push(tr([cd('font-family-mono'), cd(getOther('typography', 'font-family-mono')), 'Código e dados técnicos']));
    o.push(tC());

    o.push(h3('Tamanhos'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const sizeUsage: Record<string, string> = {
      'typography/size/xs': 'Legendas, helper text',
      'typography/size/sm': 'Labels, textos de suporte',
      'typography/size/md': 'Texto padrão de UI',
      'typography/size/lg': 'Títulos pequenos / destaques',
      'typography/size/xl': 'Títulos médios',
      'typography/size/2xl': 'Títulos grandes',
      'typography/size/3xl': 'Títulos hero',
      'typography/size/4xl': 'Display pequeno',
      'typography/size/5xl': 'Display médio',
      'typography/size/6xl': 'Display grande',
    };
    typoSection?.rows
      .filter((r) => r.token.startsWith('typography/size/'))
      .forEach((r) => {
        o.push(tr([cd(r.token), cd(getOther('typography', r.token)), sizeUsage[r.token] ?? '']));
      });
    o.push(tC());

    o.push(h3('Alturas de linha'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const lhUsage: Record<string, string> = {
      'line-height-tight': 'Títulos, textos curtos',
      'line-height-normal': 'Corpo de texto padrão',
      'line-height-relaxed': 'Textos longos, parágrafos',
    };
    typoSection?.rows
      .filter((r) => r.token.startsWith('line-height-'))
      .forEach((r) => {
        o.push(tr([cd(r.token), cd(getOther('typography', r.token)), lhUsage[r.token] ?? '']));
      });
    o.push(tC());

    o.push(h3('Pesos'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const wUsage: Record<string, string> = {
      'font-weight-regular': 'Texto padrão',
      'font-weight-medium': 'Títulos médios, labels',
      'font-weight-bold': 'Destaques fortes',
    };
    typoSection?.rows
      .filter((r) => r.token.startsWith('font-weight-'))
      .forEach((r) => {
        o.push(tr([cd(r.token), cd(getOther('typography', r.token)), wUsage[r.token] ?? '']));
      });
    o.push(tC());

    o.push(h3('Estilos de Texto (Text Styles no Figma)'));
    o.push(p('Crie <strong>Text Styles</strong> baseados nas variáveis acima. Use esses estilos em todos os textos de UI.'));
    o.push(tO());
    o.push(th(['Nome do Style', 'Fonte', 'Size', 'Weight', 'Line Height']));
    TYPOGRAPHY_STYLES.forEach((style) => {
      const config = typographyStylesConfig[style.name];
      if (!config) return;
      o.push(tr([
        cd(style.name),
        esc(getOther('typography', config.fontToken)),
        esc(getOther('typography', config.sizeToken)),
        esc(getOther('typography', config.weightToken ?? 'font-weight-regular')),
        esc(getOther('typography', config.lineHeightToken)),
      ]));
    });
    o.push(tC());
    o.push(hr());

    // MAPEAMENTO — SOMBRAS
    o.push(h2('Mapeamento de Nomes – Sombras'));
    o.push(p('Na coleção <code>Shadows</code>, configure como <strong>Effect Styles</strong> (Drop Shadow):'));
    o.push(tO());
    o.push(th(['Variável', 'Light', 'Dark']));
    shadowsSection?.rows.forEach((r) => {
      o.push(tr([cd(r.token), cd(getShadow(r.token, 'light')), cd(getShadow(r.token, 'dark'))]));
    });
    o.push(tC());
    o.push(p('Essas sombras podem ter variações entre light/dark. Crie Effect Styles separados se os valores diferirem.'));
    o.push(hr());

    // MAPEAMENTO — BRILHO
    o.push(h2('Mapeamento de Nomes – Brilho (Glow)'));
    o.push(p('Na coleção <code>Glows</code>, configure como <strong>Effect Styles</strong> (Drop Shadow com offset 0,0 e cor colorida):'));
    o.push(tO());
    o.push(th(['Variável', 'Light', 'Dark']));
    glowsSection?.rows.forEach((r) => {
      o.push(tr([cd(r.token), cd(getGlow(r.token, 'light')), cd(getGlow(r.token, 'dark'))]));
    });
    o.push(tC());
    o.push(p('Glows são úteis para estados de foco, elementos em destaque e feedback visual.'));
    o.push(hr());

    // MAPEAMENTO — MOTION
    o.push(h2('Mapeamento de Nomes – Motion'));
    o.push(p('Tokens de motion servem como <strong>referência para prototipagem</strong> (Smart Animate, transições de tela):'));
    o.push(tO());
    o.push(th(['Variável', 'Valor', 'Uso sugerido']));
    const motionUsage: Record<string, string> = {
      'motion/duration/fast': 'Hovers, toggles rápidos',
      'motion/duration/default': 'Transições padrão',
      'motion/duration/slow': 'Modais, expansões',
      'motion/easing/default': 'Transições gerais',
      'motion/easing/in-out': 'Entradas e saídas suaves',
    };
    motionSection?.rows.forEach((r) => {
      o.push(tr([cd(r.token), cd(getOther('motion', r.token)), motionUsage[r.token] ?? '']));
    });
    o.push(tC());
    o.push(hr());

    // COMO APLICAR
    o.push(h2('Como Aplicar Tokens nos Componentes do Figma'));

    o.push(h3('1. Cores'));
    o.push(p('Ao configurar o <code>Fill</code>/<code>Stroke</code> de um elemento:'));
    o.push(ol([
      'Clique no ícone de variável (losango) no seletor de cor.',
      'Escolha a variável semântica correspondente.',
    ]));
    o.push(p('Exemplos:'));
    o.push(ul([
      `Fundo de botão primário → <code>semantic/bg/brand-default</code> (${cc(getColor('semantic/bg/brand-default', 'light'))})`,
      `Texto principal → <code>semantic/text/primary</code> (${cc(getColor('semantic/text/primary', 'light'))})`,
      `Borda de input → <code>semantic/border/default</code> (${cc(getColor('semantic/border/default', 'light'))})`,
    ]));

    o.push(h3('2. Espaçamento'));
    o.push(p('Para componentes com Auto Layout:'));
    o.push(ol([
      'Use variáveis nos campos de <code>Padding</code> e <code>Gap</code>.',
      `Selecione, por exemplo, <code>space-md</code> (${cd(getOther('spacing', 'space-md'))}) para paddings e <code>space-sm</code> (${cd(getOther('spacing', 'space-sm'))}) para gaps menores.`,
    ]));

    o.push(h3('3. Radius'));
    o.push(ol([
      'Selecione o componente.',
      `Em <code>Corner radius</code>, aplique a variável desejada (ex: <code>radius-md</code> = ${cd(getOther('radius', 'radius-md'))}).`,
    ]));

    o.push(h3('4. Tipografia'));
    o.push(ol([
      'Crie <strong>Text Styles</strong> baseados nas variáveis de tipografia.',
      'Use esses estilos em todos os textos de UI (títulos, labels, textos de botão).',
    ]));
    o.push(hr());

    // SINCRONIZAÇÃO
    o.push(h2('Sincronização com o Código e IA/MCP'));

    o.push(h3('1. Alinhamento de Nomes'));
    o.push(p('Os nomes das variáveis no Figma <strong>DEVEM ser idênticos</strong> aos tokens descritos em:'));
    o.push(ul([
      '<code>STYLE_GUIDE.md</code>',
      '<code>AGENTS.md</code> (se houver menções diretas)',
      'Arquivos de tema (<code>theme.tokens.ts</code>, <code>theme/index.ts</code>)',
    ]));

    o.push(h3('2. Atualizações de Tokens'));
    o.push(p('Sempre que houver uma alteração de token:'));
    o.push(ol([
      'Atualizar no <strong>Design Tokens Manager</strong> (aplicação web).',
      'Exportar novo <strong>STYLE_GUIDE.md</strong> e <strong>JSONs para o Figma</strong>.',
      'Reimportar as variáveis no Figma.',
      'Atualizar o tema Mantine.',
    ]));

    o.push(h3('3. IA/MCP'));
    o.push(p('Para tirar mais proveito de IA/MCP:'));
    o.push(ul([
      'Mantenha tokens com nomes <strong>claros e consistentes</strong>.',
      'Evite abreviações obscuras ou nomes específicos de tela.',
      'Se possível, documente na descrição da variável no Figma o uso previsto e a referência ao token no código.',
    ]));
    o.push(p('Isso ajuda agentes a correlacionarem o que veem no Figma com o que precisam gerar no código.'));
    o.push(hr());

    // CHECKLIST
    o.push(h2('Checklist para o Designer'));
    o.push(ol([
      '<strong>Criar/abrir</strong> o arquivo <code>Design System – Tokens</code>.',
      '<strong>Criar coleções de variáveis</strong>: <code>Colors</code>, <code>Typography</code>, <code>Spacing</code>, <code>Radius</code>, <code>Shadows</code>, <code>Glows</code>.',
      '<strong>Criar modes</strong>: adicionar <code>Light</code> e <code>Dark</code> para coleções com variação de tema.',
      '<strong>Cadastrar variáveis</strong> seguindo exatamente os nomes de <code>STYLE_GUIDE.md</code>.',
      '<strong>Definir valores</strong> de light/dark para cada variável, garantindo contraste.',
      '<strong>Aplicar variáveis</strong> em todos os componentes de UI (fill, stroke, padding, gap, radius, tipografia).',
      '<strong>Publicar como Library</strong> para que outros arquivos possam usar os tokens.',
      '<strong>Avisar o time de desenvolvimento</strong> sempre que tokens forem criados/alterados/removidos.',
    ]));

    o.push(p('Seguindo estes passos, o projeto terá:'));
    o.push(ul([
      'Um <strong>style guide centralizado</strong> (<code>STYLE_GUIDE.md</code>).',
      'Tokens espelhados no Figma, prontos para IA/MCP.',
      'Tema Mantine alinhado com o design, suportando <strong>cores primárias, secundárias, terciárias</strong> e <strong>modo light/dark</strong> de forma previsível.',
    ]));

    o.push(`<hr style="margin-top:32px;border:none;border-top:1px solid #D1D5DB;"><p style="color:#9CA3AF;font-size:12px;">Gerado em ${new Date().toISOString().split('T')[0]} pelo Design Tokens Manager</p>`);
    o.push('</body></html>');

    return '\ufeff' + o.join('\n');
  };

  const generateFigmaColorsJson = (): string => {

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
      if (token.startsWith('semantic/bg/')) return ['FRAME_FILL'];
      if (token.startsWith('semantic/text/')) return ['TEXT_FILL'];
      if (token.startsWith('semantic/border/')) return ['STROKE_COLOR'];
      if (token.startsWith('semantic/icon/')) return ['SHAPE_FILL'];
      return [];
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
      name: 'Colors',
      modes: {
        [modeLightKey]: 'Light',
        [modeDarkKey]: 'Dark',
      },
      variableIds,
      variables,
    };

    return JSON.stringify(collection, null, 2);
  };

  const generateFigmaSpacingJson = (): string => {

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
        scopes: ['GAP'],
        hiddenFromPublishing: false,
        codeSyntax: {},
      };
    });

    const collection = {
      id: `VariableCollectionId:${collectionPrefix}:0`,
      name: 'Spacing',
      modes: {
        [modeKey]: 'Default',
      },
      variableIds,
      variables,
    };

    return JSON.stringify(collection, null, 2);
  };

  const generateFigmaRadiusJson = (): string => {

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

    const collectionPrefix = '3';
    const modeKey = `${collectionPrefix}:0`;

    const variableIds: string[] = [];

    const variables = radiusSection.rows.map((row, index) => {
      const variableId = `VariableID:${collectionPrefix}:${index + 1}`;
      const variableName = row.token;

      variableIds.push(variableId);

      const otherKey = `${radiusSection.id}:${row.token}`;
      const rawValue = otherValues[otherKey] ?? row.light;
      const value = toRadiusNumber(rawValue);

      const scopes =
        variableName === 'radius-xs' ? ['CORNER_RADIUS'] : ['ALL_SCOPES'];

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
        scopes,
        hiddenFromPublishing: false,
        codeSyntax: {},
      };
    });

    const collection = {
      id: `VariableCollectionId:${collectionPrefix}:0`,
      name: 'Radius',
      modes: {
        [modeKey]: 'Radius',
      },
      variableIds,
      variables,
    };

    return JSON.stringify(collection, null, 2);
  };

  const generateFigmaTypographyJson = (): string => {

    const typographySection = SECTIONS.find((section) => section.id === 'typography');
    if (!typographySection) {
      return;
    }

    const collectionPrefix = '4';
    const modeKey = `${collectionPrefix}:0`;

    const variableIds: string[] = [];
    const tokenToPrimitiveId: Record<string, string> = {};

    const toFigmaTypeName = (token: string): string => {
      if (token.startsWith('font-family-')) return `Typeface/Family/${token}`;
      if (token.startsWith('typography/size/')) return `Typeface/Size/${token.replace('typography/size/', '')}`;
      if (token.startsWith('line-height-')) return `Typeface/Line/${token}`;
      if (token.startsWith('font-weight-')) return `Typeface/Weight/${token}`;
      return token;
    };

    const variables = typographySection.rows.map((row, index) => {
      const variableId = `VariableID:${collectionPrefix}:${index + 1}`;
      const variableName = toFigmaTypeName(row.token);

      variableIds.push(variableId);
      tokenToPrimitiveId[row.token] = variableId;

      const otherKey = `${typographySection.id}:${row.token}`;
      const rawValue = otherValues[otherKey] ?? row.light;

      const isFontFamily = row.token.startsWith('font-family-');

      if (isFontFamily) {
        const stringValue = rawValue;

        return {
          id: variableId,
          name: variableName,
          description: '',
          type: 'STRING',
          valuesByMode: {
            [modeKey]: stringValue,
          },
          resolvedValuesByMode: {
            [modeKey]: { resolvedValue: stringValue, alias: null },
          },
          scopes: [],
          hiddenFromPublishing: false,
          codeSyntax: {},
        };
      }

      const numeric =
        Number.parseFloat(rawValue.replace('px', '').trim() || rawValue.trim()) || 0;

      return {
        id: variableId,
        name: variableName,
        description: '',
        type: 'FLOAT',
        valuesByMode: {
          [modeKey]: numeric,
        },
        resolvedValuesByMode: {
          [modeKey]: { resolvedValue: numeric, alias: null },
        },
        scopes: [],
        hiddenFromPublishing: false,
        codeSyntax: {},
      };
    });

    const baseConfig: TypographyStyleConfig = {
      fontToken: 'font-family-base',
      sizeToken: 'typography/size/md',
      lineHeightToken: 'line-height-normal',
    };
    const styleLabel = (name: string): string => name.replace('/', ' ');
    let styleVarIndex = typographySection.rows.length;

    const pushStyleVar = (
      name: string,
      type: 'STRING' | 'FLOAT',
      aliasId: string,
      aliasToken: string,
      scopes: string[],
    ) => {
      const id = `VariableID:${collectionPrefix}:${++styleVarIndex}`;
      variableIds.push(id);
      variables.push({
        id,
        name,
        description: '',
        type,
        valuesByMode: {
          [modeKey]: { type: 'VARIABLE_ALIAS', id: aliasId },
        },
        resolvedValuesByMode: {
          [modeKey]: {
            resolvedValue: type === 'FLOAT' ? 0 : '',
            alias: aliasId,
            aliasName: toFigmaTypeName(aliasToken),
          },
        },
        scopes,
        hiddenFromPublishing: false,
        codeSyntax: {},
      });
    };

    TYPOGRAPHY_STYLES.forEach((style) => {
      const config = typographyStylesConfig[style.name] ?? baseConfig;
      const label = styleLabel(style.name);
      const fontToken = config.fontToken ?? 'font-family-base';
      const sizeToken = config.sizeToken ?? 'typography/size/md';
      const lineToken = config.lineHeightToken ?? 'line-height-normal';
      const aliasIdFont = tokenToPrimitiveId[fontToken];
      const aliasIdSize = tokenToPrimitiveId[sizeToken];
      const aliasIdLine = tokenToPrimitiveId[lineToken];
      const aliasIdRegular = tokenToPrimitiveId['font-weight-regular'];
      const aliasIdMedium = tokenToPrimitiveId['font-weight-medium'];
      const aliasIdBold = tokenToPrimitiveId['font-weight-bold'];

      if (!aliasIdFont || !aliasIdSize || !aliasIdLine || !aliasIdRegular || !aliasIdMedium || !aliasIdBold) return;

      pushStyleVar(`Typescale/${label}/Font Family`, 'STRING', aliasIdFont, fontToken, ['FONT_FAMILY']);
      pushStyleVar(`Typescale/${label}/Size`, 'FLOAT', aliasIdSize, sizeToken, ['FONT_SIZE']);
      pushStyleVar(`Typescale/${label}/Line`, 'FLOAT', aliasIdLine, lineToken, ['LINE_HEIGHT']);
      pushStyleVar(`Typescale/${label}/Weight Regular`, 'FLOAT', aliasIdRegular, 'font-weight-regular', ['FONT_WEIGHT']);
      pushStyleVar(`Typescale/${label}/Weight Medium`, 'FLOAT', aliasIdMedium, 'font-weight-medium', ['FONT_WEIGHT']);
      pushStyleVar(`Typescale/${label}/Weight Bold`, 'FLOAT', aliasIdBold, 'font-weight-bold', ['FONT_WEIGHT']);
    });

    const collection = {
      id: `VariableCollectionId:${collectionPrefix}:0`,
      name: 'Typography',
      modes: {
        [modeKey]: 'Default',
      },
      variableIds,
      variables,
    };

    return JSON.stringify(collection, null, 2);
  };

  const handleExportProject = async (): Promise<void> => {
    const zip = new JSZip();

    zip.file('STYLE_GUIDE.md', generateStyleGuideContent());
    zip.file('FIGMA_TOKENS_SETUP.doc', generateFigmaTokensSetupContent());

    const figmaFolder = zip.folder('figma-tokens')!;
    figmaFolder.file('Colors.json', generateFigmaColorsJson());
    figmaFolder.file('Spacing.json', generateFigmaSpacingJson());
    figmaFolder.file('Radius.json', generateFigmaRadiusJson());
    figmaFolder.file('Typography.json', generateFigmaTypographyJson());

    zip.file('project-config.json', generateProjectConfigJson());

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-tokens-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateProjectConfigJson = (): string => {
    const allOtherValues: Record<string, string> = {};
    const otherSections: SectionId[] = ['spacing', 'radius', 'typography', 'motion'];
    for (const sectionId of otherSections) {
      const section = SECTIONS.find((s) => s.id === sectionId);
      if (!section) continue;
      for (const row of section.rows) {
        const key = `${sectionId}:${row.token}`;
        allOtherValues[key] = otherValues[key] ?? row.light;
      }
    }

    const config: ProjectConfig = {
      version: 1,
      lightColors,
      darkColors,
      lightShadows,
      darkShadows,
      lightGlows,
      darkGlows,
      otherValues: allOtherValues,
      typographyStylesConfig,
      useSecondary,
      useTertiary,
    };
    return JSON.stringify(config, null, 2);
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== 'string') return;

        const config = JSON.parse(raw) as ProjectConfig;

        if (config.version !== 1) {
          alert('Versão do arquivo de configuração não suportada.');
          return;
        }

        if (config.lightColors) setLightColors(config.lightColors);
        if (config.darkColors) setDarkColors(config.darkColors);
        if (config.lightShadows) setLightShadows(config.lightShadows);
        if (config.darkShadows) setDarkShadows(config.darkShadows);
        if (config.lightGlows) setLightGlows(config.lightGlows);
        if (config.darkGlows) setDarkGlows(config.darkGlows);
        if (config.otherValues) setOtherValues(config.otherValues);
        if (config.typographyStylesConfig) setTypographyStylesConfig(config.typographyStylesConfig);
        if (typeof config.useSecondary === 'boolean') setUseSecondary(config.useSecondary);
        if (typeof config.useTertiary === 'boolean') setUseTertiary(config.useTertiary);

        setShowWelcome(false);
      } catch {
        alert('Erro ao importar o arquivo. Verifique se é um JSON válido de configuração.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeSection = SECTIONS.find((section) => section.id === activeSectionId)!;

  const typographySection = SECTIONS.find((section) => section.id === 'typography');
  const typographyTokenValues: Record<string, string> =
    typographySection?.rows.reduce<Record<string, string>>((accumulator, row) => {
      const key = `typography:${row.token}`;
      accumulator[row.token] = otherValues[key] ?? row.light;
      return accumulator;
    }, {}) ?? {};

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

  if (showWelcome) {
    return (
      <div className="welcome-screen">
        <div className="welcome-glow welcome-glow-1" />
        <div className="welcome-glow welcome-glow-2" />

        <div className="welcome-content">
          <div className="welcome-badge">Design Tokens Manager</div>

          <h1 className="welcome-title">
            Configure seus <span className="welcome-highlight">Design Tokens</span> em um só lugar
          </h1>

          <p className="welcome-subtitle">
            Defina cores, tipografia, espaçamento, sombras e motion de forma visual.
            Exporte diretamente para <strong>STYLE_GUIDE.md</strong> e <strong>Figma</strong>.
          </p>

          <button
            type="button"
            className="welcome-cta"
            onClick={() => setShowWelcome(false)}
          >
            Começar configuração
            <IconArrowRight size={18} stroke={2} />
          </button>

          <button
            type="button"
            className="welcome-cta-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconUpload size={18} stroke={2} />
            Importar projeto existente
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden-file-input"
            onChange={handleImportProject}
          />

          <div className="welcome-features">
            <div className="welcome-feature-card">
              <div className="welcome-feature-icon">
                <IconPalette size={24} stroke={1.5} />
              </div>
              <h3>Cores & Paletas</h3>
              <p>Primárias, secundárias, terciárias, neutros e tokens semânticos com suporte a Light e Dark.</p>
            </div>

            <div className="welcome-feature-card">
              <div className="welcome-feature-icon">
                <IconTypography size={24} stroke={1.5} />
              </div>
              <h3>Tipografia & Escala</h3>
              <p>Famílias, tamanhos, pesos, alturas de linha e estilos de texto predefinidos.</p>
            </div>

            <div className="welcome-feature-card">
              <div className="welcome-feature-icon">
                <IconShadow size={24} stroke={1.5} />
              </div>
              <h3>Sombras, Brilho & Motion</h3>
              <p>Elevação, efeitos de glow, durações e curvas de easing para micro-interações.</p>
            </div>

            <div className="welcome-feature-card">
              <div className="welcome-feature-icon">
                <IconFileExport size={24} stroke={1.5} />
              </div>
              <h3>Exportação Integrada</h3>
              <p>Gere STYLE_GUIDE.md e FIGMA_TOKENS_SETUP.doc prontos para uso no código e no Figma.</p>
            </div>
          </div>

          <div className="welcome-footer">
            <div className="welcome-footer-item">
              <IconCode size={16} stroke={1.5} />
              <span>Mantine UI + Next.js</span>
            </div>
            <div className="welcome-footer-divider" />
            <div className="welcome-footer-item">
              <IconBrandFigma size={16} stroke={1.5} />
              <span>Figma Tokens Ready</span>
            </div>
            <div className="welcome-footer-divider" />
            <div className="welcome-footer-item">
              <IconPalette size={16} stroke={1.5} />
              <span>Light & Dark Mode</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="sidebar-header-title-row">
            <div className="sidebar-header-text">
              <h1 className="app-title">Design Tokens Manager</h1>
              <p className="app-subtitle">
                Configure os tokens definidos em <code>STYLE_GUIDE.md</code> e gere uma base
                consistente para código e Figma.
              </p>
            </div>
          </div>
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
              <span className="nav-button-icon" aria-hidden="true">
                {getSectionIcon(section.id)}
              </span>
              <span className="nav-button-content">
                <span className="nav-button-title">{section.name}</span>
                <span className="nav-button-description">{section.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <section className="help-panel">
          <h2>Dicas sobre {SECTION_HELP[activeSectionId].title}</h2>
          {SECTION_HELP[activeSectionId].tips.map((tip, i) => (
            <p key={i}>{tip}</p>
          ))}
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden-file-input"
              onChange={handleImportProject}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload size={16} stroke={2} />
              Importar Projeto
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleExportProject}
            >
              <IconDownload size={16} stroke={2} />
              Exportar Projeto
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

          {(['colors', 'spacing', 'radius', 'typography'] as const).includes(activeSectionId as 'colors' | 'spacing' | 'radius' | 'typography') ? (
            <div className="figma-plugin-notice">
              <div className="figma-plugin-notice-icon">
                <IconBrandFigma size={18} stroke={1.5} />
              </div>
              <div className="figma-plugin-notice-content">
                <p>
                  Para importar no Figma, utilize o plugin{' '}
                  <a
                    href="https://www.figma.com/community/plugin/1256972111705530093/export-import-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Export/Import Variables
                  </a>
                  . Exporte o projeto e importe o arquivo{' '}
                  <code>
                    figma-tokens/
                    {{ colors: 'Colors', spacing: 'Spacing', radius: 'Radius', typography: 'Typography' }[activeSectionId as 'colors' | 'spacing' | 'radius' | 'typography']}
                    .json
                  </code>{' '}
                  no plugin.
                </p>
              </div>
            </div>
          ) : null}

          {activeSectionId === 'colors' && colorsSection ? (
            <div className="primitive-palettes-wrapper">
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

          <div className={activeSectionId === 'colors' ? 'semantic-palettes-wrapper' : undefined}>
          {activeSectionId === 'colors' ? (
            <h3 className="semantic-tokens-title">Cores semânticas</h3>
          ) : null}

          <div className="tokens-table-wrapper">
            <table className="tokens-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>
                    {activeSectionId === 'colors' || activeSectionId === 'shadows' || activeSectionId === 'glows'
                      ? 'Valor (Light)'
                      : 'Valor'}
                  </th>
                  {activeSectionId === 'colors' || activeSectionId === 'shadows' || activeSectionId === 'glows' ? (
                    <th>Valor (Dark)</th>
                  ) : null}
                  {activeSectionId === 'spacing' ||
                  activeSectionId === 'radius' ? (
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
                  const isShadowsSection = activeSectionId === 'shadows';
                  const isGlowsSection = activeSectionId === 'glows';
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

                  if (isGlowsSection) {
                    const glowLight = lightGlows[row.token] ?? row.light;
                    const glowDark = darkGlows[row.token] ?? row.dark;

                    return (
                      <tr key={row.token}>
                        <td className="token-name">
                          <code>{row.token}</code>
                        </td>
                        <td>
                          <ShadowField
                            value={glowLight}
                            onChange={(nextValue) =>
                              setLightGlows((previous) => ({
                                ...previous,
                                [row.token]: nextValue,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <ShadowField
                            value={glowDark}
                            onChange={(nextValue) =>
                              setDarkGlows((previous) => ({
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

                  const isEasingToken = row.token.includes('/easing/');

                  return (
                    <tr key={row.token}>
                      <td className="token-name">
                        <code>{row.token}</code>
                      </td>
                      <td>
                        {isEasingToken ? (
                          <select
                            className="token-select"
                            value={otherValue}
                            onChange={(event) =>
                              setOtherValues((previous) => ({
                                ...previous,
                                [otherKey]: event.target.value,
                              }))
                            }
                          >
                            {EASING_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
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
                        )}
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

          </div>

          {activeSectionId === 'typography' ? (
            <div className="typography-styles-wrapper">
              <h3 className="semantic-tokens-title">Estilos de texto</h3>
              <div className="tokens-table-wrapper">
                <table className="tokens-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Fonte</th>
                      <th>Size</th>
                      <th>Weight</th>
                      <th>Line height</th>
                      <th>Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const baseStyles = TYPOGRAPHY_STYLES.filter((style) => {
                        const term = search.trim().toLowerCase();
                        if (!term) return true;
                        return (
                          style.name.toLowerCase().includes(term) ||
                          style.size.includes(term) ||
                          style.weight.includes(term) ||
                          style.lineHeight.includes(term)
                        );
                      });

                      const weightVariants: Array<{
                        token: 'font-weight-regular' | 'font-weight-medium' | 'font-weight-bold';
                        suffix: 'Regular' | 'Medium' | 'Bold';
                        weightValue: string;
                      }> = [
                        { token: 'font-weight-regular', suffix: 'Regular', weightValue: '400' },
                        { token: 'font-weight-medium', suffix: 'Medium', weightValue: '500' },
                        { token: 'font-weight-bold', suffix: 'Bold', weightValue: '700' },
                      ];

                      const rows: Array<{
                        style: TypographyStyleRow;
                        variant: (typeof weightVariants)[number];
                      }> = [];

                      baseStyles.forEach((style) => {
                        weightVariants.forEach((variant) => {
                          rows.push({ style, variant });
                        });
                      });

                      return rows.map(({ style, variant }) => {
                        const baseConfig: TypographyStyleConfig = {
                          fontToken: 'font-family-base',
                          sizeToken: 'typography/size/md',
                          lineHeightToken: 'line-height-normal',
                        };

                        const currentConfig =
                          typographyStylesConfig[style.name] ?? baseConfig;
                        const baseName = style.name.toLowerCase();
                        const displayName = `${baseName}/${variant.suffix}`;

                        return (
                          <tr key={`${style.name}-${variant.suffix}`}>
                            <td className="token-name">
                              <code>{displayName}</code>
                            </td>
                            <td>
                              <select
                                className="token-select"
                                value={
                                  typographyStylesConfig[style.name]?.fontToken ??
                                  'font-family-base'
                                }
                                onChange={(event) =>
                                  setTypographyStylesConfig((previous) => ({
                                    ...previous,
                                    [style.name]: {
                                      ...(previous[style.name] ?? {
                                        fontToken: 'font-family-base',
                                        sizeToken: 'typography/size/md',
                                        lineHeightToken: 'line-height-normal',
                                      }),
                                      fontToken: event.target.value,
                                    },
                                  }))
                                }
                              >
                                {TYPOGRAPHY_FONT_OPTIONS.map((option) => (
                                  <option key={option.token} value={option.token}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="token-select"
                                value={
                                  typographyStylesConfig[style.name]?.sizeToken ??
                                  'typography/size/md'
                                }
                                onChange={(event) =>
                                  setTypographyStylesConfig((previous) => ({
                                    ...previous,
                                    [style.name]: {
                                      ...(previous[style.name] ?? {
                                        fontToken: 'font-family-base',
                                        sizeToken: 'typography/size/md',
                                        lineHeightToken: 'line-height-normal',
                                      }),
                                      sizeToken: event.target.value,
                                    },
                                  }))
                                }
                              >
                                {TYPOGRAPHY_SIZE_OPTIONS.map((option) => (
                                  <option key={option.token} value={option.token}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{variant.suffix} · {variant.weightValue}</td>
                            <td>
                              <select
                                className="token-select"
                                value={
                                  typographyStylesConfig[style.name]
                                    ?.lineHeightToken ?? 'line-height-normal'
                                }
                                onChange={(event) =>
                                  setTypographyStylesConfig((previous) => ({
                                    ...previous,
                                    [style.name]: {
                                      ...(previous[style.name] ?? {
                                        fontToken: 'font-family-base',
                                        sizeToken: 'typography/size/md',
                                        lineHeightToken: 'line-height-normal',
                                      }),
                                      lineHeightToken: event.target.value,
                                    },
                                  }))
                                }
                              >
                                {TYPOGRAPHY_LINE_HEIGHT_OPTIONS.map((option) => (
                                  <option key={option.token} value={option.token}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              {(() => {
                                const config = currentConfig;
                                const fontToken =
                                  config?.fontToken ?? 'font-family-base';
                                const sizeToken =
                                  config?.sizeToken ?? 'typography/size/md';
                                const weightToken = variant.token;
                                const lineHeightToken =
                                  config?.lineHeightToken ?? 'line-height-normal';

                                const fontFamily =
                                  typographyTokenValues[fontToken] ?? 'inherit';
                                const fontSize =
                                  typographyTokenValues[sizeToken] ?? style.size;
                                const fontWeight =
                                  typographyTokenValues[weightToken] ??
                                  style.weight;
                                const lineHeight =
                                  typographyTokenValues[lineHeightToken] ??
                                  style.lineHeight;

                                return (
                                  <span
                                    className="typography-preview-text"
                                    style={{
                                      fontFamily,
                                      fontSize,
                                      fontWeight,
                                      lineHeight,
                                    }}
                                  >
                                    Aa
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

