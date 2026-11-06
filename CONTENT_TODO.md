# Krish Fashion Academy — Client Content Confirmation (CONTENT_TODO)

This document tracks all placeholder content, pricing assumptions, scheduling items, and operational details that require explicit confirmation from Krish (Academy Director).

---

## 1. Class Sessions & Tuition Fees (class_sessions)
- [ ] **Tuition Fee (CAD $):** Currently displayed as data-driven from `class_sessions.price_cad` (with sample fallback showing "Contact us for fees" if unset). Confirm standard tuition per student for the 2-Day Saree Blouse Master Class.
- [ ] **Discounts & Promotions:** Confirm whether promotional discounts (e.g. 30% OFF) apply to upcoming cohorts, their start/end dates, or eligibility conditions.
- [ ] **Seats Capacity:** Confirm actual batch maximum size (e.g., 10–12 students) and alert threshold (e.g., "Only 4 seats left").
- [ ] **Upcoming Dates & Times:** Confirm real dates for next intake cohorts. Sample currently assumes 2 consecutive Sundays, 11:00 AM – 4:00 PM.

---

## 2. In-Person Studio (Scarborough, Toronto)
- [ ] **Studio Real Photography:** Replace the current atelier placeholder photograph (`/images/home/studio-class.webp`) with authentic photos of Krish, the physical classroom, sewing machines, and studio setup at Middlefield & McNicoll.
- [ ] **Sewing Machines Provided:** Confirm whether in-person students use academy-provided sewing machines during class (assumed: yes, students practise on in-house machines).
- [ ] **Student Supplies / Fabric:** Confirm what students must bring (e.g. blouse fabric, matching thread, lining material, or if complete material kit is provided/available for purchase).

---

## 3. Online Live Master Class
- [ ] **Status:** Currently marked as **"Coming Soon"** with a WhatsApp waitlist link.
- [ ] **Launch Date:** Confirm tentative timeline for first live online batch.
- [ ] **Online Platform:** Confirm whether Zoom / Google Meet will be used for live sessions.
- [ ] **Home Equipment:** Confirm home equipment requirements for online participants (e.g., domestic sewing machine, fabric shears, iron).

---

## 4. Contact & Official Channels
- [ ] **Official Email:** `site_settings.email` is currently null/placeholder. The public site hides the email address unless provided in `site_settings`. Confirm the official inquiry email address.
- [ ] **Phone & WhatsApp:** Verified as `+1 647-501-9569` (`16475019569`). Confirm if additional backup numbers exist.
- [ ] **Social Media:** Confirm official Instagram handle (configured as `https://instagram.com/krishfashionacademy`).

---

## 5. FAQs Pending Confirmation
- [ ] **FAQ #6: Do I need my own sewing machine?** (Unpublished in DB until confirmed).
- [ ] **FAQ #7: What should I bring to class?** (Unpublished in DB until confirmed).

---

## 6. Student Gallery & Testimonials
- [ ] **Real Blouse Photos:** Upload real photos of student blouses via `/admin/gallery`. The public gallery remains hidden until verified student creations are uploaded.
- [ ] **Student Reviews / Feedback:** Review and approve student feedback submissions in `/admin`. The testimonials section remains hidden until verified feedback with publication consent exists in the database.

