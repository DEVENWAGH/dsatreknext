'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Navbar from '@/app/visualizer/components/Navbar';
import GlobalEditProfileDialog from '@/components/GlobalEditProfileDialog';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    );
  }

  const hideNavigation =
    pathname?.startsWith('/workspace/') ||
    pathname?.startsWith('/start-interview/') ||
    pathname?.startsWith('/visualizer');
  const isVisualizerPage = pathname?.startsWith('/visualizer');

  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <Navigation />}
      {isVisualizerPage && <Navbar />}
      <main className={isVisualizerPage ? 'pt-20' : ''}>{children}</main>
      <GlobalEditProfileDialog />
    </div>
  );
}
