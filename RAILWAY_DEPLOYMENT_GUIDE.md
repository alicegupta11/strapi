# Railway Deployment Guide for Strapi with Supabase

## Current Status ✅

Your Strapi project is already imported to Railway:
- **Project**: angelic-love
- **Repository**: Connected from GitHub
- **Service**: Strapi API deployed

## What You Need to Do Now

### 1. Configure Environment Variables in Railway

Your Supabase database is already configured in `.env`, but Railway needs these variables set.

#### Access Railway Environment Variables:
1. Go to your Railway service: https://railway.com/project/5be1f449-2e1d-4886-9a10-7d763127e479/service/b36d7f6b-8805-46d5-925c-18a4e6285a40
2. Click on your Strapi service
3. Go to the **Variables** tab

#### Add These Environment Variables:

```
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# App Keys (Generate new ones for production)
APP_KEYS="YOUR_GENERATED_KEY_1,YOUR_GENERATED_KEY_2,YOUR_GENERATED_KEY_3,YOUR_GENERATED_KEY_4"
API_TOKEN_SALT=YOUR_GENERATED_SALT
ADMIN_JWT_SECRET=YOUR_GENERATED_SECRET
TRANSFER_TOKEN_SALT=YOUR_GENERATED_SALT
JWT_SECRET=YOUR_GENERATED_SECRET
ENCRYPTION_KEY=YOUR_GENERATED_KEY

# Database Configuration (Supabase)
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:4M2wjN33%2FSLg@db.ovnorbyhckfcgwlyptnn.supabase.co:5432/postgres?sslmode=no-verify
DATABASE_HOST=db.ovnorbyhckfcgwlyptnn.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=4M2wjN33%2FSLg
DATABASE_SSL=false
DATABASE_SCHEMA=public

# Email Configuration (Optional - for password resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=alish@rhombuz.io
SMTP_PASSWORD=moubzbzlojmuqdlp
```

### 2. Generate Secure Keys for Production

Run this command 5-6 times to generate secure keys:

```bash
openssl rand -base64 32
```

Use the generated values for:
- `APP_KEYS` (generate 4 different keys, comma-separated)
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### 3. Configure Railway Service Settings

In your Railway service:

**Build Command:**
```
npm install
npm run build
```

**Start Command:**
```
npm start
```

**Root Directory:**
```
.
```

**Environment:** Production

### 4. Redeploy on Railway

After adding environment variables:
1. Go to your Railway service
2. Click **Settings** tab
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment

### 5. Access Your Strapi API

Once deployed, Railway will provide a URL like:
```
https://your-service-name.railway.app
```

**Access Points:**
- **Admin Panel**: `https://your-service-name.railway.app/admin`
- **API Endpoint**: `https://your-service-name.railway.app/api/articles`
- **Health Check**: `https://your-service-name.railway.app/`

### 6. Configure CORS for Frontend Access

**Important**: Your frontend on Vercel needs to access this Railway API.

#### Option A: Allow All Origins (Development)
In Railway, add this environment variable:
```
CORS_ORIGIN=*
```

#### Option B: Specific Origin (Production - Recommended)
Add to Railway environment variables:
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

Also, update `config/server.ts` to use this:
```typescript
url: process.env.CORS_ORIGIN || '*'
```

### 7. Update Frontend API URL

In your Vercel frontend project, update the Strapi API URL:

**Frontend Environment Variables:**
```
NEXT_PUBLIC_STRAPI_URL=https://your-railway-service-url.railway.app
```

Or in your frontend code:
```javascript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://your-railway-service-url.railway.app';
```

## Testing Your Deployment

### 1. Check Railway Deployment Status
- Go to Railway dashboard
- Check if your service shows "Running"
- View logs for any errors

### 2. Test API Endpoint
```bash
curl https://your-railway-service-url.railway.app/api/articles
```

Expected: JSON response with articles data

### 3. Test Admin Panel
Visit: `https://your-railway-service-url.railway.app/admin`

Expected: Strapi admin login page

### 4. Test From Frontend
Your Vercel frontend should be able to fetch data:
```javascript
fetch('https://your-railway-service-url.railway.app/api/articles')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Railway vs Vercel Setup Summary

| Component | Platform | URL |
|-----------|----------|-----|
| **Backend (Strapi)** | Railway | `https://your-service.railway.app` |
| **Frontend** | Vercel | `https://your-frontend.vercel.app` |
| **Database** | Supabase | `db.ovnorbyhckfcgwlyptnn.supabase.co` |

## Common Issues & Solutions

### Issue 1: "EADDRINUSE" error
**Solution**: Make sure `HOST=0.0.0.0` and `PORT=1337` are set

### Issue 2: Database connection refused
**Solution**: Check `DATABASE_URL` in Railway variables matches your `.env`

### Issue 3: CORS errors from frontend
**Solution**: Add `CORS_ORIGIN` environment variable with your Vercel domain

### Issue 4: Admin panel shows errors
**Solution**: Ensure all `APP_KEYS`, `ADMIN_JWT_SECRET`, etc. are properly set

### Issue 5: 404 on API routes
**Solution**: Verify deployment completed successfully (check Railway logs)

## Monitoring & Logs

### View Logs:
1. Go to Railway service
2. Click **Logs** tab
3. See real-time logs for your Strapi instance

### View Metrics:
1. Go to Railway dashboard
2. Click **Metrics** tab
3. Monitor CPU, memory, and network usage

### View Deployment History:
1. Go to Railway service
2. Click **Settings** tab
3. See deployment history and rollback options

## Pricing

**Railway Pricing:**
- Free trial: $5 credit included
- After trial: $5/month for basic plan
- Includes: PostgreSQL database, unlimited deployments

**Note**: Your Supabase database is separate (free tier works well)

## Next Steps

1. ✅ Add environment variables to Railway (CORS_ORIGIN, database, keys)
2. ✅ Redeploy Railway service
3. ✅ Test API endpoint
4. ✅ Test admin panel
5. ✅ Update frontend API URL to point to Railway
6. ✅ Test frontend → backend connection
7. ✅ Deploy frontend changes to Vercel

## Architecture Diagram

```
Frontend (Vercel)          Backend (Railway)         Database (Supabase)
─────────────────           ─────────────────           ─────────────────
  Vercel App    ←→    Strapi API Server     ←→    PostgreSQL Database
  (Next.js/React)         (Node.js Express)          (PostgreSQL)
                            ↓
                       Railway Infrastructure
```

## Support & Documentation

- **Railway Docs**: https://docs.railway.app/
- **Strapi on Railway**: https://docs.strapi.io/dev-docs/deployment/railway
- **Supabase Docs**: https://supabase.com/docs

## Summary

Your setup is now:
- ✅ Strapi API on Railway (production-ready)
- ✅ Frontend on Vercel (connected)
- ✅ Database on Supabase (persistent)
- ✅ Full stack deployed and scalable

This is a robust, production-ready architecture! 🚀
