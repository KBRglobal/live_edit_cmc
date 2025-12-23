import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  CollaboratorPresence,
  CursorPosition,
  SelectionRange,
  CommentThread,
  Comment,
  Annotation,
  ActivityEntry,
  SyncState,
  CollaborationEvent,
  CollaboratorPermissions,
} from '@/types/collaboration';

// Generate unique user color
function generateUserColor(): string {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface CollaborationState {
  // Connection
  isConnected: boolean;
  roomId: string | null;
  currentUserId: string | null;
  syncState: SyncState;

  // Presence
  collaborators: Map<string, CollaboratorPresence>;
  localPresence: CollaboratorPresence | null;

  // Comments & Annotations
  threads: Map<string, CommentThread>;
  annotations: Map<string, Annotation>;

  // Activity
  activityFeed: ActivityEntry[];

  // Component Locking
  lockedComponents: Map<string, string>; // componentId -> userId

  // Permissions
  permissions: CollaboratorPermissions | null;

  // Actions
  connect: (roomId: string, user: { id: string; name: string; email: string; avatar?: string }) => void;
  disconnect: () => void;

  // Presence actions
  updateCursor: (position: CursorPosition) => void;
  updateSelection: (selection: SelectionRange | null) => void;
  updateEditingComponent: (componentId: string | null) => void;

  // Comment actions
  addThread: (componentId: string, position?: { x: number; y: number }, fieldPath?: string) => CommentThread;
  addComment: (threadId: string, content: string, mentions?: string[]) => void;
  editComment: (threadId: string, commentId: string, content: string) => void;
  deleteComment: (threadId: string, commentId: string) => void;
  resolveThread: (threadId: string) => void;
  reopenThread: (threadId: string) => void;
  addReaction: (threadId: string, commentId: string, emoji: string) => void;

  // Annotation actions
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'authorId' | 'createdAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;

  // Locking actions
  lockComponent: (componentId: string) => boolean;
  unlockComponent: (componentId: string) => void;
  isComponentLocked: (componentId: string) => boolean;
  getComponentLockOwner: (componentId: string) => CollaboratorPresence | null;

  // Activity
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;

  // Event handling
  handleEvent: (event: CollaborationEvent) => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  immer((set, get) => ({
    // Initial state
    isConnected: false,
    roomId: null,
    currentUserId: null,
    syncState: {
      isConnected: false,
      isSynced: false,
      pendingChanges: 0,
    },

    collaborators: new Map(),
    localPresence: null,
    threads: new Map(),
    annotations: new Map(),
    activityFeed: [],
    lockedComponents: new Map(),
    permissions: null,

    // Connect to collaboration room
    connect: (roomId, user) => {
      set((state) => {
        const presence: CollaboratorPresence = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          color: generateUserColor(),
          lastSeen: Date.now(),
          status: 'active',
          currentPage: roomId,
        };

        state.isConnected = true;
        state.roomId = roomId;
        state.currentUserId = user.id;
        state.localPresence = presence;
        state.collaborators.set(user.id, presence);
        state.syncState.isConnected = true;

        // Default permissions for now
        state.permissions = {
          canEdit: true,
          canComment: true,
          canPublish: true,
          canInvite: false,
          canDelete: false,
          canManagePermissions: false,
        };
      });

      // Add join activity
      get().addActivity({
        type: 'user_joined',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        details: { message: `${user.name} הצטרף/ה לעריכה` },
      });
    },

    // Disconnect from room
    disconnect: () => {
      const { currentUserId, localPresence } = get();

      if (currentUserId && localPresence) {
        get().addActivity({
          type: 'user_left',
          userId: currentUserId,
          userName: localPresence.name,
          details: { message: `${localPresence.name} עזב/ה` },
        });
      }

      set((state) => {
        state.isConnected = false;
        state.roomId = null;
        state.currentUserId = null;
        state.localPresence = null;
        state.collaborators.clear();
        state.syncState.isConnected = false;
      });
    },

    // Update cursor position
    updateCursor: (position) => {
      set((state) => {
        if (state.localPresence) {
          state.localPresence.cursor = position;
          state.localPresence.lastSeen = Date.now();
          state.localPresence.status = 'active';
          state.collaborators.set(state.localPresence.id, state.localPresence);
        }
      });
    },

    // Update selection
    updateSelection: (selection) => {
      set((state) => {
        if (state.localPresence) {
          state.localPresence.selection = selection || undefined;
          state.collaborators.set(state.localPresence.id, state.localPresence);
        }
      });
    },

    // Update editing component
    updateEditingComponent: (componentId) => {
      set((state) => {
        if (state.localPresence) {
          state.localPresence.editingComponentId = componentId || undefined;
          state.collaborators.set(state.localPresence.id, state.localPresence);
        }
      });
    },

    // Add new comment thread
    addThread: (componentId, position, fieldPath) => {
      const { currentUserId, localPresence } = get();
      if (!currentUserId || !localPresence) {
        throw new Error('Not connected');
      }

      const thread: CommentThread = {
        id: generateId(),
        componentId,
        position,
        fieldPath,
        comments: [],
        isResolved: false,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        state.threads.set(thread.id, thread);
      });

      return thread;
    },

    // Add comment to thread
    addComment: (threadId, content, mentions = []) => {
      const { currentUserId, localPresence } = get();
      if (!currentUserId || !localPresence) return;

      const comment: Comment = {
        id: generateId(),
        threadId,
        authorId: currentUserId,
        authorName: localPresence.name,
        authorAvatar: localPresence.avatar,
        content,
        createdAt: new Date().toISOString(),
        reactions: [],
        mentions,
        isResolved: false,
      };

      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          thread.comments.push(comment);
        }
      });

      get().addActivity({
        type: 'comment_added',
        userId: currentUserId,
        userName: localPresence.name,
        details: { message: content.slice(0, 50) },
      });
    },

    // Edit comment
    editComment: (threadId, commentId, content) => {
      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          const comment = thread.comments.find((c) => c.id === commentId);
          if (comment && comment.authorId === state.currentUserId) {
            comment.content = content;
            comment.updatedAt = new Date().toISOString();
          }
        }
      });
    },

    // Delete comment
    deleteComment: (threadId, commentId) => {
      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          const commentIndex = thread.comments.findIndex((c) => c.id === commentId);
          if (commentIndex !== -1) {
            const comment = thread.comments[commentIndex];
            if (comment.authorId === state.currentUserId) {
              thread.comments.splice(commentIndex, 1);
            }
          }
        }
      });
    },

    // Resolve thread
    resolveThread: (threadId) => {
      const { currentUserId, localPresence } = get();
      if (!currentUserId || !localPresence) return;

      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          thread.isResolved = true;
          thread.resolvedAt = new Date().toISOString();
          thread.resolvedBy = currentUserId;
        }
      });

      get().addActivity({
        type: 'comment_resolved',
        userId: currentUserId,
        userName: localPresence.name,
        details: {},
      });
    },

    // Reopen thread
    reopenThread: (threadId) => {
      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          thread.isResolved = false;
          thread.resolvedAt = undefined;
          thread.resolvedBy = undefined;
        }
      });
    },

    // Add reaction
    addReaction: (threadId, commentId, emoji) => {
      const { currentUserId, localPresence } = get();
      if (!currentUserId || !localPresence) return;

      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          const comment = thread.comments.find((c) => c.id === commentId);
          if (comment) {
            const existingReaction = comment.reactions.find(
              (r) => r.userId === currentUserId && r.emoji === emoji
            );
            if (existingReaction) {
              // Remove reaction
              comment.reactions = comment.reactions.filter(
                (r) => !(r.userId === currentUserId && r.emoji === emoji)
              );
            } else {
              // Add reaction
              comment.reactions.push({
                emoji,
                userId: currentUserId,
                userName: localPresence.name,
              });
            }
          }
        }
      });
    },

    // Add annotation
    addAnnotation: (annotation) => {
      const { currentUserId } = get();
      if (!currentUserId) return;

      const newAnnotation: Annotation = {
        ...annotation,
        id: generateId(),
        authorId: currentUserId,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        state.annotations.set(newAnnotation.id, newAnnotation);
      });
    },

    // Update annotation
    updateAnnotation: (id, updates) => {
      set((state) => {
        const annotation = state.annotations.get(id);
        if (annotation && annotation.authorId === state.currentUserId) {
          state.annotations.set(id, { ...annotation, ...updates });
        }
      });
    },

    // Delete annotation
    deleteAnnotation: (id) => {
      set((state) => {
        const annotation = state.annotations.get(id);
        if (annotation && annotation.authorId === state.currentUserId) {
          state.annotations.delete(id);
        }
      });
    },

    // Lock component for editing
    lockComponent: (componentId) => {
      const { currentUserId, lockedComponents } = get();
      if (!currentUserId) return false;

      const existingLock = lockedComponents.get(componentId);
      if (existingLock && existingLock !== currentUserId) {
        return false; // Already locked by another user
      }

      set((state) => {
        state.lockedComponents.set(componentId, currentUserId);
      });
      return true;
    },

    // Unlock component
    unlockComponent: (componentId) => {
      const { currentUserId } = get();

      set((state) => {
        const lockOwner = state.lockedComponents.get(componentId);
        if (lockOwner === currentUserId) {
          state.lockedComponents.delete(componentId);
        }
      });
    },

    // Check if component is locked
    isComponentLocked: (componentId) => {
      const { lockedComponents, currentUserId } = get();
      const lockOwner = lockedComponents.get(componentId);
      return lockOwner !== undefined && lockOwner !== currentUserId;
    },

    // Get component lock owner
    getComponentLockOwner: (componentId) => {
      const { lockedComponents, collaborators } = get();
      const lockOwner = lockedComponents.get(componentId);
      if (lockOwner) {
        return collaborators.get(lockOwner) || null;
      }
      return null;
    },

    // Add activity entry
    addActivity: (entry) => {
      set((state) => {
        state.activityFeed.unshift({
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        });
        // Keep only last 100 activities
        if (state.activityFeed.length > 100) {
          state.activityFeed = state.activityFeed.slice(0, 100);
        }
      });
    },

    // Handle incoming collaboration events
    handleEvent: (event) => {
      set((state) => {
        switch (event.type) {
          case 'presence:update':
            state.collaborators.set(event.data.id, event.data);
            break;

          case 'presence:leave':
            state.collaborators.delete(event.data.userId);
            // Release any locks held by this user
            for (const [componentId, userId] of state.lockedComponents) {
              if (userId === event.data.userId) {
                state.lockedComponents.delete(componentId);
              }
            }
            break;

          case 'cursor:move': {
            const collaborator = state.collaborators.get(event.data.userId);
            if (collaborator) {
              collaborator.cursor = event.data.cursor;
              collaborator.lastSeen = Date.now();
              collaborator.status = 'active';
            }
            break;
          }

          case 'selection:change': {
            const collaborator = state.collaborators.get(event.data.userId);
            if (collaborator) {
              collaborator.selection = event.data.selection || undefined;
            }
            break;
          }

          case 'component:lock':
            state.lockedComponents.set(event.data.componentId, event.data.userId);
            break;

          case 'component:unlock':
            state.lockedComponents.delete(event.data.componentId);
            break;

          case 'comment:add': {
            const thread = state.threads.get(event.data.threadId);
            if (thread) {
              thread.comments.push(event.data);
            }
            break;
          }

          case 'thread:resolve': {
            const thread = state.threads.get(event.data.threadId);
            if (thread) {
              thread.isResolved = true;
              thread.resolvedBy = event.data.userId;
              thread.resolvedAt = new Date().toISOString();
            }
            break;
          }

          case 'sync:state':
            state.syncState = event.data;
            break;

          case 'error':
            console.error('Collaboration error:', event.data.message);
            break;
        }
      });
    },
  }))
);

export default useCollaborationStore;
