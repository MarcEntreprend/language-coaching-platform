## Structure du projet

```
english-coaching-platform/
├── .github/
│   └── workflows/
│       └── cron.yml
├── .next/                          # (généré par Next.js)
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── availability/
│   │   │   │   └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── DeletePostButton.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── TogglePublishButton.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── BookingStatusActions.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── SessionNotesEditor.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── students/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── StudentProgressForm.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   ├── check-email/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (student)/
│   │   ├── dashboard/
│   │   │   ├── book/
│   │   │   │   ├── success/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── SuccessContent.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── blog/
│   │   │   │   ├── posts/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   ├── bookings/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── notes/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── status/
│   │   │   │   │       └── route.ts
│   │   │   ├── settings/
│   │   │   │   └── route.ts
│   │   │   └── students/
│   │   │       └── [id]/
│   │   │           └── progress/
│   │   │               └── route.ts
│   │   ├── availability/
│   │   │   └── route.ts
│   │   ├── bookings/
│   │   │   ├── [id]/
│   │   │   │   └── cancel/
│   │   │   │       └── route.ts
│   │   │   ├── status-by-session/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── cron/
│   │   │   ├── cleanup-pending-bookings/
│   │   │   │   └── route.ts
│   │   │   └── session-reminders/
│   │   │       └── route.ts
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── admin/
│   │   └── BlogPostForm.tsx
│   ├── JsonLd.tsx
│   └── LogoutButton.tsx
├── lib/
│   ├── email/
│   │   ├── booking-emails.ts
│   │   ├── resend.ts
│   │   └── templates.ts
│   ├── stripe/
│   │   └── server.ts
│   ├── supabase/
│   │   ├── admin-guard.ts
│   │   ├── client.ts
│   │   ├── public.ts
│   │   ├── server.ts
│   │   └── service-role.ts
│   └── utils/
│       ├── availability.ts
│       ├── blog.ts
│       ├── lib/
│       └── slugify.ts
├── public/
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-icon.png
│   ├── favicon.ico
│   ├── icon.png
│   └── manifest.webmanifest
├── supabase/
│   ├── migrations/
│   │   ├── 0003_store_settings.sql
│   │   ├── 0004_reminders_and_promo_decrement.sql
│   │   ├── 0005_blog_updated_at.sql
│   │   └── Migration-SQL.sql
│   └── seeds/
│       └── 0001_dev_promo_codes.sql
├── .env.local
├── .gitignore
├── globals.d.ts
├── middleware.ts
├── next-env.d.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

---
