# User Registration Flow - Complete Guide

## Overview

This document explains the complete user registration flow that automatically sends emails with pre-filled registration forms when you create a new user in the Strapi admin panel. The system now uses **Strapi's default registration page** at `/admin/register` instead of a custom page.

## How It Works

### 1. User Creation in Admin Panel
When you create a new user via **Content Manager → Users → Create New Entry** and enter:
- Username
- Email
- Password (optional - user will set this during registration)
- Any other required fields

**Automatic Actions Triggered:**
- User is created with `confirmed: false` and `isInvited: true`
- A unique invite token is generated
- Token expiration is set to 24 hours from creation
- An email is automatically sent to the user's email address

### 2. Email Sending
The email is sent using **Resend API** (HTTP-based, works with Railway/Vercel deployments).

**Email Contains:**
- Personalized greeting with the user's username
- A registration link to Strapi's default admin registration page
- Instructions to complete registration

**Example Email:**
```
Hi John,

Welcome!

Please complete your registration by clicking the link below:

[Complete Registration]

Your email (john@example.com) will be pre-filled automatically.

If you did not request this, you can safely ignore this email.
```

### 3. Registration Link Format
```
{PUBLIC_URL}/admin/register?inviteToken={unique_token}&email={user_email}&username={username}
```

Where:
- `PUBLIC_URL` - Your application URL (set in .env)
- `inviteToken` - Unique 64-character hex token
- `email` - User's email address (URL-encoded)
- `username` - User's username (URL-encoded)

### 4. Registration Page Flow (Strapi Default)

When the user clicks the registration link:

1. **Page Loads** (`/admin/register`)
   - JavaScript reads URL parameters from the link
   - Automatically pre-fills the form fields:
     - ✅ Email (read-only, pre-filled)
     - ✅ Username (read-only, pre-filled)
   - Invite token is stored for form submission

2. **Form Fields (Auto-filled by Script)**
   - **Email** (read-only) - Automatically filled from URL
   - **Username** (read-only) - Automatically filled from URL
   - **Password** (user input) - User creates their password
   - **Confirm Password** (user input) - User confirms password

3. **Form Submission**
   - Sends POST request to `/api/registration/register`
   - Includes: inviteToken, email, username, password
   - Validates invite token and matches user data
   - Validates password requirements
   - Hashes password with bcrypt
   - Updates user record:
     - Sets `confirmed: true`
     - Stores hashed password
     - Clears inviteToken
     - Sets `isInvited: false`
   - Returns JWT token for immediate login
   - Redirects to admin dashboard

## Configuration Required

### Environment Variables (.env)

Add these to your `.env` file:

```bash
# Public URL for Email Links
# Set to your production URL when deploying
PUBLIC_URL=http://localhost:1337
# For production: PUBLIC_URL=https://your-domain.com

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=your-email@yourdomain.com
```

### Getting Resend Credentials

1. **Sign up for Resend**: https://resend.com
2. **Create an API Key**:
   - Go to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)
3. **Verify Domain**:
   - Add your domain in Resend dashboard
   - Configure DNS records (SPF/DKIM) as instructed
4. **Set environment variables**:
   - `RESEND_API_KEY=re_your_actual_key`
   - `RESEND_FROM_EMAIL=verified-email@yourdomain.com`

## How Auto-Fill Works

The auto-fill functionality is implemented using:

### 1. Email Link with Parameters
The email contains a specially formatted link with URL parameters:
```
http://localhost:1337/admin/register?inviteToken=abc123...&email=john@example.com&username=john
```

### 2. JavaScript Auto-Fill Script (`public/register-prefill.js`)
When the registration page loads:
- Extracts parameters from URL
- Finds email and username input fields in Strapi's form
- Pre-fills the fields with values from URL
- Makes fields read-only to prevent changes
- Stores invite token for form submission

### 3. Admin Panel Extension (`src/admin/app.tsx`)
- Detects when user is on registration page
- Stores pre-fill data for potential future use
- Integrates with Strapi's admin panel

### 4. Custom Registration Endpoint
The `/api/registration/register` endpoint:
- Accepts registration with or without invite token
- Validates invite token if provided
- Ensures email/username match invited user
- Updates existing user record (if invited) or creates new user
- Returns JWT token for login

## Security Features

### Token Security
- **Unique Tokens**: 64-character hex strings (256 bits)
- **Expiration**: 24 hours from creation
- **One-time Use**: Token is cleared after successful registration
- **Validation**: Token validated before allowing registration
- **User Verification**: Email and username must match invited user

### Password Security
- **Minimum Length**: 6 characters
- **Password Matching**: Confirmation must match
- **Hashing**: Uses bcrypt with 10 salt rounds
- **Secure Storage**: Never stored in plaintext

### Account Status
- `confirmed: false` - Initial state after creation
- `isInvited: true` - Marks user as invited
- Both set to true/false after registration completion

## API Endpoints

### 1. Validate Invite Token
**GET** `/api/invite/validate?token={inviteToken}`

**Response:**
```json
{
  "email": "user@example.com",
  "username": "johndoe"
}
```

**Errors:**
- `400` - Invalid token
- `400` - Token expired

### 2. Register User (Custom Endpoint)
**POST** `/api/registration/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "inviteToken": "abc123..." // Optional - if present, validates invited user
}
```

**Success Response:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "confirmed": true
  }
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Invalid email format
- `400` - Email or username already taken
- `400` - Password too short
- `400` - Invalid invite token (if provided)
- `400` - Email/username doesn't match invited user (if token provided)
- `400` - Token expired (if token provided)

### 3. Complete Registration (Legacy Endpoint)
**POST** `/api/registration/complete`

This endpoint is maintained for backward compatibility with the previous custom registration page.

## Database Schema (User Model)

Additional fields added to the default `plugin::users-permissions.user`:

```json
{
  "inviteToken": {
    "type": "string",
    "private": true
  },
  "inviteTokenExpiresAt": {
    "type": "datetime",
    "private": true
  },
  "isInvited": {
    "type": "boolean",
    "default": false
  }
}
```

## Troubleshooting

### Email Not Sending

**Check:**
1. Environment variables are set correctly
2. Resend API key is valid
3. From email is verified in Resend
4. Check Strapi logs for errors

**View Logs:**
```bash
npm run develop
# Look for: ✅ Welcome email sent successfully via Resend
# Or: ⚠️ RESEND_API_KEY or RESEND_FROM_EMAIL not found
```

### Registration Link Not Working

**Check:**
1. `PUBLIC_URL` is set correctly in .env
2. Link format is correct: `{PUBLIC_URL}/admin/register?inviteToken={token}&email={email}&username={username}`
3. Token hasn't expired (24-hour limit)
4. Token hasn't been used already

### Form Not Pre-filling

**Check:**
1. Open browser console (F12) for JavaScript errors
2. Look for console logs: `✅ Email pre-filled: user@example.com`
3. Check that `register-prefill.js` is accessible at `/register-prefill.js`
4. Verify URL parameters are present in the link
5. Refresh the page (sometimes form loads dynamically)

**Common Issues:**
- JavaScript disabled in browser
- Browser security settings blocking script
- Strapi form structure changed (rare)

### Registration Fails

**Common Issues:**
- Passwords don't match
- Password too short (min 6 characters)
- Token expired
- Token already used
- User already confirmed
- Email/username doesn't match invited user

**Check Browser Console:**
- View error messages in the form
- Check network requests for detailed error responses

## Testing the Flow

### 1. Local Development

```bash
# Start Strapi
npm run develop

# Create a test user in admin panel:
# Content Manager → Users → Create New Entry
# Fill in: username, email, (password optional)
# Click Save

# Check email in Resend dashboard or test email inbox
# Click the registration link
# Verify email and username are pre-filled (read-only)
# Fill in password and confirm
# Complete registration
# Should redirect to admin dashboard with logged in session
```

### 2. Production Deployment

```bash
# Set environment variables
PUBLIC_URL=https://your-production-domain.com
RESEND_API_KEY=your_production_key
RESEND_FROM_EMAIL=your-verified-email@domain.com

# Deploy to Railway/Vercel
# Follow deployment guide

# Test by creating a user in production admin panel
# Verify email delivery
# Test registration flow
# Verify auto-fill works
```

## File Structure

```
my-strapi-project/
├── public/
│   ├── register-prefill.js        # Auto-fill script for Strapi's registration form
│   └── registration.html         # Legacy custom registration page (can be removed)
├── src/
│   ├── admin/
│   │   └── app.tsx                # Admin panel extension for registration
│   ├── api/
│   │   ├── invite/
│   │   │   ├── controllers/
│   │   │   │   └── invite.ts     # Token validation endpoint
│   │   │   └── routes/
│   │   │       └── invite.ts     # Route definitions
│   │   └── registration/
│   │       ├── controllers/
│   │       │   └── registration.ts  # Registration endpoint (handles invite tokens)
│   │       └── routes/
│   │           └── registration.ts   # Route definitions
│   └── extensions/
│       └── users-permissions/
│           └── strapi-server.ts  # Lifecycle hook for email sending
└── .env                          # Environment variables
```

## Key Implementation Details

### Lifecycle Hook (`strapi-server.ts`)
- Triggers on `afterCreate` event for users
- Generates secure invite tokens
- Updates user with invite fields
- Sends email via Resend API
- Email link points to `/admin/register` with parameters

### Auto-Fill Script (`register-prefill.js`)
- Runs automatically when registration page loads
- Extracts email, username, inviteToken from URL
- Finds input fields in Strapi's form
- Pre-fills email and username fields
- Makes fields read-only (grayed out, non-editable)
- Stores invite token for form submission
- Adds invite token to form when submitted

### Admin Panel Extension (`app.tsx`)
- Monitors route changes
- Detects registration page access
- Stores pre-fill data in localStorage (backup mechanism)
- Integrates seamlessly with Strapi admin

### Registration Endpoint (`registration.ts - register`)
- Handles both invited and standard registration
- If inviteToken provided:
  - Validates token exists and isn't expired
  - Ensures email/username match invited user
  - Updates existing user record
  - Sets confirmed=true, clears token
- If no inviteToken:
  - Uses standard Strapi registration flow
  - Creates new user
  - Validates email format and uniqueness
- Returns JWT token for immediate login

### Token Validation (`invite.ts`)
- Verifies token exists in database
- Checks token is for an invited user
- Validates token hasn't expired
- Returns user data for pre-filling

## Differences from Previous Implementation

### Old System (Custom Registration Page)
- Used `/registration` URL with custom HTML page
- Custom registration form built from scratch
- Manual pre-filling logic

### New System (Strapi Default Registration)
- Uses Strapi's built-in `/admin/register` page
- Auto-fill script modifies Strapi's default form
- Seamless integration with Strapi admin
- Fields are read-only when invite token is present
- Better user experience (familiar Strapi interface)

## Best Practices

1. **Always set PUBLIC_URL correctly** for each environment
2. **Use verified email addresses** for RESEND_FROM_EMAIL
3. **Keep tokens confidential** - they're sensitive
4. **Monitor email deliverability** in Resend dashboard
5. **Test registration flow** before deploying to production
6. **Review logs** if something doesn't work
7. **Use strong passwords** when creating users
8. **Clear browser cache** when testing changes to auto-fill script

## Support & Maintenance

### Monitoring
- Check Strapi logs regularly
- Monitor Resend dashboard for delivery issues
- Track registration completion rates
- Check browser console for JavaScript errors

### Updates
- Keep Resend API key secure
- Update email templates as needed
- Review password policies periodically
- Monitor token expiration settings
- Test auto-fill after Strapi version updates

## Summary

This implementation provides a complete, secure user registration flow using Strapi's default registration page where:

✅ **Creating a user** automatically sends an email  
✅ **Email contains** a unique registration link with pre-fill parameters  
✅ **Link opens** Strapi's default registration page at `/admin/register`  
✅ **Form auto-fills** with email and username (read-only fields)  
✅ **User only needs** to set their password  
✅ **Registration completes** with automatic account activation  
✅ **Security is maintained** with token validation and password hashing  
✅ **User experience** is seamless using familiar Strapi interface  

The entire process is automated and requires no manual intervention beyond the initial user creation in the admin panel. The auto-fill script works transparently with Strapi's default registration form.
