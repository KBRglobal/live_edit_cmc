'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  ComponentVariant,
  ComponentStyles,
  StateStyles,
  VariantPresetType,
  SizeVariant,
} from '@/types/designSystem';
import { StateStyleEditor } from './StateStyleEditor';

interface VariantsManagerProps {
  componentType: string;
  variants: ComponentVariant[];
  activeVariantId: string;
  onVariantsChange: (variants: ComponentVariant[]) => void;
  onActiveVariantChange: (variantId: string) => void;
}

// Preset templates
const VARIANT_PRESETS: Record<VariantPresetType, { styles: ComponentStyles; stateStyles: StateStyles }> = {
  primary: {
    styles: {
      background: { color: 'var(--color-primary-500)' },
      typography: { fontWeight: 500 },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: 'var(--color-primary-600)' },
        effects: { shadow: '0 4px 6px rgba(0,0,0,0.1)' },
      },
      focus: {
        effects: { shadow: '0 0 0 3px rgba(59, 130, 246, 0.5)' },
      },
      active: {
        background: { color: 'var(--color-primary-700)' },
        transform: { scale: 0.98 },
      },
      disabled: {
        effects: { opacity: 0.5 },
      },
    },
  },
  secondary: {
    styles: {
      background: { color: 'var(--color-secondary-500)' },
      typography: { fontWeight: 500 },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: 'var(--color-secondary-600)' },
      },
    },
  },
  outline: {
    styles: {
      background: { color: 'transparent' },
      border: { width: '2px', style: 'solid', color: 'var(--color-primary-500)', radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: 'var(--color-primary-50)' },
      },
    },
  },
  ghost: {
    styles: {
      background: { color: 'transparent' },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  },
  link: {
    styles: {
      background: { color: 'transparent' },
      typography: { textDecoration: 'underline' },
    },
    stateStyles: {
      default: {},
      hover: {
        effects: { opacity: 0.8 },
      },
    },
  },
  destructive: {
    styles: {
      background: { color: '#ef4444' },
      typography: { fontWeight: 500 },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: '#dc2626' },
      },
    },
  },
  success: {
    styles: {
      background: { color: '#22c55e' },
      typography: { fontWeight: 500 },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: '#16a34a' },
      },
    },
  },
  warning: {
    styles: {
      background: { color: '#f59e0b' },
      typography: { fontWeight: 500 },
      border: { radius: '0.5rem' },
      spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
    },
    stateStyles: {
      default: {},
      hover: {
        background: { color: '#d97706' },
      },
    },
  },
};

const SIZE_PRESETS: Record<SizeVariant, Partial<ComponentStyles>> = {
  xs: {
    typography: { fontSize: '0.75rem' },
    spacing: { padding: { top: '0.25rem', right: '0.5rem', bottom: '0.25rem', left: '0.5rem' } },
  },
  sm: {
    typography: { fontSize: '0.875rem' },
    spacing: { padding: { top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem' } },
  },
  md: {
    typography: { fontSize: '1rem' },
    spacing: { padding: { top: '0.75rem', right: '1.5rem', bottom: '0.75rem', left: '1.5rem' } },
  },
  lg: {
    typography: { fontSize: '1.125rem' },
    spacing: { padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } },
  },
  xl: {
    typography: { fontSize: '1.25rem' },
    spacing: { padding: { top: '1.25rem', right: '2.5rem', bottom: '1.25rem', left: '2.5rem' } },
  },
};

export function VariantsManager({
  componentType,
  variants,
  activeVariantId,
  onVariantsChange,
  onActiveVariantChange,
}: VariantsManagerProps) {
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<VariantPresetType>('primary');
  const [selectedSize, setSelectedSize] = useState<SizeVariant>('md');

  const activeVariant = variants.find((v) => v.id === activeVariantId);
  const editingVariant = variants.find((v) => v.id === editingVariantId);

  const createVariant = () => {
    if (!newVariantName.trim()) return;

    const preset = VARIANT_PRESETS[selectedPreset];
    const sizeStyles = SIZE_PRESETS[selectedSize];

    const newVariant: ComponentVariant = {
      id: `variant-${Date.now()}`,
      name: newVariantName,
      nameHe: newVariantName,
      baseStyles: {
        ...preset.styles,
        typography: { ...preset.styles.typography, ...sizeStyles.typography },
        spacing: sizeStyles.spacing,
      },
      stateStyles: preset.stateStyles,
    };

    onVariantsChange([...variants, newVariant]);
    setIsCreatingNew(false);
    setNewVariantName('');
  };

  const duplicateVariant = (variant: ComponentVariant) => {
    const newVariant: ComponentVariant = {
      ...variant,
      id: `variant-${Date.now()}`,
      name: `${variant.name} (עותק)`,
      nameHe: `${variant.nameHe} (עותק)`,
      isDefault: false,
    };
    onVariantsChange([...variants, newVariant]);
  };

  const deleteVariant = (variantId: string) => {
    if (variants.length <= 1) return;
    const newVariants = variants.filter((v) => v.id !== variantId);
    onVariantsChange(newVariants);
    if (activeVariantId === variantId) {
      onActiveVariantChange(newVariants[0].id);
    }
  };

  const updateVariant = (variantId: string, updates: Partial<ComponentVariant>) => {
    onVariantsChange(
      variants.map((v) =>
        v.id === variantId ? { ...v, ...updates } : v
      )
    );
  };

  const setAsDefault = (variantId: string) => {
    onVariantsChange(
      variants.map((v) => ({
        ...v,
        isDefault: v.id === variantId,
      }))
    );
  };

  return (
    <div className="variants-manager">
      {/* Variants List */}
      <div className="variants-list mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            וריאנטים ({variants.length})
          </h3>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            + חדש
          </button>
        </div>

        <div className="grid gap-2">
          {variants.map((variant) => (
            <motion.div
              key={variant.id}
              layout
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                ${
                  activeVariantId === variant.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => onActiveVariantChange(variant.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VariantPreview
                    styles={variant.baseStyles}
                    stateStyles={variant.stateStyles}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {variant.nameHe || variant.name}
                    </div>
                    {variant.isDefault && (
                      <span className="text-xs text-blue-600">ברירת מחדל</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingVariantId(variant.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateVariant(variant);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded"
                  >
                    📋
                  </button>
                  {variants.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVariant(variant.id);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create New Variant Dialog */}
      <AnimatePresence>
        {isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsCreatingNew(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">יצירת וריאנט חדש</h3>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">שם הוריאנט</label>
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="לדוגמה: כפתור ראשי"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preset Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">בחר תבנית</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(VARIANT_PRESETS) as VariantPresetType[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedPreset(preset)}
                      className={`
                        p-2 rounded-lg border text-xs capitalize transition-all
                        ${
                          selectedPreset === preset
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">גודל</label>
                <div className="flex gap-2">
                  {(Object.keys(SIZE_PRESETS) as SizeVariant[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        flex-1 py-2 rounded-lg border text-sm uppercase transition-all
                        ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">תצוגה מקדימה</label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                  <VariantPreview
                    styles={{
                      ...VARIANT_PRESETS[selectedPreset].styles,
                      ...SIZE_PRESETS[selectedSize],
                    }}
                    stateStyles={VARIANT_PRESETS[selectedPreset].stateStyles}
                    isLarge
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={createVariant}
                  disabled={!newVariantName.trim()}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  יצירה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Variant Panel */}
      <AnimatePresence>
        {editingVariant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setEditingVariantId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
                <div>
                  <input
                    type="text"
                    value={editingVariant.nameHe}
                    onChange={(e) =>
                      updateVariant(editingVariant.id, {
                        nameHe: e.target.value,
                        name: e.target.value,
                      })
                    }
                    className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0"
                  />
                  {!editingVariant.isDefault && (
                    <button
                      onClick={() => setAsDefault(editingVariant.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      הגדר כברירת מחדל
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setEditingVariantId(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* State Styles Editor */}
                <StateStyleEditor
                  stateStyles={editingVariant.stateStyles}
                  onChange={(stateStyles) =>
                    updateVariant(editingVariant.id, { stateStyles })
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Variant Quick Actions */}
      {activeVariant && (
        <div className="active-variant-actions mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">וריאנט פעיל: {activeVariant.nameHe}</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingVariantId(activeVariant.id)}
              className="flex-1 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ערוך סגנונות
            </button>
            <button
              onClick={() => duplicateVariant(activeVariant)}
              className="flex-1 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              שכפל
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Variant Preview Component
interface VariantPreviewProps {
  styles: ComponentStyles;
  stateStyles: StateStyles;
  isLarge?: boolean;
}

function VariantPreview({ styles, stateStyles, isLarge = false }: VariantPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStyles = (): React.CSSProperties => {
    const base = styles;
    const hover = isHovered ? stateStyles.hover : {};
    const merged = { ...base, ...hover };

    const css: React.CSSProperties = {};

    // Background
    if (merged.background?.color) {
      css.backgroundColor = merged.background.color;
    }

    // Border
    if (merged.border) {
      if (merged.border.width && merged.border.style && merged.border.color) {
        css.border = `${merged.border.width} ${merged.border.style} ${merged.border.color}`;
      }
      if (merged.border.radius) {
        css.borderRadius = merged.border.radius;
      }
    }

    // Effects
    if (merged.effects?.shadow) {
      css.boxShadow = merged.effects.shadow;
    }

    return css;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...getStyles(),
        width: isLarge ? 'auto' : '32px',
        height: isLarge ? 'auto' : '32px',
        padding: isLarge ? '12px 24px' : undefined,
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
      className={isLarge ? 'text-white font-medium' : 'rounded'}
    >
      {isLarge && 'לחץ כאן'}
    </div>
  );
}

export default VariantsManager;
