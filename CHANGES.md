# BetView — Enhancement Changelog

## 🎨 UI/UX & Layout

### Dark / Light / System Theme
- New `ThemeContext` (`src/contexts/ThemeContext.tsx`) with localStorage persistence
- `ThemeToggle` component (`src/components/shared/ThemeToggle.tsx`) cycles Light → Dark → System
- Added full `.dark` CSS variables in `src/index.css` for all UI tokens
- Theme toggle visible in: HeroSection navbar, Browse nav, Pricing nav, PropertyDetail nav

### Wider Property Grid
- Browse grid upgraded: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (was 3-col max)
- Container widened to `max-w-screen-2xl` with tighter padding

### Page Transitions
- `.page-transition` CSS animation (fade + slide up, 300ms) added to `index.css`
- Applied to: Index, Browse, Pricing, Checkout, PropertyDetail pages

### Full-Page Property Detail
- New route `/property/:id` → `src/pages/property/PropertyDetail.tsx`
- High-res image gallery with thumbnails
- Full specs: rooms, living space, type, available date
- Interactive map (OpenStreetMap embed)
- 360° virtual tour embed
- Surrounding area & transport info
- Two CTAs: Contact Agent + Book a Visit

---

## 🔐 Authentication & Navigation

### Sign-Out Confirmation
- New `SignOutConfirmDialog` (`src/components/shared/SignOutConfirmDialog.tsx`)
- Replaces direct `signOut()` call in: HeroSection, Browse, AdminTopBar, AgencyTopBar
- "Are you sure?" modal with Cancel / Sign Out buttons

---

## 💳 Pricing, Checkout & Plan Activation

### Payment Methods on Pricing Page
- CBE Transfer and Telebirr badges displayed under each agency plan tier
- Plan cards now route to `/checkout` (for agency users) or `/auth` (unauthenticated)

### New Checkout Flow (`src/pages/Checkout.tsx`)
- Agency selects plan → routed with plan info via `navigate(state)`
- Displays plan summary + dynamic payment instructions (CBE / Telebirr)
- Secure file upload: accepts `.jpg`, `.png`, `.pdf`, max 5 MB
- Uploads proof to Supabase Storage bucket `payment-proofs`
- Creates `plan_purchase_requests` record with `status: pending_approval`
- Success screen shown after submission

### Admin Plan Request Review (`src/pages/admin/AdminPlanRequests.tsx`)
- Lists all plan purchase requests with agency name, plan, method, date, status
- **Approve**: updates request status + sets `agencies.plan_tier`
- **Reject**: requires reason from dropdown (or free-text "Other")
- Payment proof preview via signed Supabase Storage URLs (in modal)
- Accessible via Admin Sidebar → "Plan Requests"

---

## 🏠 Property Management

### Orphaned Properties
- AdminListings now fetches `agency_id` field
- New "Orphan" filter tab in Admin → Listings shows properties with `agency_id IS NULL`
- Database index `idx_properties_no_agency` added for performance

---

## 📅 Visit Booking & Agency Workflow

### Unified Booking Form (`src/components/browse/BookVisitModal.tsx`)
- Replaces old "Book Visit" toast placeholder
- Fields: Full name, phone, email, preferred date/time, notes, consent checkbox
- Inserts `visit_requests` record with `status: pending`
- Used in both PropertyModal (popup) and PropertyDetail (full page)

### Agency Visit Management (`src/pages/agency/AgencyVisits.tsx`)
- New page at `/agency/visits` — linked in Agency Sidebar
- Table shows all visit requests for the agency's properties
- **Accept** → sets `status: confirmed`
- **Reject** → dropdown (Already Sold / Not Available / Agency Policy / Other + text) → sets `status: rejected` with reason
- **Reschedule** → proposes new date/time → sets `status: rescheduled`

### Visit Status Enum
`pending | confirmed | rescheduled | rejected | cancelled`

---

## 🗄️ Database Migrations

File: `supabase/migrations/20260504_betview_enhancements.sql`

### New Tables
- `public.visit_requests` — visit booking records with full RLS policies
- `public.plan_purchase_requests` — payment proof submissions with RLS

### Storage
- Bucket: `payment-proofs` (private) — for payment receipt uploads

---

## 🔧 Routing Updates (`src/App.tsx`)
- `ThemeProvider` wraps entire app
- New public route: `/property/:id`
- New auth-required route: `/checkout`
- New agency route: `/agency/visits`
- New admin route: `/admin/plan-requests`

## 📌 Sidebar Updates
- **Agency Sidebar**: Added "Visit Requests" link (CalendarCheck icon)
- **Admin Sidebar**: Added "Plan Requests" link (CreditCard icon)
- **Admin/Agency TopBar**: Added ThemeToggle + SignOut confirmation
