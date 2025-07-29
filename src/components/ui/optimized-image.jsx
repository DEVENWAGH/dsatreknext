'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function OptimizedImage({
  src,
  alt,
  className,
  width = 500,
  height = 300,
  fallbackText,
}) {
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Handle image load error
  const handleError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative my-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-md">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {isError ? (
        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-md bg-muted/20 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2 text-muted-foreground"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <p className="text-sm font-medium">Image failed to load</p>
          {fallbackText && <p className="text-xs mt-1">{fallbackText}</p>}
          <p
            className="text-xs mt-2 text-primary hover:underline cursor-pointer"
            onClick={() => window.open(src, '_blank')}
          >
            View image source
          </p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || 'Problem illustration'}
          width={width}
          height={height}
          className={cn(
            'rounded-md max-w-full h-auto border border-border/30',
            isLoading && 'opacity-0',
            className
          )}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}
