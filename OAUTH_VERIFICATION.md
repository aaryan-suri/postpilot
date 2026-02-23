# Google OAuth Verification Checklist

If Google says "the website of your home page URL is not registered to you" even after setup, work through this checklist.

## 1. Account consistency (critical)

- The **same Google account** must:
  - Be Owner or Editor of the GCP project
  - Have verified the domain in Google Search Console
- If different accounts did Search Console vs GCP, re-verify in Search Console with the GCP project Owner account.

## 2. Search Console verification

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add a **URL Prefix** property (not Domain) for your exact homepage:
   - `https://postpilot.company` **or**
   - `https://www.postpilot.company`
3. Use whichever matches your OAuth consent screen (see #3).
4. Verify via DNS TXT or HTML file upload
5. Confirm the property shows as **Verified** for your account

## 3. GCP OAuth consent screen (exact match)

Ensure the homepage URL in GCP matches what you verified in Search Console:

- **Application home page:** `https://postpilot.company` (or `https://www.postpilot.company` if you use www)
- **Privacy policy link:** `https://postpilot.company/privacy-policy`
- **Terms of Service link:** `https://postpilot.company/terms`

**Authorized domains** (no `https://`):
- `postpilot.company`
- `postpilot-tawny.vercel.app` (if you use preview deployments)

## 4. Homepage must link to Privacy Policy

Your homepage must contain a clear link to the privacy policy. The footer includes a "Privacy Policy" link to `/privacy-policy`. This page is available at:
`https://postpilot.company/privacy-policy`

## 5. Enable Search Console API (optional but can help)

1. In [Google Cloud Console](https://console.cloud.google.com), go to **APIs & Services** → **Library**
2. Search for **Google Search Console API**
3. Enable it for your project  
   This can help Google link Search Console verification to your GCP project.

## 6. Use the exact verified URL

- If Search Console is verified for `https://postpilot.company`, use that in the OAuth consent screen.
- If verified for `https://www.postpilot.company`, use that instead.
- Keep it consistent everywhere.

## 7. Propagation and retries

- DNS and verification can take 24–48 hours.
- After changes, wait at least 24 hours before re-submitting.
- Clear cache and try incognito when re-checking.
