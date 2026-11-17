# Waimushave

React + TypeScript + Vite frontend, Express + TypeScript API, MongoDB database.

## Local setup

Use Node.js 24 LTS. In the project root run `npm ci`.
In `server` run `npm ci`.
Copy `server/.env.example` to `server/.env` and supply your own MongoDB URI and a long random JWT secret.
Do not commit `.env` or upload it with source archives.
The optional root `.env.example` documents the Google Maps browser key; restrict that key to your own site origins in Google Cloud.

Start the backend with `npm run dev` from `server`.
Start the frontend with `npm run dev` from the root; visit http://localhost:5173.
The Vite development proxy forwards `/api` and `/uploads` to port 5000.

## Checks

From the root: `npm run build` and `npm run lint`.
From `server`: `npm run build` and `npm test`.
Tests use an ephemeral local HTTP server and do not connect to your database.

## This maintenance update

- Frontend builds; lint passes. Canvas animation has typed references, elapsed-time motion and cleanup.
- Authentication hooks are separate from component exports. Network/server failures no longer delete a saved session token; retry by reloading when the service is available. Invalid sessions still clear the token.
- Login/register share a per-IP limit of 30 attempts per 15 minutes. Login failures use a generic message. Registration passwords are limited to 72 UTF-8 bytes for bcrypt.
- Job creation validates types, lengths, email, phone characters, price, categories, currencies, coordinates and dates. Invalid or duplicate multipart fields return 400.
- Images are decoded with Sharp and re-encoded as WebP, removing metadata. GIF uploads use their first frame. Limits: 6 images, 5 MiB each, 20 megapixels each. Failed writes are cleaned up.
- Search uses pages of 50 with a Load more button. Stale search responses do not overwrite newer results.
- New listings default to GEL; the map defaults to Tbilisi. Existing listing currencies are unchanged.
- Example configuration files contain placeholders only.

## Preserved behavior and remaining decisions

Acceptance still immediately assigns a job. Either participant can complete it. Cancellation, employer approval, and a revised contact/address visibility policy are not implemented in this update. Agree on these rules before adding their states and controls.
Current job phone/email visibility remains all authenticated users; addresses remain public.
The interface remains English. Georgian localization and city normalization remain future work.
JWTs remain in localStorage; a cookie-based session design is a separate change.
The rate limiter uses process memory; multiple backend instances need a shared rate-limit store. When deploying behind a reverse proxy, configure Express trust proxy for the exact trusted proxy topology (do not blindly trust all proxies).
Image decoding uses bounded pixels but still requires deployment-level concurrency/request controls.

## Hosting

The API requires a Node server, MongoDB, and persistent disk for `server/uploads` (or a future object-storage implementation). Static frontend hosting alone is insufficient.
Configure production routing for `/api`, `/uploads`, and React route fallback to `index.html`; the Vite development proxy is not a production reverse proxy.
No deployment or GitHub push is included in this update.

## Verification limitations

Frontend/backend compilation, lint, validation/image tests and HTTP boundary tests are covered.
Live MongoDB account/job flows, concurrency under real database load, and browser interactions still need an integration test pass with a disposable test database.

## Responsive interface update

The interface uses white, light gray, charcoal and muted red, with desktop side navigation and mobile bottom navigation. Browse jobs opens immediately, supports category/search/city filters and URL-based pagination. Listings have individual detail pages. My jobs shows the accepting worker’s name and a link to their public profile; it refreshes every 30 seconds while visible and when the window regains focus, with a manual refresh button. This is polling, not push or email notifications.

To install this update: retain your own server/.env and server/uploads, replace the source/configuration files, then run npm ci in BOTH the root and server directories before starting each dev server. Do not replace or delete your existing database.

Email verification, bot challenges, payments and in-app messaging are not enabled in this update. No account is labelled verified. Public profiles contain self-reported names, cities and bios only.

Desktop and 390px phone layouts were visually inspected using disposable sample data; sample pages are not included in this archive. Real database/browser job acceptance still needs an integration check with test accounts.

## November 17: readable components and preferences

Start with docs/AUTH_AND_ROUTES.md for the explained authentication/request flow and route table. Page/component styles live beside their TSX files; theme tokens and shared primitives live in src/styles/global.css. App.css only contains shell layout. Run npm run format to keep code consistently readable.

New pages: /my-jobs (your listings), /accepted-jobs (taken/completed work), /profile (account details and appearance). The avatar opens Profile. The GEO/ENG switch defaults to Georgian; both language and light/dark preference persist per browser.

Read docs/SEO.md for production URL setup and the remaining server-rendering/hosting requirements. The app is still a client-rendered React SPA, not a complete SSR migration.

Install: keep server/.env and server/uploads, run npm ci in both the root and server, then run npm run dev in each directory. No database migration is required. No live email verification, payments or messaging are added.
