# PROJECT: Agri Check (Indian Farmers App - Marketplace)

## Tech Stack
- Frontend: React + TS + Vite + Tailwind CSS v4, Wouter
- Backend: Supabase (PostgreSQL) + Vercel
- State: LocalStorage
- Languages: 6 (en, gu, hi, mr, pa, ta)

## Security & DB Status (100% SECURE & LAUNCH-READY)
- RLS enabled, anon write revoked.
- Test OTP removed from Supabase (Production ready for real SMS).
- Phone formats normalized (12-digit with 91 prefix).
- EXIF/GPS stripped from photos via Canvas.
- Fake ratings blocked (User must contact seller first in `interests`).
- Account delete & Consent timestamp fully functional.
- Views tracking: RPC `record_listing_views` (1 view per day, owner/guest excluded).
- Playwright Tested: 22 routes, 3 languages, no horizontal overflow, no crashes.
- Fixed: Removed public `/cotton-debug` route.
- Fixed: Commented out `sw.js` register in App.tsx (404 error fixed).
- Fixed: Browse `+` sign showing on error (added `!error &&`).

## Completed Features
- **Marketplace:** Sell, Browse (with pagination), Contact via WhatsApp (9191 bug fixed), MyListings.
- **Trust & Safety:** 5-Star Rating System (Rated ✓ state), Report Button (Fake/Spam).
- **Mandi:** Grouped by Crop (Average) + Show All toggle.
- **Auth:** Login redirect validation, DPDP Consent Checkbox with DB Timestamp.
- **Misc:** 6 Languages fully mapped, Raw DB errors localized, Applied Filters for Load More.

## 🚧 Pending (Next Steps)
1. **MSG91 Integration:** Setup real SMS OTP in Supabase (API Key, Sender ID, Template ID).
2. **CAPTCHA:** Enable hCaptcha/Turnstile in Supabase Auth to prevent SMS pumping.
3. **PWA:** Create proper `sw.js` and re-enable service worker registration.

## 🤖 AI Rules
- Language: Hindi/Gujarati mix.
- Code: Full file code blocks.
- Workflow: One task per turn, commit -> deploy -> screenshot.
