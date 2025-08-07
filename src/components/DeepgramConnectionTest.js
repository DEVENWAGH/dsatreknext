'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function DeepgramConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const testDeepgramConnection = async () => {
    setIsTesting(true);
    setError(null);
    setTestResult(null);

    try {
      // Test 1: Check if API key is available
      const keyResponse = await fetch('/api/voice-agent/key');
      const keyData = await keyResponse.json();

      if (!keyData.success) {
        throw new Error('Failed to get API key from server');
      }

      // Test 2: Test Deepgram service status
      const statusResponse = await fetch(
        '/api/deepgram/voice-agent?action=status'
      );
      const statusData = await statusResponse.json();

      // Test 3: Test Deepgram configuration
      const configResponse = await fetch(
        '/api/deepgram/voice-agent?action=config'
      );
      const configData = await configResponse.json();

      setTestResult({
        apiKeyAvailable: !!keyData.key,
        apiKey:
          keyData.key?.substring(0, 8) + '...' + keyData.key?.substring(-4),
        serviceStatus: statusData.status,
        deepgramConfigured: statusData.deepgramConfigured,
        features: configData.features,
        supportedLanguages: configData.supportedLanguages,
        models: configData.models,
      });
    } catch (err) {
      console.error('Deepgram connection test failed:', err);
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deepgram Connection Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test your Deepgram API configuration and connection
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testDeepgramConnection}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Deepgram Connection'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Connection Failed:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {testResult && (
            <div className="space-y-3">
              <Alert
                variant={testResult.apiKeyAvailable ? 'default' : 'destructive'}
              >
                {testResult.apiKeyAvailable ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>API Key:</strong>{' '}
                  {testResult.apiKeyAvailable
                    ? `Available (${testResult.apiKey})`
                    : 'Not found'}
                </AlertDescription>
              </Alert>

              <Alert
                variant={
                  testResult.deepgramConfigured ? 'default' : 'destructive'
                }
              >
                {testResult.deepgramConfigured ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>Service Status:</strong> {testResult.serviceStatus} -
                  {testResult.deepgramConfigured
                    ? ' Configured'
                    : ' Not configured'}
                </AlertDescription>
              </Alert>

              {testResult.features && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Available Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        Voice Agent:{' '}
                        {testResult.features.voiceAgent ? '✅' : '❌'}
                      </div>
                      <div>
                        Real-time STT:{' '}
                        {testResult.features.realTimeSTT ? '✅' : '❌'}
                      </div>
                      <div>
                        Real-time TTS:{' '}
                        {testResult.features.realTimeTTS ? '✅' : '❌'}
                      </div>
                      <div>
                        Multi-language:{' '}
                        {testResult.features.multiLanguage ? '✅' : '❌'}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">
                        <strong>Supported Languages:</strong>{' '}
                        {testResult.supportedLanguages?.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>STT Model:</strong> {testResult.models?.stt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>TTS Model:</strong> {testResult.models?.tts}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Configuration Details</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>
            <strong>Project ID:</strong> 5f497996-f6df-44f8-a86f-e9bea4bdb6c4
          </p>
          <p>
            <strong>API Key ID:</strong> d095b056-9286-41f3-8629-51aa80920a8a
          </p>
          <p>
            <strong>Voice Model:</strong> Nova-3 (STT) + Aura-2-Thalia (TTS)
          </p>
          <p>
            <strong>Supported Languages:</strong> English, Hindi
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
