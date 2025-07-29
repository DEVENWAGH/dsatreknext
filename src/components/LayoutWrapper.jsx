'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Navbar from '@/app/visualizer/components/Navbar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
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
    </div>
  );
}
