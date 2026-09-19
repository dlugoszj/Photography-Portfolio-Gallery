# Photography Portfolio

A photography portfolio site with a public gallery and a password-protected admin
area for managing albums and images. Built with React, TypeScript, and Firebase
(Firestore, Storage, Cloud Functions, Hosting).

## Stack

- **Frontend:** React 18 + TypeScript, Vite, React Router, Tailwind CSS
- **Backend:** Firebase Cloud Functions (Node 20, TypeScript), Sharp (image resize),
  `heic-convert` (HEIC/HEIF → JPEG)
- **Data/storage:** Firestore (album/image metadata), Firebase Storage (image files)
- **Auth:** Firebase Authentication, gating the `/admin` routes
- **Hosting/CI:** Firebase Hosting, deployed via GitHub Actions on push to `main`

## How it's structured

Content has three levels: **album categories → albums → images.** Each level is a
Firestore document with a cover image in Storage; images additionally have a
thumbnail (700×700) and full-size (2000×2000) rendition, generated server-side.

```
frontend/
  src/
    pages/
      Home/           Public gallery views (category list, album list, image grid)
      Admin/           Login screen (Admin.tsx itself is currently unused/dead)
    components/        Shared UI: nav bar, modals for add/edit/delete, protected route
    utils/utils.ts      Firestore/Storage read-write helpers, client-side image resize (pica)
    firebaseConfig.ts   Firebase client SDK init
  functions/
    src/index.ts        Cloud Functions: processImage (resize/convert/compress),
                         deleteDocumentsRecursively (cascading delete for admin)
```

**Routing** (`src/App.tsx`), via `react-router-dom` with `HashRouter`:

| Path | Page |
|---|---|
| `/` | Home — album categories |
| `/:categoryId` | Albums within a category |
| `/:categoryId/:galleryId` | Images within an album |
| `/login` | Admin login |
| `/admin`, `/admin/:categoryId`, `/admin/:categoryId/:galleryId` | Same views in admin mode (add/edit/delete UI), behind `ProtectedRoute` |

**Upload/processing pipeline:** an admin picks a file in a modal → it's resized
client-side with `pica` if it's large → uploaded to Storage → a Cloud Function
(`processImage`) downloads it, converts HEIC/HEIF to JPEG if needed, generates
resized/compressed renditions with `sharp`, and writes the resulting URLs back to
Firestore.

## Setup

Requires Node 20 (matches the Cloud Functions runtime).

```bash
cd frontend
npm install
cp .env.example .env   # fill in Firebase web app config (see below)
npm run dev
```

Environment variables (`frontend/.env`):

```
VITE_FIREBASE_API_KEY=...
```

Other Firebase config (project ID, auth domain, etc.) is hardcoded in
`src/firebaseConfig.ts` since it's not sensitive — only the API key is templated.

Cloud Functions live in `frontend/functions` and have their own `package.json`:

```bash
cd frontend/functions
npm install
npm run build
```

### Scripts (`frontend/`)

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc`) then build with Vite
- `npm run lint` — ESLint
- `npm run preview` — preview a production build locally

## Known issues

This project has some rough edges worth calling out up front rather than
discovering by surprise:

- **Firestore security rules are expired.** `frontend/firestore.rules` still has
  the Firebase default "test mode" rule, which only allowed access until
  2026-02-27. As written, all Firestore reads/writes are currently denied.
- **Storage security rules deny everything unconditionally** (`allow read, write:
  if false` in `frontend/storage.rules`), which also breaks image loading via
  `getDownloadURL`. Neither of these has real auth-based rules in place yet —
  that needs to happen before this could serve real traffic.
- **The Firebase Hosting deploy workflow is broken.**
  `.github/workflows/firebase-hosting-merge.yml` runs `npm ci && npm run build`
  from the repo root, but `package.json` lives in `frontend/`. It's been failing
  on every push to `main` since it's had no `working-directory` set.
- `.github/workflows/deploy.yml` is a fully commented-out legacy GitHub Pages
  pipeline, superseded by the two Firebase Hosting workflows above.
- `frontend/src/pages/Admin/Admin.tsx` is not wired into any route — dead code.
- **`npm run lint` doesn't work.** The only `.eslintrc.cjs` lives at the repo
  root, but ESLint resolves plugins relative to wherever the config file is —
  and there's no `node_modules` at the repo root (only in `frontend/`). ESLint
  fails to find `@typescript-eslint/eslint-plugin` even though it's installed.

See `frontend/TODO.txt` for planned feature work.
