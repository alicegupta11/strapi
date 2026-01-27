# Testing Guide - User Registration with Auto-Fill

## Quick Test Steps

### 1. Start Strapi
```bash
npm run develop
```

### 2. Configure Environment Variables
Make sure your `.env` file has:
```bash
PUBLIC_URL=http://localhost:1337
RESEND_API_KEY=re_your_actual_key
RESEND_FROM_EMAIL=your-verified-email@domain.com
```

### 3. Create a Test User

1. Go to Strapi Admin: `http://localhost:1337/admin`
2. Navigate to: **Content Manager → Users**
3. Click **Create new entry**
4. Fill in:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **Password**: Leave empty (user will set this)
5. Click **Save**

### 4. Check Email

You should receive an email with subject: "Welcome! Complete Your Registration"

The email contains a link like:
```
http://localhost:1337/admin/register?inviteToken=abc123...&email=test%40example.com&username=testuser
```

### 5. Test Registration

1. Click the registration link in the email
2. Browser opens Strapi's default registration page at `/admin/register`
3. **Expected Result**:
   - ✅ Email field is **pre-filled** with `test@example.com`
   - ✅ Email field is **read-only** (grayed out, cannot be edited)
   - ✅ Username field is **pre-filled** with `testuser`
   - ✅ Username field is **read-only** (grayed out, cannot be edited)
4. Fill in:
   - **Password**: `Test123456`
   - **Confirm Password**: `Test123456`
5. Click **Register**
6. **Expected Result**:
   - ✅ Registration succeeds
   - ✅ Redirects to admin dashboard
   - ✅ User is logged in automatically

### 6. Verify in Admin Panel

1. Go to **Content Manager → Users**
2. Find the `testuser` account
3. Check:
   - ✅ **Confirmed**: `true`
   - ✅ **isInvited**: `false`
   - ✅ **inviteToken**: empty/null

## Troubleshooting

### Email Not Received

1. Check Strapi logs:
```bash
# Look for:
# ✅ Welcome email sent successfully via Resend
# Or errors if it failed
```

2. Check Resend dashboard:
   - Login to resend.com
   - View email logs
   - Check if email was sent successfully

3. Verify environment variables:
```bash
# In .env file:
RESEND_API_KEY=re_your_actual_key
RESEND_FROM_EMAIL=your-verified-email@domain.com
```

### Form Not Pre-filling

1. Open browser console (F12)
2. Look for console logs:
```
✅ Email pre-filled: test@example.com
✅ Username pre-filled: testuser
✅ Invite token stored
```

3. If no logs, check:
   - Refresh the page (Ctrl+F5)
   - Clear browser cache
   - Check URL parameters are present in the link
   - Verify JavaScript is enabled

### Registration Fails

1. Check browser console for error messages
2. Check Network tab (F12 → Network) for failed requests
3. Common issues:
   - Passwords don't match
   - Password too short (must be 6+ characters)
   - Token expired (24-hour limit)
   - Token already used

### Fields Not Read-Only

If fields are editable when they should be read-only:
1. Check browser console for JavaScript errors
2. Refresh the page
3. The fields should be grayed out with `cursor: not-allowed`

## Verification Checklist

After completing registration, verify:

- [ ] Email was received with registration link
- [ ] Link opens Strapi's default registration page (`/admin/register`)
- [ ] Email field is pre-filled with correct email
- [ ] Email field is read-only (grayed out)
- [ ] Username field is pre-filled with correct username
- [ ] Username field is read-only (grayed out)
- [ ] Password fields are empty and editable
- [ ] Registration completes successfully
- [ ] User is redirected to admin dashboard
- [ ] User is automatically logged in
- [ ] In Content Manager → Users: `confirmed=true`, `isInvited=false`
- [ ] `inviteToken` is cleared (null/empty)

## Browser Console Output

When testing, you should see these logs in the console:

```
✅ Email pre-filled: test@example.com
✅ Username pre-filled: testuser
✅ Invite token stored
✅ Invite token added to form submission
```

If you see errors instead, check the error message and refer to troubleshooting section.

## Strapi Server Logs

In your terminal, you should see:

```
👤 User creation started
📧 Email: test@example.com
🆔 User ID: 1
🔑 Generated invite token: abc123...
⏰ Invite token expires at: 2026-01-28T14:30:00.000Z
✅ Updated user with invite token
✅ Confirmed status: false
🔗 Registration Link: http://localhost:1337/admin/register?...
📧 Sending email via Resend from: your-email@domain.com
✅ Welcome email sent successfully via Resend
```

During registration:

```
🔑 Validating invite token for registration
✅ Invite-based registration completed for user: test@example.com
```

## Testing Multiple Users

Test the flow with multiple users to ensure it works consistently:

1. Create user: `alice` with email `alice@example.com`
2. Create user: `bob` with email `bob@example.com`
3. Create user: `charlie` with email `charlie@example.com`

Each should receive separate emails with unique invite tokens and work independently.

## Testing Token Expiration

1. Create a user
2. Wait 25+ hours
3. Click the registration link
4. Expected: Error message "Invite token has expired"

## Testing Token Reuse

1. Create a user
2. Complete registration using the link
3. Try clicking the same link again
4. Expected: Error message "Invalid invite token" or "Account already confirmed"

## Testing Without Invite Token

Standard registration (without invite) should still work:

1. Directly access: `http://localhost:1337/admin/register`
2. Fill in all fields (email, username, password)
3. Register
4. Expected: Creates new user without invite token validation

## Production Testing

After deploying to production:

1. Update `.env`:
```bash
PUBLIC_URL=https://your-production-domain.com
```

2. Deploy to Railway/Vercel

3. Create test user in production admin panel

4. Verify:
   - Email is sent successfully
   - Registration link uses production URL
   - Auto-fill works in production
   - Registration completes successfully

## Success Indicators

If everything works correctly, you'll have:

✅ **Automated workflow** - User creation triggers email automatically
✅ **Pre-filled forms** - Email and username auto-populate
✅ **Secure process** - Fields are read-only when invited
✅ **Seamless UX** - Uses Strapi's default registration page
✅ **Immediate login** - User is logged in after registration
✅ **Clean admin** - No manual intervention needed beyond initial user creation

## Support

If you encounter any issues:

1. Check browser console for JavaScript errors
2. Check Strapi terminal output for server errors
3. Check Resend dashboard for email delivery issues
4. Review `REGISTRATION_FLOW_GUIDE.md` for detailed documentation
5. Ensure all environment variables are set correctly
