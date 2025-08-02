import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useTestSolution = () => {
  return useMutation({
    mutationFn: async ({ problemId, code, language, testCases }) => {
      const response = await fetch(`/api/problems/${problemId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          testCases,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: data => {
      if (data.success) {
        toast.success('Test completed successfully');
      } else {
        toast.error(data.message || 'Test failed');
      }
    },
    onError: error => {
      console.error('Test error:', error);
      toast.error('Failed to run test');
    },
  });
};
