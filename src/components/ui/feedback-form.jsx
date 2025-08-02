'use client';

import { useEffect, useState } from 'react';

import {
  PopoverForm,
  PopoverFormButton,
  PopoverFormCutOutLeftIcon,
  PopoverFormCutOutRightIcon,
  PopoverFormSeparator,
  PopoverFormSuccess,
} from '@/components/ui/popover-form';

export function FeedbackForm() {
  const [formState, setFormState] = useState('idle');
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const MAX_WORDS = 500;

  const getWordCount = text => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const handleFeedbackChange = e => {
    const text = e.target.value;
    const wordCount = getWordCount(text);

    if (wordCount <= MAX_WORDS) {
      setFeedback(text);
    }
  };

  async function submit() {
    setFormState('loading');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedback }),
      });

      if (response.ok) {
        setFormState('success');
        setTimeout(() => {
          setOpen(false);
          setFormState('idle');
          setFeedback('');
        }, 2000);
      } else {
        setFormState('idle');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFormState('idle');
    }
  }

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setOpen(false);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'Enter' &&
        open &&
        formState === 'idle' &&
        feedback.trim() &&
        getWordCount(feedback) <= MAX_WORDS
      ) {
        submit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, formState]);

  return (
    <div>
      <PopoverForm
        title="Feedback"
        open={open}
        setOpen={setOpen}
        width="364px"
        height="192px"
        showCloseButton={formState !== 'success'}
        showSuccess={formState === 'success'}
        openChild={
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!feedback || getWordCount(feedback) > MAX_WORDS) return;
              submit();
            }}
            className=""
          >
            <div className="relative">
              <textarea
                autoFocus
                placeholder="Feedback"
                value={feedback}
                onChange={handleFeedbackChange}
                className="h-32 w-full resize-none rounded-t-lg p-3 text-sm outline-none custom-scrollbar"
                data-lenis-prevent
                required
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {getWordCount(feedback)}/{MAX_WORDS} words
              </div>
            </div>
            <div className="relative flex h-12 items-center px-[10px]">
              <PopoverFormSeparator />
              <div className="absolute left-0 top-0 -translate-x-[1.5px] -translate-y-1/2">
                <PopoverFormCutOutLeftIcon />
              </div>
              <div className="absolute right-0 top-0 translate-x-[1.5px] -translate-y-1/2 rotate-180">
                <PopoverFormCutOutRightIcon />
              </div>
              <PopoverFormButton
                loading={formState === 'loading'}
                disabled={
                  getWordCount(feedback) > MAX_WORDS || !feedback.trim()
                }
                text="Submit"
              />
            </div>
          </form>
        }
        successChild={
          <PopoverFormSuccess
            title="Feedback Received"
            description="Thank you for supporting our project!"
          />
        }
      />
    </div>
  );
}
