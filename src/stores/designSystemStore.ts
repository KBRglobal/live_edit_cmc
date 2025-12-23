import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  DesignTokens,
  ThemePreset,
  ColorShade,
  ComponentStyles,
  ResponsiveStyles,
} from '@/types/designSystem';
import { defaultDesignTokens, themePresets } from '@/lib/design-system/defaultTokens';
import { generateCSSVariables, applyThemeToDocument } from '@/lib/design-system/cssGenerator';

interface DesignSystemState {
  // Current tokens
  tokens: DesignTokens;

  // Active preset
  activePresetId: string | null;

  // Custom presets created by user
  customPresets: ThemePreset[];

  // Component-specific styles
  componentStyles: Record<string, ResponsiveStyles>;

  // UI State
  isThemeEditorOpen: boolean;
  isStyleEditorOpen: boolean;
  activeStyleTab: 'layout' | 'spacing' | 'typography' | 'background' | 'border' | 'effects';
  selectedBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // History for undo/redo
  tokenHistory: DesignTokens[];
  tokenHistoryIndex: number;
}

interface DesignSystemActions {
  // Token actions
  setTokens: (tokens: DesignTokens) => void;
  updateTokens: (path: string, value: any) => void;
  resetTokens: () => void;

  // Color actions
  updatePrimaryColor: (shade: keyof ColorShade, value: string) => void;
  updateSecondaryColor: (shade: keyof ColorShade, value: string) => void;
  generateColorPalette: (baseColor: string, type: 'primary' | 'secondary') => void;

  // Typography actions
  updateFontFamily: (type: 'heading' | 'body' | 'mono', family: string) => void;
  updateFontSize: (size: string, value: { size: string; lineHeight: string }) => void;

  // Preset actions
  applyPreset: (presetId: string) => void;
  saveAsPreset: (name: string, nameHe: string) => void;
  deleteCustomPreset: (presetId: string) => void;

  // Component style actions
  setComponentStyles: (componentId: string, styles: ResponsiveStyles) => void;
  updateComponentStyles: (componentId: string, breakpoint: string, styles: Partial<ComponentStyles>) => void;
  clearComponentStyles: (componentId: string) => void;

  // UI actions
  setThemeEditorOpen: (open: boolean) => void;
  setStyleEditorOpen: (open: boolean) => void;
  setActiveStyleTab: (tab: DesignSystemState['activeStyleTab']) => void;
  setSelectedBreakpoint: (breakpoint: DesignSystemState['selectedBreakpoint']) => void;

  // History actions
  undo: () => void;
  redo: () => void;

  // Export/Import
  exportTokens: () => string;
  importTokens: (json: string) => void;
  exportCSS: () => string;
}

type DesignSystemStore = DesignSystemState & DesignSystemActions;

// Helper to generate color palette from base color
function generatePaletteFromBase(baseColor: string): ColorShade {
  // Simple palette generation - in production use a proper color library
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const { h, s } = hexToHSL(baseColor);

  return {
    50: hslToHex(h, Math.min(s, 30), 97),
    100: hslToHex(h, Math.min(s, 40), 94),
    200: hslToHex(h, Math.min(s, 50), 86),
    300: hslToHex(h, Math.min(s, 60), 74),
    400: hslToHex(h, Math.min(s, 70), 60),
    500: hslToHex(h, s, 50),
    600: hslToHex(h, s, 42),
    700: hslToHex(h, s, 35),
    800: hslToHex(h, s, 28),
    900: hslToHex(h, s, 22),
    950: hslToHex(h, s, 12),
  };
}

// Helper to set nested value by path
function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] };
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

export const useDesignSystemStore = create<DesignSystemStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        tokens: defaultDesignTokens,
        activePresetId: null,
        customPresets: [],
        componentStyles: {},
        isThemeEditorOpen: false,
        isStyleEditorOpen: false,
        activeStyleTab: 'layout',
        selectedBreakpoint: 'base',
        tokenHistory: [defaultDesignTokens],
        tokenHistoryIndex: 0,

        // Token actions
        setTokens: (tokens) => {
          set((state) => {
            state.tokens = tokens;
            // Add to history
            state.tokenHistory = state.tokenHistory.slice(0, state.tokenHistoryIndex + 1);
            state.tokenHistory.push(tokens);
            state.tokenHistoryIndex = state.tokenHistory.length - 1;
          });
          applyThemeToDocument(tokens);
        },

        updateTokens: (path, value) => {
          set((state) => {
            state.tokens = setNestedValue(state.tokens, path, value);
          });
          applyThemeToDocument(get().tokens);
        },

        resetTokens: () => {
          set((state) => {
            state.tokens = defaultDesignTokens;
            state.activePresetId = null;
          });
          applyThemeToDocument(defaultDesignTokens);
        },

        // Color actions
        updatePrimaryColor: (shade, value) => {
          set((state) => {
            state.tokens.colors.primary[shade] = value;
          });
          applyThemeToDocument(get().tokens);
        },

        updateSecondaryColor: (shade, value) => {
          set((state) => {
            state.tokens.colors.secondary[shade] = value;
          });
          applyThemeToDocument(get().tokens);
        },

        generateColorPalette: (baseColor, type) => {
          const palette = generatePaletteFromBase(baseColor);
          set((state) => {
            state.tokens.colors[type] = palette;
          });
          applyThemeToDocument(get().tokens);
        },

        // Typography actions
        updateFontFamily: (type, family) => {
          set((state) => {
            state.tokens.typography.fonts[type].name = family;
          });
          applyThemeToDocument(get().tokens);
        },

        updateFontSize: (size, value) => {
          set((state) => {
            (state.tokens.typography.sizes as any)[size] = value;
          });
          applyThemeToDocument(get().tokens);
        },

        // Preset actions
        applyPreset: (presetId) => {
          const preset = [...themePresets, ...get().customPresets].find(
            (p) => p.id === presetId
          );
          if (preset) {
            const newTokens = {
              ...defaultDesignTokens,
              ...preset.tokens,
              id: presetId,
              name: preset.name,
            };
            set((state) => {
              state.tokens = newTokens as DesignTokens;
              state.activePresetId = presetId;
            });
            applyThemeToDocument(newTokens as DesignTokens);
          }
        },

        saveAsPreset: (name, nameHe) => {
          const id = `custom-${Date.now()}`;
          const newPreset: ThemePreset = {
            id,
            name,
            nameHe,
            description: 'Custom theme preset',
            thumbnail: '',
            category: 'minimal',
            tokens: get().tokens,
          };
          set((state) => {
            state.customPresets.push(newPreset);
            state.activePresetId = id;
          });
        },

        deleteCustomPreset: (presetId) => {
          set((state) => {
            state.customPresets = state.customPresets.filter(
              (p) => p.id !== presetId
            );
            if (state.activePresetId === presetId) {
              state.activePresetId = null;
            }
          });
        },

        // Component style actions
        setComponentStyles: (componentId, styles) => {
          set((state) => {
            state.componentStyles[componentId] = styles;
          });
        },

        updateComponentStyles: (componentId, breakpoint, styles) => {
          set((state) => {
            if (!state.componentStyles[componentId]) {
              state.componentStyles[componentId] = { base: {} };
            }
            if (breakpoint === 'base') {
              state.componentStyles[componentId].base = {
                ...state.componentStyles[componentId].base,
                ...styles,
              };
            } else {
              (state.componentStyles[componentId] as any)[breakpoint] = {
                ...(state.componentStyles[componentId] as any)[breakpoint],
                ...styles,
              };
            }
          });
        },

        clearComponentStyles: (componentId) => {
          set((state) => {
            delete state.componentStyles[componentId];
          });
        },

        // UI actions
        setThemeEditorOpen: (open) => {
          set((state) => {
            state.isThemeEditorOpen = open;
          });
        },

        setStyleEditorOpen: (open) => {
          set((state) => {
            state.isStyleEditorOpen = open;
          });
        },

        setActiveStyleTab: (tab) => {
          set((state) => {
            state.activeStyleTab = tab;
          });
        },

        setSelectedBreakpoint: (breakpoint) => {
          set((state) => {
            state.selectedBreakpoint = breakpoint;
          });
        },

        // History actions
        undo: () => {
          const { tokenHistoryIndex, tokenHistory } = get();
          if (tokenHistoryIndex > 0) {
            set((state) => {
              state.tokenHistoryIndex = tokenHistoryIndex - 1;
              state.tokens = tokenHistory[tokenHistoryIndex - 1];
            });
            applyThemeToDocument(tokenHistory[tokenHistoryIndex - 1]);
          }
        },

        redo: () => {
          const { tokenHistoryIndex, tokenHistory } = get();
          if (tokenHistoryIndex < tokenHistory.length - 1) {
            set((state) => {
              state.tokenHistoryIndex = tokenHistoryIndex + 1;
              state.tokens = tokenHistory[tokenHistoryIndex + 1];
            });
            applyThemeToDocument(tokenHistory[tokenHistoryIndex + 1]);
          }
        },

        // Export/Import
        exportTokens: () => {
          return JSON.stringify(get().tokens, null, 2);
        },

        importTokens: (json) => {
          try {
            const tokens = JSON.parse(json) as DesignTokens;
            get().setTokens(tokens);
          } catch (error) {
            console.error('Failed to import tokens:', error);
          }
        },

        exportCSS: () => {
          return generateCSSVariables(get().tokens);
        },
      })),
      {
        name: 'design-system-storage',
        partialize: (state) => ({
          tokens: state.tokens,
          activePresetId: state.activePresetId,
          customPresets: state.customPresets,
          componentStyles: state.componentStyles,
        }),
      }
    ),
    { name: 'DesignSystemStore' }
  )
);

// Selector hooks
export const useDesignTokens = () => useDesignSystemStore((state) => state.tokens);
export const useActivePreset = () => useDesignSystemStore((state) => state.activePresetId);
export const useIsThemeEditorOpen = () => useDesignSystemStore((state) => state.isThemeEditorOpen);
