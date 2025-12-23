"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import type { User } from "@/types/liveEdit";

interface LiveEditContextValue {
  isEnabled: boolean;
}

const LiveEditContext = createContext<LiveEditContextValue>({
  isEnabled: false,
});

export function useLiveEditContext() {
  return useContext(LiveEditContext);
}

interface LiveEditProviderProps {
  children: ReactNode;
  user?: User | null;
  enabled?: boolean;
  autoSaveInterval?: number;
}

export function LiveEditProvider({
  children,
  user = null,
  enabled = true,
  autoSaveInterval = 30000,
}: LiveEditProviderProps) {
  const {
    isEditMode,
    hasUnsavedChanges,
    setCurrentUser,
    saveDraft,
    exitEditMode,
    undo,
    redo,
  } = useLiveEditStore();

  // Set user in store
  useEffect(() => {
    setCurrentUser(user);
  }, [user, setCurrentUser]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEditMode || !hasUnsavedChanges) return;

    const intervalId = setInterval(() => {
      saveDraft().catch(console.error);
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [isEditMode, hasUnsavedChanges, autoSaveInterval, saveDraft]);

  // Warn before unload if unsaved changes
  useEffect(() => {
    if (!isEditMode || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditMode, hasUnsavedChanges]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEditMode) return;

      // Check for modifier key
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
          case "s":
            e.preventDefault();
            saveDraft().catch(console.error);
            break;
        }
      }

      // ESC to exit edit mode
      if (e.key === "Escape") {
        exitEditMode();
      }
    },
    [isEditMode, undo, redo, saveDraft, exitEditMode]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Add edit mode class to body
  useEffect(() => {
    if (isEditMode) {
      document.body.classList.add("live-edit-mode");
    } else {
      document.body.classList.remove("live-edit-mode");
    }

    return () => {
      document.body.classList.remove("live-edit-mode");
    };
  }, [isEditMode]);

  const canEdit =
    enabled &&
    user &&
    ["admin", "editor", "author"].includes(user.role);

  return (
    <LiveEditContext.Provider value={{ isEnabled: !!canEdit }}>
      {children}
    </LiveEditContext.Provider>
  );
}
