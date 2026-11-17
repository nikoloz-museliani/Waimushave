# Search visibility and production hosting

Implemented:
- Georgian HTML language/default metadata; language attribute changes with the switch.
- Human-readable page titles and descriptions; public job metadata uses that job’s title and description.
- Real link URLs, heading structure, image descriptions, and semantic navigation.
- Canonical and Open Graph URLs when VITE_SITE_URL contains your real HTTPS origin.
- Client-side noindex for account pages, profiles and search-filter results.
- A sitemap endpoint listing only open jobs and the homepage when SITE_URL is configured.

Before public launch:
1. Set VITE_SITE_URL for the frontend build and SITE_URL for the backend to the same real HTTPS origin.
2. Proxy `/api` and `/uploads` to Express. Proxy `/sitemap.xml` and `/robots.txt` to Express as well.
3. Serve the frontend index.html on direct React page loads. Missing pages/jobs need real 404 statuses in a server-rendered deployment, not a universal 200 response.
4. Submit /sitemap.xml in Google Search Console and inspect representative pages.
5. Use server rendering or prerendering for public job pages if reliable social previews and crawler-visible initial content matter. This update remains a client-rendered Vite app; many link preview bots do not execute its JavaScript.
6. Private data must stay protected by the API. noindex and robots.txt are not access controls.

The language switch changes UI on the same URL. It is not a separate English/Georgian indexed URL structure; do not add hreflang links claiming alternate pages until actual language-specific URLs exist. User content stays in its original language. Ranking is never guaranteed.

We deliberately do not add JobPosting structured data to every listing: small local tasks are not automatically conventional employment vacancies, and eligibility/required fields must be checked first.
