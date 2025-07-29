import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DEFAULT_DISCUSSION_MODEL } from '@/utils/aiModels';

export const useAIDiscussion = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_DISCUSSION_MODEL);

  const sendMessage = useCallback(
    async ({
      message,
      problem,
      model = selectedModel,
      conversationHistory,
      userCode,
      solution,
    }) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/discussion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            problem,
            model,
            conversationHistory,
            userCode,
            solution,
          }),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            response: result.response,
            model: result.model,
          };
        } else {
          const errorMsg = result.error || 'Failed to get AI response';
          toast.error(`${errorMsg}. Try switching to a different AI model.`);
          return {
            success: false,
            error: result.error,
            suggestModelChange: true,
          };
        }
      } catch (error) {
        toast.error(
          'Failed to send message. Try switching to a different AI model.'
        );
        console.error('Discussion error:', error);
        return {
          success: false,
          error: error.message,
          suggestModelChange: true,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [selectedModel]
  );

  const addMessage = useCallback(message => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const changeModel = useCallback(newModel => {
    setSelectedModel(newModel);
  }, []);

  return {
    messages,
    isLoading,
    selectedModel,
    sendMessage,
    addMessage,
    clearMessages,
    changeModel,
  };
};
