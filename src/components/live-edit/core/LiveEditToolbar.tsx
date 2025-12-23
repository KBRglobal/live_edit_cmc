"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Send,
  X,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export function LiveEditToolbar() {
  const {
    isEditMode,
    isPreviewMode,
    isSaving,
    isPublishing,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    lastSavedAt,
    devicePreview,
    exitEditMode,
    togglePreviewMode,
    undo,
    redo,
    setDevicePreview,
    saveDraft,
    openDialog,
  } = useLiveEditStore();

  if (!isEditMode) return null;

  const handleSave = async () => {
    try {
      await saveDraft();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <AnimatePresence>
      {isEditMode && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-le-toolbar bg-white border-b shadow-sm"
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <TooltipProvider delayDuration={200}>
            <div className="h-14 px-4 flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-2">
                {/* Exit Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exitEditMode()}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">יציאה</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>יציאה ממצב עריכה (ESC)</TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-gray-200" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>בטל (Ctrl+Z)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                      >
                        <Redo2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>חזור (Ctrl+Y)</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Center Section */}
              <div className="flex items-center gap-4">
                {/* Device Preview */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={devicePreview === "desktop" ? "secondary" : "ghost"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setDevicePreview("desktop")}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Desktop</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={devicePreview === "tablet" ? "secondary" : "ghost"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setDevicePreview("tablet")}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tablet</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={devicePreview === "mobile" ? "secondary" : "ghost"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setDevicePreview("mobile")}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile</TooltipContent>
                  </Tooltip>
                </div>

                {/* Save Status */}
                <div className="flex items-center gap-2 text-sm text-gray-500 min-w-[160px]">
                  {isSaving ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>שומר...</span>
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600">שינויים לא שמורים</span>
                    </>
                  ) : lastSavedAt ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">
                        נשמר{" "}
                        {formatDistanceToNow(lastSavedAt, {
                          addSuffix: true,
                          locale: he,
                        })}
                      </span>
                    </>
                  ) : (
                    <span>טיוטה</span>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Preview */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isPreviewMode ? "secondary" : "ghost"}
                      size="sm"
                      onClick={togglePreviewMode}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isPreviewMode ? "חזרה לעריכה" : "תצוגה מקדימה"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPreviewMode ? "חזרה לעריכה" : "תצוגה מקדימה"}
                  </TooltipContent>
                </Tooltip>

                {/* Save Draft */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges || isSaving}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">שמור</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>שמור טיוטה (Ctrl+S)</TooltipContent>
                </Tooltip>

                {/* Publish */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => openDialog("publish")}
                      disabled={isPublishing}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>פרסם</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>פרסם שינויים</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
