# BetView

BetView is a real-estate web application with a public browsing experience, admin dashboard, authentication, and password reset flow.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Database)
- EmailJS (transactional email from frontend)
- Vitest + Testing Library

## Features

- Property browsing with map and compare tools
- Authentication (sign in)
- Forgot/reset password flow via Supabase Auth
- Admin panel for users, listings, inquiries, reports, logs
- Contact/demo request email integrations using EmailJS

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` from `.env.example` and set values.

Required keys:

```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

VITE_EMAILJS_SERVICE_ID="your_booking_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_booking_template_id"
VITE_EMAILJS_PUBLIC_KEY="your_emailjs_public_key"
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run test`: Run tests once
- `npm run test:watch`: Run tests in watch mode

## Password Reset Flow (Supabase)

- Forgot page sends reset email with:
	- `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- Reset page exchanges auth code and sets new password with:
	- `supabase.auth.exchangeCodeForSession(code)`
	- `supabase.auth.updateUser({ password })`

Ensure your Supabase Auth redirect URLs include:

- `http://localhost:8080/reset-password` (or your local dev URL)
- `https://your-domain.com/reset-password` (production)

## Deployment Notes

- App is a static frontend build (Vite) backed by Supabase and EmailJS.
- Deploy `dist/` to your static host (Vercel, Netlify, Cloudflare Pages, etc.).
- Set all `VITE_*` environment variables in your hosting platform.

## Repository

GitHub: `https://github.com/BLA573/BetView`
