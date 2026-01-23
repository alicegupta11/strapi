# Railway Email Setup Guide

## Overview
Your Strapi application has been migrated from SMTP email to Resend API to work with Railway's network restrictions.

## Required Environment Variables

Add these environment variables in your Railway project:

### 1. RESEND_API_KEY
- **Description**: Your Resend API key for authentication
- **Value**: `xxx`
- **Required**: Yes - Emails won't send without this

### 2. RESEND_FROM_EMAIL
- **Description**: The email address that will appear as the sender
- **Value**: `alish@rhombuz.io` (or your preferred sender email)
- **Required**: No - defaults to `alish@rhombuz.io`

## How to Add Environment Variables in Railway

1. **Go to your Railway project**: https://railway.app/project/[your-project-id]

2. **Select your Strapi service**

3. **Click on "Variables" tab**

4. **Add new variables**:
   - Click "New Variable"
   - Enter Name: `RESEND_API_KEY`
   - Enter Value: `xxx`
   - Click "Add Variable"

   - Click "New Variable" again
   - Enter Name: `RESEND_FROM_EMAIL`
   - Enter Value: `xxx`
   - Click "Add Variable"

5. **Redeploy your service**:
   - Railway will automatically redeploy when you save changes
   - Or manually click "Redeploy" button

## What's Different?

**Before (SMTP - Blocked by Railway)**:
- Used port 587/465
- Connection timeouts
- Network restrictions

**After (Resend API - Works on Railway)**:
- Uses HTTP/HTTPS (port 443)
- No connection timeouts
- Railway-compatible
- Better reliability

## Testing

After deploying:

1. **Create a new admin user** through the admin panel
2. **Check Railway logs** for email sending confirmation:
   ```
   📧 Sending email via Resend from: xxx
   ✅ Welcome email sent successfully via Resend
   ```
3. **Check your inbox** for the registration email

## Troubleshooting

### Emails not sending?

**Check logs for:**
```
⚠️ RESEND_API_KEY not found in environment variables. Email will not be sent.
```
→ Add the `RESEND_API_KEY` variable

**Check logs for:**
```
❌ Failed to send welcome email via Resend
```
→ Verify:
  - API key is correct
  - Sender email is verified in Resend dashboard
  - Recipient email is valid

### Want to change sender email?

1. Go to https://resend.com/domains
2. Verify your domain
3. Update `RESEND_FROM_EMAIL` in Railway
4. Redeploy

## Registration Flow

With Resend, the complete flow now works on Railway:

1. ✅ Admin creates user via Strapi admin panel
2. ✅ User saved to Supabase with `confirmationToken`
3. ✅ Registration email sent via Resend API
4. ✅ User receives email with registration link
5. ✅ User clicks link to complete registration
6. ✅ User account activated

All steps now work seamlessly on Railway!
