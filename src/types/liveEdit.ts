// Position types
export interface Position {
  index: number;
  parentId: string | null;
}

// Component change tracking
export interface ComponentChange {
  componentId: string;
  type: "update" | "add" | "remove" | "move";
  before: ComponentState | null;
  after: ComponentState | null;
  timestamp: number;
}

// History entry for undo/redo
export interface HistoryEntry {
  id: string;
  changes: ComponentChange[];
  timestamp: number;
  description: string;
}

// Component state stored in layout
export interface ComponentState {
  id: string;
  type: string;
  order: number;
  parentId: string | null;
  props: Record<string, any>;
  contentRef?: {
    contentId: string;
    contentType: string;
  };
  styles?: Record<string, string>;
}

// Device preview options
export type DevicePreview = "desktop" | "tablet" | "mobile";

// Sidebar tabs
export type SidebarTab = "components" | "settings" | "content";

// Dialog types
export type DialogType =
  | "contentPicker"
  | "mediaPicker"
  | "publish"
  | "discard"
  | "recovery"
  | null;

// User roles for permissions
export type UserRole = "admin" | "editor" | "author" | "viewer";

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Editable field types
export type EditableFieldType =
  | "text"
  | "richtext"
  | "image"
  | "content"
  | "link"
  | "select"
  | "number"
  | "boolean";

// Editable field configuration
export interface EditableField {
  name: string;
  type: EditableFieldType;
  label: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: (value: any) => string | null;
  maxLength?: number;
  placeholder?: string;
}

// Component capabilities
export interface ComponentCapabilities {
  draggable: boolean;
  resizable: boolean;
  deletable: boolean;
  duplicatable: boolean;
  hasChildren: boolean;
}

// Component category
export type ComponentCategory = "layout" | "content" | "media" | "interactive";

// Editable component configuration
export interface EditableComponentConfig {
  type: string;
  displayName: string;
  icon: string;
  category: ComponentCategory;
  editableFields: EditableField[];
  capabilities: ComponentCapabilities;
  defaultProps: Record<string, any>;
  thumbnail?: string;
}

// Layout API types
export interface PageLayout {
  id: string;
  pageSlug: string;
  pageType: "home" | "category" | "content" | "custom";
  components: ComponentState[];
  draftComponents?: ComponentState[];
  publishedAt: string | null;
  publishedBy?: string;
  draftUpdatedAt?: string;
  draftUpdatedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Content item for picker
export interface ContentItem {
  id: string;
  type: string;
  title: string;
  slug: string;
  heroImage?: string;
  metaDescription?: string;
  seoScore?: number;
  status: "published" | "draft";
}

// Media item for picker
export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt?: string;
  width: number;
  height: number;
  uploadedAt: string;
}

// Live edit store state
export interface LiveEditState {
  // Mode state
  isEditMode: boolean;
  isPreviewMode: boolean;
  isDragging: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isLoading: boolean;

  // Selection state
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  focusedFieldId: string | null;

  // Content state
  pageSlug: string | null;
  originalLayout: Record<string, ComponentState>;
  currentLayout: Record<string, ComponentState>;
  componentOrder: string[];
  pendingChanges: ComponentChange[];

  // History state
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // UI state
  sidebarOpen: boolean;
  sidebarTab: SidebarTab;
  devicePreview: DevicePreview;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Dialog state
  activeDialog: DialogType;
  dialogProps: Record<string, any>;

  // User state
  currentUser: User | null;
}

// Live edit store actions
export interface LiveEditActions {
  // Mode actions
  enterEditMode: (pageSlug: string) => Promise<void>;
  exitEditMode: (force?: boolean) => void;
  togglePreviewMode: () => void;

  // Selection actions
  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;
  focusField: (fieldId: string | null) => void;

  // Edit actions
  updateComponent: (id: string, changes: Partial<ComponentState>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  addComponent: (
    type: string,
    position: Position,
    props?: Record<string, any>
  ) => string;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, newPosition: Position) => void;
  duplicateComponent: (id: string) => string | null;
  reorderComponents: (newOrder: string[]) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Save actions
  saveDraft: () => Promise<void>;
  publishChanges: () => Promise<void>;
  discardChanges: () => void;
  recoverDraft: () => Promise<void>;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setDevicePreview: (device: DevicePreview) => void;
  openDialog: (dialog: DialogType, props?: Record<string, any>) => void;
  closeDialog: () => void;

  // Layout actions
  loadLayout: (pageSlug: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;

  // Internal helpers
  _addToHistory: (changes: ComponentChange[], description: string) => void;
  _getComponentById: (id: string) => ComponentState | undefined;
  _getNextOrder: () => number;
}

// Combined store type
export type LiveEditStore = LiveEditState & LiveEditActions;
