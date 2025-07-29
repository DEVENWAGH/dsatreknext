'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const BatchManager = ({
  batchQueue,
  batchResults,
  isBatchProcessing,
  isLoading,
  executeBatch,
  clearBatch,
  getBatchStats,
  updateBatchConfig,
  batchConfig,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState(batchConfig);

  const stats = getBatchStats();

  const handleConfigUpdate = () => {
    updateBatchConfig(configForm);
    setShowConfig(false);
    toast.success('Batch configuration updated');
  };

  const getStatusIcon = result => {
    if (result.success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeColor = type => {
    switch (type) {
      case 'submission':
        return 'bg-blue-100 text-blue-800';
      case 'run':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Batch Operations
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {stats.queueLength > 0 && (
            <Badge variant="secondary">{stats.queueLength} queued</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configuration Panel */}
        {showConfig && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Batch Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Max Batch Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configForm.maxBatchSize}
                    onChange={e =>
                      setConfigForm(prev => ({
                        ...prev,
                        maxBatchSize: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">
                    Batch Delay (ms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={configForm.batchDelay}
                    onChange={e =>
                      setConfigForm(prev => ({
                        ...prev,
                        batchDelay: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfigUpdate}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfig(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">
              {stats.queueLength}
            </div>
            <div className="text-xs text-gray-500">Queued</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedBatches}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">
              {stats.types.submissions}
            </div>
            <div className="text-xs text-gray-500">Submissions</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-600">
              {stats.types.runs}
            </div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
        </div>

        <Separator />

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={executeBatch}
            disabled={stats.queueLength === 0 || isBatchProcessing || isLoading}
            className="flex-1"
          >
            {isBatchProcessing || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Batch ({stats.queueLength})
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={clearBatch}
            disabled={stats.queueLength === 0 || isBatchProcessing}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Processing Progress */}
        {(isBatchProcessing || isLoading) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing batch operations...</span>
              <span>
                {stats.completedBatches}/{stats.queueLength}
              </span>
            </div>
            <Progress
              value={
                (stats.completedBatches / Math.max(stats.queueLength, 1)) * 100
              }
              className="h-2"
            />
          </div>
        )}

        {/* Queue Display */}
        {batchQueue.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Queued Operations</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {batchQueue.slice(0, 5).map(operation => (
                <div
                  key={operation.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(operation.type)}>
                      {operation.type}
                    </Badge>
                    <span className="font-mono text-xs">
                      {operation.language}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(operation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {batchQueue.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  ... and {batchQueue.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Display */}
        {batchResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Results</div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {batchResults.slice(-10).map(result => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <Badge className={getTypeColor(result.operation?.type)}>
                      {result.operation?.type}
                    </Badge>
                    <span className="font-mono text-xs">
                      {result.operation?.language}
                    </span>
                  </div>
                  <div className="text-xs">
                    {result.success ? (
                      <span className="text-green-600">
                        {result.result?.allPassed
                          ? 'All Passed'
                          : `${result.result?.passedCount}/${result.result?.totalTestCases}`}
                      </span>
                    ) : (
                      <span className="text-red-600">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {batchQueue.length === 0 && batchResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">No batch operations yet</div>
            <div className="text-xs">
              Submit code or run tests to add to batch
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchManager;
