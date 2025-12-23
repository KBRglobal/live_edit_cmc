"use client";

import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import {
  componentRegistry,
  getComponentCategories,
  getCategoryLabelHebrew,
  getComponentsByCategory,
} from "@/lib/live-edit/componentRegistry";
import type { EditableComponentConfig, ComponentCategory } from "@/types/liveEdit";
import { cn } from "@/lib/utils";

function DraggableComponentItem({
  config,
}: {
  config: EditableComponentConfig;
}) {
  const { addComponent, componentOrder } = useLiveEditStore();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `new-${config.type}`,
      data: {
        type: "new-component",
        componentType: config.type,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    // Add component at the end
    addComponent(
      config.type,
      { index: componentOrder.length, parentId: null },
      config.defaultProps
    );
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-grab",
        "hover:border-primary hover:bg-primary/5 transition-all",
        "active:cursor-grabbing",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-2xl">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{config.displayName}</h4>
        <p className="text-xs text-muted-foreground">גרור או לחץ להוספה</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={cn(
          "p-1.5 rounded-md hover:bg-primary hover:text-white",
          "transition-colors text-muted-foreground"
        )}
        title="הוסף בסוף"
      >
        <Plus className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function CategorySection({ category }: { category: ComponentCategory }) {
  const components = getComponentsByCategory(category);

  if (components.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground px-1">
        {getCategoryLabelHebrew(category)}
      </h3>
      <div className="space-y-2">
        {components.map((config) => (
          <DraggableComponentItem key={config.type} config={config} />
        ))}
      </div>
    </div>
  );
}

export function ComponentLibrary() {
  const categories = getComponentCategories();

  return (
    <div className="p-4 space-y-6">
      <div className="text-sm text-muted-foreground">
        גרור קומפוננטות לעמוד או לחץ על + להוספה
      </div>

      {categories.map((category) => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
}
