'use client';

import { useCallback, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  useRoom,
  useMyPresence,
  useOthers,
  useEventListener,
} from '../../../liveblocks.config.js';
import { CollaborativeCursors } from './CollaborativeCursors';

export function CollaborativeEditor({
  language = 'javascript',
  defaultValue = '',
  onMount,
  options = {},
  theme = 'vs-dark',
}) {
  const [editorRef, setEditorRef] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const room = useRoom();
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Check authentication using authStore
  useEffect(() => {
    const checkAuth = async () => {
      const { useAuthStore } = await import('@/store/authStore');
      const authUser = useAuthStore.getState().authUser;

      if (authUser) {
        let userName = 'User';
        if (authUser.firstName && authUser.lastName) {
          userName = `${authUser.firstName} ${authUser.lastName}`;
        } else if (authUser.name) {
          userName = authUser.name;
        } else if (authUser.email) {
          userName = authUser.email.split('@')[0];
        }

        const info = {
          name: userName,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        };

        setUserInfo(info);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Listen for room ending events from window
  useEffect(() => {
    const handleRoomEnded = () => {
      // Immediately redirect to regular workspace
      window.location.href = window.location.pathname;
    };

    const handleRoomLeft = () => {
      // User left collaboration, redirect to regular workspace
      window.location.href = window.location.pathname;
    };

    window.addEventListener('roomEnded', handleRoomEnded);
    window.addEventListener('roomLeft', handleRoomLeft);

    return () => {
      window.removeEventListener('roomEnded', handleRoomEnded);
      window.removeEventListener('roomLeft', handleRoomLeft);
    };
  }, []);

  useEffect(() => {
    if (!editorRef || !room) return;

    let binding;
    let yProvider;
    let disposed = false;

    const setupCollaboration = async () => {
      try {
        const { getYjsProviderForRoom } = await import('@liveblocks/yjs');
        const { MonacoBinding } = await import('y-monaco');

        // Check if the editor has been disposed
        if (disposed || !editorRef.getModel()) {
          console.log(
            'Editor was disposed before collaboration setup completed'
          );
          return;
        }

        yProvider = getYjsProviderForRoom(room);
        const yDoc = yProvider.getYDoc();
        const yText = yDoc.getText('monaco');

        // Set starter code only once per room using room metadata
        const roomKey = `starter_set_${room.id}`;

        yProvider.on('sync', () => {
          // Check if starter code was already set for this room
          const metadata = yDoc.getMap('metadata');
          const starterSet = metadata.get('starterCodeSet');

          if (!starterSet && yText.length === 0 && defaultValue) {
            yText.insert(0, defaultValue);
            metadata.set('starterCodeSet', true);
            console.log('Inserted starter code into room:', room.id);
          }
        });

        // Get user info from authStore
        const getUserInfo = async () => {
          try {
            const { useAuthStore } = await import('@/store/authStore');
            const authUser = useAuthStore.getState().authUser;

            if (authUser) {
              let userName = 'User';

              if (authUser.firstName && authUser.lastName) {
                userName = `${authUser.firstName} ${authUser.lastName}`;
              } else if (authUser.name) {
                userName = authUser.name;
              } else if (authUser.email) {
                userName = authUser.email.split('@')[0];
              }

              return {
                name: userName,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
              };
            }
          } catch (error) {
            // Silent fallback
          }

          return {
            name: 'User',
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          };
        };

        const currentUserInfo = await getUserInfo();

        // Set user info in awareness for Monaco binding
        yProvider.awareness.setLocalStateField('user', currentUserInfo);

        // Check again if model exists before creating binding
        const model = editorRef.getModel();
        if (!model || disposed) {
          console.log(
            'Editor model was disposed before binding could be created'
          );
          return;
        }

        try {
          binding = new MonacoBinding(
            yText,
            model,
            new Set([editorRef]),
            yProvider.awareness
          );
        } catch (error) {
          console.error('Error creating Monaco binding:', error);
          return;
        }

        // Update cursor position and user info in presence
        editorRef.onDidChangeCursorPosition(e => {
          updateMyPresence({
            cursor: {
              line: e.position.lineNumber,
              column: e.position.column,
            },
            user: currentUserInfo,
          });
        });

        // Set initial presence with user info
        updateMyPresence({
          cursor: {
            line: 1,
            column: 1,
          },
          user: currentUserInfo,
        });
      } catch (error) {
        console.error('Error setting up collaboration:', error);
      }
    };

    setupCollaboration();

    return () => {
      binding?.destroy();
    };
  }, [editorRef, room, defaultValue, userInfo]);

  const handleOnMount = useCallback(
    (editor, monaco) => {
      // Initialize event handlers array
      editor._liveblocksEventHandlers = [];

      // Store the editor instance
      setEditorRef(editor);

      // Call the parent's onMount handler if provided
      if (onMount) {
        try {
          onMount(editor, monaco);
        } catch (error) {
          console.warn('Error in parent onMount handler:', error);
        }
      }
    },
    [onMount]
  );

  return (
    <div className="relative h-full w-full">
      <Editor
        onMount={handleOnMount}
        height="100%"
        width="100%"
        theme={theme}
        defaultLanguage={language}
        defaultValue={defaultValue}
        options={{
          tabSize: 2,
          minimap: { enabled: false },
          readOnly: !isAuthenticated,
          ...options,
        }}
      />
      <CollaborativeCursors editorRef={editorRef} />
    </div>
  );
}
