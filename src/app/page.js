'use client';

import { useEffect } from 'react';
import { useProblems, usePrefetchProblem } from '@/hooks/useProblems';
import LandingPage from '@/components/LandingPage';
import Footer from '@/components/Footer';

export default function Home() {
  const { data: problems = [] } = useProblems();
  const prefetchProblem = usePrefetchProblem();

  // Prefetch ALL problem details for instant workspace loading
  useEffect(() => {
    if (problems?.length > 0) {
      setTimeout(() => {
        problems.forEach((problem, index) => {
          setTimeout(() => {
            prefetchProblem(problem.id);
          }, index * 100);
        });
      }, 1000);
    }
  }, [problems, prefetchProblem]);

  return (
    <>
      <LandingPage />
      <Footer />
    </>
  );
}
