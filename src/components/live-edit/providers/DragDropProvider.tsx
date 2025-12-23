"use client";

import { ReactNode, useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { getComponentConfig } from "@/lib/live-edit/componentRegistry";
import { cn } from "@/lib/utils";

interface DragDropProviderProps {
  children: ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const {
    isEditMode,
    isPreviewMode,
    componentOrder,
    currentLayout,
    reorderComponents,
    addComponent,
  } = useLiveEditStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over) return;

      // Check if it's a new component being added
      if (String(active.id).startsWith("new-")) {
        const componentType = (active.data.current as any)?.componentType;
        const config = getComponentConfig(componentType);
        if (config) {
          const overIndex = componentOrder.indexOf(over.id as string);
          const insertIndex = overIndex >= 0 ? overIndex : componentOrder.length;
          addComponent(
            componentType,
            { index: insertIndex, parentId: null },
            config.defaultProps
          );
        }
        return;
      }

      // Handle reordering
      if (active.id !== over.id) {
        const oldIndex = componentOrder.indexOf(active.id as string);
        const newIndex = componentOrder.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...componentOrder];
          newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, active.id as string);
          reorderComponents(newOrder);
        }
      }
    },
    [componentOrder, reorderComponents, addComponent]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  // Get the active component for the drag overlay
  const activeComponent = activeId
    ? currentLayout[activeId]
    : null;
  const activeConfig = activeComponent
    ? getComponentConfig(activeComponent.type)
    : null;

  // Don't enable DnD if not in edit mode or in preview
  if (!isEditMode || isPreviewMode) {
    return <>{children}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={componentOrder}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>

      <DragOverlay>
        {activeId && activeConfig && (
          <div
            className={cn(
              "p-4 bg-white border-2 border-primary rounded-lg shadow-xl",
              "flex items-center gap-3 min-w-[200px]"
            )}
          >
            <span className="text-2xl">{activeConfig.icon}</span>
            <div>
              <h4 className="font-medium">{activeConfig.displayName}</h4>
              <p className="text-xs text-muted-foreground">
                שחרר למיקום הרצוי
              </p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
