import { cn } from '@/lib/utils';
import React from 'react';

export function GridBackground({ className, children }) {
  return (
    <div className={cn('relative w-full h-full', className)}>
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          '[background-size:32px_32px]',
          '[background-image:linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)]',
          'dark:[background-image:linear-gradient(to_right,#404040_1px,transparent_1px),linear-gradient(to_bottom,#404040_1px,transparent_1px)]'
        )}
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
