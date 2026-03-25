# Vercel Deployment Guide

## Overview

This application has been configured to work properly on Vercel. The main issue that was fixed is the handling of API base URLs during server-side rendering (SSR).

## The Problem

When deploying to Vercel, server actions and server-side code was trying to fetch from `http://localhost:3000`, which doesn't exist in Vercel's environment. This caused the error:

```
TypeError: fetch failed
  [cause]: Error: connect ECONNREFUSED 127.0.0.1:3000
```

## The Solution

A new utility function `getBaseUrl()` was created in `/lib/get-base-url.ts` that intelligently determines the correct base URL:

1. **Priority 1**: Uses `process.env.API_BASE_URL` if explicitly set
2. **Priority 2**: Uses `process.env.VERCEL_URL` automatically on Vercel (provides `https://<project>-<hash>.vercel.app`)
3. **Priority 3**: Uses `process.env.NEXT_PUBLIC_APP_URL` if custom app URL is needed
4. **Fallback**: Uses `http://localhost:3000` for local development

All server action files in `/app/actions/` have been updated to use this utility.

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. You have two options:

#### Option A: Use Vercel's Automatic URL (Recommended for simple setups)
- No need to set anything manually
- Vercel automatically provides `VERCEL_URL` which will be used automatically

#### Option B: Set a Custom Domain (Recommended for production)
- If using a custom domain (e.g., `pia.example.com`):
  - Add: `API_BASE_URL=https://pia.example.com`
  - This ensures consistent URLs across all environments

#### Option C: Use NEXT_PUBLIC_APP_URL
- Add: `NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app`
- Note: `NEXT_PUBLIC_*` variables are exposed to the browser

### Step 2: Verify Other Required Variables

Make sure you also have these configured (they likely already exist):

```
DATABASE_URL=<your-database-url>
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://your-app-domain.vercel.app
```

### Step 3: Deploy

Push your code to your connected Git repository:

```bash
git add .
git commit -m "Fix Vercel SSR fetch errors"
git push
```

Vercel will automatically detect the changes and start a new deployment.

## Testing the Fix

After deployment:

1. Visit your Vercel deployment URL
2. Navigate to pages that use server actions (inventory, requisitions, etc.)
3. Verify data loads without errors
4. Check browser console for any fetch-related errors
5. Check Vercel deployment logs for any connection refused errors

## Troubleshooting

### Still Getting `ECONNREFUSED` Errors?

1. **Check Environment Variables**:
   - Log into Vercel dashboard
   - Verify `API_BASE_URL` or `VERCEL_URL` is set correctly
   - Redeploy if you added/changed variables

2. **Check Logs**:
   - View deployment logs in Vercel dashboard
   - Look for any fetch/connection errors
   - Check build logs for errors during build phase

3. **Verify Network Calls**:
   - Open browser DevTools
   - Check Network tab for failed requests
   - Check Console for error messages
   - Note the actual URL being called

### API Calls Still Failing?

This tool fixes the base URL issue. If you still have API errors:

1. Verify your API backend is accessible
2. Check CORS configuration if calling an external API
3. Verify authentication tokens are being sent correctly
4. Check API route handlers don't have errors

## Local Development

For local development, continue using:

```
API_BASE_URL=http://localhost:3000
```

Or leave it unset, as the fallback is `http://localhost:3000`.

## Files Modified

- `/lib/get-base-url.ts` - New utility function
- `/app/actions/inventory.ts` - Updated all functions
- `/app/actions/departments.ts` - Updated all functions
- `/app/actions/auth.ts` - Updated all functions
- `/app/actions/purchaseOrder.ts` - Updated all functions
- `/app/actions/requisition.ts` - Updated all functions
- `/.env.example` - Updated with documentation

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Environment Variables in Vercel](https://vercel.com/docs/projects/environment-variables)
