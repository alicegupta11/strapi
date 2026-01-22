# 🔧 Fix Railway Database Connection Error

## Problem

Railway is showing this error:
```
Error: connect ENETUNREACH 2406:da1c:f42:ae0b:1d44:d037:6ca7:3345:5432 - Local (:::0)
```

**Root Cause**: Railway is trying to connect to its built-in PostgreSQL database instead of your Supabase database.

## Solution: Configure Railway Environment Variables

### Step 1: Remove Railway's Auto-Added Database

Railway may have automatically added a PostgreSQL service. You need to either:
1. **Delete the Railway database service** (recommended)
2. **Or keep it but ensure Strapi uses Supabase** (requires correct env vars)

### Step 2: Add Correct Environment Variables

Go to your Railway service → **Variables** tab

**CRITICAL**: Make sure `DATABASE_URL` points to Supabase, not Railway:

```
# ✅ CORRECT (Supabase):
DATABASE_URL=postgresql://postgres:4M2wjN33%2FSLg@db.ovnorbyhckfcgwlyptnn.supabase.co:5432/postgres?sslmode=no-verify

# ❌ WRONG (Railway database):
DATABASE_URL=postgresql://postgres:password@2406:da1c:f42:ae0b:1d44:d037:6ca7:3345:5432/railway
```

### Complete Environment Variables List:

```
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Database Configuration (MUST BE SUPABASE!)
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:4M2wjN33%2FSLg@db.ovnorbyhckfcgwlyptnn.supabase.co:5432/postgres?sslmode=no-verify
DATABASE_HOST=db.ovnorbyhckfcgwlyptnn.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=4M2wjN33%2FSLg
DATABASE_SSL=false
DATABASE_SCHEMA=public

# App Keys (Generate with: openssl rand -base64 32)
APP_KEYS="YOUR_KEY_1,YOUR_KEY_2,YOUR_KEY_3,YOUR_KEY_4"
API_TOKEN_SALT=YOUR_SALT
ADMIN_JWT_SECRET=YOUR_SECRET
TRANSFER_TOKEN_SALT=YOUR_SALT
JWT_SECRET=YOUR_SECRET
ENCRYPTION_KEY=YOUR_KEY

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=alish@rhombuz.io
SMTP_PASSWORD=moubzbzlojmuqdlp

# CORS
CORS_ORIGIN=*
```

## Option A: Delete Railway Database (Recommended)

If Railway automatically created a PostgreSQL database for this project:

1. Go to Railway project: https://railway.com/project/5be1f449-2e1d-4886-9a10-7d763127e479
2. Look for any **PostgreSQL** services
3. Click on the database service
4. Click **Settings**
5. Click **Delete Service**
6. Confirm deletion

**Why?**: Your Strapi uses Supabase, so Railway's built-in database is unnecessary and causes conflicts.

## Option B: Keep Railway Database (Not Recommended)

If you want to keep Railway's database (you probably don't):

1. Go to Railway database service
2. Copy the connection string
3. Update your `DATABASE_URL` to use Railway's database
4. Update all other DATABASE_* variables
5. **Note**: You'll lose your Supabase data!

## Step 3: Redeploy After Fixing Variables

After updating environment variables:

1. Go to your Strapi service on Railway
2. Click **Settings** tab
3. Click **Redeploy**
4. Wait 2-3 minutes
5. Check logs - should NOT show ENETUNREACH error

## Step 4: Verify Supabase Connection

Test that Railway can reach Supabase:

```bash
# From Railway logs, you should see successful database connections
# Look for logs showing PostgreSQL connection to db.ovnorbyhckfcgwlyptnn.supabase.co
```

## What Successful Logs Look Like:

### ✅ Good (Supabase connected):
```
[INFO] Connecting to PostgreSQL database...
[INFO] Database connection established
[INFO] Strapi started successfully
```

### ❌ Bad (Railway database):
```
Error: connect ENETUNREACH 2406:da1c:f42:ae0b:1d44:d037:6ca7:3345:5432
```

## Quick Fix Checklist

- [ ] Remove Railway's auto-added PostgreSQL service (or ignore it)
- [ ] Verify DATABASE_URL points to Supabase (not Railway)
- [ ] Check all DATABASE_* variables match Supabase
- [ ] Add APP_KEYS, JWT_SECRET, etc. if missing
- [ ] Redeploy Railway service
- [ ] Verify logs show Supabase connection
- [ ] Test admin panel: `https://your-railway-url.railway.app/admin`

## Verification Steps

### 1. Check Railway Environment Variables
Go to Railway service → Variables tab
- Look for any Railway database variables (like `PGHOST`, `PGDATABASE`)
- Delete them if found
- Ensure your DATABASE variables point to Supabase

### 2. Test Connection
```bash
curl https://your-railway-url.railway.app/api/articles
```
Should return JSON (not 404 or 500)

### 3. Check Admin Panel
Visit: `https://your-railway-url.railway.app/admin`
Should show Strapi login page

## Common Mistakes

### ❌ Mistake 1: Using Railway Database
**Wrong**: DATABASE_URL=postgresql://...@2406:da1c... (Railway)
**Right**: DATABASE_URL=postgresql://...@db.ovnorbyhckfcgwlyptnn.supabase.co (Supabase)

### ❌ Mistake 2: DATABASE_SSL=true
**Wrong**: DATABASE_SSL=true (causes connection failures with Supabase)
**Right**: DATABASE_SSL=false

### ❌ Mistake 3: Missing APP_KEYS
**Wrong**: No APP_KEYS defined
**Right**: APP_KEYS="key1,key2,key3,key4" (generate with `openssl rand -base64 32`)

## Summary

**The error is because Railway is trying to connect to its built-in database instead of your Supabase database.**

**Fix:**
1. Delete Railway's PostgreSQL service (or ignore it)
2. Set DATABASE_URL and other DATABASE_* variables to point to Supabase
3. Add missing environment variables (APP_KEYS, JWT_SECRET, etc.)
4. Redeploy

Your Supabase database is already configured and working locally - Railway just needs to use the same connection string!
