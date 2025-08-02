'use client';

import { useEffect, useState } from 'react';
import { RoomProvider, useEventListener } from '../../../liveblocks.config';

function RoomEventHandler() {
  useEventListener(({ event }) => {
    if (event.type === 'room-force-disconnect') {
      window.location.reload();
    }
  });
  return null;
}

export function CollaborativeWrapper({ children, problemId }) {
  const [roomId, setRoomId] = useState(`workspace-${problemId}`);
  const [key, setKey] = useState(0);
  const [roomBlocked, setRoomBlocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const updateRoom = async () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const urlRoomId = searchParams.get('roomId');

        if (urlRoomId) {
          const { roomStateManager } = await import('@/utils/roomState');

          // Get user from authStore
          const { useAuthStore } = await import('@/store/authStore');
          const currentAuthUser = useAuthStore.getState().authUser;

          // Check if room exists in local state
          const existingRoom = roomStateManager.getRoomState(urlRoomId);

          if (!existingRoom && currentAuthUser) {
            // Create room if it doesn't exist and user is authenticated
            roomStateManager.createRoom(urlRoomId, currentAuthUser.id);
          } else {
            // Check if existing room is accessible
            const isAccessible =
              await roomStateManager.isRoomAccessible(urlRoomId);
            if (!isAccessible) {
              setRoomBlocked(true);
              return;
            }
          }

          if (currentAuthUser) {
            // Register authenticated user as joining the room
            const canJoin = await roomStateManager.joinRoom(
              urlRoomId,
              currentAuthUser.id
            );
            if (!canJoin) {
              setRoomBlocked(true);
              return;
            }
          }
          // Non-authenticated users can view if room is accessible
        }

        const newRoomId = urlRoomId
          ? `collab-${urlRoomId}`
          : `workspace-${problemId}`;

        if (newRoomId !== roomId) {
          console.log('Switching to room:', newRoomId);
          setRoomId(newRoomId);
          setKey(prev => prev + 1);
          setRoomBlocked(false);
        }
      }
    };

    const handleRoomEnded = event => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentRoomId = searchParams.get('roomId');

      if (currentRoomId) {
        // Immediately redirect to regular workspace
        window.history.pushState({}, '', window.location.pathname);
        window.location.reload();
      }
    };

    const handleRoomLeft = event => {
      // User left collaboration, redirect to regular workspace
      window.history.pushState({}, '', window.location.pathname);
      window.location.reload();
    };

    const handleStorageChange = event => {
      if (event.key === 'room-ended-broadcast' && event.newValue) {
        const data = JSON.parse(event.newValue);
        const searchParams = new URLSearchParams(window.location.search);
        const currentRoomId = searchParams.get('roomId');

        if (currentRoomId === data.roomId) {
          setRoomBlocked(true);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    updateRoom();
    window.addEventListener('popstate', updateRoom);
    window.addEventListener('room-ended', handleRoomEnded);
    window.addEventListener('roomEnded', handleRoomEnded);
    window.addEventListener('roomLeft', handleRoomLeft);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('popstate', updateRoom);
      window.removeEventListener('room-ended', handleRoomEnded);
      window.removeEventListener('roomEnded', handleRoomEnded);
      window.removeEventListener('roomLeft', handleRoomLeft);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [roomId, problemId]);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const urlRoomId = searchParams.get('roomId');

        if (urlRoomId) {
          const { useAuthStore } = await import('@/store/authStore');
          const user = useAuthStore.getState().authUser;
          setIsAuthenticated(!!user);
          setShowLoginPrompt(!user);
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();

    // Re-check auth when window gains focus (user returns from login)
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (roomBlocked) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            End Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            This collaboration session has ended. Members can no longer
            collaborate on coding.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Collaboration</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                window.history.pushState({}, '', window.location.pathname);
                window.location.reload();
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Return to Problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider key={key} id={roomId}>
      <RoomEventHandler />
      {showLoginPrompt && (
        <div className="fixed top-4 right-4 z-50 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Login Required for Collaboration
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                You can view the problem, but login is required to collaborate
                with others.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const callbackUrl = encodeURIComponent(
                      window.location.href
                    );
                    window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </RoomProvider>
  );
}
