# Vercel Serverless Deployment Guide

This guide explains how to deploy your DSATrek Next.js application to Vercel's serverless platform.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a serverless-compatible PostgreSQL database:
   - **Neon** (Recommended): [neon.tech](https://neon.tech) - Built for serverless
   - **PlanetScale**: [planetscale.com](https://planetscale.com)
   - **Supabase**: [supabase.com](https://supabase.com)

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Clone your repository
git clone https://github.com/DEVENWAGH/dsatreknext
cd dsatreknext

# Install dependencies
npm install

# Build locally to test
npm run build
```

### 2. Database Setup

**For Neon (Recommended):**

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. The connection string format: `postgresql://username:password@hostname/database?sslmode=require`

**Connection pooling is already optimized for serverless in `src/lib/db.js`**

### 3. Environment Variables

Create a `.env.local` file (for local testing) with all required variables:

```bash
cp .env.example .env.local
# Fill in all the values
```

**Required Variables:**

- `DATABASE_URL` - Your PostgreSQL connection string
- `AUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production domain
- `CRON_SECRET` - Random secret for cron jobs

### 4. Deploy to Vercel

**Method 1: Vercel Dashboard**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the dashboard
5. Deploy

**Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
# ... add all other environment variables

# Redeploy with environment variables
vercel --prod
```

### 5. Configure Environment Variables in Vercel

In your Vercel dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
AUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
CRON_SECRET=your-cron-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
GEMINI_API_KEY=your-gemini-api-key
# ... add all other variables
```

### 6. Run Database Migrations

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npm run db:migrate
```

Or create a migration API route (recommended):

```javascript
// src/app/api/migrate/route.js
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '@/lib/db';

export async function POST(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 7. Set Up Cron Jobs

The application uses cron jobs for cleanup tasks. In Vercel dashboard:

1. Go to your project settings
2. Navigate to "Functions" tab
3. Add cron jobs in `vercel.json` (already configured):

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Serverless Optimizations Applied

### 1. Database Connection

- ✅ Single connection with connection pooling
- ✅ Lower timeout values for serverless
- ✅ Optimized for cold starts

### 2. Background Services

- ✅ Disabled background intervals in serverless environment
- ✅ Converted to cron jobs using Vercel Cron

### 3. Configuration Changes

- ✅ Removed `output: 'standalone'` from Next.js config
- ✅ Added Vercel-specific optimizations
- ✅ Created `.vercelignore` to exclude unnecessary files

### 4. API Route Optimizations

- ✅ Added configurations where needed
- ✅ Optimized batch processing for serverless limits
- ✅ Added proper error handling and timeouts

## Performance Considerations

### 1. Cold Starts

- Database connections are optimized for quick initialization
- Minimal import statements in API routes
- Connection pooling configured for serverless

### 2. Function Timeouts

- API routes have 30-second timeout (Pro plan: 5 minutes)
- Batch operations are chunked to prevent timeouts
- Long-running tasks moved to cron jobs

### 3. Memory Limits

- Free plan: 1024MB memory limit
- Pro plan: Up to 3008MB
- Database queries optimized for memory efficiency

## Monitoring and Debugging

### 1. Vercel Analytics

```javascript
// Already included in your app
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Function Logs

- View logs in Vercel dashboard
- Use `console.log` for debugging
- Errors are automatically tracked

### 3. Performance Monitoring

```javascript
// Already included
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string format
   - Ensure SSL is enabled
   - Verify database allows connections from Vercel IPs

2. **Environment Variable Issues**
   - Ensure all required variables are set in Vercel dashboard
   - Redeploy after adding environment variables
   - Check variable names match exactly

3. **Function Timeouts**
   - Reduce batch sizes in batch operations
   - Optimize database queries
   - Consider upgrading to Pro plan for longer timeouts

4. **Cold Start Performance**
   - Database connections are already optimized
   - Consider keeping one function warm with uptime monitoring

## Migration from GCP VM

### What Changed:

- ❌ Removed Docker configuration
- ❌ Removed nginx load balancer
- ❌ Removed VM deployment scripts
- ❌ Disabled background services
- ✅ Added Vercel configuration
- ✅ Added cron jobs for scheduled tasks
- ✅ Optimized database connections
- ✅ Added serverless-specific configurations

### Benefits:

- 🚀 Automatic scaling
- 💰 Pay per request (likely cheaper for moderate traffic)
- 🔄 Zero downtime deployments
- 📊 Built-in analytics and monitoring
- 🌍 Global CDN
- 🔒 Automatic HTTPS

## Support

For deployment issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review function logs in Vercel dashboard
3. Test locally with `npm run build && npm run start`
