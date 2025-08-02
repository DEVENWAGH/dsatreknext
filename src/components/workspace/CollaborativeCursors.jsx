'use client';

import { useOthers } from '../../../liveblocks.config.js';
import { useEffect, useState } from 'react';

export function CollaborativeCursors({ editorRef }) {
  const others = useOthers();
  const [cursors, setCursors] = useState([]);

  useEffect(() => {
    if (!editorRef) return;

    const updateCursors = () => {
      const newCursors = others
        .filter(({ presence }) => presence?.cursor)
        .map(({ connectionId, presence }) => {
          const { line, column } = presence.cursor;
          const coords = editorRef.getScrolledVisiblePosition({
            lineNumber: line,
            column,
          });
          if (!coords) return null;

          return {
            id: connectionId,
            x: coords.left,
            y: coords.top,
            user: presence.user,
          };
        })
        .filter(Boolean);

      setCursors(newCursors);
    };

    updateCursors();
    const interval = setInterval(updateCursors, 100);

    return () => clearInterval(interval);
  }, [others, editorRef]);

  return (
    <>
      {/* User count indicator */}
      {others.length > 0 && (
        <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 dark:text-green-300">
              {others.length} online
            </span>
          </div>
        </div>
      )}

      {/* Real-time cursors */}
      {cursors.map(({ id, x, y, user }) => (
        <div
          key={id}
          className="absolute pointer-events-none z-30"
          style={{
            left: x,
            top: y,
            transform: 'translate(-1px, -2px)',
          }}
        >
          {/* Cursor line */}
          <div
            className="w-0.5 h-5 animate-pulse"
            style={{ backgroundColor: user?.color || '#666' }}
          />

          {/* Username label */}
          <div
            className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-xs text-white whitespace-nowrap text-shadow"
            style={{ backgroundColor: user?.color || '#666' }}
          >
            {user?.name || 'Anonymous'}
          </div>
        </div>
      ))}
    </>
  );
}
