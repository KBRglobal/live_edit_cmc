"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, PartyPopper } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function PublishDialog() {
  const {
    activeDialog,
    closeDialog,
    publishChanges,
    isPublishing,
    history,
    historyIndex,
  } = useLiveEditStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const isOpen = activeDialog === "publish";

  // Get recent changes summary
  const recentChanges = history.slice(0, Math.min(historyIndex + 1, 5));

  const handlePublish = async () => {
    try {
      await publishChanges();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        closeDialog();
      }, 2000);
    } catch (error) {
      console.error("Failed to publish:", error);
    }
  };

  const handleClose = () => {
    if (!isPublishing) {
      setIsSuccess(false);
      closeDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">פורסם בהצלחה!</h3>
              <p className="text-muted-foreground">השינויים שלך מופיעים כעת באתר</p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <PartyPopper className="w-8 h-8 mx-auto text-yellow-500" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  פרסום שינויים
                </DialogTitle>
                <DialogDescription>
                  השינויים יפורסמו באתר ויהיו גלויים לכל הגולשים
                </DialogDescription>
              </DialogHeader>

              {/* Changes Summary */}
              <div className="my-6">
                <h4 className="text-sm font-medium mb-3">סיכום שינויים:</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {recentChanges.length > 0 ? (
                    recentChanges.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{entry.description}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      אין שינויים לפרסום
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPublishing}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      מפרסם...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      פרסם עכשיו
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
