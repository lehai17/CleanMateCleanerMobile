# CleanMate Cleaner Mobile

Independent Expo/React Native app for cleaners, using the shared CleanMate API.
This folder has its own local Git repository on `main`. No commit, remote or
GitHub repository has been created automatically.

The native app has its own name, URL scheme and package/bundle identifier
`com.cleanmate.cleaner`, separate from the customer app. Tokens use Expo SecureStore
with a cleaner-specific key. Screens and source code are contained in this repo;
running it does not require the customer mobile/web repositories.

## Features

- Sign in/register; submit and resubmit cleaner applications with staff feedback.
- Pending applicants see profile/notifications only; approval unlocks work tabs.
- Dashboard from real job data, available work, assigned jobs, chronological schedule.
- Accept, start, complete and confirm receipt of cash after the completed job.
- Actual profile editing, logout and notification read state with pagination.
- Server enforces booking ownership, schedule overlap and one active job.

Customers pay cash directly to the cleaner after work. Displayed cash totals are
self-declarations, not app balances or amounts the platform owes the cleaner.
There is no mock personal profile, chat, GPS tracking or online checkout.

## Run with Expo

Requires Node.js 22 and a phone running a compatible Expo Go or a native dev build.
The project uses the same Expo SDK 54 baseline as the existing customer app.

```powershell
cd E:\cleanmate\cleaner-mobile
npm ci
$env:EXPO_PUBLIC_API_URL = 'http://192.168.1.10:5238'
npx expo start --port 8082
```

Replace the sample IP with your computer's LAN IP. The phone and API must be
reachable on the same network. `localhost` on a physical phone is the phone itself.
The backend must listen on a LAN-accessible address, for example from `backend/`:

```powershell
dotnet run --project CleanMate.Api --no-launch-profile --urls http://0.0.0.0:5238
```

Alternatively copy/edit `.env.example` to `.env`; Expo loads `EXPO_PUBLIC_API_URL`.
Development without an explicit URL uses the Expo development host (or Android
emulator `10.0.2.2`). Production exports require an explicit API URL; use HTTPS
for a deployed API. Configure the URL before exporting because Expo embeds it.
Keep the backend running and approve the cleaner from `../admin` before accepting
work. Existing approved cleaner accounts can sign in directly.

## Verification

Verified 16 October 2026: 3 domain tests and the Android bundle export passed
(1,308 modules). A physical-device UI test has not been performed.

```powershell
npm test
$env:EXPO_PUBLIC_API_URL = 'https://your-api.example.com'
npm run export:android
```

Tests cover the role gate, valid cash confirmation state and real cash totals.
The Android export compiles the native JavaScript/dependency graph. It is not
an APK or evidence of a physical-device UI test. Camera, signing, store release
and a native-device test runner are not configured here.

API job lifecycle and review flows are also covered by the sibling cleaner-web
Playwright suite, using an isolated real API/database. Browser mobile emulation
does not test this native app's UI. Generated bundles are ignored by Git.

## Separate Git

Suggested GitHub repository: `CleanMateCleanerMobile`. Create an empty repository
and attach its URL as this folder's `origin`. Commit text:

```text
Add dedicated cleaner mobile app with approval, jobs, and cash receipts
```

If Windows reports dubious ownership, run:
`git config --global --add safe.directory E:/cleanmate/cleaner-mobile`.
