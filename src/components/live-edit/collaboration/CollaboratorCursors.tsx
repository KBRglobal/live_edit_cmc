'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaborationStore } from '@/stores/collaborationStore';

interface CollaboratorCursorsProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function CollaboratorCursors({ containerRef }: CollaboratorCursorsProps) {
  const { collaborators, currentUserId, updateCursor, isConnected } =
    useCollaborationStore();
  const throttleRef = useRef<number | null>(null);

  // Track and broadcast cursor position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isConnected || !containerRef.current) return;

      // Throttle updates to 30fps
      if (throttleRef.current) return;
      throttleRef.current = window.setTimeout(() => {
        throttleRef.current = null;
      }, 33);

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      updateCursor({
        x,
        y,
        viewportWidth: rect.width,
        viewportHeight: rect.height,
      });
    },
    [isConnected, containerRef, updateCursor]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef, handleMouseMove]);

  // Get other collaborators (not self)
  const otherCollaborators = Array.from(collaborators.values()).filter(
    (c) => c.id !== currentUserId && c.cursor
  );

  return (
    <div className="collaborator-cursors pointer-events-none absolute inset-0 overflow-hidden z-50">
      <AnimatePresence>
        {otherCollaborators.map((collaborator) => (
          <CollaboratorCursor
            key={collaborator.id}
            collaborator={collaborator}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface CollaboratorCursorProps {
  collaborator: {
    id: string;
    name: string;
    color: string;
    cursor?: { x: number; y: number };
    editingComponentId?: string;
    status: string;
  };
}

function CollaboratorCursor({ collaborator }: CollaboratorCursorProps) {
  if (!collaborator.cursor) return null;

  const { x, y } = collaborator.cursor;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.15 }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor Arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M5 3L19 12L12 12L8 21L5 3Z"
          fill={collaborator.color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name Label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-5 right-1 whitespace-nowrap"
      >
        <div
          className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: collaborator.color }}
        >
          {collaborator.name}
          {collaborator.editingComponentId && (
            <span className="ml-1 opacity-75">✏️</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CollaboratorCursors;
