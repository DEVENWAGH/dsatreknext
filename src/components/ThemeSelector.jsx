'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedToggle from './AnimatedToggle';

const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('default');
  const [isDark, setIsDark] = useState(false);

  const themes = {
    default: { name: 'Default', color: 'from-amber-500 to-yellow-600' },
    github: { name: 'GitHub', color: 'from-blue-500 to-blue-600' },
    monokai: { name: 'Monokai', color: 'from-green-500 to-cyan-500' },
    ayu: { name: 'Ayu', color: 'from-orange-500 to-yellow-500' },
    horizon: { name: 'Horizon', color: 'from-pink-500 to-rose-500' },
    everforest: { name: 'Everforest', color: 'from-green-500 to-emerald-500' },
    dune: { name: 'Dune', color: 'from-yellow-600 to-amber-600' },
    onedark: { name: 'Knight Dark', color: 'from-gray-600 to-gray-700' },
    dracula: { name: 'Dracula', color: 'from-purple-500 to-pink-500' },
    tokyo: { name: 'Tokyo Night', color: 'from-indigo-500 to-purple-500' },
  };

  const changeTheme = newTheme => {
    setTheme(newTheme);
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '');
    if (newTheme !== 'default') {
      root.classList.add(`theme-${newTheme}`);
    }
  };

  const toggleMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border-amber-500/30 text-amber-600 hover:text-amber-500 transition-all duration-300 px-6 py-2 rounded-full border-2 shadow-lg shadow-amber-500/10"
      >
        <Palette className="w-4 h-4" />
        Themes
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-4 lg:inset-auto lg:top-16 lg:right-4 flex items-center justify-center lg:items-start lg:justify-end z-[9999]"
            >
              <Card className="w-96 lg:w-48 xl:w-80 max-h-[80vh] lg:max-h-[60vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border shadow-2xl">
                <CardContent className="p-4 lg:p-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsOpen(false)}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h3 className="font-semibold text-foreground">
                          Choose Theme
                        </h3>
                      </div>
                      <AnimatedToggle checked={isDark} onChange={toggleMode} />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Current: {themes[theme]?.name} (
                      {isDark ? 'Dark' : 'Light'})
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(themes).map(([key, themeData]) => (
                        <button
                          key={key}
                          onClick={() => changeTheme(key)}
                          className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                            theme === key
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-gray-300 hover:border-amber-400 bg-white/50 dark:bg-gray-800/50 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeData.color} shadow-sm`}
                            />
                            <span className="text-sm font-medium truncate">
                              {themeData.name}
                            </span>
                          </div>

                          {theme === key && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-3 h-3 text-amber-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-2">
                        Preview
                      </div>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-primary" />
                        <div className="w-4 h-4 rounded bg-secondary" />
                        <div className="w-4 h-4 rounded bg-accent" />
                        <div className="w-4 h-4 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
