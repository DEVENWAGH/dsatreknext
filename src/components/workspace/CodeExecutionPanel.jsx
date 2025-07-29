'use client';

import React, { useState } from 'react';
import RunButton from '../ui/RunButton';

const CodeExecutionPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput('Code executed successfully!\nOutput: Hello World');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Run Button */}
      <RunButton 
        onClick={handleRunCode}
        disabled={isRunning}
      >
        {isRunning ? 'RUNNING...' : 'RUN'}
      </RunButton>

      {/* Output Panel */}
      {output && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Output:</h3>
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPanel;