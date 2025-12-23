"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Settings, FileText } from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentLibrary } from "./ComponentLibrary";
import { ComponentSettings } from "./ComponentSettings";
import { cn } from "@/lib/utils";

export function LiveEditSidebar() {
  const {
    isEditMode,
    isPreviewMode,
    sidebarOpen,
    sidebarTab,
    setSidebarOpen,
    setSidebarTab,
    selectedComponentId,
  } = useLiveEditStore();

  if (!isEditMode || isPreviewMode) return null;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-14 right-0 bottom-0 w-80 z-le-sidebar",
            "bg-white border-l shadow-lg",
            "flex flex-col"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">עריכה</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            value={sidebarTab}
            onValueChange={(value) => setSidebarTab(value as any)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="w-full justify-start px-4 pt-2">
              <TabsTrigger value="components" className="gap-2">
                <Layers className="w-4 h-4" />
                קומפוננטות
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2"
                disabled={!selectedComponentId}
              >
                <Settings className="w-4 h-4" />
                הגדרות
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <FileText className="w-4 h-4" />
                תוכן
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="components" className="h-full m-0">
                <ScrollArea className="h-full live-edit-sidebar">
                  <ComponentLibrary />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="h-full m-0">
                <ScrollArea className="h-full live-edit-sidebar">
                  <ComponentSettings />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="content" className="h-full m-0">
                <ScrollArea className="h-full live-edit-sidebar">
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      בחר קומפוננטה כדי לערוך את התוכן שלה
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
