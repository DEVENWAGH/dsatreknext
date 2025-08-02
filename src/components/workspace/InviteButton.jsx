'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Copy,
  Check,
  Users,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function InviteButton({ problemId }) {
  const [isInRoom, setIsInRoom] = useState(false);
  const [showJoining, setShowJoining] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roomId = searchParams.get('roomId');
      setIsInRoom(!!roomId);

      // Check if current user is the host
      if (roomId) {
        const hostKey = `room-host-${roomId}`;
        setIsHost(localStorage.getItem(hostKey) === 'true');

        // Start timer for room
        const checkRoomExpiry = () => {
          const roomData = localStorage.getItem(`room-${roomId}`);
          if (!roomData) return;

          const room = JSON.parse(roomData);
          const now = Date.now();
          const twoHours = 2 * 60 * 60 * 1000;
          const remaining = room.createdAt + twoHours - now;

          if (remaining <= 0) {
            setTimeLeft(null);
            return;
          }

          setTimeLeft(remaining);
        };

        checkRoomExpiry();
        const interval = setInterval(checkRoomExpiry, 60000);

        return () => clearInterval(interval);
      }
    }
  }, []);

  const handleInvite = async () => {
    // Check authentication using authStore
    const { useAuthStore } = await import('@/store/authStore');
    const authUser = useAuthStore.getState().authUser;

    if (!authUser) {
      toast.error('Please login to create or join collaborations');
      return;
    }

    try {
      if (isInRoom) {
        // Copy current URL if already in room
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Room link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        return;
      }

      // Create new room
      setShowJoining(true);
      const roomIdParam = Math.random().toString(36).substring(2, 8);

      // Register room in state manager
      const { roomStateManager } = await import('@/utils/roomState');
      roomStateManager.createRoom(roomIdParam, authUser.id);

      // Mark current user as host
      localStorage.setItem(`room-host-${roomIdParam}`, 'true');
      setIsHost(true);

      const newUrl = `${window.location.origin}${window.location.pathname}?roomId=${roomIdParam}`;
      window.history.pushState(
        {},
        '',
        `${window.location.pathname}?roomId=${roomIdParam}`
      );

      setTimeout(async () => {
        setShowJoining(false);
        setIsInRoom(true);

        // Auto-copy the collaboration link with full URL
        try {
          await navigator.clipboard.writeText(newUrl);
          toast.success('Room created and link copied to clipboard!');
        } catch (err) {
          toast.success('Room created! Share this URL to invite others.');
        }

        // Refresh page with smooth animation for proper sync
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1000);
    } catch (error) {
      console.error('Failed to check authentication:', error);
      toast.error('Authentication check failed');
    }
  };

  const handleEnd = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentRoomId = urlParams.get('roomId');

    if (currentRoomId) {
      const { roomStateManager } = await import('@/utils/roomState');

      try {
        if (isHost) {
          // Host ends the room for everyone
          const { useAuthStore } = await import('@/store/authStore');
          const authUser = useAuthStore.getState().authUser;

          const ended = roomStateManager.endRoom(
            currentRoomId,
            authUser?.id || 'user'
          );

          if (ended) {
            setShowEndDialog(false);

            // Show single toast for host only
            toast.success('Collaboration ended for all users');

            window.history.pushState({}, '', window.location.pathname);
            setIsInRoom(false);

            // Refresh page to return to regular workspace
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            toast.error('Failed to end collaboration');
            setShowEndDialog(false);
          }
        } else {
          // Member leaves the room (can rejoin)
          setShowEndDialog(false);
          window.history.pushState({}, '', window.location.pathname);
          setIsInRoom(false);
          setIsHost(false);
          toast.success('Left collaboration - you can rejoin using the link');

          // Refresh page to return to regular workspace
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error('Failed to check authentication:', error);
        toast.error('Authentication check failed');
      }
    }
  };

  if (showJoining) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-sm text-blue-600 dark:text-blue-400">
          Creating collaboration...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isInRoom && (
        <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${isHost ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              <X className="h-4 w-4" />
              {isHost ? 'End' : 'Leave'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <AlertDialogTitle>
                    {isHost ? 'End Collaboration?' : 'Leave Collaboration?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="mt-2">
                    {isHost
                      ? 'Are you sure you want to end this collaboration? After it ends, members can no longer collaborate on coding.'
                      : 'Are you sure you want to leave this collaboration? You can rejoin using the same link.'}
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEnd}
                className={
                  isHost
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }
              >
                {isHost ? 'End Collaboration' : 'Leave Collaboration'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvite}
              className="gap-2"
            >
              {isInRoom ? (
                <>
                  <Users className="h-4 w-4" />
                  Invite
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Invite
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Real-time Collaboration</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Invite collaborators to code together on this problem!
              </p>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Clock className="h-3 w-3" />
                <span>
                  {timeLeft
                    ? `Session ends in ${Math.floor(timeLeft / (1000 * 60 * 60))}h ${Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m`
                    : 'Session lasts up to 2 hours'}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
