# Pre-Deployment Checklist & Vercel Guide

## ✅ Pre-Deployment Quality Checks

### Environment & Configuration
- ✅ `.env.example` created with all required variables
- ✅ `.gitignore` properly excludes `.env.local` and sensitive files
- ✅ `.next/` build directory excluded from git
- ✅ `node_modules/` excluded from git
- ✅ `package-lock.json` should be committed (for reproducible builds)

### Code Quality
- ✅ `npm run lint` passes with zero errors
- ✅ `npm run build` succeeds with no TypeScript errors
- ✅ No `debugger` statements
- ✅ All `console.error` statements are for legitimate error logging
- ✅ Error boundaries implemented for crash protection

### API & Backend
- ✅ All API routes have error handling
- ✅ Input validation on message submissions (max 5000 chars)
- ✅ File size validation (50MB limit)
- ✅ File type validation (PDF only)
- ✅ localStorage quota error handling
- ✅ Environment variable validation at startup

### React Components
- ✅ Hydration mismatch resolved with mounted gate
- ✅ No `typeof window` checks in useState initializers
- ✅ Custom theme provider prevents SSR script injection
- ✅ All async operations have error states
- ✅ Loading states implemented for user feedback

### Security
- ✅ Sensitive files in `.gitignore`
- ✅ API keys loaded from environment variables only
- ✅ No hardcoded credentials
- ✅ Supabase RLS policies configured (in database)
- ✅ Content Security Policy ready for Vercel

### Performance
- ✅ Production build optimized (Turbopack)
- ✅ Next.js Image component used (where applicable)
- ✅ Dynamic imports for code splitting (via Next.js automatic)
- ✅ Bundle analysis shows no bloat

## 🚀 Deployment on Vercel

### Step 1: Prepare Your GitHub Repository

```bash
cd ~/Desktop/Profile_Gap_Project/ai-research-assistant

# Add all files to git
git add .

# Commit changes
git commit -m "Pre-deployment: Update React Showcase and add QA improvements

- Updated React Showcase with current component patterns
- Added input validation for messages (5000 char limit)
- Added localStorage quota error handling
- Added environment variable validation at startup
- Fixed hydration mismatch with mounted gate
- Updated dark mode theme provider documentation
- All linting and TypeScript checks pass"

# Push to GitHub (create repo if needed)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-research-assistant.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for and select your `ai-research-assistant` repo
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

```
OPENAI_API_KEY=sk-... (from OpenAI)
SUPABASE_URL=https://... (from Supabase)
SUPABASE_ANON_KEY=eyJ... (public, for client)
NEXT_PUBLIC_SUPABASE_URL=https://... (same as SUPABASE_URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (same as SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret, for server-side only)
```

**Important**: 
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe to make public)
- Other variables are server-only (keep secret)
- Never commit `.env.local` with real values

### Step 4: Deploy

1. In Vercel dashboard, click "Deploy"
2. Vercel will:
   - Run `npm run build`
   - Run tests (if configured)
   - Generate optimized production bundle
   - Deploy to CDN

3. Monitor deployment progress in "Deployments" tab

### Step 5: Verify Deployment

After deployment completes:

1. Visit your live URL (e.g., `ai-research-assistant.vercel.app`)
2. Test core workflows:
   - Load home page (check dark mode toggle)
   - Upload a PDF document
   - Create a new chat
   - Send multiple messages
   - View saved chats
   - Delete a saved chat
   - Clear chat history

3. Check browser console for errors (F12)
4. Test on mobile device

### Step 6: Post-Deployment Monitoring

#### Set Up Error Tracking
```bash
# (Optional) Install Sentry for error monitoring
npm install @sentry/nextjs
```

#### Monitor Vercel Analytics
- Vercel Dashboard → Analytics
- Check response times, request counts, errors
- Set up alerts for high error rates

#### Monitor Supabase
- Go to Supabase Dashboard
- Check Real-time Logs for queries
- Monitor API usage
- Review database performance

## 🔄 Continuous Deployment

### Enable Auto-Deploy from Main Branch

In Vercel:
1. Project Settings → Git
2. Ensure "Deploy on push to main" is enabled
3. Every push to `main` will auto-deploy

### Staging Deployments

Create a `staging` branch for testing before main:

```bash
git checkout -b staging
git push origin staging
```

In Vercel: Project Settings → Git → Add custom branch
- Branch: `staging`
- Production: Off (creates preview deployment)

## 📝 Rollback Plan

If something breaks on production:

```bash
# Option 1: Rollback via Vercel Dashboard
# Deployments tab → Select previous version → Click "Redeploy"

# Option 2: Revert in Git
git revert HEAD
git push origin main
```

## 📊 Performance Optimization (Post-Deployment)

Monitor with Vercel Analytics:
- TTFB (Time to First Byte): Target < 200ms
- FCP (First Contentful Paint): Target < 1.5s
- LCP (Largest Contentful Paint): Target < 2.5s

If slow:
1. Check Supabase query performance
2. Optimize PDF processing (add pagination)
3. Enable caching for static assets

## 🔐 Security Checklist (Post-Deployment)

- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Security headers configured (Vercel defaults)
- ✅ No API keys exposed in frontend code
- ✅ Supabase RLS policies enforced
- ✅ Rate limiting considered (future enhancement)

## 📞 Troubleshooting

### Build Fails on Vercel but Works Locally

Usually environment variable mismatch:
1. Check all `NEXT_PUBLIC_*` vars are set in Vercel
2. Check private vars (`OPENAI_API_KEY`, etc.) are set
3. Rebuild: Vercel Dashboard → Deployments → "Redeploy"

### Chat Not Saving to Database

Check Supabase:
1. Verify database URL is correct
2. Check RLS policies allow writes
3. Verify service role key is set
4. Check Supabase logs for query errors

### PDF Upload Fails

Common causes:
1. File size > 50MB (error message shown)
2. Not a valid PDF
3. Node.js runtime not available (should be set)
4. pdfjs-dist worker not found

### Performance Issues

1. Check Vercel Analytics
2. Optimize Supabase queries
3. Enable response caching
4. Consider upgrading Supabase tier

## 🎯 Next Steps After Deployment

1. **Set up monitoring** - Sentry for errors, LogRocket for session replay
2. **Add analytics** - Vercel Web Analytics or Segment
3. **Implement CI/CD** - GitHub Actions for automated tests
4. **Add automated tests** - Jest + Playwright (when ready)
5. **Performance optimization** - Based on real user metrics

## 📚 Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
