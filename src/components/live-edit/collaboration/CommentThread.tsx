'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaborationStore } from '@/stores/collaborationStore';
import type { CommentThread as CommentThreadType, Comment } from '@/types/collaboration';

interface CommentThreadProps {
  thread: CommentThreadType;
  onClose?: () => void;
  position?: 'inline' | 'floating';
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '😊', '🤔', '👀'];

export function CommentThread({
  thread,
  onClose,
  position = 'floating',
}: CommentThreadProps) {
  const {
    addComment,
    editComment,
    deleteComment,
    resolveThread,
    reopenThread,
    addReaction,
    currentUserId,
    localPresence,
  } = useCollaborationStore();

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Extract mentions
    const mentions = newComment.match(/@(\w+)/g)?.map((m) => m.slice(1)) || [];

    addComment(thread.id, newComment.trim(), mentions);
    setNewComment('');
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editContent.trim()) {
      editComment(thread.id, editingCommentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        comment-thread bg-white dark:bg-gray-800 rounded-lg shadow-lg border
        ${position === 'floating' ? 'w-80' : 'w-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {thread.isResolved ? '✅ ' : '💬 '}
            שרשור
          </span>
          <span className="text-xs text-gray-500">
            {thread.comments.length} הודעות
          </span>
        </div>
        <div className="flex items-center gap-1">
          {thread.isResolved ? (
            <button
              onClick={() => reopenThread(thread.id)}
              className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              פתח מחדש
            </button>
          ) : (
            <button
              onClick={() => resolveThread(thread.id)}
              className="p-1.5 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
            >
              ✓ סמן כנפתר
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-3">
        <AnimatePresence>
          {thread.comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative group p-3 rounded-lg
                ${
                  comment.authorId === currentUserId
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }
              `}
            >
              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    comment.authorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-gray-400 mr-2">
                    {formatTime(comment.createdAt)}
                    {comment.updatedAt && ' (נערך)'}
                  </span>
                </div>
              </div>

              {/* Content */}
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm border rounded resize-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      שמור
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {renderCommentContent(comment.content)}
                </p>
              )}

              {/* Reactions */}
              {comment.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {groupReactions(comment.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(thread.id, comment.id, emoji)}
                      className={`
                        px-2 py-0.5 text-xs rounded-full border transition-colors
                        ${
                          users.some((u) => u.userId === currentUserId)
                            ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30'
                            : 'bg-gray-100 border-gray-200 dark:bg-gray-700 hover:bg-gray-200'
                        }
                      `}
                      title={users.map((u) => u.userName).join(', ')}
                    >
                      {emoji} {users.length}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-600 rounded"
                >
                  😊
                </button>
                {comment.authorId === currentUserId && (
                  <>
                    <button
                      onClick={() => handleEdit(comment)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-600 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteComment(thread.id, comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-600 rounded"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>

              {/* Reaction Picker */}
              <AnimatePresence>
                {showReactions === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-0 left-0 -translate-y-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-1 flex gap-1"
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addReaction(thread.id, comment.id, emoji);
                          setShowReactions(null);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {thread.comments.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            אין הודעות עדיין. התחל שיחה!
          </div>
        )}
      </div>

      {/* Input */}
      {!thread.isResolved && (
        <form onSubmit={handleSubmit} className="p-3 border-t">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="הוסף תגובה... (@ לאזכור)"
              className="flex-1 px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              Enter לשליחה, Shift+Enter לשורה חדשה
            </span>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              שלח
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

// Helper functions
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;

  return date.toLocaleDateString('he-IL');
}

function renderCommentContent(content: string): React.ReactNode {
  // Convert @mentions to styled spans
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-blue-600 font-medium">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function groupReactions(
  reactions: { emoji: string; userId: string; userName: string }[]
): [string, { userId: string; userName: string }[]][] {
  const groups = new Map<string, { userId: string; userName: string }[]>();

  reactions.forEach((r) => {
    if (!groups.has(r.emoji)) {
      groups.set(r.emoji, []);
    }
    groups.get(r.emoji)!.push({ userId: r.userId, userName: r.userName });
  });

  return Array.from(groups.entries());
}

export default CommentThread;
