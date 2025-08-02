'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';

import Home from './components/Home';
import SortingVisualizer from './components/sorting/SortingVisualizer';
import SearchVisualizer from './components/searching/SearchVisualizer';
import GraphVisualizer from './components/graph/GraphVisualizer';
import DPVisualizer from './components/dp/DPVisualizer';
import GreedyVisualizer from './components/greedy/GreedyVisualizer';
import BacktrackingVisualizer from './components/backtracking/BacktrackingVisualizer';
import TreeVisualizer from './components/tree/TreeVisualizer';
import MathVisualizer from './components/mathematical/MathVisualizer';
import ErrorBoundary from './components/ErrorBoundary';
import RaceMode from './components/race/RaceMode';
import FAQ from './components/FAQ';
import Sidebar from './components/Sidebar';
import './App.css';
import './index.css';
import './dsatrek-theme.css';

const VisualizerContent = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'home';
  const algorithm = searchParams.get('algorithm');
  const showSidebar = category !== 'home';
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Ensure theme is applied when visualizer loads
  useEffect(() => {
    if (resolvedTheme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  const renderContent = () => {
    switch (category) {
      case 'sorting':
        return <SortingVisualizer />;
      case 'searching':
        return <SearchVisualizer />;
      case 'graph':
        return <GraphVisualizer />;
      case 'dynamic-programming':
        return <DPVisualizer />;
      case 'greedy-algorithm':
        return <GreedyVisualizer />;
      case 'backtracking':
        return <BacktrackingVisualizer />;
      case 'tree-algorithms':
        return <TreeVisualizer />;
      case 'mathematical-algorithms':
        return <MathVisualizer />;
      case 'race-mode':
        return <RaceMode />;
      case 'faq':
        return <FAQ />;
      default:
        return <Home />;
    }
  };

  return (
    <div
      className={`visualizer-container flex w-screen ${category === 'graph' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
    >
      {/* Sidebar only on xl and above */}
      {showSidebar && (
        <aside className="visualizer-sidebar hidden min-[1280px]:block min-[1280px]:fixed min-[1280px]:top-0 min-[1280px]:left-0 min-[1280px]:w-64 min-[1280px]:h-screen">
          <Sidebar />
        </aside>
      )}
      <div
        className={`flex-1 transition-all duration-0 ${showSidebar ? 'min-[1281px]:ml-64' : 'min-[1281px]:ml-0'}`}
      >
        <ErrorBoundary>{renderContent()}</ErrorBoundary>
      </div>
    </div>
  );
};

const VisualizerPage = () => {
  return (
    <Suspense fallback={<div className="visualizer-container min-h-screen" />}>
      <VisualizerContent />
    </Suspense>
  );
};

export default VisualizerPage;
