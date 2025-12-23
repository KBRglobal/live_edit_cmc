"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Loader2 } from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { useLiveEditContext } from "../providers/LiveEditProvider";
import { cn } from "@/lib/utils";

interface LiveEditToggleProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  pageSlug?: string;
}

export function LiveEditToggle({
  position = "bottom-right",
  pageSlug = "home",
}: LiveEditToggleProps) {
  const { isEnabled } = useLiveEditContext();
  const {
    isEditMode,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    enterEditMode,
    exitEditMode,
  } = useLiveEditStore();

  // Only show for authorized users
  if (!isEnabled) {
    return null;
  }

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-20 right-6",
    "top-left": "top-20 left-6",
  };

  const handleClick = async () => {
    if (isEditMode) {
      exitEditMode();
    } else {
      try {
        await enterEditMode(pageSlug);
      } catch (error) {
        console.error("Failed to enter edit mode:", error);
      }
    }
  };

  return (
    <motion.div
      className={cn("fixed z-le-button", positionClasses[position])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Unsaved changes indicator */}
      <AnimatePresence>
        {hasUnsavedChanges && !isEditMode && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          isEditMode
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white"
            : "bg-primary hover:bg-primary/90 focus:ring-primary text-white",
          hasUnsavedChanges && !isEditMode && "animate-pulse",
          isLoading && "cursor-wait"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isEditMode ? "Exit Edit Mode (ESC)" : "Enter Edit Mode"}
        aria-label={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
      >
        <AnimatePresence mode="wait">
          {isLoading || isSaving ? (
            <motion.div
              key="loading"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
            >
              <Loader2 className="w-6 h-6" />
            </motion.div>
          ) : isEditMode ? (
            <motion.div
              key="exit"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Pencil className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className={cn(
          "absolute bottom-full mb-2 left-1/2 -translate-x-1/2",
          "bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap",
          "pointer-events-none shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {isEditMode ? "יציאה מעריכה (ESC)" : "מצב עריכה"}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </motion.div>
    </motion.div>
  );
}
