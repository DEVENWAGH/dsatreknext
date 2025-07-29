'use client';

import { useState } from 'react';
import {
  useOthers,
  useBroadcastEvent,
  useEventListener,
} from '../../../liveblocks.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, Users, Share2, X } from 'lucide-react';

export function CollaborationPanel() {
  const others = useOthers();
  const broadcast = useBroadcastEvent();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Listen for chat messages
  useEventListener(({ event }) => {
    if (event.type === 'chat-message') {
      setMessages(prev => [...prev, event.data]);
    }
  });

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      user: 'Current User', // Get from auth
      timestamp: new Date().toLocaleTimeString(),
    };

    broadcast({ type: 'chat-message', data: message });
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collaboration Stats */}
      <div className="flex items-center gap-2 mb-2">
        <Card className="px-3 py-2 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{others.length + 1} online</span>
          </div>
        </Card>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowChat(!showChat)}
          className="bg-white/90 backdrop-blur"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <Card className="w-80 h-96 bg-white/95 backdrop-blur border shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">Team Chat</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowChat(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-3 h-64 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="mb-2 text-sm">
                <div className="font-medium text-blue-600">{msg.user}</div>
                <div className="text-gray-700">{msg.text}</div>
                <div className="text-xs text-gray-400">{msg.timestamp}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button size="sm" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
