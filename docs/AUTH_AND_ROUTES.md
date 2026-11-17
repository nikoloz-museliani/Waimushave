# How authentication and routes work

## Two kinds of routes

React page routes choose which screen the visitor sees. Express API routes read or change data. They are not interchangeable.

| Page URL | Component | Purpose | Login required |
| --- | --- | --- | --- |
| `/` | MainMenu | Search public jobs | No |
| `/jobs/:id` | JobDetails | Read a listing; accept it when signed in | Reading: no; accepting: yes |
| `/people/:id` | PublicProfile | Read a worker’s public name/city/bio | No |
| `/login`, `/signup` | AuthPage | Enter an account or create one | No |
| `/my-jobs` | JobsPage, posted mode | Manage listings you created | Yes |
| `/accepted-jobs` | JobsPage, accepted mode | View work you took and finished | Yes |
| `/profile` | Profile | Edit your details and appearance | Yes |
| `/post` | PostJob | Add a listing | Yes |

The avatar opens `/profile`. It does not open the job lists.

## Registration and login, step by step

1. AuthPage collects the form fields and calls `signup` or `login` from `useAuth()`.
2. AuthProvider uses the shared `api()` wrapper to POST to `/api/auth/register` or `/api/auth/login`.
3. Express validates the input. Registration hashes the password with bcrypt before saving. Login compares the supplied password against the saved hash.
4. The server returns a signed JWT and public user fields. No password hash is returned.
5. AuthProvider stores the token and updates React’s user state. Every component now sees the same account.
6. AuthPage returns the visitor to the internal page they originally wanted.

A JWT is a signed claim, not encrypted private storage. `JWT_SECRET` belongs only in server/.env. Anyone who gets it can forge tokens.

## Reloading a page

AuthProvider finds the saved token and requests `/api/auth/me`. The server verifies the signature/expiry and looks up the account. ProtectedRoute displays a loading state until that request finishes. This avoids incorrectly redirecting a signed-in user during startup.

A 401 response removes the invalid token. A network outage does not delete it; reload once connectivity returns. Logout clears this browser’s token and React account state, but does not revoke an already-copied JWT. Changing that needs server-managed sessions or token revocation.

## Why ProtectedRoute is not security

A frontend guard only prevents confusing navigation. A person could call the API directly, without using React. Therefore every protected Express route uses `requireAuth` and checks authorization at the database query.

- `requireAuth`: invalid/missing token → 401; valid token → set `req.userId` and call `next()`.
- `optionalAuth`: public read is allowed; valid tokens allow the existing contact-visibility behavior.
- `req.userId`: derived from a verified token, never from a submitted job/profile field.
- `next()`: continue to the next middleware/handler.
- `populate('acceptedBy', 'name')`: replace the stored worker id with public identifying fields for display.

Accepting uses ONE atomic conditional update: the job must still be open and cannot belong to the caller. This avoids two people both taking the same job. Deleting requires the caller to be the poster and the job to be open. Completing keeps the existing rule that either participant may complete an in-progress job.

## Styling and preferences

Every visual component imports its own PascalCase CSS file. App.css contains only the app shell layout. `styles/global.css` owns reusable controls, typography, utility classes, and theme tokens. It does not own page-specific selectors.

`PreferencesProvider` holds language/theme once for the whole application. `usePreferences()` reads them. `georgian.ts` contains the interface translations; the English text is the lookup key. Category values sent to MongoDB remain English even when their labels are Georgian. User-authored content is never automatically translated.

Language defaults to Georgian (`ka`). Theme defaults to light. Preferences are stored under `waimushave.language` and `waimushave.theme` in this browser. Blocked storage is handled without crashing. They are not saved across devices/accounts.

## What was intentionally kept

React, Vite, Express, MongoDB, existing accounts and job records remain. Token storage remains localStorage to avoid quietly changing the authentication protocol. HttpOnly cookie sessions, email verification, bot challenges, payment processing and messaging are separate future changes. The code documents these limits rather than suggesting they already exist.
