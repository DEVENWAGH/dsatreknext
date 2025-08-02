'use client';

import React, { memo } from 'react';
import ProblemTable from './ProblemTable';

// Simple wrapper that uses the existing ProblemTable
const VirtualizedProblemTable = memo(() => {
  return <ProblemTable />;
});

VirtualizedProblemTable.displayName = 'VirtualizedProblemTable';

export default VirtualizedProblemTable;
