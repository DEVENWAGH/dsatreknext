'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

export function SessionManager({ roomId, isHost = false }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Set session duration (e.g., 2 hours)
    const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours in ms
    const sessionStart = Date.now();
    const sessionEnd = sessionStart + sessionDuration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = sessionEnd - now;

      if (remaining <= 0) {
        setSessionExpired(true);
        clearInterval(interval);

        if (isHost) {
          // Host ends session for everyone
          const endRoomAsync = async () => {
            const { roomStateManager } = await import('@/utils/roomState');
            const { useAuthStore } = await import('@/store/authStore');
            const authUser = useAuthStore.getState().authUser;

            if (authUser) {
              await roomStateManager.endRoom(roomId, authUser.id);
            }

            localStorage.removeItem(`room-host-${roomId}`);
          };

          endRoomAsync();
        }

        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, isHost]);

  const formatTime = ms => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const endSession = async () => {
    if (isHost) {
      // Import room state manager and end room properly
      const { roomStateManager } = await import('@/utils/roomState');
      const { useAuthStore } = await import('@/store/authStore');
      const authUser = useAuthStore.getState().authUser;

      if (authUser) {
        await roomStateManager.endRoom(roomId, authUser.id);
      }

      localStorage.removeItem(`room-host-${roomId}`);
    }
    router.push('/problems');
  };

  if (sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">
            {isHost
              ? 'Your collaboration session has ended.'
              : 'The host has ended this collaboration session.'}
          </p>
          <Button onClick={endSession} className="w-full">
            Return to Problems
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-40">
      <Card className="px-3 py-2 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>{timeLeft && formatTime(timeLeft)} left</span>
          {isHost && (
            <Button
              size="sm"
              variant="destructive"
              onClick={endSession}
              className="ml-2"
            >
              End Session
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
