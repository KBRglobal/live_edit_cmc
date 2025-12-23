"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Layout,
  Box,
  Type,
  Image,
  Square,
  Sparkles,
  Move,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useDesignSystemStore } from "@/stores/designSystemStore";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ComponentStyles, BoxStyle, SpacingStyle } from "@/types/designSystem";
import { cn } from "@/lib/utils";

// Layout Editor Section
function LayoutEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const boxStyles = styles.box || {};

  const displayOptions = [
    { value: "block", icon: "▢", label: "Block" },
    { value: "flex", icon: "⬛⬛", label: "Flex" },
    { value: "grid", icon: "⊞", label: "Grid" },
    { value: "inline", icon: "—", label: "Inline" },
    { value: "none", icon: "⊘", label: "Hidden" },
  ];

  const flexDirectionOptions = [
    { value: "row", label: "→ שורה" },
    { value: "row-reverse", label: "← שורה הפוכה" },
    { value: "column", label: "↓ עמודה" },
    { value: "column-reverse", label: "↑ עמודה הפוכה" },
  ];

  const justifyOptions = [
    { value: "start", label: "התחלה" },
    { value: "center", label: "מרכז" },
    { value: "end", label: "סוף" },
    { value: "between", label: "מרווח" },
    { value: "around", label: "סביב" },
    { value: "evenly", label: "שווה" },
  ];

  const alignOptions = [
    { value: "start", label: "התחלה" },
    { value: "center", label: "מרכז" },
    { value: "end", label: "סוף" },
    { value: "stretch", label: "מתיחה" },
    { value: "baseline", label: "בסיס" },
  ];

  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="space-y-2">
        <Label>סוג תצוגה</Label>
        <div className="flex gap-1">
          {displayOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({ box: { ...boxStyles, display: opt.value as any } })
              }
              className={cn(
                "flex-1 p-2 text-center border rounded-lg text-sm",
                "hover:bg-muted transition-colors",
                boxStyles.display === opt.value && "border-primary bg-primary/10"
              )}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Flex Direction (if flex) */}
      {(boxStyles.display === "flex" || boxStyles.display === "inline-flex") && (
        <>
          <div className="space-y-2">
            <Label>כיוון</Label>
            <div className="grid grid-cols-2 gap-2">
              {flexDirectionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({
                      box: { ...boxStyles, flexDirection: opt.value as any },
                    })
                  }
                  className={cn(
                    "p-2 text-center border rounded-lg text-sm",
                    "hover:bg-muted transition-colors",
                    boxStyles.flexDirection === opt.value &&
                      "border-primary bg-primary/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>יישור ראשי (Justify)</Label>
            <div className="grid grid-cols-3 gap-2">
              {justifyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({
                      box: { ...boxStyles, justifyContent: opt.value as any },
                    })
                  }
                  className={cn(
                    "p-2 text-center border rounded-lg text-xs",
                    "hover:bg-muted transition-colors",
                    boxStyles.justifyContent === opt.value &&
                      "border-primary bg-primary/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>יישור משני (Align)</Label>
            <div className="grid grid-cols-3 gap-2">
              {alignOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({
                      box: { ...boxStyles, alignItems: opt.value as any },
                    })
                  }
                  className={cn(
                    "p-2 text-center border rounded-lg text-xs",
                    "hover:bg-muted transition-colors",
                    boxStyles.alignItems === opt.value &&
                      "border-primary bg-primary/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>רווח (Gap)</Label>
            <Input
              value={boxStyles.gap || "0"}
              onChange={(e) =>
                onChange({ box: { ...boxStyles, gap: e.target.value } })
              }
              placeholder="16px"
            />
          </div>
        </>
      )}

      {/* Grid Columns (if grid) */}
      {boxStyles.display === "grid" && (
        <div className="space-y-2">
          <Label>עמודות</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((cols) => (
              <button
                key={cols}
                onClick={() =>
                  onChange({ box: { ...boxStyles, gridCols: cols } })
                }
                className={cn(
                  "w-10 h-10 border rounded-lg text-sm",
                  "hover:bg-muted transition-colors",
                  boxStyles.gridCols === cols && "border-primary bg-primary/10"
                )}
              >
                {cols}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Spacing Editor Section (Margin & Padding)
function SpacingEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const spacingStyles = styles.spacing || { margin: {}, padding: {} };

  const spacingValues = ["0", "4px", "8px", "12px", "16px", "24px", "32px", "48px", "64px"];

  const updateSpacing = (
    type: "margin" | "padding",
    side: string,
    value: string
  ) => {
    onChange({
      spacing: {
        ...spacingStyles,
        [type]: {
          ...spacingStyles[type],
          [side]: value,
        },
      },
    });
  };

  const SpacingBox = ({ type }: { type: "margin" | "padding" }) => {
    const values = spacingStyles[type] || {};
    const color = type === "margin" ? "bg-orange-100" : "bg-blue-100";
    const label = type === "margin" ? "Margin" : "Padding";

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative p-8">
          {/* Visual Box */}
          <div
            className={cn(
              "absolute inset-4 border-2 border-dashed rounded-lg",
              type === "margin" ? "border-orange-300" : "border-blue-300"
            )}
          />

          {/* Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <Input
              value={values.top || "0"}
              onChange={(e) => updateSpacing(type, "top", e.target.value)}
              className="w-16 h-7 text-xs text-center"
            />
          </div>

          {/* Right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Input
              value={values.right || "0"}
              onChange={(e) => updateSpacing(type, "right", e.target.value)}
              className="w-16 h-7 text-xs text-center"
            />
          </div>

          {/* Bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <Input
              value={values.bottom || "0"}
              onChange={(e) => updateSpacing(type, "bottom", e.target.value)}
              className="w-16 h-7 text-xs text-center"
            />
          </div>

          {/* Left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Input
              value={values.left || "0"}
              onChange={(e) => updateSpacing(type, "left", e.target.value)}
              className="w-16 h-7 text-xs text-center"
            />
          </div>

          {/* Center label */}
          <div className="h-20 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SpacingBox type="margin" />
      <SpacingBox type="padding" />
    </div>
  );
}

// Size Editor Section
function SizeEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const sizeStyles = styles.size || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>רוחב</Label>
          <Input
            value={sizeStyles.width || "auto"}
            onChange={(e) =>
              onChange({ size: { ...sizeStyles, width: e.target.value } })
            }
            placeholder="auto"
          />
        </div>
        <div className="space-y-2">
          <Label>גובה</Label>
          <Input
            value={sizeStyles.height || "auto"}
            onChange={(e) =>
              onChange({ size: { ...sizeStyles, height: e.target.value } })
            }
            placeholder="auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>רוחב מינימלי</Label>
          <Input
            value={sizeStyles.minWidth || "0"}
            onChange={(e) =>
              onChange({ size: { ...sizeStyles, minWidth: e.target.value } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>רוחב מקסימלי</Label>
          <Input
            value={sizeStyles.maxWidth || "none"}
            onChange={(e) =>
              onChange({ size: { ...sizeStyles, maxWidth: e.target.value } })
            }
          />
        </div>
      </div>
    </div>
  );
}

// Typography Editor Section
function TypographyStyleEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const typoStyles = styles.typography || {};

  const alignOptions = [
    { value: "right", label: "ימין" },
    { value: "center", label: "מרכז" },
    { value: "left", label: "שמאל" },
    { value: "justify", label: "מיושר" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>גודל טקסט</Label>
          <Input
            value={typoStyles.fontSize || "inherit"}
            onChange={(e) =>
              onChange({
                typography: { ...typoStyles, fontSize: e.target.value },
              })
            }
            placeholder="16px"
          />
        </div>
        <div className="space-y-2">
          <Label>משקל</Label>
          <select
            value={typoStyles.fontWeight || 400}
            onChange={(e) =>
              onChange({
                typography: {
                  ...typoStyles,
                  fontWeight: parseInt(e.target.value),
                },
              })
            }
            className="w-full h-10 px-3 border rounded-md bg-background"
          >
            <option value={100}>Thin (100)</option>
            <option value={300}>Light (300)</option>
            <option value={400}>Regular (400)</option>
            <option value={500}>Medium (500)</option>
            <option value={600}>Semibold (600)</option>
            <option value={700}>Bold (700)</option>
            <option value={800}>Extrabold (800)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>יישור טקסט</Label>
        <div className="flex gap-1">
          {alignOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({
                  typography: { ...typoStyles, textAlign: opt.value as any },
                })
              }
              className={cn(
                "flex-1 p-2 text-center border rounded-lg text-sm",
                "hover:bg-muted transition-colors",
                typoStyles.textAlign === opt.value &&
                  "border-primary bg-primary/10"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>גובה שורה</Label>
          <Input
            value={typoStyles.lineHeight || "inherit"}
            onChange={(e) =>
              onChange({
                typography: { ...typoStyles, lineHeight: e.target.value },
              })
            }
            placeholder="1.5"
          />
        </div>
        <div className="space-y-2">
          <Label>ריווח אותיות</Label>
          <Input
            value={typoStyles.letterSpacing || "normal"}
            onChange={(e) =>
              onChange({
                typography: { ...typoStyles, letterSpacing: e.target.value },
              })
            }
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

// Background Editor Section
function BackgroundEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const bgStyles = styles.background || {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>צבע רקע</Label>
        <div className="flex gap-2">
          <div
            className="w-10 h-10 rounded-lg border shadow cursor-pointer relative overflow-hidden"
            style={{ backgroundColor: bgStyles.color || "transparent" }}
          >
            <input
              type="color"
              value={bgStyles.color || "#ffffff"}
              onChange={(e) =>
                onChange({ background: { ...bgStyles, color: e.target.value } })
              }
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={bgStyles.color || ""}
            onChange={(e) =>
              onChange({ background: { ...bgStyles, color: e.target.value } })
            }
            placeholder="transparent"
            className="flex-1"
          />
        </div>
      </div>

      {/* Gradient toggle would go here */}
    </div>
  );
}

// Border Editor Section
function BorderEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const borderStyles = styles.border || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>עובי</Label>
          <Input
            value={borderStyles.width || "0"}
            onChange={(e) =>
              onChange({ border: { ...borderStyles, width: e.target.value } })
            }
            placeholder="1px"
          />
        </div>
        <div className="space-y-2">
          <Label>סגנון</Label>
          <select
            value={borderStyles.style || "solid"}
            onChange={(e) =>
              onChange({
                border: { ...borderStyles, style: e.target.value as any },
              })
            }
            className="w-full h-10 px-3 border rounded-md bg-background"
          >
            <option value="none">ללא</option>
            <option value="solid">מלא</option>
            <option value="dashed">מקווקו</option>
            <option value="dotted">נקודות</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>צבע</Label>
          <div
            className="w-full h-10 rounded-md border cursor-pointer relative overflow-hidden"
            style={{ backgroundColor: borderStyles.color || "#e2e8f0" }}
          >
            <input
              type="color"
              value={borderStyles.color || "#e2e8f0"}
              onChange={(e) =>
                onChange({ border: { ...borderStyles, color: e.target.value } })
              }
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>עיגול פינות</Label>
        <Input
          value={borderStyles.radius || "0"}
          onChange={(e) =>
            onChange({ border: { ...borderStyles, radius: e.target.value } })
          }
          placeholder="8px"
        />
      </div>
    </div>
  );
}

// Effects Editor Section
function EffectsEditor({
  styles,
  onChange,
}: {
  styles: ComponentStyles;
  onChange: (styles: Partial<ComponentStyles>) => void;
}) {
  const effectStyles = styles.effects || {};
  const { tokens } = useDesignSystemStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>צל</Label>
        <select
          value={effectStyles.shadow || "none"}
          onChange={(e) =>
            onChange({ effects: { ...effectStyles, shadow: e.target.value } })
          }
          className="w-full h-10 px-3 border rounded-md bg-background"
        >
          {Object.entries(tokens.shadows).map(([name, value]) => (
            <option key={name} value={value}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>שקיפות ({Math.round((effectStyles.opacity || 1) * 100)}%)</Label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={effectStyles.opacity || 1}
          onChange={(e) =>
            onChange({
              effects: { ...effectStyles, opacity: parseFloat(e.target.value) },
            })
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>טשטוש</Label>
        <Input
          value={effectStyles.blur || "0"}
          onChange={(e) =>
            onChange({ effects: { ...effectStyles, blur: e.target.value } })
          }
          placeholder="0px"
        />
      </div>
    </div>
  );
}

// Main Style Editor Panel
export function StyleEditorPanel() {
  const { selectedComponentId } = useLiveEditStore();
  const {
    componentStyles,
    updateComponentStyles,
    clearComponentStyles,
    selectedBreakpoint,
    setSelectedBreakpoint,
    activeStyleTab,
    setActiveStyleTab,
  } = useDesignSystemStore();

  const currentStyles = useMemo(() => {
    if (!selectedComponentId) return {};
    const styles = componentStyles[selectedComponentId];
    if (!styles) return {};

    if (selectedBreakpoint === "base") {
      return styles.base;
    }
    return { ...styles.base, ...(styles as any)[selectedBreakpoint] };
  }, [selectedComponentId, componentStyles, selectedBreakpoint]);

  const handleStyleChange = (newStyles: Partial<ComponentStyles>) => {
    if (!selectedComponentId) return;
    updateComponentStyles(selectedComponentId, selectedBreakpoint, newStyles);
  };

  if (!selectedComponentId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>בחר קומפוננטה כדי לערוך את הסגנון שלה</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Breakpoint Selector */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setSelectedBreakpoint("base")}
            className={cn(
              "flex-1 p-2 rounded-md text-sm transition-colors",
              selectedBreakpoint === "base" && "bg-background shadow"
            )}
          >
            בסיס
          </button>
          <button
            onClick={() => setSelectedBreakpoint("sm")}
            className={cn(
              "p-2 rounded-md transition-colors",
              selectedBreakpoint === "sm" && "bg-background shadow"
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedBreakpoint("md")}
            className={cn(
              "p-2 rounded-md transition-colors",
              selectedBreakpoint === "md" && "bg-background shadow"
            )}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedBreakpoint("lg")}
            className={cn(
              "p-2 rounded-md transition-colors",
              selectedBreakpoint === "lg" && "bg-background shadow"
            )}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Style Tabs */}
      <Tabs
        value={activeStyleTab}
        onValueChange={(v) => setActiveStyleTab(v as any)}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="w-3 h-3 mr-1" />
              פריסה
            </TabsTrigger>
            <TabsTrigger value="spacing" className="text-xs">
              <Box className="w-3 h-3 mr-1" />
              ריווח
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-xs">
              <Type className="w-3 h-3 mr-1" />
              טקסט
            </TabsTrigger>
          </TabsList>
          <TabsList className="w-full grid grid-cols-3 mt-1">
            <TabsTrigger value="background" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              רקע
            </TabsTrigger>
            <TabsTrigger value="border" className="text-xs">
              <Square className="w-3 h-3 mr-1" />
              מסגרת
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              אפקטים
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="layout" className="m-0">
            <LayoutEditor styles={currentStyles} onChange={handleStyleChange} />
            <div className="mt-4">
              <SizeEditor styles={currentStyles} onChange={handleStyleChange} />
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="m-0">
            <SpacingEditor styles={currentStyles} onChange={handleStyleChange} />
          </TabsContent>

          <TabsContent value="typography" className="m-0">
            <TypographyStyleEditor
              styles={currentStyles}
              onChange={handleStyleChange}
            />
          </TabsContent>

          <TabsContent value="background" className="m-0">
            <BackgroundEditor
              styles={currentStyles}
              onChange={handleStyleChange}
            />
          </TabsContent>

          <TabsContent value="border" className="m-0">
            <BorderEditor styles={currentStyles} onChange={handleStyleChange} />
          </TabsContent>

          <TabsContent value="effects" className="m-0">
            <EffectsEditor styles={currentStyles} onChange={handleStyleChange} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Reset Button */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => clearComponentStyles(selectedComponentId)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          איפוס סגנונות
        </Button>
      </div>
    </div>
  );
}
