# Custom Voice Agent Installation Guide

## Overview

The Custom Voice Agent is a complete replacement for the Deepgram Voice Agent, using:

- **STT (Speech-to-Text)**: Deepgram Nova-2 API
- **AI Model**: Google Gemini 1.5 Pro with LangChain.js
- **TTS (Text-to-Speech)**: Deepgram Aura TTS API
- **Memory Management**: LangChain Buffer Memory for conversation context

## Required Dependencies

The following packages have been added to package.json:

```json
{
  "@langchain/core": "^0.3.12",
  "@langchain/google-genai": "^0.1.2",
  "langchain": "^0.3.6"
}
```

## Installation Steps

1. **Install the new dependencies:**

   ```bash
   npm install @langchain/core @langchain/google-genai langchain
   ```

2. **Environment Variables:**
   Make sure you have both API keys in your `.env.local`:

   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Usage:**
   The custom voice agent can be used through the `useCustomVoiceInterview` hook:

   ```javascript
   import { useCustomVoiceInterview } from '@/hooks/useCustomVoiceInterview';

   const {
     isConnected,
     isListening,
     isSpeaking,
     conversation,
     error,
     status,
     startInterview,
     endInterview,
   } = useCustomVoiceInterview(interviewConfig);
   ```

## Key Features

### 🎯 **Advanced AI Conversation**

- Uses Google Gemini 1.5 Pro for natural interview conversations
- LangChain.js for structured conversation flow and memory management
- Context-aware responses based on interview type and position

### 🎤 **High-Quality Audio Processing**

- Deepgram Nova-2 for accurate speech recognition
- Real-time audio streaming with Web Audio API
- Optimized for interview scenarios with proper endpointing

### 🔊 **Natural Text-to-Speech**

- Deepgram Aura TTS for human-like voice synthesis
- Multiple voice options (Asteria, Luna, Stella)
- Language support for English and Hindi

### 🧠 **Intelligent Memory Management**

- Conversation history tracking
- Context-aware follow-up questions
- Interview progress tracking

### 🔧 **Robust Error Handling**

- Graceful fallbacks for API failures
- Microphone access error handling
- Connection retry mechanisms

## API Endpoints

### GET `/api/voice-agent/config`

Returns configuration and API key validation:

```json
{
  "success": true,
  "deepgramApiKey": "***",
  "geminiApiKey": "***",
  "features": {
    "stt": true,
    "tts": true,
    "ai": true,
    "customAgent": true,
    "langchain": true
  }
}
```

## File Structure

```
src/
├── services/
│   └── customVoiceAgent.js          # Main voice agent implementation
├── hooks/
│   └── useCustomVoiceInterview.js   # React hook for voice interviews
├── components/
│   └── CustomVoiceInterviewTest.js  # Test component
└── app/api/voice-agent/
    └── config/route.js              # API configuration endpoint
```

## Testing

Use the `CustomVoiceInterviewTest` component to test the implementation:

```javascript
import CustomVoiceInterviewTest from '@/components/CustomVoiceInterviewTest';

function TestPage() {
  return <CustomVoiceInterviewTest />;
}
```

## Configuration Options

The voice agent supports various configuration options:

```javascript
const interviewConfig = {
  position: 'Front-End Developer',
  interviewType: 'Technical Interview',
  language: 'english', // or 'hindi'
  difficulty: 'medium', // 'easy', 'medium', 'hard'
  duration: '30 minutes',
  questions: [
    'Tell me about yourself...',
    'What is your experience with React?',
    // ... more questions
  ],
};
```

## Comparison: Old vs New

| Feature        | Old (Deepgram Voice Agent) | New (Custom Voice Agent) |
| -------------- | -------------------------- | ------------------------ |
| STT            | Deepgram Nova-3            | Deepgram Nova-2          |
| AI Model       | OpenAI GPT-4o-mini         | Google Gemini 1.5 Pro    |
| TTS            | Deepgram Aura              | Deepgram Aura            |
| Framework      | Direct Deepgram Agent API  | Custom implementation    |
| Memory         | Basic conversation log     | LangChain Buffer Memory  |
| Error Handling | Limited                    | Comprehensive            |
| Customization  | Minimal                    | Highly customizable      |
| Performance    | Good                       | Optimized                |

## Benefits of the New Implementation

1. **Better AI Responses**: Gemini 1.5 Pro provides more natural and contextual responses
2. **Improved Memory**: LangChain manages conversation context more effectively
3. **Enhanced Control**: Full control over the conversation flow and interview logic
4. **Better Error Handling**: Robust error recovery and fallback mechanisms
5. **Cost Optimization**: More efficient API usage with better resource management
6. **Customizable**: Easy to modify prompts, add features, and integrate with other systems

## Troubleshooting

### Common Issues:

1. **Microphone Access Denied**
   - Ensure HTTPS is enabled in production
   - Check browser permissions for microphone access

2. **API Key Errors**
   - Verify both DEEPGRAM_API_KEY and GEMINI_API_KEY are set
   - Check API key validity and quotas

3. **Audio Playback Issues**
   - Ensure Web Audio API is supported in the browser
   - Check audio output device settings

4. **LangChain Import Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if needed

## Next Steps

1. **Install Dependencies**: Run `npm install` to get the LangChain packages
2. **Configure API Keys**: Set up both Deepgram and Gemini API keys
3. **Test Implementation**: Use the test component to verify everything works
4. **Replace Usage**: Switch from `useDeepgramInterview` to `useCustomVoiceInterview`
5. **Customize**: Modify prompts and configuration for your specific use case

The new Custom Voice Agent provides a much more flexible and powerful foundation for voice-based interviews while maintaining compatibility with the existing interface.
