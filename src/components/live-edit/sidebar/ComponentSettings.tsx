"use client";

import { useMemo } from "react";
import { useLiveEditStore, useSelectedComponent } from "@/stores/liveEditStore";
import { getComponentConfig } from "@/lib/live-edit/componentRegistry";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, FileText } from "lucide-react";
import type { EditableField } from "@/types/liveEdit";
import { cn } from "@/lib/utils";

interface FieldEditorProps {
  field: EditableField;
  value: any;
  onChange: (value: any) => void;
  componentId: string;
}

function FieldEditor({ field, value, onChange, componentId }: FieldEditorProps) {
  const { openDialog } = useLiveEditStore();

  switch (field.type) {
    case "text":
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      );

    case "richtext":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(
            "w-full min-h-[100px] p-3 rounded-md border",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "resize-y"
          )}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          {value && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={value}
                alt=""
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          <Button
            variant="outline"
            onClick={() =>
              openDialog("mediaPicker", {
                onSelect: (url: string) => onChange(url),
                currentValue: value,
              })
            }
            className="w-full gap-2"
          >
            <Image className="w-4 h-4" />
            {value ? "החלף תמונה" : "בחר תמונה"}
          </Button>
        </div>
      );

    case "content":
      return (
        <Button
          variant="outline"
          onClick={() =>
            openDialog("contentPicker", {
              onSelect: (contentId: string) => onChange(contentId),
              currentValue: value,
            })
          }
          className="w-full gap-2"
        >
          <FileText className="w-4 h-4" />
          {value ? "החלף תוכן" : "בחר תוכן"}
        </Button>
      );

    case "link":
      return (
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      );

    case "select":
      return (
        <Select value={value?.toString() || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="בחר..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value?.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "number":
      return (
        <Input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );

    case "boolean":
      return (
        <Switch
          checked={!!value}
          onCheckedChange={onChange}
        />
      );

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function ComponentSettings() {
  const selectedComponent = useSelectedComponent();
  const { updateComponentProps, removeComponent, duplicateComponent, selectedComponentId } =
    useLiveEditStore();

  const config = useMemo(() => {
    if (!selectedComponent) return null;
    return getComponentConfig(selectedComponent.type);
  }, [selectedComponent]);

  if (!selectedComponent || !config) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>בחר קומפוננטה לעריכה</p>
      </div>
    );
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    updateComponentProps(selectedComponent.id, { [fieldName]: value });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Component Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h3 className="font-semibold">{config.displayName}</h3>
          <p className="text-xs text-muted-foreground">
            {selectedComponent.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {config.editableFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <FieldEditor
              field={field}
              value={selectedComponent.props[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
              componentId={selectedComponent.id}
            />
            {field.maxLength && (
              <p className="text-xs text-muted-foreground">
                {(selectedComponent.props[field.name] || "").length}/{field.maxLength}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t space-y-2">
        {config.capabilities.duplicatable && (
          <Button
            variant="outline"
            onClick={() => duplicateComponent(selectedComponent.id)}
            className="w-full"
          >
            שכפל קומפוננטה
          </Button>
        )}
        {config.capabilities.deletable && (
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("האם אתה בטוח?")) {
                removeComponent(selectedComponent.id);
              }
            }}
            className="w-full"
          >
            מחק קומפוננטה
          </Button>
        )}
      </div>
    </div>
  );
}
