"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Check, Upload, Image, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const MOCK_MEDIA = [
  {
    id: "1",
    url: "/api/placeholder/400/300",
    thumbnailUrl: "/api/placeholder/200/150",
    alt: "Image 1",
    width: 400,
    height: 300,
  },
  {
    id: "2",
    url: "/api/placeholder/400/300",
    thumbnailUrl: "/api/placeholder/200/150",
    alt: "Image 2",
    width: 400,
    height: 300,
  },
  {
    id: "3",
    url: "/api/placeholder/400/300",
    thumbnailUrl: "/api/placeholder/200/150",
    alt: "Image 3",
    width: 400,
    height: 300,
  },
  {
    id: "4",
    url: "/api/placeholder/400/300",
    thumbnailUrl: "/api/placeholder/200/150",
    alt: "Image 4",
    width: 400,
    height: 300,
  },
];

export function MediaPickerDialog() {
  const { activeDialog, dialogProps, closeDialog } = useLiveEditStore();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isOpen = activeDialog === "mediaPicker";
  const onSelect = dialogProps?.onSelect;
  const currentValue = dialogProps?.currentValue;

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedId(null);
    }
  }, [isOpen]);

  // Filter media
  const filteredMedia = MOCK_MEDIA.filter((media) =>
    media.alt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    const selected = MOCK_MEDIA.find((m) => m.id === selectedId);
    if (selected && onSelect) {
      onSelect(selected.url);
    }
    closeDialog();
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload here
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>בחירת תמונה</DialogTitle>
        </DialogHeader>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-primary/50"
          )}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            גרור תמונות לכאן או{" "}
            <button className="text-primary hover:underline">בחר קבצים</button>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF עד 10MB
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש בספריית המדיה..."
            className="pl-10"
          />
        </div>

        {/* Media Grid */}
        <ScrollArea className="h-[300px]">
          {filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Image className="w-12 h-12 mb-2" />
              <p>לא נמצאו תמונות</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredMedia.map((media) => {
                const isSelected = selectedId === media.id;

                return (
                  <motion.button
                    key={media.id}
                    onClick={() => handleSelect(media.id)}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden",
                      "border-2 transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Preview & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedId ? (
              <span>תמונה נבחרה</span>
            ) : (
              <span>בחר תמונה מהספרייה</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={closeDialog}>
              ביטול
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedId}>
              בחר תמונה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
