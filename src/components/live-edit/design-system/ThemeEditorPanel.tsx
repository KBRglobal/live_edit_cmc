"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Type,
  Square,
  Layers,
  Download,
  Upload,
  RotateCcw,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { useDesignSystemStore } from "@/stores/designSystemStore";
import { themePresets } from "@/lib/design-system/defaultTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Color Picker Component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border-2 border-white shadow-md cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono"
        />
      </div>
    </div>
  );
}

// Color Palette Editor
function ColorPaletteEditor({
  title,
  colors,
  onColorChange,
  onGenerateFromBase,
}: {
  title: string;
  colors: Record<string, string>;
  onColorChange: (shade: string, value: string) => void;
  onGenerateFromBase: (baseColor: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const baseColor = colors["500"];

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Preview bar */}
      <div className="flex rounded-lg overflow-hidden h-8">
        {Object.entries(colors).map(([shade, color]) => (
          <div
            key={shade}
            className="flex-1 cursor-pointer hover:scale-y-110 transition-transform"
            style={{ backgroundColor: color }}
            title={`${shade}: ${color}`}
            onClick={() => onGenerateFromBase(color)}
          />
        ))}
      </div>

      {/* Base color picker */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg border shadow-md cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: baseColor }}
        >
          <input
            type="color"
            value={baseColor}
            onChange={(e) => onGenerateFromBase(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <div>
          <Label className="text-sm">צבע בסיס</Label>
          <p className="text-xs text-muted-foreground">
            לחץ כדי לייצר פלטה חדשה
          </p>
        </div>
      </div>

      {/* Expanded shades */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              {Object.entries(colors).map(([shade, color]) => (
                <ColorPicker
                  key={shade}
                  label={shade}
                  value={color}
                  onChange={(value) => onColorChange(shade, value)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Typography Editor
function TypographyEditor() {
  const { tokens, updateFontFamily, updateFontSize } = useDesignSystemStore();

  const fonts = [
    "Inter",
    "Heebo",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Playfair Display",
    "Merriweather",
    "IBM Plex Sans",
    "Source Sans Pro",
  ];

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <div className="space-y-4">
        <h4 className="font-medium">גופנים</h4>

        {(["heading", "body", "mono"] as const).map((type) => (
          <div key={type} className="space-y-2">
            <Label className="capitalize">
              {type === "heading" ? "כותרות" : type === "body" ? "טקסט" : "קוד"}
            </Label>
            <select
              value={tokens.typography.fonts[type].name}
              onChange={(e) => updateFontFamily(type, e.target.value)}
              className="w-full h-10 px-3 border rounded-md bg-background"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
            <p
              className="text-sm p-3 bg-muted rounded-lg"
              style={{ fontFamily: tokens.typography.fonts[type].name }}
            >
              {type === "heading"
                ? "זוהי כותרת לדוגמה"
                : type === "body"
                ? "זהו טקסט גוף לדוגמה. Lorem ipsum dolor sit amet."
                : "const code = 'example';"}
            </p>
          </div>
        ))}
      </div>

      {/* Font Sizes Preview */}
      <div className="space-y-4">
        <h4 className="font-medium">גדלי טקסט</h4>
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          {Object.entries(tokens.typography.sizes).map(([name, { size }]) => (
            <div key={name} className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-12">{name}</span>
              <span style={{ fontSize: size }}>{size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Spacing Editor
function SpacingEditor() {
  const { tokens } = useDesignSystemStore();

  const spacingGroups = {
    קטן: ["0", "px", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4"],
    בינוני: ["5", "6", "7", "8", "9", "10", "11", "12"],
    גדול: ["14", "16", "20", "24", "28", "32"],
    "גדול מאוד": ["36", "40", "44", "48", "52", "56", "60", "64", "72", "80", "96"],
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium">ריווחים</h4>

      {Object.entries(spacingGroups).map(([group, values]) => (
        <div key={group} className="space-y-2">
          <Label>{group}</Label>
          <div className="flex flex-wrap gap-2">
            {values.map((key) => {
              const value = (tokens.spacing as any)[key];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center p-2 border rounded-lg hover:bg-muted"
                  title={value}
                >
                  <div
                    className="bg-primary rounded"
                    style={{ width: value, height: value, minWidth: 4, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {key}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Border Radius Editor
function RadiusEditor() {
  const { tokens, updateTokens } = useDesignSystemStore();

  return (
    <div className="space-y-6">
      <h4 className="font-medium">פינות מעוגלות</h4>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(tokens.radius).map(([name, value]) => (
          <div key={name} className="space-y-2">
            <Label className="text-xs">{name}</Label>
            <div
              className="w-full h-16 bg-primary/20 border-2 border-primary"
              style={{ borderRadius: value }}
            />
            <Input
              value={value}
              onChange={(e) => updateTokens(`radius.${name}`, e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Shadow Editor
function ShadowEditor() {
  const { tokens, updateTokens } = useDesignSystemStore();

  return (
    <div className="space-y-6">
      <h4 className="font-medium">צללים</h4>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(tokens.shadows)
          .filter(([name]) => name !== "none" && name !== "inner")
          .map(([name, value]) => (
            <div key={name} className="space-y-2">
              <Label className="text-xs">{name}</Label>
              <div
                className="w-full h-20 bg-background rounded-lg"
                style={{ boxShadow: value }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

// Preset Selector
function PresetSelector() {
  const { activePresetId, applyPreset, customPresets } = useDesignSystemStore();
  const allPresets = [...themePresets, ...customPresets];

  return (
    <div className="space-y-4">
      <h4 className="font-medium">תבניות עיצוב</h4>

      <div className="grid grid-cols-2 gap-3">
        {allPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            className={cn(
              "p-4 border rounded-lg text-right transition-all",
              "hover:border-primary hover:bg-primary/5",
              activePresetId === preset.id && "border-primary bg-primary/10"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: preset.tokens?.colors?.primary?.[500] || "#3b82f6",
                }}
              />
              <span className="font-medium">{preset.nameHe}</span>
              {activePresetId === preset.id && (
                <Check className="w-4 h-4 text-primary mr-auto" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{preset.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Main Theme Editor Panel
export function ThemeEditorPanel() {
  const {
    isThemeEditorOpen,
    setThemeEditorOpen,
    tokens,
    generateColorPalette,
    updatePrimaryColor,
    updateSecondaryColor,
    resetTokens,
    exportTokens,
    exportCSS,
  } = useDesignSystemStore();

  const [activeTab, setActiveTab] = useState("presets");

  const handleExportJSON = () => {
    const json = exportTokens();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design-tokens.json";
    a.click();
  };

  const handleExportCSS = () => {
    const css = exportCSS();
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design-tokens.css";
    a.click();
  };

  return (
    <Dialog open={isThemeEditorOpen} onOpenChange={setThemeEditorOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            עורך עיצוב
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="presets" className="gap-2">
                <Layers className="w-4 h-4" />
                תבניות
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-2">
                <Palette className="w-4 h-4" />
                צבעים
              </TabsTrigger>
              <TabsTrigger value="typography" className="gap-2">
                <Type className="w-4 h-4" />
                טיפוגרפיה
              </TabsTrigger>
              <TabsTrigger value="spacing" className="gap-2">
                <Square className="w-4 h-4" />
                ריווחים
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="presets" className="m-0">
              <PresetSelector />
            </TabsContent>

            <TabsContent value="colors" className="m-0 space-y-6">
              <ColorPaletteEditor
                title="צבע ראשי (Primary)"
                colors={tokens.colors.primary}
                onColorChange={(shade, value) =>
                  updatePrimaryColor(shade as any, value)
                }
                onGenerateFromBase={(color) =>
                  generateColorPalette(color, "primary")
                }
              />

              <ColorPaletteEditor
                title="צבע משני (Secondary)"
                colors={tokens.colors.secondary}
                onColorChange={(shade, value) =>
                  updateSecondaryColor(shade as any, value)
                }
                onGenerateFromBase={(color) =>
                  generateColorPalette(color, "secondary")
                }
              />

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">צבעים סמנטיים</h4>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Success"
                    value={tokens.colors.semantic.success}
                    onChange={(value) =>
                      useDesignSystemStore
                        .getState()
                        .updateTokens("colors.semantic.success", value)
                    }
                  />
                  <ColorPicker
                    label="Warning"
                    value={tokens.colors.semantic.warning}
                    onChange={(value) =>
                      useDesignSystemStore
                        .getState()
                        .updateTokens("colors.semantic.warning", value)
                    }
                  />
                  <ColorPicker
                    label="Error"
                    value={tokens.colors.semantic.error}
                    onChange={(value) =>
                      useDesignSystemStore
                        .getState()
                        .updateTokens("colors.semantic.error", value)
                    }
                  />
                  <ColorPicker
                    label="Info"
                    value={tokens.colors.semantic.info}
                    onChange={(value) =>
                      useDesignSystemStore
                        .getState()
                        .updateTokens("colors.semantic.info", value)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="m-0">
              <TypographyEditor />
            </TabsContent>

            <TabsContent value="spacing" className="m-0 space-y-6">
              <SpacingEditor />
              <RadiusEditor />
              <ShadowEditor />
            </TabsContent>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetTokens}>
                <RotateCcw className="w-4 h-4 mr-2" />
                איפוס
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSS}>
                <Download className="w-4 h-4 mr-2" />
                CSS
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button size="sm" onClick={() => setThemeEditorOpen(false)}>
                <Check className="w-4 h-4 mr-2" />
                החל
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
