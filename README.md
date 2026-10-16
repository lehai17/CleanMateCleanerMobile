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
- Search codes, customers and addresses without requiring Vietnamese accents.
- Filter by status and date (YYYY-MM-DD, Vietnam time); clear filters to see all work.
- The calendar shows accepted/in-progress work. Notification links open the exact
  assigned job in the Jobs tab, including completed work, with an option to view all jobs.
- Call the assigned customer and open a job address in Maps; unavailable apps show an error.
- Server enforces booking ownership, schedule overlap and one active job.
- Profile → Hỗ trợ đơn hàng opens reports for your bookings. Submit a problem,
  track its status and read the latest staff response; notifications open Support.

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

Verified 16 October 2026: 7 domain tests and the Android bundle export passed
(1,316 modules). A physical-device UI test has not been performed.

Profile → Đổi mật khẩu changes the current password and signs out after success.
The same screen offers confirmed logout from all CleanMate sessions without
changing the password, including Google-only accounts.
The backend invalidates every previous JWT; a protected request with a revoked
session also signs the app out. Quên mật khẩu now opens email-code recovery;
the security screen also verifies email. Real delivery requires SMTP setup.
See ../backend/ACCOUNT_RECOVERY.md for configuration and limitations.

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

Support → Xem trao đổi shows private message history and supports follow-up
messages, retry with the same request ID and loading earlier messages. A follow-up
reopens a resolved report. Staff replies are available through the existing inbox;
refresh a thread explicitly to reload its messages. No background push is added.
See ../backend/SUPPORT_CONVERSATIONS.md. Native UI interaction needs a device test.

Authentication safeguards: login/signup display the API's throttling message and
retry time. New-password inputs cap characters; the backend enforces 72 UTF-8
bytes. Existing login passwords remain supported up to 128 characters.
See ../backend/AUTH_RATE_LIMITS.md. Android export is not a device UI test.

Suggested GitHub repository: `CleanMateCleanerMobile`. Create an empty repository
and attach its URL as this folder's `origin`. Commit text:

```text
Add private support conversations and reply history
```

If Windows reports dubious ownership, run:
`git config --global --add safe.directory E:/cleanmate/cleaner-mobile`.
