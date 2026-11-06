# Krish Fashion Academy (KFA)

The official web platform and participant management system for **Krish Fashion Academy (KFA)**, located at Middlefield Rd & McNicoll Ave, Scarborough, Toronto, Ontario, Canada.

Krish Fashion Academy teaches tailoring, mainly saree blouse making, to beginners with hands-on 2-day masterclasses in-person and online.

---

## ✦ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components by default, Server Actions, TypeScript)
- **Styling:** Tailwind CSS (Luxury atelier palette: Gold `#C9A24A`, Light Gold `#E8C77A`, Charcoal `#2E333B`, Darker `#1F2329`, Off-White `#F7F3EC`)
- **Typography:** *Cormorant Garamond* (headings) & *Inter* (body) via `next/font`
- **Database & Auth:** Supabase (Postgres, Auth email/password, Row Level Security on all tables)
- **Currency:** CAD ($)
- **Contact:** +1 647-501-9569 (WhatsApp: https://wa.me/16475019569)
- **Location:** Middlefield Rd & McNicoll Ave, Scarborough, ON, Canada
- **Animations:** GSAP 3 (ScrollTrigger, DrawSVG stitch lines), Lenis (smooth scroll), Swiper (testimonials slider)
- **Forms & Validation:** `react-hook-form` + `zod` (`@hookform/resolvers`)
- **Future Payments:** Modular `lib/payments/` provider architecture (Manual e-Transfer / Stripe ready)

---

## ✦ Database Migrations & Setup

1. Open your Supabase Dashboard SQL Editor.
2. Run `supabase/migrations/20261105000000_init_schema.sql` (if starting fresh) or `supabase/complete_setup.sql`.
3. Run `supabase/migrations/20261105010000_update_schema.sql` to install the batch management, recordings, feedback, and FAQ tables.
4. Run `supabase/seed.sql` to seed the flagship **2-Day Saree Blouse Master Class**, Canadian studio settings, FAQs, and sample batch data.
5. Whenever you want to clean up sample data, run `supabase/cleanup_sample_data.sql`.

---

## ✦ Roles & Security

- **Public Visitor:** Explores upcoming masterclasses, view step-by-step syllabus, reads real student feedback, downloads .ics calendar invites, and registers via WhatsApp (+1 647-501-9569) or enquiry form.
- **Participant (Student):** Logs in to `/dashboard`. Can only view their own enrolled batches, Zoom join links (when batch is active), batch recordings (with resume playback), and submit batch feedback.
- **Admin (Krish):** Full academy CMS at `/admin` (Batches, Participants, Recordings, Enquiries Inbox, Feedback Moderation, Courses, Gallery, and Settings).

---

## ✦ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live website.
