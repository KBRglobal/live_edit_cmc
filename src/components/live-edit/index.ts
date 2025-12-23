// Providers
export { LiveEditProvider } from "./providers/LiveEditProvider";
export { DragDropProvider } from "./providers/DragDropProvider";

// Core Components
export { LiveEditToggle } from "./core/LiveEditToggle";
export { LiveEditToolbar } from "./core/LiveEditToolbar";
export { EditableWrapper } from "./core/EditableWrapper";

// Editors
export { InlineTextEditor } from "./editors/InlineTextEditor";

// Sidebar
export { LiveEditSidebar } from "./sidebar/LiveEditSidebar";
export { ComponentLibrary } from "./sidebar/ComponentLibrary";
export { ComponentSettings } from "./sidebar/ComponentSettings";

// Dialogs
export { ContentPickerDialog } from "./dialogs/ContentPickerDialog";
export { MediaPickerDialog } from "./dialogs/MediaPickerDialog";
export { PublishDialog } from "./dialogs/PublishDialog";
export { DiscardDialog } from "./dialogs/DiscardDialog";

// Re-export store hooks
export {
  useLiveEditStore,
  useIsEditMode,
  useIsPreviewMode,
  useSelectedComponent,
  useHasUnsavedChanges,
  useCanUndo,
  useCanRedo,
} from "@/stores/liveEditStore";

// Re-export component registry
export {
  componentRegistry,
  getComponentConfig,
  getComponentsByCategory,
  getAllComponents,
  getComponentCategories,
  getCategoryLabel,
  getCategoryLabelHebrew,
} from "@/lib/live-edit/componentRegistry";

// Types
export type {
  ComponentState,
  ComponentChange,
  HistoryEntry,
  Position,
  DevicePreview,
  SidebarTab,
  DialogType,
  User,
  UserRole,
  EditableField,
  EditableFieldType,
  EditableComponentConfig,
  ComponentCategory,
  ComponentCapabilities,
  PageLayout,
  ContentItem,
  MediaItem,
  LiveEditState,
  LiveEditActions,
  LiveEditStore,
} from "@/types/liveEdit";
