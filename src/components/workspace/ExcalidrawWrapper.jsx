'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useState, useEffect } from 'react';

const ExcalidrawWrapper = ({ problemId }) => {
  const [isLoaded, setIsLoaded] = useState(false);

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

  return (
    <div className="h-full w-full">
      <Excalidraw
        initialData={{
          elements,
          appState: {
            ...appState,
            theme: 'dark',
            viewBackgroundColor: '#1a1a1a',
            collaborators: new Map(),
          },
        }}
        onChange={handleChange}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
