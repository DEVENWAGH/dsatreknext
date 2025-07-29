'use client';

import { useCallback, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  useRoom,
  useMyPresence,
  useOthers,
  useEventListener,
} from '../../../liveblocks.config';
import { CollaborativeCursors } from './CollaborativeCursors';

export function CollaborativeEditor({
  language = 'javascript',
  defaultValue = '',
  onMount,
  options = {},
  theme = 'vs-dark',
}) {
  const [editorRef, setEditorRef] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const room = useRoom();
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { useAuthStore } = await import('@/store/authStore');
      const authUser = useAuthStore.getState().authUser;
      setIsAuthenticated(!!authUser);
    };
    checkAuth();
  }, []);

  // Listen for room ending events from window
  useEffect(() => {
    const handleRoomEnded = event => {
      const { roomId } = event.detail;
      const searchParams = new URLSearchParams(window.location.search);
      const currentRoomId = searchParams.get('roomId');

      if (currentRoomId === roomId) {
        // Just redirect without toast
        setTimeout(() => {
          window.location.href = window.location.pathname;
        }, 1000);
      }
    };

    window.addEventListener('room-ended', handleRoomEnded);

    return () => {
      window.removeEventListener('room-ended', handleRoomEnded);
    };
  }, []);

  useEffect(() => {
    if (!editorRef || !room) return;

    let binding;

    const setupCollaboration = async () => {
      try {
        const { getYjsProviderForRoom } = await import('@liveblocks/yjs');
        const { MonacoBinding } = await import('y-monaco');

        const yProvider = getYjsProviderForRoom(room);
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
          console.log('🔍 Getting user info for collaboration...');

          try {
            const { useAuthStore } = await import('@/store/authStore');
            const authUser = useAuthStore.getState().authUser;

            console.log('📊 AuthStore state:', {
              authUser,
              hasAuthUser: !!authUser,
              firstName: authUser?.firstName,
              lastName: authUser?.lastName,
              name: authUser?.name,
              email: authUser?.email,
            });

            if (authUser) {
              let userName = 'User';

              if (authUser.firstName && authUser.lastName) {
                userName = `${authUser.firstName} ${authUser.lastName}`;
                console.log('✅ Using firstName + lastName:', userName);
              } else if (authUser.name) {
                userName = authUser.name;
                console.log('✅ Using name field:', userName);
              } else if (authUser.email) {
                userName = authUser.email.split('@')[0];
                console.log('✅ Using email prefix:', userName);
              } else {
                console.log('❌ No valid name fields found in authUser');
              }

              const userInfo = {
                name: userName,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
              };

              console.log('🎯 Final user info for collaboration:', userInfo);
              return userInfo;
            } else {
              console.log('❌ No authUser found in store');
            }
          } catch (error) {
            console.error('💥 Failed to get user from authStore:', error);
          }

          console.log('⚠️ Falling back to default user');
          return {
            name: 'User',
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          };
        };

        const userInfo = await getUserInfo();
        console.log('🚀 Setting user info in awareness:', userInfo);

        // Set user info in awareness for Monaco binding
        yProvider.awareness.setLocalStateField('user', userInfo);

        // Debug awareness changes
        yProvider.awareness.on('change', () => {
          const states = yProvider.awareness.getStates();
          console.log(
            '👥 Awareness states changed:',
            Array.from(states.entries()).map(([id, state]) => ({
              id,
              user: state.user,
            }))
          );
        });

        binding = new MonacoBinding(
          yText,
          editorRef.getModel(),
          new Set([editorRef]),
          yProvider.awareness
        );

        // Update cursor position and user info in presence
        editorRef.onDidChangeCursorPosition(e => {
          const presenceData = {
            cursor: {
              line: e.position.lineNumber,
              column: e.position.column,
            },
            user: userInfo,
          };
          console.log('📍 Updating presence:', presenceData);
          updateMyPresence(presenceData);
        });

        // Set initial presence with user info
        const initialPresence = {
          cursor: {
            line: 1,
            column: 1,
          },
          user: userInfo,
        };
        console.log('🎯 Setting initial presence:', initialPresence);
        updateMyPresence(initialPresence);

        console.log('Collaboration setup complete for room:', room.id);
      } catch (error) {
        console.error('Error setting up collaboration:', error);
      }
    };

    setupCollaboration();

    return () => {
      binding?.destroy();
    };
  }, [editorRef, room, defaultValue]);

  const handleOnMount = useCallback(
    (editor, monaco) => {
      setEditorRef(editor);
      onMount?.(editor, monaco);
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
