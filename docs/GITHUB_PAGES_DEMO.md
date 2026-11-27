# Waimushave portfolio demo

`demo` is the GitHub Pages branch. `main` remains the full-stack project. Do not merge demo-only changes into main just to publish the portfolio.

Twenty fictional jobs are in `src/demoJobs.ts`. Browse, search, category/city filters, pagination and details run in the browser. No API server, MongoDB, credentials or uploaded photos are needed. Login, posting, acceptance and private pages are disabled with an explanation.

## Enable Pages once

1. Repository Settings > Pages > Build and deployment > Source: GitHub Actions.
2. If GitHub blocks the demo branch: Settings > Environments > github-pages > Deployment branches and tags, allow the `demo` branch.
3. Open Actions > Deploy portfolio demo to GitHub Pages. Re-run a failed deployment after changing settings. Future pushes to demo deploy automatically.
4. Expected URL after successful deployment: https://nikoloz-museliani.github.io/Waimushave/

## Work locally

Commit or stash your current work before switching branches.

```bash
git fetch origin
git switch --track origin/demo
npm ci
npm run dev:demo
```

If you already have the local branch, use `git switch demo` then `git pull --ff-only` instead. Open the URL printed by Vite, including `/Waimushave/`.

Edit `src/demoJobs.ts`, then commit and push on demo. To return to the real project, use `git switch main`.

## Verification

```bash
npm run test:demo
npm run lint
npm run build:demo
```

The workflow publishes only frontend `dist`. The server folder is retained in source for reference but is not installed, executed or included in the published site. `npm run dev` and `npm run build` still select full-stack mode; use the explicit demo commands for this branch's portfolio.
