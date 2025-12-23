// ============================================
// Collaboration Types
// ============================================

// User/Presence Types
export interface CollaboratorPresence {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastSeen: number;
  status: 'active' | 'idle' | 'away';
  currentPage?: string;
  editingComponentId?: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface SelectionRange {
  componentId: string;
  startOffset?: number;
  endOffset?: number;
  fieldPath?: string;
}

// Room/Session Types
export interface CollaborationRoom {
  id: string;
  pageSlug: string;
  createdAt: string;
  participants: CollaboratorPresence[];
  maxParticipants: number;
  isLocked: boolean;
  lockReason?: string;
}

// Comment Types
export interface Comment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions: CommentReaction[];
  mentions: string[];
  isResolved: boolean;
  attachments?: CommentAttachment[];
}

export interface CommentThread {
  id: string;
  componentId: string;
  position?: {
    x: number;
    y: number;
  };
  fieldPath?: string;
  comments: Comment[];
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface CommentAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

// Annotation Types
export interface Annotation {
  id: string;
  type: 'highlight' | 'pin' | 'arrow' | 'box';
  componentId?: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  color: string;
  label?: string;
  authorId: string;
  createdAt: string;
  linkedThreadId?: string;
}

// Activity/History Types
export interface ActivityEntry {
  id: string;
  type:
    | 'component_added'
    | 'component_removed'
    | 'component_edited'
    | 'component_moved'
    | 'style_changed'
    | 'content_changed'
    | 'comment_added'
    | 'comment_resolved'
    | 'page_published'
    | 'page_saved'
    | 'user_joined'
    | 'user_left';
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  details: {
    componentId?: string;
    componentType?: string;
    changes?: Record<string, { before: any; after: any }>;
    message?: string;
  };
}

// Sync Types (for Yjs integration)
export interface SyncState {
  isConnected: boolean;
  isSynced: boolean;
  pendingChanges: number;
  lastSyncAt?: string;
  error?: string;
}

export interface ConflictResolution {
  type: 'auto' | 'manual';
  strategy: 'latest-wins' | 'merge' | 'prompt';
}

// Permissions
export interface CollaboratorPermissions {
  canEdit: boolean;
  canComment: boolean;
  canPublish: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
}

export interface CollaboratorRole {
  id: string;
  name: string;
  nameHe: string;
  permissions: CollaboratorPermissions;
  color: string;
  icon: string;
}

// Built-in roles
export const COLLABORATOR_ROLES: CollaboratorRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    nameHe: 'בעלים',
    permissions: {
      canEdit: true,
      canComment: true,
      canPublish: true,
      canInvite: true,
      canDelete: true,
      canManagePermissions: true,
    },
    color: '#8B5CF6',
    icon: '👑',
  },
  {
    id: 'editor',
    name: 'Editor',
    nameHe: 'עורך',
    permissions: {
      canEdit: true,
      canComment: true,
      canPublish: true,
      canInvite: false,
      canDelete: false,
      canManagePermissions: false,
    },
    color: '#3B82F6',
    icon: '✏️',
  },
  {
    id: 'commenter',
    name: 'Commenter',
    nameHe: 'מגיב',
    permissions: {
      canEdit: false,
      canComment: true,
      canPublish: false,
      canInvite: false,
      canDelete: false,
      canManagePermissions: false,
    },
    color: '#10B981',
    icon: '💬',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    nameHe: 'צופה',
    permissions: {
      canEdit: false,
      canComment: false,
      canPublish: false,
      canInvite: false,
      canDelete: false,
      canManagePermissions: false,
    },
    color: '#6B7280',
    icon: '👁️',
  },
];

// Collaboration Events (for WebSocket/real-time)
export type CollaborationEvent =
  | { type: 'presence:update'; data: CollaboratorPresence }
  | { type: 'presence:leave'; data: { userId: string } }
  | { type: 'cursor:move'; data: { userId: string; cursor: CursorPosition } }
  | { type: 'selection:change'; data: { userId: string; selection: SelectionRange | null } }
  | { type: 'component:lock'; data: { componentId: string; userId: string } }
  | { type: 'component:unlock'; data: { componentId: string } }
  | { type: 'comment:add'; data: Comment }
  | { type: 'comment:update'; data: Comment }
  | { type: 'comment:delete'; data: { commentId: string; threadId: string } }
  | { type: 'thread:resolve'; data: { threadId: string; userId: string } }
  | { type: 'thread:reopen'; data: { threadId: string; userId: string } }
  | { type: 'sync:state'; data: SyncState }
  | { type: 'error'; data: { message: string; code?: string } };

// Notification preferences
export interface CollaborationNotificationSettings {
  enabled: boolean;
  mentions: boolean;
  replies: boolean;
  resolves: boolean;
  edits: boolean;
  joins: boolean;
  desktop: boolean;
  email: boolean;
  sound: boolean;
}
