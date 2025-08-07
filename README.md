<div align="center">
  <span style="display:inline-flex; align-items:center;">
    <span style="font-size:6.2em; font-weight:bold; vertical-align:middle; color:#000;">D</span>
    <span style="font-size:6.2em; font-weight:bold; vertical-align:middle; color:#FFD700;">SATrek</span>
  </span>
</div>

**Status:** Active  
**License:** MIT  
**Frameworks:** Next.js 15, React, Tailwind CSS

[dsatrek.com](https://dsatrek.com)

---

## Overview

DSATrek is a cutting-edge platform for mastering Data Structures & Algorithms, acing interviews, and collaborating with a vibrant tech community. Built with Next.js 15, Drizzle ORM, Zustand, and powered by AI integrations, DSATrek offers everything you need to learn, practice, analyze, and grow as a developer.

---

## 🚀 What DSATrek Offers

- **DSA Problem Solving**: Hundreds of curated problems with step-by-step visualizations (Array, String, Tree, Graph, DP, Greedy, Backtracking, and more)
- **AI-Powered Interviews**: Generate and practice coding interviews with Deepgram STT/TTS and Gemini LLM. Real-time voice interview support.
- **Advanced Analytics**: Track your streaks, acceptance rates, skill level, and more with interactive dashboards and heatmaps.
- **Real-Time Collaboration**: Code together, join rooms, and share solutions with others using Liveblocks.io and Yjs.
- **Rich Community**: Post, discuss, and learn with other users. Community features for sharing, voting, and commenting.
- **Modern UI/UX**: Responsive, theme-aware design with dark/light mode, animated transitions, and beautiful components.
- **Secure Authentication**: Auth.js v5 with Google & GitHub providers. OAuth and credentials support.
- **Performance & Reliability**: SSR-optimized, error boundaries, debounced functions, and robust API services.
- **Customizable Experience**: Adjustable parameters, multiple algorithm selection, and detailed analytics breakdowns.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Animation**: Framer Motion, GSAP, Motion
- **Icons**: Lucide React, Tabler Icons
- **Database**: Drizzle ORM, PostgreSQL, Neon
- **State Management**: Zustand
- **UI Components**: Radix UI, shadcn/ui, MagicUI, custom components
- **Rich Text Editor**: Plate.js, Excalidraw
- **Collaboration**: Liveblocks.io, Yjs, Monaco Editor, y-monaco
- **AI Services**: OpenAI, Gemini, Vapi, Deepgram, Google Generative AI
- **Authentication**: Auth.js v5 (Google, GitHub), NextAuth
- **Analytics**: Google Analytics, Vercel Analytics, Speed Insights
- **File Uploads**: UploadThing
- **Utilities**: Zod, Lodash, clsx, nanoid, uuid, date-fns
- **Styling**: Tailwind CSS, styled-components, tailwind-merge, tailwind-scrollbar
- **Other**: D3, Razorpay, Nodemailer, Sonner, Recharts, pdf-lib, html2canvas-pro

---

## 📁 Project Structure

```
src/
├── api/                  # API route handlers
├── app/                  # Next.js App Router & main app logic
│   ├── admin/            # Admin dashboard and features
│   ├── api/              # App-specific API endpoints
│   ├── auth/             # Authentication pages
│   ├── community/        # Community features
│   ├── components/       # App-level UI components
│   │   ├── ui/           # UI primitives (buttons, cards, etc.)
│   │   ├── magicui/      # Magic UI components
│   │   └── optimized/    # Optimized components
│   ├── contests/         # Coding contests
│   ├── interview/        # Interview features
│   ├── interview-details/# Interview details pages
│   ├── pricing/          # Pricing pages
│   ├── problems/         # DSA problems and solutions
│   ├── profile/          # User profile pages
│   ├── scroll-demo/      # Scroll demo features
│   ├── start-interview/  # Start interview workflow
│   ├── terms/            # Terms and conditions
│   ├── visualizer/       # Algorithm visualizer
│   ├── workspace/        # Collaborative workspace
├── components/           # Global reusable UI components
│   ├── ActivityHeatmap.jsx
│   ├── AnalyticsDashboard.jsx
│   ├── ...
├── fonts/                # Custom fonts
├── hooks/                # Custom React hooks
├── lib/                  # Core libraries and utilities
├── services/             # API services
├── store/                # State management
├── utils/                # Utility functions
```

## 🚀 Key Features

- **Server-Side Rendering (SSR)** optimized components
- **Theme-aware** logo handling with proper SSR support
- **Error Boundaries** for graceful error handling
- **Custom Hooks** for reusable logic
- **Optimized API Service** with retry logic and proper error handling
- **Centralized Constants** for better maintainability
- **Utility Functions** for common operations
- **Loading Components** for better UX
- **Real-time Collaboration** for coding together with other users

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Animation**: Framer Motion, GSAP, Motion
- **Icons**: Lucide React, Tabler Icons
- **Database**: Drizzle ORM, PostgreSQL, Neon
- **State Management**: Zustand
- **UI Components**: Radix UI, shadcn/ui, MagicUI, custom components
- **Rich Text Editor**: Plate.js, Excalidraw
- **Collaboration**: Liveblocks.io, Yjs, Monaco Editor, y-monaco
- **AI Services**: OpenAI, Gemini, Vapi, Deepgram, Google Generative AI
- **Authentication**: Auth.js v5 (Google, GitHub), NextAuth
- **Analytics**: Google Analytics, Vercel Analytics, Speed Insights
- **File Uploads**: UploadThing
- **Utilities**: Zod, Lodash, clsx, nanoid, uuid, date-fns
- **Styling**: Tailwind CSS, styled-components, tailwind-merge, tailwind-scrollbar
- **Other**: D3, Razorpay, Nodemailer, Sonner, Recharts, pdf-lib, html2canvas-pro

## 🔧 Key Improvements Made

### 1. Fixed SSR Issues

The main issue was "window is not defined" error during server-side rendering. This was resolved by:

- Creating a custom `useLogo` hook that handles client-side theme detection
- Using `useEffect` for client-side-only operations
- Providing proper fallbacks for SSR

### 2. Enhanced Code Organization

- **Custom Hooks**: Created reusable hooks like `useLogo` for better code organization
- **Constants File**: Centralized all app constants for better maintainability
- **Utility Functions**: Common helper functions organized in `utils/helpers.js`
- **Enhanced API Service**: Improved API handling with retry logic and proper error handling

### 3. Better Error Handling

- **Error Boundary**: Component to catch and handle React errors gracefully
- **API Error Handling**: Comprehensive error handling in API service
- **Loading States**: Loading components for better user experience

### 4. Performance Optimizations

- **SSR-Compatible Components**: All components now work properly with SSR
- **Debounced Functions**: Utility functions for performance optimization
- **Proper Image Handling**: Optimized logo loading based on theme

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing`
5. Open pull request

See `docs/AI_INTERVIEW_README.md` and other docs for guidelines.

---

## 📷 Project Screenshots

---

## 📄 License

MIT © License

---

Made with ❤️ by DEVEN WAGH
