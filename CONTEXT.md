# PROJECT: Agri Check (Indian Farmers App - Marketplace)

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS v4, Wouter (routing)
- Backend: Supabase (PostgreSQL) + Vercel (hosting)
- State: LocalStorage (contacted listings, etc.)
- Languages: 6 (en, gu, hi, mr, pa, ta)

## Database & Security Status (Fixed)
- Tables: `users`, `listings`, `interests` (RLS Enabled).
- Security: anon role write revoked; RPCs have rate-limit & expiry checks.
- RPCs: `get_listing_contact`, `get_listing_interests`, `get_browse_listings`, `renew_listing`, `delete_my_account`.
- Phone Format: DB stores 12-digits with `91` prefix (e.g., 919876543210).
- Storage: `listing-photos` (Public, 5MB limit, jpeg/png/webp only).

## ✅ P0 & P1 Issues (All FIXED)
- WhatsApp `9191` duplicate bug fixed in MyListings/Browse.
- Photo EXIF/GPS location leak fixed (Canvas resize).
- Account delete complete (Auth + Storage cleanup).
- Marathi typo in SellCrop fixed.
- Login return path, Consent timestamp, Raw DB error translations fixed.
- Duplicate listing spam block localized.

## 🚧 P2 (Low Priority / Next Phase)
1. **Report Button** (Flag inappropriate listings).
2. **Rating System** (Seller/Buyer ratings).
3. **MSG91 Integration** (Production OTP - replacing test numbers).

## 🤖 AI Rules (For future context)
- Language: Hindi/Gujarati mix.
- Code: Always provide full file code blocks.
- Workflow: One task at a time, ask for commit + deploy + screenshot.
