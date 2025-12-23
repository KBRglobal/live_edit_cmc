'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollaborationStore } from '@/stores/collaborationStore';
import type { CollaboratorPresence } from '@/types/collaboration';

interface PresenceAvatarsProps {
  maxVisible?: number;
  showNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PresenceAvatars({
  maxVisible = 5,
  showNames = false,
  size = 'md',
}: PresenceAvatarsProps) {
  const { collaborators, currentUserId, isConnected } = useCollaborationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isConnected) return null;

  const allCollaborators = Array.from(collaborators.values());
  const visibleCollaborators = allCollaborators.slice(0, maxVisible);
  const hiddenCount = Math.max(0, allCollaborators.length - maxVisible);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className="presence-avatars relative">
      <div className="flex items-center -space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleCollaborators.map((collaborator, index) => (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, scale: 0, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
              style={{ zIndex: visibleCollaborators.length - index }}
            >
              <AvatarBadge
                collaborator={collaborator}
                isCurrentUser={collaborator.id === currentUserId}
                sizeClass={sizeClass}
                showName={showNames}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Overflow indicator */}
        {hiddenCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              ${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700
              flex items-center justify-center font-medium
              border-2 border-white dark:border-gray-900
              hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
            `}
          >
            +{hiddenCount}
          </motion.button>
        )}
      </div>

      {/* Expanded list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 min-w-[200px]"
          >
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              משתתפים ({allCollaborators.length})
            </h4>
            <div className="space-y-2">
              {allCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <AvatarBadge
                    collaborator={collaborator}
                    isCurrentUser={collaborator.id === currentUserId}
                    sizeClass="w-6 h-6 text-xs"
                    showName={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {collaborator.name}
                      {collaborator.id === currentUserId && (
                        <span className="text-gray-400 mr-1">(את/ה)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getStatusText(collaborator.status)}
                    </div>
                  </div>
                  <StatusIndicator status={collaborator.status} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AvatarBadgeProps {
  collaborator: CollaboratorPresence;
  isCurrentUser: boolean;
  sizeClass: string;
  showName: boolean;
}

function AvatarBadge({
  collaborator,
  isCurrentUser,
  sizeClass,
  showName,
}: AvatarBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const initials = collaborator.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          ${sizeClass} rounded-full flex items-center justify-center
          font-medium text-white border-2 border-white dark:border-gray-900
          ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        `}
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.avatar ? (
          <img
            src={collaborator.avatar}
            alt={collaborator.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Status dot */}
      <StatusIndicator
        status={collaborator.status}
        className="absolute -bottom-0.5 -left-0.5"
        small
      />

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 whitespace-nowrap z-50"
          >
            <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg">
              {collaborator.name}
              {isCurrentUser && ' (את/ה)'}
              {collaborator.editingComponentId && (
                <div className="text-gray-400 mt-0.5">עורך/ת רכיב</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name label */}
      {showName && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center truncate max-w-[60px]">
          {collaborator.name.split(' ')[0]}
        </div>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: string;
  className?: string;
  small?: boolean;
}

function StatusIndicator({
  status,
  className = '',
  small = false,
}: StatusIndicatorProps) {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    away: 'bg-gray-400',
  };

  const color = statusColors[status as keyof typeof statusColors] || statusColors.away;
  const sizeClass = small ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <span
      className={`
        ${sizeClass} ${color} rounded-full border-2 border-white dark:border-gray-900
        ${className}
      `}
    />
  );
}

function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    active: 'פעיל/ה',
    idle: 'לא פעיל/ה',
    away: 'לא נמצא/ת',
  };
  return statusTexts[status] || 'לא ידוע';
}

export default PresenceAvatars;
