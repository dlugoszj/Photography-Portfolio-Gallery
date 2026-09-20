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
src/
  pages/
    Home/             Public gallery views (category list, album list, image grid)
    Admin/            Login screen (Admin.tsx itself is currently unused/dead)
  components/         Shared UI: nav bar, modals for add/edit/delete, protected route
  utils/utils.ts      Firestore/Storage read-write helpers, client-side image resize (pica)
  firebaseConfig.ts   Firebase client SDK init
functions/
  src/index.ts        Cloud Functions: processImage (resize/convert/compress),
                      deleteDocumentsRecursively (cascading delete for admin)
firebase.json         Hosting, Functions, Firestore and Storage config
firestore.rules       Firestore security rules
storage.rules         Storage security rules
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
npm install
cp .env.example .env   # fill in Firebase web app config (see below)
npm run dev
```

Environment variables (`.env`):

```
VITE_FIREBASE_API_KEY=...
```

Other Firebase config (project ID, auth domain, etc.) is hardcoded in
`src/firebaseConfig.ts` since it's not sensitive — only the API key is templated.

Cloud Functions live in `functions/` and have their own `package.json`:

```bash
cd functions
npm install
npm run build
```

### Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc`) then build with Vite
- `npm run lint` — ESLint
- `npm run preview` — preview a production build locally

## Deployment

**CI:** pushing to `main` runs `.github/workflows/firebase-hosting-merge.yml`,
which builds the site and deploys `dist/` to the live Firebase Hosting channel.
Pull requests get a preview channel via `firebase-hosting-pull-request.yml`.
Both need two repository secrets:

- `VITE_FIREBASE_API_KEY` — the same value as in `.env`
- `FIREBASE_SERVICE_ACCOUNT_TATA_S_PHOTOGRAPHY` — a Firebase service account key

CI deploys Hosting only. Cloud Functions and security rules are deployed
manually, from the repo root with the Firebase CLI:

```bash
npm run build && firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules,storage
```

Note that nothing syncs rules automatically: editing them in the Firebase
console leaves the files here stale, and deploying overwrites whatever is live.

## Security rules

`firestore.rules` and `storage.rules` both grant public read access to gallery
content and restrict writes to an allowlist of admin user IDs (`isAdmin()`).
Anything outside `albumCategories` is denied to clients by default. Cloud
Functions use the Admin SDK and bypass rules entirely, which is how album
creation and cascading deletes work.

Adding an admin means adding their UID (Firebase console → Authentication →
Users) to the list in both files, then redeploying the rules.

## Planned work

See `TODO.txt`.
