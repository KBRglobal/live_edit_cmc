"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Check, FileText, MapPin, Hotel } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { id: "all", label: "הכל", icon: FileText },
  { id: "attraction", label: "אטרקציות", icon: MapPin },
  { id: "hotel", label: "מלונות", icon: Hotel },
  { id: "article", label: "מאמרים", icon: FileText },
];

// Mock data for demonstration
const MOCK_CONTENTS = [
  {
    id: "1",
    type: "attraction",
    title: "מגדל דוד",
    heroImage: "/api/placeholder/400/300",
    metaDescription: "אחד מסמלי ירושלים העתיקה",
    seoScore: 85,
    status: "published",
  },
  {
    id: "2",
    type: "attraction",
    title: "הכותל המערבי",
    heroImage: "/api/placeholder/400/300",
    metaDescription: "המקום הקדוש ביותר ליהודים",
    seoScore: 92,
    status: "published",
  },
  {
    id: "3",
    type: "hotel",
    title: "מלון המלך דוד",
    heroImage: "/api/placeholder/400/300",
    metaDescription: "מלון יוקרה בירושלים",
    seoScore: 78,
    status: "published",
  },
  {
    id: "4",
    type: "article",
    title: "המדריך המלא לירושלים",
    heroImage: "/api/placeholder/400/300",
    metaDescription: "כל מה שצריך לדעת על ירושלים",
    seoScore: 88,
    status: "published",
  },
];

export function ContentPickerDialog() {
  const { activeDialog, dialogProps, closeDialog } = useLiveEditStore();
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isOpen = activeDialog === "contentPicker";
  const multiple = dialogProps?.multiple || false;
  const initialSelection = dialogProps?.initialSelection || [];
  const onSelect = dialogProps?.onSelect;

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelection);
      setSearch("");
      setContentType("all");
    }
  }, [isOpen, initialSelection]);

  // Filter contents
  const filteredContents = MOCK_CONTENTS.filter((content) => {
    const matchesType = contentType === "all" || content.type === contentType;
    const matchesSearch = content.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleItem = (id: string) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(multiple ? selectedIds : selectedIds[0]);
    }
    closeDialog();
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return MapPin;
      case "hotel":
        return Hotel;
      default:
        return FileText;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>בחירת תוכן</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש תוכן..."
            className="pl-10"
          />
        </div>

        {/* Content Type Tabs */}
        <Tabs value={contentType} onValueChange={setContentType}>
          <TabsList className="w-full justify-start">
            {CONTENT_TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="gap-2">
                <type.icon className="w-4 h-4" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Content List */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-12 h-12 mb-2" />
              <p>לא נמצא תוכן</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContents.map((content) => {
                const Icon = getContentIcon(content.type);
                const isSelected = selectedIds.includes(content.id);

                return (
                  <motion.button
                    key={content.id}
                    onClick={() => handleToggleItem(content.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-right",
                      "flex items-start gap-3",
                      "transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {content.heroImage ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Icon className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium truncate">{content.title}</h4>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {content.metaDescription || "אין תיאור"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {content.type}
                        </Badge>
                        {content.seoScore && (
                          <Badge
                            variant={content.seoScore >= 70 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            SEO: {content.seoScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Selected Count & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedIds.length > 0 ? (
              <>נבחרו {selectedIds.length} פריטים</>
            ) : (
              <>לא נבחר תוכן</>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={closeDialog}>
              ביטול
            </Button>
            <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
              אישור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
