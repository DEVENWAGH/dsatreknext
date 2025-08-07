# Environment Variables Guide

This document explains how to properly configure environment variables in your Next.js project.

## Environment Variable Types

### 1. Server-Only Variables

These variables are only accessible on the server-side and are not exposed to the browser:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key
- `OPEN_ROUTER_API` - OpenRouter AI API key
- `DEEPGRAM_API_KEY` - Deepgram voice agent API key for STT/TTS
- `GEMINI_API_KEY` - Google Gemini AI API key for conversation AI

### 2. Client-Side Variables (NEXT*PUBLIC*\*)

These variables are exposed to the browser and must be prefixed with `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_GEMINI_API_KEY` - Gemini AI API key
- `NEXT_PUBLIC_VAPI_PRIVATE_KEY` - VAPI private key
- `NEXT_PUBLIC_VAPI_API_KEY` - VAPI API key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key for frontend

### 3. Build-Time Variables

These are used during the build process:

- `NODE_ENV` - Environment mode (development/production/test)

## File Structure

```
├── .env.example          # Template with all required variables
├── .env.local           # Your actual environment variables (git-ignored)
├── .env.development     # Development-specific variables (optional)
├── .env.production      # Production-specific variables (optional)
└── types/env.d.ts       # TypeScript definitions for environment variables
```

## Security Best Practices

1. **Never commit `.env.local`** - This file contains sensitive data
2. **Use NEXT*PUBLIC* prefix carefully** - These variables are exposed to the browser
3. **Keep server secrets server-only** - Don't prefix sensitive keys with NEXT*PUBLIC*
4. **Validate environment variables** - Check for required variables at startup

## Common Issues Fixed

### 1. Database URL Mismatch

- **Before**: `DATABASE_URI` in .env.local but code used `DATABASE_URL`
- **After**: Standardized to `DATABASE_URL`

### 2. VITE Variables in Next.js

- **Before**: `VITE_GEMINI_API_KEY` (Vite-specific)
- **After**: `NEXT_PUBLIC_GEMINI_API_KEY` (Next.js-specific)

### 3. Inconsistent API URLs

- **Before**: Different default URLs in different files
- **After**: Consistent `http://localhost:3000/api` default

## Usage Examples

### Server-Side (API Routes)

```javascript
// In API routes or server components
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

### Client-Side (Components)

```javascript
// In React components
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
```

### Type-Safe Usage

```typescript
// With TypeScript definitions in types/env.d.ts
const apiUrl: string = process.env.NEXT_PUBLIC_API_URL;
```

## Setup Instructions

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Environment Variable Loading Order

Next.js loads environment variables in this order (later ones override earlier ones):

1. `.env.local` (always loaded, git-ignored)
2. `.env.development` (when NODE_ENV=development)
3. `.env.production` (when NODE_ENV=production)
4. `.env` (always loaded)

## Validation

Consider adding environment variable validation at app startup:

```javascript
// lib/env-validation.js
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXT_PUBLIC_API_URL'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```
