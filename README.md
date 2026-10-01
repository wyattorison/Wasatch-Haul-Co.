# Wasatch Haul Co. website

A plain HTML/CSS/JavaScript site. No build step and nothing to install.

## Files
- `index.html` – the page
- `styles.css` – the look
- `app.js` – load-price slider and quote form
- `config.js` – where your Supabase URL and anon key go
- `supabase-setup.sql` – run once in Supabase to create the `quote_requests` table

## Setup
1. **GitHub:** upload all these files to the repo (Add file → Upload files → Commit changes).
2. **Vercel:** Add New → Project → import this repo → Framework Preset "Other" → Deploy.
3. **Supabase:** New project → SQL Editor → paste `supabase-setup.sql` → Run.
4. **Connect:** Supabase → Project Settings → API. Copy the Project URL and the anon public key into `config.js` (edit it right on GitHub with the pencil icon) and commit. Vercel redeploys automatically.
5. **Test:** submit a quote on the live site, then check Supabase → Table Editor → quote_requests.

Until step 4 is done, the form still works: it shows the customer a pre-filled message to text you.

## Before going live
- Replace the placeholder phone number: search `index.html` for `555-0142` and swap in your real number everywhere it appears.
- Update the business name if it changes.
