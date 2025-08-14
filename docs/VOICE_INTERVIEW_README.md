# Voice Interview Integration

## Overview

This implementation uses **Deepgram** for Speech-to-Text (STT) and Text-to-Speech (TTS), combined with **Google Gemini** LLM for intelligent interview responses.

## Architecture

- **Voice Agent**: Deepgram's integrated Voice Agent API
- **STT**: Deepgram Nova-2 model (handled internally)
- **TTS**: Deepgram Aura Asteria voice model (handled internally)
- **LLM**: OpenAI GPT-4o-mini (handled internally)
- **Real-time**: Single WebSocket connection for complete voice interaction

## Setup

### 1. Environment Variables

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key
```

### 2. API Keys

- **Deepgram**: Get from [deepgram.com](https://deepgram.com) (includes Voice Agent access)

## Usage

### Starting an Interview

```javascript
import { useDeepgramVoiceInterview } from '@/hooks/useDeepgramVoiceInterview';

const {
  isConnected,
  isListening,
  isSpeaking,
  conversation,
  startInterview,
  endInterview,
} = useDeepgramVoiceInterview(interviewConfig);
```

### Interview Flow

1. **Initialize**: Connect to Deepgram Voice Agent
2. **Configure**: Set interview context and AI prompt
3. **Start**: Voice Agent handles complete conversation flow
4. **Interact**: Real-time speech-to-speech conversation
5. **End**: Get complete transcript and statistics

## Features

- ✅ Real-time speech recognition
- ✅ Natural voice synthesis
- ✅ Context-aware AI responses
- ✅ Conversation history tracking
- ✅ Error handling and recovery
- ✅ Microphone permission handling

## File Structure

```
src/
├── services/
│   └── deepgramVoiceAgent.js     # Core voice agent
├── hooks/
│   └── useDeepgramVoiceInterview.js  # React hook
└── app/
    └── start-interview/
        └── [interviewId]/
            └── page.js           # Interview UI
```

## API Endpoints

- `GET /api/voice-agent/config` - Get API keys and configuration
- `POST /api/generate-feedback` - Generate interview feedback

## Troubleshooting

### Common Issues

1. **Microphone Access**: Ensure HTTPS or localhost
2. **API Keys**: Verify Deepgram and Gemini keys are valid
3. **WebSocket**: Check network connectivity
4. **Audio Playback**: Ensure browser audio permissions

### Debug Mode

Enable console logging to see real-time status:

```javascript
console.log('Voice Agent Status:', status);
console.log('Conversation:', conversation);
```
