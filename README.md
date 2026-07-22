## Structure du projet

```
english-coaching-platform/
├── app/
│ ├── (auth)/
│ │ ├── login/page.tsx
│ │ ├── register/page.tsx
│ │ └── forgot-password/page.tsx
│ ├── (student)/dashboard/...
│ ├── (admin)/admin/...
│ ├── blog/...
│ └── api/...
├── lib/
│ ├── supabase/
│ └── utils/
├── supabase/
│ └── migrations/
└── middleware.ts
```

---

stripe --version
stripe version 1.44.0
PS C:\Users\mmarc\Documents\Programming\myProjects\websites_businesses\english-site> stripe login
Your pairing code is: nifty-neat-feat-fresh
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser or visit https://dashboard.stripe.com/stripecli/confirm_auth?t=IRnjVf0YK0oZsLsqluJOidKrOmjH8LXO (^C to quit)

> Done! The Stripe CLI is configured for Linkedin with account id acct_1Qy9fZCzMTxD4lN0
> Please note: this key will expire after 90 days, at which point you'll need to re-authenticate.
> PS C:\Users\mmarc\Documents\Programming\myProjects\websites_businesses\english-site>

---

stripe listen --forward-to localhost:3000/api/stripe/webhook

> Ready! You are using Stripe API Version [2025-02-24.acacia]. Your webhook signing secret is whsec_5c578e31dd2795df2e6ff5e323a048db142628df0a1adec927ea5e9cc19637e4 (^C to quit)
