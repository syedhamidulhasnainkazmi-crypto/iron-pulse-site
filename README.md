# Iron Pulse Fitness — Deploying on Vercel (with your own domain)

## What's in this package
- `index.html` — your gym site, with Sign In / Sign Up in the navbar
- `signup.html`, `signin.html` — matching auth pages
- `api/signup.js`, `api/login.js`, `api/export-emails.js` — serverless functions (Vercel runs these automatically, no config needed)
- `package.json` — the two small libraries the functions need

## Step 1 — Put this on GitHub
1. Create a free GitHub account if you don't have one.
2. Create a new repository, e.g. `iron-pulse-site`.
3. Upload every file in this package, keeping the `api` folder as a folder.

## Step 2 — Import into Vercel
1. Go to vercel.com → sign in (GitHub sign-in is easiest) → "Add New" → "Project".
2. Select your `iron-pulse-site` repo → Import.
3. Leave all build settings as default (Vercel auto-detects static + API). Click **Deploy**.
4. Wait ~1 minute — you'll get a live `.vercel.app` URL to test with first.

## Step 3 — Add the database (Vercel KV)
This is where signups get stored.
1. In your Vercel project → top tab **Storage** → **Create Database** → choose **KV**.
2. Name it anything (e.g. `iron-pulse-db`) → Create.
3. On the next screen, click **Connect Project** and select this project. Vercel automatically adds the required connection environment variables for you — nothing to copy/paste.

## Step 4 — Set your private owner key
1. Project → **Settings** → **Environment Variables**.
2. Add:
   - Name: `EXPORT_KEY`
   - Value: make up your own secret phrase (e.g. `hamid-iron-pulse-2026`) — treat it like a password, don't share it.
3. Save, then go to **Deployments** → click the three dots on the latest deployment → **Redeploy** (so the new variable takes effect).

## Step 5 — Connect your own domain
1. Project → **Settings** → **Domains** → type your domain → Add.
2. Vercel shows you a DNS record (usually an A record or CNAME) to add at wherever you bought your domain (GoDaddy, Namecheap, etc.).
3. Add that record in your domain provider's DNS settings. It usually goes live within a few minutes, sometimes up to a few hours.

## Getting your customer email list (owner-only)
Visit this URL any time — only works with your exact secret key:
```
https://yourdomain.com/api/export-emails?key=hamid-iron-pulse-2026
```
Downloads a CSV (Name, Email, Signed-up date) — opens straight in Excel. Nobody without that exact key can access it.

## Logo + "Add to Home Screen"
This package now includes a real logo (dumbbell + pulse line icon) and everything
needed for it to show up properly when a customer adds your site to their phone's
home screen from Chrome:

- `icon-source.svg` — the logo design (editable if you ever want to tweak it)
- `icons/` — the logo already converted into every size Chrome/iOS need
- `manifest.json` — tells Chrome the app's name, icon, and colors

**What your customer sees:** they open your site in Chrome on Android, tap the
three-dot menu → "Add to Home screen." It adds an icon (your logo) to their phone.
When they tap it, Chrome shows a brief loading/splash screen using your logo and
colors, then opens straight into your site like an app — no address bar. This is
automatic once `manifest.json` and the icons are uploaded, nothing else to configure.

No extra deployment step needed — just make sure the whole package (including
`icons/`, `icon-source.svg`, and `manifest.json`) goes into your GitHub repo along
with everything else.
