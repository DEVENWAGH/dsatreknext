'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useProblems,
  useProblem,
  usePrefetchProblem,
} from '@/hooks/useProblems';
import { useLanguageStore } from '@/store/languageStore';
import { useUIStore } from '@/store/uiStore';
import { useSession } from 'next-auth/react';
import SubscribeButton from '@/components/ui/subscribe-button';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  List,
  Maximize2,
  Filter,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanyBadgeWithDialog } from '@/components/ui/company-logos-dialog';
import { useCompanyStore } from '@/store/companyStore';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { InviteButton } from '@/components/workspace/InviteButton';
import { LiveblocksProvider } from '@liveblocks/react/suspense';
import { CollaborativeWrapper } from '@/components/workspace/CollaborativeWrapper';

import Timer from '@/components/ui/Timer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const Workspace = dynamic(() => import('@/components/workspace/Workspace'), {
  ssr: false,
});

import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import PremiumGate from '@/components/PremiumGate';
import { checkProblemAccess, getRequiredPlan } from '@/utils/premiumUtils';

const WorkspacePage = () => {
  const { problemId } = useParams();
  const router = useRouter();
  const { data: problemsData, isLoading: problemsLoading } = useProblems(
    1,
    1000
  ); // Get all problems for navigation
  const problems = problemsData?.problems || [];
  const { data: problem, isLoading: problemLoading } = useProblem(problemId);
  const prefetchProblem = usePrefetchProblem();
  const { getCompanyFromCache } = useCompanyStore();
  const { getLanguageById } = useLanguageStore();
  const { selectedLanguage, setSelectedLanguage } = useUIStore();
  const [hasSetDefaultLanguage, setHasSetDefaultLanguage] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);
  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [panelDifficultyFilter, setPanelDifficultyFilter] = useState('all');
  const { data: session } = useSession();
  const { subscription } = usePremiumAccess();

  const searchPlaceholders = [
    'Search Two Sum...',
    'Find Array problems...',
    'Look for Google...',
    'Search Dynamic Programming...',
    'Find Binary Tree...',
  ];
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 13,
    tabSize: 4,
    wordWrap: 'on',
    lineNumbers: 'on',
  });

  const isLoading = problemsLoading || problemLoading;

  // Navigation functions - memoized for performance
  const sortedProblems = React.useMemo(() => {
    const problemsList = problemsData?.problems || [];
    if (problemsList.length === 0) return [];
    return [...problemsList].sort((a, b) => {
      const numA = parseInt(a.title.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.title.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  }, [problemsData?.problems]);

  const currentIndex = React.useMemo(
    () => sortedProblems.findIndex(p => p.id === problemId),
    [sortedProblems, problemId]
  );

  // Effect to set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prefetch adjacent problems for navigation
  useEffect(() => {
    if (sortedProblems.length > 0 && currentIndex >= 0) {
      const prefetchTimer = setTimeout(() => {
        // Prefetch previous problem
        if (currentIndex > 0) {
          prefetchProblem(sortedProblems[currentIndex - 1].id);
        }
        // Prefetch next problem
        if (currentIndex < sortedProblems.length - 1) {
          prefetchProblem(sortedProblems[currentIndex + 1].id);
        }
      }, 500);

      return () => clearTimeout(prefetchTimer);
    }
  }, [currentIndex, sortedProblems, prefetchProblem]);

  // Set up available languages based on the problem's starter code
  const availableLanguages = React.useMemo(() => {
    if (!problem?.starterCode) return [];

    const starterCodeKeys = Object.keys(problem.starterCode).filter(key =>
      problem.starterCode[key]?.trim()
    );

    // Convert language IDs (numbers) to language keys (strings) for backward compatibility
    const languages = starterCodeKeys
      .map(key => {
        // If the key is already a language key (like "JAVASCRIPT"), return it
        if (isNaN(key)) return key;

        // If the key is a number (Judge0 language ID), convert it to language key
        const languageData = getLanguageById(parseInt(key));
        return languageData?.key || null; // Return null if conversion fails
      })
      .filter(Boolean); // Remove null values

    return languages;
  }, [problem, getLanguageById]);

  // Set default language once when problem loads
  useEffect(() => {
    if (availableLanguages.length > 0 && !hasSetDefaultLanguage) {
      const defaultLang = availableLanguages.includes('CPP')
        ? 'CPP'
        : availableLanguages[0];
      setSelectedLanguage(defaultLang);
      setHasSetDefaultLanguage(true);
    }
  }, [availableLanguages, hasSetDefaultLanguage, setSelectedLanguage]);

  const handleLanguageChange = newLanguage => {
    setSelectedLanguage(newLanguage);
  };

  const handleBackToProblems = () => {
    router.back();
  };

  const handleBackToProblem = () => {
    router.back();
  };

  // Filtered problems for side panel
  const filteredPanelProblems = React.useMemo(() => {
    return sortedProblems.filter(problem => {
      const matchesSearch =
        !panelSearchQuery ||
        problem.title.toLowerCase().includes(panelSearchQuery.toLowerCase()) ||
        (problem.tags || []).some(tag =>
          tag.toLowerCase().includes(panelSearchQuery.toLowerCase())
        ) ||
        (problem.companies || []).some(companyId => {
          const company = getCompanyFromCache(companyId);
          return company?.name
            ?.toLowerCase()
            .includes(panelSearchQuery.toLowerCase());
        });

      const matchesDifficulty =
        panelDifficultyFilter === 'all' ||
        problem.difficulty.toLowerCase() ===
          panelDifficultyFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  }, [
    sortedProblems,
    panelSearchQuery,
    panelDifficultyFilter,
    getCompanyFromCache,
  ]);

  const navigateToProblem = useCallback(
    targetProblemId => {
      // Prefetch next problem data
      prefetchProblem(targetProblemId);
      router.push(`/workspace/${targetProblemId}`);
    },
    [router, prefetchProblem]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      navigateToProblem(sortedProblems[currentIndex - 1].id);
    }
  }, [currentIndex, sortedProblems, navigateToProblem]);

  const handleNext = useCallback(() => {
    if (currentIndex < sortedProblems.length - 1) {
      navigateToProblem(sortedProblems[currentIndex + 1].id);
    }
  }, [currentIndex, sortedProblems, navigateToProblem]);

  const handleRandom = useCallback(() => {
    if (sortedProblems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * sortedProblems.length);
    if (sortedProblems[randomIndex]?.id !== problemId) {
      navigateToProblem(sortedProblems[randomIndex].id);
    } else {
      const nextIndex = (randomIndex + 1) % sortedProblems.length;
      navigateToProblem(sortedProblems[nextIndex].id);
    }
  }, [sortedProblems, problemId, navigateToProblem]);

  // Show loading state only when actually loading and no cached data
  if (!isClient) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="flex-1 flex">
          <div className="w-1/2 p-4 border-r">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="w-1/2 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Always calculate access after problem is loaded
  const canAccessProblem = problem
    ? checkProblemAccess(problem, subscription)
    : true;
  const requiredPlan = problem ? getRequiredPlan(problem) : null;

  // Show loading when no problem data and still loading
  if ((!problem || !problem.description) && isLoading && isClient) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="flex-1 flex">
          <div className="w-1/2 p-4 border-r">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="w-1/2 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!problem && !isLoading && isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Problem Not Found
          </h2>
          <p className="text-muted-foreground">
            The problem you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={handleBackToProblems}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveblocksProvider
      publicApiKey={
        process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ||
        'pk_dev_55axckwuwst_EGxszKOcxex1pxWIoOg2Sa28Bk_R_ZrOG7sKZMqIHPZ0YA1dtTy_'
      }
    >
      <CollaborativeWrapper problemId={problemId}>
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProblem}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1 border-r pr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex <= 0}
                  className="h-8 w-8"
                  title="Previous Problem"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex >= sortedProblems.length - 1}
                  className="h-8 w-8"
                  title="Next Problem"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRandom}
                  className="h-8 w-8"
                  title="Random Problem"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProblemList(!showProblemList)}
                  className="h-8 w-8"
                  title="Problem List"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold truncate">
                  {problem?.title || 'Loading...'}
                </h1>
                {problem?.difficulty && (
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'easy'
                        ? 'bg-green-500/10 text-green-500'
                        : problem.difficulty === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {problem.difficulty}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Timer />
              <InviteButton problemId={problemId} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.documentElement.requestFullscreen()}
                className="h-8 w-8"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Problem List Side Panel */}
          <AnimatePresence>
            {showProblemList && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-40"
                  onClick={() => setShowProblemList(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="fixed left-0 top-0 h-full w-96 bg-background border-r shadow-xl z-50 flex flex-col"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                      Problems ({filteredPanelProblems.length})
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowProblemList(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Search and Filter */}
                  <div className="p-4 border-b space-y-3">
                    <PlaceholdersAndVanishInput
                      placeholders={searchPlaceholders}
                      onChange={setPanelSearchQuery}
                      value={panelSearchQuery}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            {panelDifficultyFilter === 'all'
                              ? 'All Levels'
                              : panelDifficultyFilter.charAt(0).toUpperCase() +
                                panelDifficultyFilter.slice(1)}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-full">
                        <DropdownMenuItem
                          onClick={() => setPanelDifficultyFilter('all')}
                        >
                          All Levels
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPanelDifficultyFilter('easy')}
                        >
                          Easy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPanelDifficultyFilter('medium')}
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPanelDifficultyFilter('hard')}
                        >
                          Hard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <SmoothScroll className="flex-1 custom-scrollbar">
                    <div className="p-4 space-y-2">
                      {filteredPanelProblems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-sm">No problems found</div>
                          <div className="text-xs mt-1">
                            Try adjusting your search or filters
                          </div>
                        </div>
                      ) : (
                        filteredPanelProblems.map(p => {
                          const companies = p.companies || [];
                          return (
                            <div
                              key={p.id}
                              className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                                p.id === problemId
                                  ? 'bg-accent border-primary'
                                  : 'hover:border-accent-foreground/20'
                              }`}
                              onClick={() => {
                                navigateToProblem(p.id);
                                setShowProblemList(false);
                              }}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-medium text-sm leading-tight">
                                  {p.title}
                                </h3>
                                <Badge
                                  className={`text-xs ${
                                    p.difficulty === 'easy'
                                      ? 'bg-green-500/10 text-green-500'
                                      : p.difficulty === 'medium'
                                        ? 'bg-yellow-500/10 text-yellow-500'
                                        : 'bg-red-500/10 text-red-500'
                                  }`}
                                >
                                  {p.difficulty}
                                </Badge>
                              </div>
                              {companies.length > 0 && (
                                <div
                                  className="mb-2"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <CompanyBadgeWithDialog
                                    companyIds={companies}
                                    maxVisible={2}
                                    variant="secondary"
                                  />
                                </div>
                              )}
                              {p.tags && p.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {p.tags.slice(0, 3).map(tag => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {p.tags.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{p.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </SmoothScroll>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Workspace */}
          <div className="flex-1 overflow-hidden relative">
            {problem && (
              <Workspace
                problem={problem}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                availableLanguages={availableLanguages}
                editorSettings={editorSettings}
                setEditorSettings={setEditorSettings}
              />
            )}

            {/* Premium/Pro Access Gate */}
            {!canAccessProblem && requiredPlan && (
              <PremiumGate problemType={requiredPlan} />
            )}
          </div>
        </div>
      </CollaborativeWrapper>
    </LiveblocksProvider>
  );
};

export default WorkspacePage;
