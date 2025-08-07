# Deepgram Voice Agent Setup Guide

## Overview

Your DSATrek application now includes comprehensive voice interview capabilities using Deepgram's Voice Agent API with Nova-3 for speech-to-text and text-to-speech services.

## Features Implemented

### 1. **Deepgram Voice Agent Service** (`src/services/deepgramVoiceAgent.js`)

- Real-time voice conversation with AI interviewer
- Nova-3 speech recognition for high accuracy
- Aura TTS for natural voice responses
- Automatic question flow management
- Conversation transcript logging

### 2. **React Hook for Voice Interviews** (`src/hooks/useDeepgramInterview.js`)

- Easy integration with React components
- State management for interview flow
- Real-time audio handling
- Error handling and recovery

### 3. **Enhanced Interview Component** (`src/components/EnhancedVoiceInterview.js`)

- Multi-service support (Deepgram, VAPI, Jarvis, Native)
- Real-time interview controls
- Live conversation display
- Debug mode for troubleshooting

### 4. **AI Feedback Generation** (`src/services/interviewFeedbackService.js`)

- Comprehensive interview analysis
- Voice-specific performance metrics
- Detailed recommendations
- Professional report generation

### 5. **Feedback Display Component** (`src/components/InterviewFeedbackDisplay.js`)

- Beautiful feedback visualization
- Skill-wise analysis
- Voice quality assessment
- Downloadable reports

## Setup Instructions

### 1. Get Deepgram API Key

1. Visit [Deepgram Console](https://console.deepgram.com/)
2. Sign up or log in
3. Create a new project
4. Generate an API key
5. Copy the API key for environment setup

### 2. Environment Configuration

Add to your `.env.local` file:

```bash
# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key_here
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 3. Install Dependencies

```bash
yarn add @deepgram/sdk
```

### 4. Integration Example

```javascript
import { useDeepgramInterview } from '@/hooks/useDeepgramInterview';
import DeepgramVoiceInterview from '@/components/DeepgramVoiceInterview';

function InterviewPage() {
  const interviewConfig = {
    position: 'Software Engineer',
    interviewType: 'Technical',
    language: 'english', // or 'hindi'
    candidateName: 'John Doe',
  };

  return (
    <DeepgramVoiceInterview
      interviewConfig={interviewConfig}
      onInterviewComplete={result => {
        console.log('Interview completed:', result);
      }}
      onInterviewCancel={() => {
        // Handle cancellation
      }}
    />
  );
}
```

## Workflow

### 1. **Interview Creation**

- User fills interview details form
- Gemini generates questions based on job requirements
- System prepares interview configuration

### 2. **Voice Interview**

- Deepgram Voice Agent initializes
- AI asks questions using natural voice
- User responds via microphone
- Real-time transcript generation
- Automatic question progression

### 3. **Conversation Flow**

```
AI: "Hello! Welcome to your Software Engineer interview..."
User: "Hello, thank you. I'm ready to begin."
AI: "Great! Let's start with the first question..."
[Interview continues with natural conversation]
```

### 4. **Post-Interview Analysis**

- Complete transcript analysis
- AI-generated feedback using Gemini
- Voice-specific metrics (clarity, confidence)
- Detailed recommendations
- Professional report generation

## API Endpoints

### Voice Agent

- `POST /api/deepgram/voice-agent` - Start/manage voice agent
- `GET /api/deepgram/voice-agent?action=status` - Check service status

### Feedback Generation

- `POST /api/interview/feedback` - Generate interview feedback
- `GET /api/interview/feedback?action=status` - Check feedback service

## Voice Agent Configuration

### Interview Prompts

The system creates dynamic prompts based on:

- Job position and requirements
- Interview type (Technical, Behavioral, etc.)
- Difficulty level
- Language preference (English/Hindi)

### Audio Settings

- **Input**: Linear16, 24kHz sampling rate
- **Output**: Linear16, 16kHz for TTS
- **Models**: Nova-3 for STT, Aura-2-Thalia for TTS
- **Language**: Supports English and Hindi

## Features

### Real-time Capabilities

- ✅ Live speech recognition
- ✅ Natural AI responses
- ✅ Conversation flow management
- ✅ Real-time transcript display
- ✅ Audio level monitoring

### Interview Management

- ✅ Multi-language support
- ✅ Dynamic question generation
- ✅ Progress tracking
- ✅ Interview state management
- ✅ Error handling and recovery

### Post-Interview Analytics

- ✅ Comprehensive feedback generation
- ✅ Voice quality analysis
- ✅ Technical skill assessment
- ✅ Communication evaluation
- ✅ Downloadable reports

## Troubleshooting

### Common Issues

1. **Microphone Access**
   - Ensure browser permissions are granted
   - Check system microphone settings
   - Test with other applications

2. **API Key Issues**
   - Verify Deepgram API key is correct
   - Check environment variable names
   - Ensure key has sufficient credits

3. **Audio Quality**
   - Use a good quality microphone
   - Minimize background noise
   - Speak clearly and at normal pace

4. **Connection Issues**
   - Check internet connectivity
   - Verify firewall settings
   - Test with different browsers

### Debug Mode

Enable debug mode in the interview component to see:

- WebSocket connection status
- Audio chunk processing
- Transcript generation
- Error messages

## Best Practices

### For Candidates

1. **Environment Setup**
   - Quiet room with minimal echo
   - Good internet connection
   - Quality headset or microphone

2. **During Interview**
   - Speak clearly and at normal pace
   - Wait for questions to complete
   - Provide complete answers

### For Developers

1. **Error Handling**
   - Implement retry mechanisms
   - Provide fallback options
   - Log errors for debugging

2. **Performance**
   - Monitor API usage
   - Implement rate limiting
   - Cache responses when possible

## Future Enhancements

- [ ] Multi-speaker interview support
- [ ] Real-time emotion detection
- [ ] Advanced audio processing
- [ ] Integration with calendar systems
- [ ] Video interview capabilities
- [ ] Behavioral analysis
- [ ] Custom voice models

## Support

For issues or questions:

1. Check Deepgram documentation
2. Review error logs in debug mode
3. Test with sample interviews
4. Contact Deepgram support if needed

---

This implementation provides a complete voice interview solution with professional-grade features and comprehensive feedback generation.
