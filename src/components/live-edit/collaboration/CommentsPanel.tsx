'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { CommentThread } from './CommentThread';
import type { CommentThread as CommentThreadType } from '@/types/collaboration';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'open' | 'resolved' | 'mentions';

export function CommentsPanel({ isOpen, onClose }: CommentsPanelProps) {
  const { threads, currentUserId, localPresence, addThread } =
    useCollaborationStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

  const allThreads = Array.from(threads.values());

  const filteredThreads = useMemo(() => {
    switch (filter) {
      case 'open':
        return allThreads.filter((t) => !t.isResolved);
      case 'resolved':
        return allThreads.filter((t) => t.isResolved);
      case 'mentions':
        return allThreads.filter((t) =>
          t.comments.some((c) =>
            c.mentions?.includes(localPresence?.name || '')
          )
        );
      default:
        return allThreads;
    }
  }, [allThreads, filter, localPresence]);

  const sortedThreads = useMemo(() => {
    return [...filteredThreads].sort((a, b) => {
      const aTime = a.comments[a.comments.length - 1]?.createdAt || a.createdAt;
      const bTime = b.comments[b.comments.length - 1]?.createdAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [filteredThreads]);

  const stats = useMemo(() => {
    const open = allThreads.filter((t) => !t.isResolved).length;
    const resolved = allThreads.filter((t) => t.isResolved).length;
    return { open, resolved, total: allThreads.length };
  }, [allThreads]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <h2 className="font-semibold">הערות</h2>
              <span className="text-sm text-gray-500">
                ({stats.open} פתוחות)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-1 p-3 border-b bg-gray-50 dark:bg-gray-800">
            {[
              { key: 'all', label: 'הכל', count: stats.total },
              { key: 'open', label: 'פתוחות', count: stats.open },
              { key: 'resolved', label: 'נפתרו', count: stats.resolved },
              { key: 'mentions', label: 'אזכורים', count: null },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as FilterType)}
                className={`
                  flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors
                  ${
                    filter === item.key
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {item.label}
                {item.count !== null && (
                  <span className="mr-1 opacity-70">({item.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {sortedThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-center">
                  {filter === 'all'
                    ? 'אין הערות עדיין. לחץ על רכיב כדי להוסיף הערה.'
                    : 'אין הערות בקטגוריה זו.'}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {sortedThreads.map((thread) => (
                  <ThreadPreview
                    key={thread.id}
                    thread={thread}
                    isExpanded={expandedThreadId === thread.id}
                    onToggle={() =>
                      setExpandedThreadId(
                        expandedThreadId === thread.id ? null : thread.id
                      )
                    }
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {stats.open} פתוחות • {stats.resolved} נפתרו
              </span>
              <span>{allThreads.reduce((acc, t) => acc + t.comments.length, 0)} הודעות</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ThreadPreviewProps {
  thread: CommentThreadType;
  isExpanded: boolean;
  onToggle: () => void;
  currentUserId: string | null;
}

function ThreadPreview({
  thread,
  isExpanded,
  onToggle,
  currentUserId,
}: ThreadPreviewProps) {
  const lastComment = thread.comments[thread.comments.length - 1];

  return (
    <motion.div
      layout
      className={`
        rounded-lg border overflow-hidden transition-colors
        ${thread.isResolved ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}
        ${isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
      `}
    >
      {/* Preview Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 text-right"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {thread.isResolved ? (
                <span className="text-green-500">✅</span>
              ) : (
                <span className="text-blue-500">💬</span>
              )}
              <span className="text-xs text-gray-500">
                {thread.comments.length} הודעות
              </span>
            </div>
            {lastComment && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                <span className="font-medium">{lastComment.authorName}:</span>{' '}
                {lastComment.content.slice(0, 50)}
                {lastComment.content.length > 50 && '...'}
              </p>
            )}
          </div>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Expanded Thread */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t">
              <CommentThread thread={thread} position="inline" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CommentsPanel;
