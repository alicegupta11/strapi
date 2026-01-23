# Deployment URL Fix - Registration Email Links

## Problem
The registration email was hardcoded to `http://localhost:1337`, which doesn't work when deployed to Railway at `http://strapi-production-d8a7.up.railway.app`.

## Solution
Implemented a dynamic URL system using the `PUBLIC_URL` environment variable.

## Changes Made

### 1. Updated `src/extensions/users-permissions/strapi-server.ts`
- Changed from hardcoded URL to dynamic environment variable
- Added fallback to `http://localhost:1337` for local development
- Code now reads `process.env.PUBLIC_URL` to construct registration links

### 2. Updated `.env.example`
- Added `PUBLIC_URL` environment variable with documentation
- Set default value to `http://localhost:1337` for local development

## Local Development Setup

Add this to your `.env` file:
```bash
PUBLIC_URL=http://localhost:1337
```

## Railway Deployment Setup

To fix the registration links in production:

### Option 1: Via Railway Dashboard
1. Go to your Railway project
2. Select your Strapi service
3. Go to the "Variables" tab
4. Add a new variable:
   - **Name**: `PUBLIC_URL`
   - **Value**: `http://strapi-production-d8a7.up.railway.app`
5. Redeploy the service

### Option 2: Via Railway CLI
```bash
railway variables set PUBLIC_URL=http://strapi-production-d8a7.up.railway.app
railway up
```

### Option 3: Via railway.json (Recommended)
Add to your `railway.json` file:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run develop",
    "healthcheckPath": "/_health"
  },
  "services": {
    "api": {
      "environment": {
        "PUBLIC_URL": "${{RAILWAY_PUBLIC_DOMAIN}}"
      }
    }
  }
}
```

This uses Railway's built-in `${{RAILWAY_PUBLIC_DOMAIN}}` variable which automatically uses the correct domain.

## Testing

### Local Testing
1. Create a new user
2. Check the logs: `strapi log:tail`
3. Verify the registration link shows `http://localhost:1337`

### Production Testing
1. After setting `PUBLIC_URL` on Railway
2. Create a test user through the API
3. Check Railway logs for the registration link
4. Verify it shows `http://strapi-production-d8a7.up.railway.app`

## Verification

The registration link in emails should now be:
- **Local**: `http://localhost:1337/admin/auth/register?confirmationToken=...`
- **Production**: `http://strapi-production-d8a7.up.railway.app/admin/auth/register?confirmationToken=...`

## Notes

- The `PUBLIC_URL` variable should include the protocol (`http://` or `https://`)
- Do not include a trailing slash
- If your Railway domain changes (e.g., new deployment), update the `PUBLIC_URL` variable
- Using `${{RAILWAY_PUBLIC_DOMAIN}}` in railway.json is the most maintainable approach as it auto-updates

## Troubleshooting

### Registration link still shows localhost
- Verify the `PUBLIC_URL` variable is set in Railway
- Check that the variable name is exactly `PUBLIC_URL` (case-sensitive)
- Ensure you've redeployed after adding the variable

### Can't access registration link
- Verify the URL format is correct (protocol, no trailing slash)
- Check if your Railway deployment is running
- Ensure the user's email service is configured correctly

## Related Files
- `src/extensions/users-permissions/strapi-server.ts` - Main implementation
- `.env.example` - Environment variable documentation
- `railway.json` - Railway configuration (if using automatic domain)
