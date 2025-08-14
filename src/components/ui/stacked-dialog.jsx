'use client';

import React, { createContext, useContext, useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DialogStackContext = createContext();

export function DialogStack({ children, open, onOpenChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = newOpen => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setCurrentIndex(0); // Reset to first step when closing
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogStackContext.Provider
      value={{
        currentIndex,
        setCurrentIndex,
        isOpen,
        setIsOpen: handleOpenChange,
      }}
    >
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {children}
      </Dialog>
    </DialogStackContext.Provider>
  );
}

export function DialogStackTrigger({ children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function DialogStackOverlay({ className, ...props }) {
  return <DialogOverlay className={className} {...props} />;
}

export function DialogStackBody({ children }) {
  const { currentIndex } = useContext(DialogStackContext);

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      {React.Children.toArray(children)[currentIndex]}
    </DialogContent>
  );
}

export function DialogStackContent({ children, className, ...props }) {
  return (
    <div className={cn('space-y-4 p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogStackHeader({ children, className, ...props }) {
  return (
    <div className={cn('space-y-2 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogStackFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'flex justify-between items-center pt-4 border-t',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogStackPrevious({ children, className, ...props }) {
  const { currentIndex, setCurrentIndex } = useContext(DialogStackContext);

  return (
    <Button
      variant="outline"
      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
      disabled={currentIndex === 0}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DialogStackNext({ children, className, ...props }) {
  const { currentIndex, setCurrentIndex } = useContext(DialogStackContext);
  const totalSteps =
    React.Children.count(React.useContext(DialogStackContext)?.children) || 4;

  return (
    <Button
      onClick={() =>
        setCurrentIndex(Math.min(totalSteps - 1, currentIndex + 1))
      }
      disabled={currentIndex >= totalSteps - 1}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
