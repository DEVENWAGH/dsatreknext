'use client';

import { useState } from 'react';
import {
  useBroadcastEvent,
  useEventListener,
} from '../../../liveblocks.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

export function CodeSnapshot({ editorRef }) {
  const broadcast = useBroadcastEvent();
  const [snapshots, setSnapshots] = useState([]);

  useEventListener(({ event }) => {
    if (event.type === 'code-snapshot') {
      setSnapshots(prev => [...prev, event.data]);
      toast.success(`${event.data.user} shared a code snapshot`);
    }
  });

  const takeSnapshot = () => {
    if (!editorRef) return;

    const code = editorRef.getValue();
    const snapshot = {
      id: Date.now(),
      code,
      user: 'Current User', // Get from auth
      timestamp: new Date().toLocaleString(),
      language: 'cpp', // Get from current language
    };

    broadcast({ type: 'code-snapshot', data: snapshot });
    setSnapshots(prev => [...prev, snapshot]);
    toast.success('Code snapshot shared with team');
  };

  const downloadSnapshot = snapshot => {
    const blob = new Blob([snapshot.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot-${snapshot.id}.${snapshot.language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={takeSnapshot}
        className="flex items-center gap-2"
      >
        <Camera className="w-4 h-4" />
        Share Snapshot
      </Button>

      {snapshots.length > 0 && (
        <Card className="p-3 max-h-40 overflow-y-auto">
          <h4 className="font-medium mb-2">Team Snapshots</h4>
          {snapshots.map(snapshot => (
            <div
              key={snapshot.id}
              className="flex items-center justify-between py-1 text-sm"
            >
              <div>
                <div className="font-medium">{snapshot.user}</div>
                <div className="text-gray-500">{snapshot.timestamp}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadSnapshot(snapshot)}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
