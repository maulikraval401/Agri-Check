# PROJECT: Agri Check (Indian Farmers App - Marketplace)

## Tech Stack
- Frontend: React + TS + Vite + Tailwind CSS v4, Wouter
- Backend: Supabase (PostgreSQL) + Vercel
- State: LocalStorage
- Languages: 6 (en, gu, hi, mr, pa, ta)

## Security & DB Status (100% SECURE & LAUNCH-READY)
- RLS enabled, anon write revoked.
- Supabase Test OTP restricted to specific number only 
- Phone formats normalized (12-digit with 91 prefix).
- EXIF/GPS stripped from photos via Canvas.
- Fake ratings blocked (User must contact seller first in `interests`).
- Account delete & Consent timestamp fully functional.
- `get_browse_listings`, `get_listing_contact`, `delete_my_account`, `renew_listing` RPCs active.

## Completed Features
- **Marketplace:** Sell, Browse (with pagination), Contact via WhatsApp (9191 bug fixed), MyListings.
- **Trust & Safety:** 5-Star Rating System, Report Button (Fake/Spam).
- **Mandi:** Grouped by Crop (Average) + Show All toggle.
- **Auth:** Login redirect validation, DPDP Consent Checkbox with DB Timestamp.
- **Misc:** 6 Languages fully mapped, Raw DB errors localized.

## 🚧 Final Pending (Pre-Launch)
1. **MSG91 Integration:** Twilio ki dummy keys hata kar MSG91 (ya real SMS provider) lagana hai.
2. **CAPTCHA:** SMS pumping attack rokne ke liye Supabase Auth me hCaptcha/Turnstile on karna hai.

## 🤖 AI Rules
- Language: Hindi/Gujarati mix.
- Code: Full file code blocks.
- Workflow: One task per turn.
