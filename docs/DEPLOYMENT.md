# Deployment Guide

## 1. Deploy to Vercel

1. Push the project to a GitHub, GitLab or Bitbucket repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Vercel detects **Next.js** automatically. Keep the default build command (`npm run build`) and output settings.
4. Optional: add `NEXT_PUBLIC_SITE_URL` (your final domain, e.g. `https://www.example.com`). Without it, canonical URLs use Vercel's production URL.
5. Click **Deploy**.

No database, backend, API keys or environment variables are needed for the tools to work.

**CLI alternative:**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

Before deploying, check locally that the production build passes:

```bash
npm ci && npm test && npm run lint && npm run build
```

## 2. Custom domain

1. Vercel → Project → **Settings → Domains** → add `example.com` and `www.example.com`.
2. Create the DNS records Vercel shows you at your registrar:
   - apex domain (`example.com`): `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`

   Or switch your nameservers to Vercel DNS.
3. Choose one primary domain (e.g. `www.example.com`) and set the other to redirect to it.
4. Set `NEXT_PUBLIC_SITE_URL` to the primary domain, **including `https://`**, and **redeploy** so canonical URLs, the sitemap and structured data use it.
5. HTTPS certificates are issued automatically.

## 3. Google Search Console

1. Open https://search.google.com/search-console and add a property.
   - **Domain property (recommended):** verify with the DNS TXT record Google gives you.
   - **URL-prefix property:** choose *HTML tag*, copy only the `content` value, set it as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel, redeploy, then click **Verify**.
2. Go to **Sitemaps** and submit `https://www.example.com/sitemap.xml`.
3. Use **URL Inspection** on the home page and a few tool pages, and click **Request indexing**.
4. After a few days, review **Pages** (indexing) and **Core Web Vitals**.

## 4. Google AdSense

**Before applying:**
- Use your own custom domain. AdSense does not approve `*.vercel.app` sites.
- Set `NEXT_PUBLIC_CONTACT_EMAIL` so the Contact page shows a real address.
- Make sure the Privacy Policy (`/privacy-policy`) is reachable. It already contains the Google advertising disclosures.

**Steps:**
1. Sign up at https://adsense.google.com and add your site.
2. Copy your publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
3. In Vercel, set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to that value and redeploy. This:
   - loads the official AdSense script on every page, which AdSense uses to verify the site;
   - adds the `google-adsense-account` meta tag;
   - generates `/ads.txt` automatically (see below).
4. Wait for approval. Until slot IDs are configured, the script loads but no ad boxes appear on the page.
5. After approval, create four **Display ads → Responsive** ad units in **Ads → By ad unit**, and set their numeric slot IDs:

   | Variable | Placement |
   | --- | --- |
   | `NEXT_PUBLIC_ADSENSE_SLOT_HERO` | Below the hero (home page) |
   | `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | Between the tool and the educational content |
   | `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | Within the lower content section |
   | `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | Near the footer |

   Redeploy. Any slot left empty is skipped; nothing is rendered in its place.
6. Alternatively, leave the slots empty and turn on **Auto ads** in AdSense. The script is already present.

**Ad placement rules built in:** ads are never placed inside or between the editors or toolbars, each unit is labelled "Advertisement", and space is reserved (`min-height`) to avoid layout shifts and accidental clicks.

### Consent (EEA, UK, Switzerland)

Google requires a Google-certified consent management platform (CMP) for visitors in the EEA, UK and Switzerland. The simplest option:

1. AdSense → **Privacy & messaging → European regulations** → create a message and publish it for your site.
2. The consent message is served by the AdSense script the site already loads; no code changes are needed.
3. Optionally configure **US state regulations** messages too.

## 5. ads.txt

`ads.txt` tells ad buyers which sellers are authorized for your domain. It is generated at build time by `scripts/generate-ads-txt.mjs`:

- If `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is a valid `ca-pub-` ID, the build writes `public/ads.txt`:
  ```
  google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
  ```
- If it isn't set, no `ads.txt` is published, so a placeholder ID is never published.

After deploying, open `https://www.example.com/ads.txt` to confirm the file is served. AdSense can take a few days to detect it (**Sites** page → ads.txt status). The file must be on the root domain. If you serve the site on `www`, also make sure `example.com` redirects to it.

## 6. Post-deployment checklist

- [ ] `https://your-domain/` loads, and the formatter works with the network disconnected after the page loads
- [ ] DevTools Network tab shows no requests containing editor content
- [ ] `/sitemap.xml` and `/robots.txt` use your real domain
- [ ] View source shows the correct `<link rel="canonical">`
- [ ] Contact page shows your email
- [ ] Sitemap submitted in Search Console
- [ ] (After AdSense approval) `/ads.txt` is reachable and ads show in their labelled slots
- [ ] Lighthouse on the home page: Performance, Accessibility, Best Practices and SEO all in the green
