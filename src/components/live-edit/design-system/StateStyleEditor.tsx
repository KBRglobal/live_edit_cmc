'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StateStyles, ComponentStyles } from '@/types/designSystem';

interface StateStyleEditorProps {
  stateStyles: StateStyles;
  onChange: (stateStyles: StateStyles) => void;
}

type StateKey = 'default' | 'hover' | 'focus' | 'active' | 'disabled';

interface StateConfig {
  key: StateKey;
  label: string;
  labelHe: string;
  icon: string;
  description: string;
}

const STATES: StateConfig[] = [
  {
    key: 'default',
    label: 'Default',
    labelHe: 'ברירת מחדל',
    icon: '⬜',
    description: 'Normal state',
  },
  {
    key: 'hover',
    label: 'Hover',
    labelHe: 'ריחוף',
    icon: '👆',
    description: 'Mouse over',
  },
  {
    key: 'focus',
    label: 'Focus',
    labelHe: 'מיקוד',
    icon: '🎯',
    description: 'Keyboard focus',
  },
  {
    key: 'active',
    label: 'Active',
    labelHe: 'לחוץ',
    icon: '⬛',
    description: 'Being pressed',
  },
  {
    key: 'disabled',
    label: 'Disabled',
    labelHe: 'מושבת',
    icon: '🚫',
    description: 'Not interactive',
  },
];

export function StateStyleEditor({
  stateStyles,
  onChange,
}: StateStyleEditorProps) {
  const [activeState, setActiveState] = useState<StateKey>('default');
  const [previewState, setPreviewState] = useState<StateKey | null>(null);

  const getCurrentStyles = (): Partial<ComponentStyles> => {
    if (activeState === 'default') {
      return stateStyles.default;
    }
    return stateStyles[activeState] || {};
  };

  const updateStateStyles = (styles: Partial<ComponentStyles>) => {
    if (activeState === 'default') {
      onChange({
        ...stateStyles,
        default: { ...stateStyles.default, ...styles } as ComponentStyles,
      });
    } else {
      onChange({
        ...stateStyles,
        [activeState]: { ...stateStyles[activeState], ...styles },
      });
    }
  };

  const copyFromDefault = () => {
    if (activeState !== 'default') {
      onChange({
        ...stateStyles,
        [activeState]: { ...stateStyles.default },
      });
    }
  };

  const clearState = () => {
    if (activeState !== 'default') {
      const newStyles = { ...stateStyles };
      delete newStyles[activeState];
      onChange(newStyles);
    }
  };

  const currentStyles = getCurrentStyles();

  return (
    <div className="state-style-editor">
      {/* State Tabs */}
      <div className="state-tabs flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {STATES.map((state) => {
          const hasStyles =
            state.key !== 'default' && stateStyles[state.key];
          return (
            <button
              key={state.key}
              onClick={() => setActiveState(state.key)}
              onMouseEnter={() => setPreviewState(state.key)}
              onMouseLeave={() => setPreviewState(null)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all
                relative
                ${
                  activeState === state.key
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <span className="mr-1">{state.icon}</span>
              <span>{state.labelHe}</span>
              {hasStyles && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* State Actions */}
      {activeState !== 'default' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={copyFromDefault}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            העתק מברירת מחדל
          </button>
          <button
            onClick={clearState}
            className="px-3 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            נקה
          </button>
        </div>
      )}

      {/* Preview Box */}
      <div className="preview-section mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          תצוגה מקדימה
        </label>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
          <PreviewElement
            stateStyles={stateStyles}
            previewState={previewState}
          />
        </div>
      </div>

      {/* Style Properties */}
      <div className="style-properties space-y-4">
        {/* Background Color */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            צבע רקע
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={currentStyles.background?.color || '#ffffff'}
              onChange={(e) =>
                updateStateStyles({
                  background: {
                    ...currentStyles.background,
                    color: e.target.value,
                  },
                })
              }
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={currentStyles.background?.color || ''}
              onChange={(e) =>
                updateStateStyles({
                  background: {
                    ...currentStyles.background,
                    color: e.target.value,
                  },
                })
              }
              placeholder="transparent"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            צבע טקסט
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={getTextColor(currentStyles)}
              onChange={(e) =>
                updateStateStyles({
                  typography: {
                    ...currentStyles.typography,
                  },
                })
              }
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value=""
              placeholder="inherit"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Border */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            גבול
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={currentStyles.border?.width || ''}
              onChange={(e) =>
                updateStateStyles({
                  border: {
                    ...currentStyles.border,
                    width: e.target.value,
                  },
                })
              }
              placeholder="1px"
              className="px-3 py-2 border rounded-md text-sm"
            />
            <select
              value={currentStyles.border?.style || 'solid'}
              onChange={(e) =>
                updateStateStyles({
                  border: {
                    ...currentStyles.border,
                    style: e.target.value as 'solid' | 'dashed' | 'dotted' | 'none',
                  },
                })
              }
              className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
            >
              <option value="none">ללא</option>
              <option value="solid">רציף</option>
              <option value="dashed">מקווקו</option>
              <option value="dotted">נקודות</option>
            </select>
            <input
              type="color"
              value={currentStyles.border?.color || '#e5e7eb'}
              onChange={(e) =>
                updateStateStyles({
                  border: {
                    ...currentStyles.border,
                    color: e.target.value,
                  },
                })
              }
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
        </div>

        {/* Shadow */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            צל
          </label>
          <select
            value={currentStyles.effects?.shadow || 'none'}
            onChange={(e) =>
              updateStateStyles({
                effects: {
                  ...currentStyles.effects,
                  shadow: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
          >
            <option value="none">ללא</option>
            <option value="0 1px 2px rgba(0,0,0,0.05)">קטן</option>
            <option value="0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)">בינוני</option>
            <option value="0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)">גדול</option>
            <option value="0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)">גדול מאוד</option>
            <option value="0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)">ענק</option>
          </select>
        </div>

        {/* Transform */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            טרנספורמציה
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">סקאלה</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="2"
                value={currentStyles.transform?.scale ?? 1}
                onChange={(e) =>
                  updateStateStyles({
                    transform: {
                      ...currentStyles.transform,
                      scale: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">הזזה Y</label>
              <input
                type="text"
                value={currentStyles.transform?.translateY || ''}
                onChange={(e) =>
                  updateStateStyles({
                    transform: {
                      ...currentStyles.transform,
                      translateY: e.target.value,
                    },
                  })
                }
                placeholder="0px"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Opacity */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            שקיפות: {Math.round((currentStyles.effects?.opacity ?? 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentStyles.effects?.opacity ?? 1}
            onChange={(e) =>
              updateStateStyles({
                effects: {
                  ...currentStyles.effects,
                  opacity: parseFloat(e.target.value),
                },
              })
            }
            className="w-full"
          />
        </div>

        {/* Transition */}
        <div className="property-group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            אנימציית מעבר
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={currentStyles.transition?.duration || ''}
              onChange={(e) =>
                updateStateStyles({
                  transition: {
                    ...currentStyles.transition,
                    duration: e.target.value,
                  },
                })
              }
              placeholder="200ms"
              className="px-3 py-2 border rounded-md text-sm"
            />
            <select
              value={currentStyles.transition?.easing || 'ease'}
              onChange={(e) =>
                updateStateStyles({
                  transition: {
                    ...currentStyles.transition,
                    easing: e.target.value,
                  },
                })
              }
              className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
            >
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In/Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getTextColor(styles: Partial<ComponentStyles>): string {
  return '#000000';
}

// Preview Element Component
interface PreviewElementProps {
  stateStyles: StateStyles;
  previewState: StateKey | null;
}

function PreviewElement({ stateStyles, previewState }: PreviewElementProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getActiveState = (): StateKey => {
    if (previewState) return previewState;
    if (isActive) return 'active';
    if (isFocused) return 'focus';
    if (isHovered) return 'hover';
    return 'default';
  };

  const getMergedStyles = (): React.CSSProperties => {
    const activeState = getActiveState();
    const baseStyles = stateStyles.default;
    const stateSpecificStyles =
      activeState !== 'default' ? stateStyles[activeState] : {};

    const merged = { ...baseStyles, ...stateSpecificStyles };
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
    if (merged.effects) {
      if (merged.effects.shadow) css.boxShadow = merged.effects.shadow;
      if (merged.effects.opacity !== undefined) css.opacity = merged.effects.opacity;
    }

    // Transform
    if (merged.transform) {
      const transforms: string[] = [];
      if (merged.transform.scale !== undefined) {
        transforms.push(`scale(${merged.transform.scale})`);
      }
      if (merged.transform.translateY) {
        transforms.push(`translateY(${merged.transform.translateY})`);
      }
      if (transforms.length > 0) {
        css.transform = transforms.join(' ');
      }
    }

    // Transition
    if (merged.transition) {
      const property = merged.transition.property || 'all';
      const duration = merged.transition.duration || '200ms';
      const easing = merged.transition.easing || 'ease';
      css.transition = `${property} ${duration} ${easing}`;
    } else {
      css.transition = 'all 200ms ease';
    }

    return css;
  };

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        ...getMergedStyles(),
        padding: '12px 24px',
        cursor: previewState === 'disabled' ? 'not-allowed' : 'pointer',
      }}
      disabled={previewState === 'disabled'}
      className="font-medium"
    >
      {previewState ? `מצב: ${STATES.find((s) => s.key === previewState)?.labelHe}` : 'רחף לתצוגה'}
    </button>
  );
}

export default StateStyleEditor;
