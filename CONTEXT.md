# PROJECT: Agri Check (Indian Farmers App - Marketplace)

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS v4, Wouter (routing)
- Backend: Supabase (PostgreSQL) + Vercel (hosting)
- State: LocalStorage (contacted listings)
- Languages: 6 (en, gu, hi, mr, pa, ta)

## Security & Database (100% Fixed)
- RLS enabled. `anon` write revoked.
- `get_browse_listings` RPC (handles pagination & search).
- `delete_my_account` RPC (cleans auth & storage).
- Phone format normalized (DB has 12-digit with 91).
- `ratings` & `reports` tables active with RLS.
- **Rules:** No fake ratings (requires contact first), No duplicate listings, Rate limited.
- Photo upload strips EXIF/GPS via Canvas.

## ✅ Completed Features
- **Marketplace:** Sell, Browse, Contact via WhatsApp (9191 bug fixed), MyListings, Sold/Renew.
- **Trust & Safety:** 5-Star Rating System, Report Button (Fake/Spam).
- **Mandi:** Grouped by Crop (Average) + Show All toggle.
- **Auth:** Login redirect validation, DPDP Consent Checkbox with DB Timestamp.
- **Misc:** 6 Languages fully mapped, Raw DB errors localized, Pagination added.

## 🚧 Final Pending (Pre-Launch)
1. **MSG91 Integration:** Switch Supabase Auth from Test OTP to real SMS. Enable CAPTCHA to prevent SMS pumping.
2. **Native Speaker Review:** Verify Marathi, Punjabi, Tamil translations.
3. **Testing:** Run full end-to-end test on real mobile devices.

## 🤖 AI Rules
- Language: Hindi/Gujarati mix.
- Code: Full file code blocks.
- Workflow: One task per turn, commit -> deploy -> screenshot.
