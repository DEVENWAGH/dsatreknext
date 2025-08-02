'use client';

import { useMemo } from 'react';

const AvatarFallback = ({ name, size = 32, className = '' }) => {
  const initial = useMemo(() => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }, [name]);

  return (
    <div
      className={`flex items-center justify-center bg-black text-white font-semibold rounded-full ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
};

export default AvatarFallback;
