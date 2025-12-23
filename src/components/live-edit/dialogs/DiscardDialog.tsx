"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLiveEditStore } from "@/stores/liveEditStore";

export function DiscardDialog() {
  const {
    activeDialog,
    dialogProps,
    closeDialog,
    discardChanges,
    exitEditMode,
    saveDraft,
  } = useLiveEditStore();

  const isOpen = activeDialog === "discard";
  const isExitConfirmation = !dialogProps?.onConfirm;

  const handleDiscard = () => {
    if (dialogProps?.onConfirm) {
      dialogProps.onConfirm();
    } else {
      discardChanges();
      exitEditMode(true);
    }
    closeDialog();
  };

  const handleSaveAndClose = async () => {
    try {
      await saveDraft();
      exitEditMode(true);
      closeDialog();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {dialogProps?.title || "שינויים לא שמורים"}
          </DialogTitle>
          <DialogDescription>
            {dialogProps?.message ||
              "יש לך שינויים שלא נשמרו. מה תרצה לעשות?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={closeDialog}>
            המשך לערוך
          </Button>
          {isExitConfirmation && (
            <Button variant="secondary" onClick={handleSaveAndClose}>
              שמור וצא
            </Button>
          )}
          <Button variant="destructive" onClick={handleDiscard}>
            {dialogProps?.onConfirm ? "מחק" : "צא בלי לשמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
