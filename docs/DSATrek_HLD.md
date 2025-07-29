# DSATrek High-Level Design (HLD) Documentation

## 1. Overview

DSATrek is a modern web platform for mastering Data Structures & Algorithms, featuring AI-powered interviews, analytics, and a collaborative community. Built with Next.js 14, Drizzle ORM, Zustand, and integrated with OpenAI and Vapi AI.

---

## 2. Architecture Diagram

```
[Client: React/Next.js]
    |
    |---> [App Router: /src/app]
    |---> [Components: /src/components]
    |---> [State: Zustand Stores]
    |
[API Layer: /src/app/api]
    |
    |---> [Database: Drizzle ORM + PostgreSQL]
    |
    |---> [AI Services: OpenAI/OpenRouter, Vapi AI]
    |
[External Integrations]
    |---> [Liveblocks.io, Yjs, Monaco Editor]
```

---

## 3. Major Modules

### 3.1 App Router (`src/app`)

- Handles routing, layouts, and SSR.
- Pages: Home, Problems, Interview, Community, Profile, Terms, Privacy.

### 3.2 Components (`src/components`)

- UI: Buttons, Cards, Dialogs, Forms, Charts.
- Feature: InterviewForm, UserInterviews, CommunityPost, AnalyticsDashboard.

### 3.3 State Management (`src/store`)

- Zustand stores for auth, UI, problems, interviews, community.

### 3.4 API Layer (`src/app/api`)

- RESTful endpoints for problems, users, interviews, submissions, analytics.
- Error handling via centralized middleware.

### 3.5 Database (`src/lib/schema`)

- Drizzle ORM schemas for User, Problem, Submission, Interview, Community, Comments, Votes.

### 3.6 AI Integration (`src/services`)

- `aiService.js`: Interview question generation, feedback.
- `voiceInterviewService.js`: Voice-based interview management.

### 3.7 Analytics

- Submission tracking, streaks, acceptance rates, heatmaps.
- Real-time dashboard with charts and progress bars.

---

## 4. Data Flow

1. **User Actions**: UI triggers API calls via Zustand actions.
2. **API Layer**: Validates, processes, and interacts with Drizzle ORM.
3. **Database**: Stores/retrieves normalized data.
4. **AI Services**: Generates interview questions and feedback.
5. **Frontend**: Displays analytics, interview results, and community posts.

---

## 5. Extensibility

- Modular schema: Easily add new tables (e.g., badges, notifications).
- API-first: New endpoints can be added with standardized error handling.
- Pluggable AI: Swap/upgrade models via service abstraction.
- UI: New features/components can be added in `/src/components`.

---

## 6. Security & Error Handling

- Authentication: NextAuth with OAuth and credentials.
- API: Centralized error handler, JSON responses.
- SSR: All components SSR-safe.
- Input validation: On both client and server.

---

## 7. Deployment

- Vercel/Netlify/AWS-ready.
- Health check endpoints for monitoring.
- Environment variables for secrets and API keys.

---

## 8. Future Enhancements

- Video interviews, advanced analytics, mobile app, calendar integration.
- Real-time notifications, gamification, more AI models.

---

## 9. References

- See `README.md` for setup and usage.
- See `DEPLOYMENT_FIXES.md` for deployment best practices.
- See `AI_INTERVIEW_README.md` and `ANALYTICS_IMPLEMENTATION.md` for feature details.

---

## 10. Contact

For architecture questions, reach out to DSATrek Support: wagh@dsatrek.com
