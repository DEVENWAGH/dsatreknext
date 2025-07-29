import React from 'react';
import { ProblemDisplay } from '@/components/ProblemDisplay';

const ProblemEditorial = ({ problem }) => {
  if (!problem?.editorial) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Editorial</h3>
        <div className="text-muted-foreground">
          No editorial available for this problem yet.
        </div>
      </div>
    );
  }

  // Use editorial content directly
  const editorialContent = problem.editorial;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Editorial</h3>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {/* Pass only editorial content without additional Editorial header */}
        <ProblemDisplay description={editorialContent} className="max-w-none" />
      </div>
    </div>
  );
};

export default ProblemEditorial;
