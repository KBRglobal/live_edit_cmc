"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bold, Italic, Underline, Link2 } from "lucide-react";
import { useLiveEditStore } from "@/stores/liveEditStore";
import { cn } from "@/lib/utils";

interface InlineTextEditorProps {
  componentId: string;
  fieldName: string;
  value: string;
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div";
  maxLength?: number;
  className?: string;
  placeholder?: string;
  richText?: boolean;
}

export function InlineTextEditor({
  componentId,
  fieldName,
  value,
  as: Component = "p",
  maxLength,
  className,
  placeholder = "לחץ לעריכה...",
  richText = false,
}: InlineTextEditorProps) {
  const {
    isEditMode,
    isPreviewMode,
    updateComponentProps,
    focusField,
    focusedFieldId,
  } = useLiveEditStore();

  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const fieldId = `${componentId}-${fieldName}`;

  // Sync with store value
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Focus when selected externally
  useEffect(() => {
    if (focusedFieldId === fieldId && editorRef.current) {
      editorRef.current.focus();
      setIsEditing(true);
    }
  }, [focusedFieldId, fieldId]);

  const handleClick = useCallback(() => {
    if (!isEditMode || isPreviewMode) return;
    setIsEditing(true);
    focusField(fieldId);
  }, [isEditMode, isPreviewMode, fieldId, focusField]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setShowToolbar(false);
    focusField(null);

    // Save changes
    const newValue = editorRef.current?.innerHTML || "";
    if (newValue !== value) {
      updateComponentProps(componentId, { [fieldName]: newValue });
    }
  }, [value, componentId, fieldName, updateComponentProps, focusField]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Save on Enter (for single line headings)
      if (e.key === "Enter" && !e.shiftKey && !["p", "div"].includes(Component)) {
        e.preventDefault();
        editorRef.current?.blur();
      }

      // Cancel on Escape
      if (e.key === "Escape") {
        if (editorRef.current) {
          editorRef.current.innerHTML = value;
        }
        setLocalValue(value);
        setIsEditing(false);
        focusField(null);
      }

      // Rich text shortcuts
      if (richText && (e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            document.execCommand("bold");
            break;
          case "i":
            e.preventDefault();
            document.execCommand("italic");
            break;
          case "u":
            e.preventDefault();
            document.execCommand("underline");
            break;
        }
      }
    },
    [Component, value, richText, focusField]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newValue = richText
        ? editorRef.current.innerHTML
        : editorRef.current.textContent || "";

      if (maxLength && newValue.length > maxLength) {
        // Trim to max length
        editorRef.current.innerHTML = localValue;
        return;
      }

      setLocalValue(newValue);
    }
  }, [maxLength, localValue, richText]);

  const handleSelectionChange = useCallback(() => {
    if (!richText || !isEditing) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        });
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
    }
  }, [richText, isEditing]);

  // Listen for selection changes
  useEffect(() => {
    if (isEditing && richText) {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }
  }, [isEditing, richText, handleSelectionChange]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleAddLink = () => {
    const url = prompt("הכנס URL:");
    if (url) {
      applyFormat("createLink", url);
    }
  };

  // Read-only mode
  if (!isEditMode || isPreviewMode) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
      />
    );
  }

  const charCount = richText
    ? (editorRef.current?.textContent || "").length
    : localValue.length;

  return (
    <div className="relative">
      {/* Rich Text Toolbar */}
      <AnimatePresence>
        {showToolbar && richText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "fixed z-50",
              "flex items-center gap-1 p-1",
              "bg-gray-900 text-white rounded-lg shadow-lg"
            )}
            style={{
              top: toolbarPosition.top,
              left: toolbarPosition.left,
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => applyFormat("bold")}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat("italic")}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat("underline")}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-700 mx-1" />
            <button
              onClick={handleAddLink}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              title="Link (Ctrl+K)"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable Element */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: localValue || "" }}
        className={cn(
          className,
          "outline-none transition-all duration-200",
          "cursor-text min-h-[1.5em]",
          isEditing
            ? "ring-2 ring-primary ring-offset-2 rounded bg-white"
            : "hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 rounded",
          !localValue && "text-gray-400"
        )}
        data-placeholder={placeholder}
        data-editable={fieldName}
      />

      {/* Character Count */}
      {maxLength && isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "absolute -bottom-6 right-0 text-xs",
            charCount > maxLength * 0.9 ? "text-red-500" : "text-gray-400"
          )}
        >
          {charCount}/{maxLength}
        </motion.div>
      )}
    </div>
  );
}
