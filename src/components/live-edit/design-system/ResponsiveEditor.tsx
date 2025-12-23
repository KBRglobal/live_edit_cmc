'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResponsiveStyles, ComponentStyles } from '@/types/designSystem';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  key: Breakpoint;
  label: string;
  labelHe: string;
  minWidth: string;
  icon: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'wide';
}

const BREAKPOINTS: BreakpointConfig[] = [
  {
    key: 'base',
    label: 'Base',
    labelHe: 'בסיס',
    minWidth: '0px',
    icon: '📱',
    deviceType: 'mobile',
  },
  {
    key: 'sm',
    label: 'Small',
    labelHe: 'קטן',
    minWidth: '640px',
    icon: '📱',
    deviceType: 'mobile',
  },
  {
    key: 'md',
    label: 'Medium',
    labelHe: 'בינוני',
    minWidth: '768px',
    icon: '📱',
    deviceType: 'tablet',
  },
  {
    key: 'lg',
    label: 'Large',
    labelHe: 'גדול',
    minWidth: '1024px',
    icon: '💻',
    deviceType: 'desktop',
  },
  {
    key: 'xl',
    label: 'X-Large',
    labelHe: 'גדול מאוד',
    minWidth: '1280px',
    icon: '🖥️',
    deviceType: 'desktop',
  },
  {
    key: '2xl',
    label: '2X-Large',
    labelHe: 'ענק',
    minWidth: '1536px',
    icon: '🖥️',
    deviceType: 'wide',
  },
];

interface ResponsiveEditorProps {
  responsiveStyles: ResponsiveStyles;
  onChange: (styles: ResponsiveStyles) => void;
}

export function ResponsiveEditor({
  responsiveStyles,
  onChange,
}: ResponsiveEditorProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('base');
  const [previewWidth, setPreviewWidth] = useState(375); // Mobile default

  const getBreakpointStyles = (bp: Breakpoint): Partial<ComponentStyles> => {
    if (bp === 'base') return responsiveStyles.base;
    return responsiveStyles[bp] || {};
  };

  const updateBreakpointStyles = (
    bp: Breakpoint,
    styles: Partial<ComponentStyles>
  ) => {
    if (bp === 'base') {
      onChange({
        ...responsiveStyles,
        base: { ...responsiveStyles.base, ...styles } as ComponentStyles,
      });
    } else {
      onChange({
        ...responsiveStyles,
        [bp]: { ...responsiveStyles[bp], ...styles },
      });
    }
  };

  const clearBreakpointStyles = (bp: Breakpoint) => {
    if (bp === 'base') return; // Can't clear base
    const newStyles = { ...responsiveStyles };
    delete newStyles[bp];
    onChange(newStyles);
  };

  const copyFromBreakpoint = (fromBp: Breakpoint, toBp: Breakpoint) => {
    const sourceStyles = getBreakpointStyles(fromBp);
    updateBreakpointStyles(toBp, sourceStyles);
  };

  const hasBreakpointStyles = (bp: Breakpoint): boolean => {
    if (bp === 'base') return true;
    const styles = responsiveStyles[bp];
    return styles !== undefined && Object.keys(styles).length > 0;
  };

  const currentStyles = getBreakpointStyles(activeBreakpoint);
  const currentBreakpointConfig = BREAKPOINTS.find(
    (bp) => bp.key === activeBreakpoint
  );

  // Device preview sizes
  const deviceSizes = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  };

  return (
    <div className="responsive-editor">
      {/* Breakpoint Tabs */}
      <div className="breakpoint-tabs mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
          {BREAKPOINTS.map((bp) => {
            const hasStyles = hasBreakpointStyles(bp.key);
            return (
              <button
                key={bp.key}
                onClick={() => {
                  setActiveBreakpoint(bp.key);
                  setPreviewWidth(deviceSizes[bp.deviceType]);
                }}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-all
                  relative whitespace-nowrap
                  ${
                    activeBreakpoint === bp.key
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <span className="mr-1">{bp.icon}</span>
                <span>{bp.labelHe}</span>
                <span className="ml-1 text-xs text-gray-400">
                  {bp.minWidth}
                </span>
                {hasStyles && bp.key !== 'base' && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breakpoint Actions */}
      {activeBreakpoint !== 'base' && (
        <div className="breakpoint-actions flex gap-2 mb-4">
          <select
            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800"
            onChange={(e) => {
              if (e.target.value) {
                copyFromBreakpoint(e.target.value as Breakpoint, activeBreakpoint);
              }
            }}
            value=""
          >
            <option value="">העתק מ...</option>
            {BREAKPOINTS.filter((bp) => bp.key !== activeBreakpoint).map(
              (bp) => (
                <option key={bp.key} value={bp.key}>
                  {bp.labelHe}
                </option>
              )
            )}
          </select>
          <button
            onClick={() => clearBreakpointStyles(activeBreakpoint)}
            className="px-3 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            נקה
          </button>
        </div>
      )}

      {/* Preview Area */}
      <div className="preview-area mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            תצוגה מקדימה
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{previewWidth}px</span>
            <input
              type="range"
              min="320"
              max="1920"
              value={previewWidth}
              onChange={(e) => setPreviewWidth(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-hidden">
          <motion.div
            animate={{ width: `${Math.min(previewWidth, 100)}%` }}
            className="mx-auto bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
            style={{ maxWidth: previewWidth }}
          >
            <ResponsivePreview
              responsiveStyles={responsiveStyles}
              previewWidth={previewWidth}
            />
          </motion.div>
        </div>

        {/* Quick Device Buttons */}
        <div className="flex justify-center gap-2 mt-3">
          {Object.entries(deviceSizes).map(([device, width]) => (
            <button
              key={device}
              onClick={() => setPreviewWidth(width)}
              className={`
                px-3 py-1 text-xs rounded-full transition-colors
                ${
                  previewWidth === width
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {device === 'mobile' && '📱'}
              {device === 'tablet' && '📱'}
              {device === 'desktop' && '💻'}
              {device === 'wide' && '🖥️'}{' '}
              {width}px
            </button>
          ))}
        </div>
      </div>

      {/* Style Properties for Active Breakpoint */}
      <div className="style-properties">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold">
            סגנונות ל-{currentBreakpointConfig?.labelHe}
          </h4>
          {activeBreakpoint !== 'base' && !hasBreakpointStyles(activeBreakpoint) && (
            <span className="text-xs text-gray-500">
              יורש מ-{BREAKPOINTS[BREAKPOINTS.findIndex(bp => bp.key === activeBreakpoint) - 1]?.labelHe || 'בסיס'}
            </span>
          )}
        </div>

        {/* Layout */}
        <PropertySection title="פריסה">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Display</label>
              <select
                value={currentStyles.box?.display || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    box: {
                      ...currentStyles.box,
                      display: e.target.value as any || undefined,
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-800"
              >
                <option value="">ברירת מחדל</option>
                <option value="block">Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
                <option value="inline">Inline</option>
                <option value="none">Hidden</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">כיוון Flex</label>
              <select
                value={currentStyles.box?.flexDirection || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    box: {
                      ...currentStyles.box,
                      flexDirection: e.target.value as any || undefined,
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-800"
              >
                <option value="">ברירת מחדל</option>
                <option value="row">שורה</option>
                <option value="row-reverse">שורה הפוכה</option>
                <option value="column">עמודה</option>
                <option value="column-reverse">עמודה הפוכה</option>
              </select>
            </div>
          </div>

          {currentStyles.box?.display === 'grid' && (
            <div className="mt-3">
              <label className="text-xs text-gray-500 mb-1 block">עמודות Grid</label>
              <input
                type="number"
                min="1"
                max="12"
                value={currentStyles.box?.gridCols || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    box: {
                      ...currentStyles.box,
                      gridCols: parseInt(e.target.value) || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
          )}
        </PropertySection>

        {/* Size */}
        <PropertySection title="גודל">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">רוחב</label>
              <input
                type="text"
                value={currentStyles.size?.width || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    size: {
                      ...currentStyles.size,
                      width: e.target.value || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">גובה</label>
              <input
                type="text"
                value={currentStyles.size?.height || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    size: {
                      ...currentStyles.size,
                      height: e.target.value || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">רוחב מקסימלי</label>
              <input
                type="text"
                value={currentStyles.size?.maxWidth || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    size: {
                      ...currentStyles.size,
                      maxWidth: e.target.value || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">גובה מינימלי</label>
              <input
                type="text"
                value={currentStyles.size?.minHeight || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    size: {
                      ...currentStyles.size,
                      minHeight: e.target.value || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
          </div>
        </PropertySection>

        {/* Typography */}
        <PropertySection title="טיפוגרפיה">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">גודל פונט</label>
              <input
                type="text"
                value={currentStyles.typography?.fontSize || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    typography: {
                      ...currentStyles.typography,
                      fontSize: e.target.value || undefined,
                    },
                  })
                }
                placeholder="יורש"
                className="w-full px-2 py-1.5 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">יישור טקסט</label>
              <select
                value={currentStyles.typography?.textAlign || ''}
                onChange={(e) =>
                  updateBreakpointStyles(activeBreakpoint, {
                    typography: {
                      ...currentStyles.typography,
                      textAlign: e.target.value as any || undefined,
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border rounded bg-white dark:bg-gray-800"
              >
                <option value="">יורש</option>
                <option value="right">ימין</option>
                <option value="center">מרכז</option>
                <option value="left">שמאל</option>
                <option value="justify">מיושר</option>
              </select>
            </div>
          </div>
        </PropertySection>

        {/* Spacing */}
        <PropertySection title="מרווחים">
          <div className="grid grid-cols-2 gap-4">
            {/* Padding */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Padding</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={currentStyles.spacing?.padding?.top || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        padding: {
                          ...currentStyles.spacing?.padding,
                          top: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="↑"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.padding?.bottom || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        padding: {
                          ...currentStyles.spacing?.padding,
                          bottom: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="↓"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.padding?.right || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        padding: {
                          ...currentStyles.spacing?.padding,
                          right: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="→"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.padding?.left || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        padding: {
                          ...currentStyles.spacing?.padding,
                          left: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="←"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Margin</label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  value={currentStyles.spacing?.margin?.top || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        margin: {
                          ...currentStyles.spacing?.margin,
                          top: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="↑"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.margin?.bottom || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        margin: {
                          ...currentStyles.spacing?.margin,
                          bottom: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="↓"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.margin?.right || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        margin: {
                          ...currentStyles.spacing?.margin,
                          right: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="→"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
                <input
                  type="text"
                  value={currentStyles.spacing?.margin?.left || ''}
                  onChange={(e) =>
                    updateBreakpointStyles(activeBreakpoint, {
                      spacing: {
                        ...currentStyles.spacing,
                        margin: {
                          ...currentStyles.spacing?.margin,
                          left: e.target.value || undefined,
                        },
                      },
                    })
                  }
                  placeholder="←"
                  className="w-full px-2 py-1 text-xs border rounded text-center"
                />
              </div>
            </div>
          </div>
        </PropertySection>

        {/* Visibility */}
        <PropertySection title="נראות">
          <div className="flex items-center justify-between">
            <span className="text-sm">הסתר ב-breakpoint זה</span>
            <button
              onClick={() =>
                updateBreakpointStyles(activeBreakpoint, {
                  box: {
                    ...currentStyles.box,
                    display: currentStyles.box?.display === 'none' ? undefined : 'none',
                  },
                })
              }
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  currentStyles.box?.display === 'none'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }
              `}
            >
              {currentStyles.box?.display === 'none' ? 'מוסתר' : 'מוצג'}
            </button>
          </div>
        </PropertySection>
      </div>

      {/* Inheritance Indicator */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🔗 ירושת סגנונות
        </h4>
        <p className="text-xs text-blue-600 dark:text-blue-300">
          סגנונות יורשים מ-breakpoints קטנים יותר. הגדר רק את מה שצריך להשתנות.
        </p>
        <div className="flex gap-1 mt-2">
          {BREAKPOINTS.map((bp, index) => (
            <div
              key={bp.key}
              className={`
                flex-1 h-2 rounded
                ${
                  hasBreakpointStyles(bp.key)
                    ? 'bg-blue-500'
                    : 'bg-blue-200 dark:bg-blue-800'
                }
              `}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>📱</span>
          <span>🖥️</span>
        </div>
      </div>
    </div>
  );
}

// Property Section Component
interface PropertySectionProps {
  title: string;
  children: React.ReactNode;
}

function PropertySection({ title, children }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="property-section border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
      >
        {title}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Responsive Preview Component
interface ResponsivePreviewProps {
  responsiveStyles: ResponsiveStyles;
  previewWidth: number;
}

function ResponsivePreview({ responsiveStyles, previewWidth }: ResponsivePreviewProps) {
  const getActiveBreakpoint = (): Breakpoint => {
    if (previewWidth >= 1536) return '2xl';
    if (previewWidth >= 1280) return 'xl';
    if (previewWidth >= 1024) return 'lg';
    if (previewWidth >= 768) return 'md';
    if (previewWidth >= 640) return 'sm';
    return 'base';
  };

  const getMergedStyles = (): React.CSSProperties => {
    const activeBreakpoint = getActiveBreakpoint();
    const breakpoints: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
    const activeIndex = breakpoints.indexOf(activeBreakpoint);

    // Merge styles from base to active breakpoint
    let mergedStyles: Partial<ComponentStyles> = { ...responsiveStyles.base };
    for (let i = 1; i <= activeIndex; i++) {
      const bp = breakpoints[i];
      if (responsiveStyles[bp]) {
        mergedStyles = deepMerge(mergedStyles, responsiveStyles[bp]!);
      }
    }

    // Convert to CSS
    const css: React.CSSProperties = {};

    // Box/Layout
    if (mergedStyles.box) {
      if (mergedStyles.box.display) css.display = mergedStyles.box.display;
      if (mergedStyles.box.flexDirection) css.flexDirection = mergedStyles.box.flexDirection;
      if (mergedStyles.box.gridCols) {
        css.gridTemplateColumns = `repeat(${mergedStyles.box.gridCols}, 1fr)`;
      }
    }

    // Size
    if (mergedStyles.size) {
      if (mergedStyles.size.width) css.width = mergedStyles.size.width;
      if (mergedStyles.size.height) css.height = mergedStyles.size.height;
      if (mergedStyles.size.maxWidth) css.maxWidth = mergedStyles.size.maxWidth;
      if (mergedStyles.size.minHeight) css.minHeight = mergedStyles.size.minHeight;
    }

    // Typography
    if (mergedStyles.typography) {
      if (mergedStyles.typography.fontSize) css.fontSize = mergedStyles.typography.fontSize;
      if (mergedStyles.typography.textAlign) css.textAlign = mergedStyles.typography.textAlign;
    }

    // Spacing
    if (mergedStyles.spacing?.padding) {
      const p = mergedStyles.spacing.padding;
      if (p.top) css.paddingTop = p.top;
      if (p.right) css.paddingRight = p.right;
      if (p.bottom) css.paddingBottom = p.bottom;
      if (p.left) css.paddingLeft = p.left;
    }

    if (mergedStyles.spacing?.margin) {
      const m = mergedStyles.spacing.margin;
      if (m.top) css.marginTop = m.top;
      if (m.right) css.marginRight = m.right;
      if (m.bottom) css.marginBottom = m.bottom;
      if (m.left) css.marginLeft = m.left;
    }

    return css;
  };

  return (
    <div
      style={getMergedStyles()}
      className="p-4 min-h-[100px] transition-all duration-300"
    >
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center">
        <div className="text-sm font-medium mb-1">
          Breakpoint: {getActiveBreakpoint()}
        </div>
        <div className="text-xs text-gray-500">
          רוחב: {previewWidth}px
        </div>
      </div>
    </div>
  );
}

// Helper function for deep merging objects
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(
          (target[key] as Record<string, any>) || {},
          source[key] as Record<string, any>
        ) as T[typeof key];
      } else {
        result[key] = source[key] as T[typeof key];
      }
    }
  }
  return result;
}

export default ResponsiveEditor;
