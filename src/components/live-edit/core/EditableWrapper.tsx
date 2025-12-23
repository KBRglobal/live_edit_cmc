"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings, Copy, Trash2 } from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { getComponentConfig } from "@/lib/live-edit/componentRegistry";
import { cn } from "@/lib/utils";

interface EditableWrapperProps {
  componentId: string;
  componentType: string;
  children: React.ReactNode;
  className?: string;
}

export function EditableWrapper({
  componentId,
  componentType,
  children,
  className,
}: EditableWrapperProps) {
  const {
    isEditMode,
    isPreviewMode,
    selectedComponentId,
    hoveredComponentId,
    selectComponent,
    hoverComponent,
    removeComponent,
    duplicateComponent,
    setSidebarTab,
    openDialog,
  } = useLiveEditStore();

  const config = getComponentConfig(componentType);
  const isSelected = selectedComponentId === componentId;
  const isHovered = hoveredComponentId === componentId;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: componentId,
    disabled: !isEditMode || isPreviewMode || !config?.capabilities.draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Event handlers
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditMode || isPreviewMode) return;
      e.stopPropagation();
      selectComponent(componentId);
      setSidebarTab("settings");
    },
    [isEditMode, isPreviewMode, componentId, selectComponent, setSidebarTab]
  );

  const handleMouseEnter = useCallback(() => {
    if (!isEditMode || isPreviewMode) return;
    hoverComponent(componentId);
  }, [isEditMode, isPreviewMode, componentId, hoverComponent]);

  const handleMouseLeave = useCallback(() => {
    if (!isEditMode || isPreviewMode) return;
    hoverComponent(null);
  }, [isEditMode, isPreviewMode, hoverComponent]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openDialog("discard", {
        title: "מחיקת קומפוננטה",
        message: "האם אתה בטוח שברצונך למחוק את הקומפוננטה?",
        onConfirm: () => {
          removeComponent(componentId);
        },
      });
    },
    [componentId, removeComponent, openDialog]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateComponent(componentId);
    },
    [componentId, duplicateComponent]
  );

  const handleSettings = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectComponent(componentId);
      setSidebarTab("settings");
    },
    [componentId, selectComponent, setSidebarTab]
  );

  // Don't wrap if not in edit mode
  if (!isEditMode) {
    return <>{children}</>;
  }

  // Preview mode - no editing UI
  if (isPreviewMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative group", "transition-all duration-200", className)}
      data-component-id={componentId}
      data-component-type={componentType}
    >
      {/* Selection/Hover Border */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none rounded-lg transition-all duration-200",
          "border-2",
          isSelected
            ? "border-primary bg-primary/5 shadow-lg"
            : isHovered
            ? "border-primary/50 border-dashed"
            : "border-transparent"
        )}
      />

      {/* Component Label */}
      <AnimatePresence>
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute -top-8 left-0 z-10",
              "flex items-center gap-1 px-2 py-1",
              "bg-primary text-white text-xs font-medium rounded-t-md",
              "shadow-md"
            )}
          >
            <span>{config?.icon}</span>
            <span>{config?.displayName || componentType}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "absolute -top-8 right-0 z-10",
              "flex items-center gap-1"
            )}
          >
            {/* Drag Handle */}
            {config?.capabilities.draggable && (
              <button
                {...attributes}
                {...listeners}
                className={cn(
                  "p-1.5 bg-primary text-white rounded-md cursor-grab",
                  "hover:bg-primary/90 active:cursor-grabbing",
                  "transition-colors"
                )}
                title="גרור לשינוי מיקום"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}

            {/* Settings */}
            <button
              onClick={handleSettings}
              className={cn(
                "p-1.5 bg-primary text-white rounded-md",
                "hover:bg-primary/90 transition-colors"
              )}
              title="הגדרות"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Duplicate */}
            {config?.capabilities.duplicatable && (
              <button
                onClick={handleDuplicate}
                className={cn(
                  "p-1.5 bg-primary text-white rounded-md",
                  "hover:bg-primary/90 transition-colors"
                )}
                title="שכפל"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}

            {/* Delete */}
            {config?.capabilities.deletable && (
              <button
                onClick={handleDelete}
                className={cn(
                  "p-1.5 bg-red-500 text-white rounded-md",
                  "hover:bg-red-600 transition-colors"
                )}
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Content */}
      <div className={cn("relative", isDragging && "opacity-50")}>
        {children}
      </div>
    </div>
  );
}
