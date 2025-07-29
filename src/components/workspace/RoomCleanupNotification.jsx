'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RoomCleanupNotification({ roomId }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRoomExpiry = () => {
      const roomData = localStorage.getItem(`room-${roomId}`);
      if (!roomData) return;

      const room = JSON.parse(roomData);
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      const remaining = room.createdAt + twoHours - now;

      if (remaining <= 0) {
        // Room expired
        router.push('/problems');
        return;
      }

      setTimeLeft(remaining);

      // Show warning in last 10 minutes
      if (remaining <= 10 * 60 * 1000) {
        setShowWarning(true);
      }
    };

    checkRoomExpiry();
    const interval = setInterval(checkRoomExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [roomId, router]);

  const formatTime = ms => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (!timeLeft) return null;

  if (showWarning) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="p-4 bg-yellow-50 border-yellow-200 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Session Ending Soon
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This collaboration session will end in {formatTime(timeLeft)}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-yellow-800 border-yellow-300"
                onClick={() => setShowWarning(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card className="px-3 py-2 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Session ends in {formatTime(timeLeft)}</span>
        </div>
      </Card>
    </div>
  );
}
