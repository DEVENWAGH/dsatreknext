'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ui/theme-provider';

const ExcalidrawWrapper = ({ problemId }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Set Excalidraw asset path
    if (typeof window !== 'undefined') {
      window.EXCALIDRAW_ASSET_PATH = window.location.origin + '/';
    }
    setIsLoaded(true);
  }, []);

  const handleChange = (elements, appState) => {
    const sketchData = {
      elements,
      appState,
      problemId,
      timestamp: Date.now(),
    };
    localStorage.setItem(`sketch-${problemId}`, JSON.stringify(sketchData));
  };

  const loadSketchData = () => {
    try {
      const saved = localStorage.getItem(`sketch-${problemId}`);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          elements: data.elements || [],
          appState: {
            ...data.appState,
            // Always ensure collaborators is a Map per Excalidraw API
            collaborators: new Map(),
          } || { collaborators: new Map() },
        };
      }
    } catch (error) {
      console.error('Error loading sketch data:', error);
    }
    return { elements: [], appState: { collaborators: new Map() } };
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading sketch canvas...</div>
      </div>
    );
  }

  const { elements, appState } = loadSketchData();

  // Derive excalidraw theme from site theme; default to light
  const excalidrawTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Respect saved background if present; otherwise choose sensible default per theme
  const defaultBg = excalidrawTheme === 'dark' ? '#1a1a1a' : '#ffffff';
  const initialAppState = {
    ...appState,
    theme: excalidrawTheme,
    viewBackgroundColor: appState?.viewBackgroundColor ?? defaultBg,
    collaborators: new Map(),
  };

  return (
    <div className="h-full w-full">
      <Excalidraw
        // Keep Excalidraw UI in sync with site theme
        theme={excalidrawTheme}
        initialData={{
          elements,
          appState: initialAppState,
        }}
        onChange={handleChange}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
