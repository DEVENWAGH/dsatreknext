'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const OptimizedImage = React.memo(
  ({
    src,
    alt,
    width,
    height,
    className = '',
    fallback = '/user.png',
    priority = false,
    ...props
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
    }, []);

    if (hasError) {
      return (
        <Image
          src={fallback}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <Skeleton
            className={`absolute inset-0 ${className}`}
            style={{ width, height }}
          />
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
