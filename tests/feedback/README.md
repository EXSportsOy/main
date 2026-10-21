# Feedback regression tests

Tests exercise the feedback feature maintained in this repository: the browser form, the Firestore security rules and the published production setup. The notification function has its own unit tests in `firebase/functions` (`npm test`).

## Run locally

Requires Node.js 20 or newer and Python on PATH. From `tests/feedback`:

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright starts a loopback-only static server automatically. Chromium loads the real application scripts. The Firebase SDK files that `feedback.js` imports from gstatic are served from the `firebase` npm package of the same version, and a test fails if the two versions differ, so bump both together. App Check is switched off for browser tests. A test also fails while `feedback-config.js` still has placeholder values. They cover English and Finnish website feedback, app selection, bug-report deep links and fields, required fields, email validation, the honeypot, and recovery after a failed submission. Every browser submission (`POST …/documents:commit`) is intercepted, decoded and answered by the test. Other write requests and unexpected Firebase calls are blocked. Script and stylesheet failures and uncaught JavaScript errors fail the test.

The browser suite also checks that language changes preserve the selected app and feedback view, direct localized links override a different remembered language, and translated guide/legal pages switch to the equivalent document (including the original English URLs).

## Security rules

`npm run test:rules` starts the Firestore emulator (Java 21 or newer, downloaded once by the Firebase CLI) with `firebase/firestore.rules` and checks that valid feedback is accepted, that every required field, allowed value, length limit, the `new` status and the server timestamp are enforced, that unknown fields are rejected, and that reading, listing, updating and deleting are denied. Nothing leaves the machine.

## Check the published site and production API

In PowerShell:

```powershell
$env:FEEDBACK_BASE_URL = 'https://www.exsports.fi'
$env:FEEDBACK_LIVE_API = '1'
npm run test:production
```

In a POSIX shell:

```sh
FEEDBACK_BASE_URL=https://www.exsports.fi FEEDBACK_LIVE_API=1 npm run test:production
```

The browser tests still intercept submissions when visiting the published site. The separate API test reads the published configuration, refuses to continue unless it names the `exsports-verkkosivut` project and a well-formed API key, and checks:

- Every Firebase SDK file that `feedback.js` imports is still served by the CDN.
- Listing feedback through the Firestore REST API is denied (`403`). `pageSize=1` limits what a regression could return.
- A submission with an empty message and one with an invalid category are both denied (`403 PERMISSION_DENIED`).

Live requests use only the website's public key, have 20-second timeouts, and are not retried. The API test stops at the first failed assertion. No service account or other repository secret is needed. Traces, screenshots and response-body artifacts are disabled.

If a security rule regresses, an invalid probe could be stored and the notification function could send an email. Look for `CI validation probe` in `message` or `page_url` in the Firebase Console and remove only that test document after investigating the failure. The probes contain no real contact details. Do not rerun a failing validation test repeatedly.

Coverage limits: these tests do not verify successful production writes or email delivery. When App Check is enforced, production denies the probes before the rules are evaluated, so the production test then confirms that unverified clients are blocked; the rule logic itself is covered by the emulator tests.

## GitHub Actions and failures

`Feedback tests` runs the browser tests, the security rule tests and the function unit tests for relevant pushes to main and pull requests. Once daily at 06:17 UTC and on a manual main-branch run, it checks both the checkout and production. After a successful `pages-build-deployment` on main from this repository, it checks the published site and API. Production checks do not run on pull requests or manual runs from other branches. Concurrent production runs are serialized.

A failed assertion makes the Actions job fail with a named test and diagnostic output. Enable **Settings → Notifications → System → Actions** notifications in your GitHub account (including email for failed workflows); delivery depends on each user's GitHub settings. Investigate failures rather than accepting a green HTTP status alone. No separate email integration is configured by this repository.

The daily schedule exists to catch regressions in SDK delivery, deployed configuration and deployed security rules between code changes. Adjust it according to testing needs. Public-repository schedules can be disabled after 60 days without repository activity; check the workflow state if daily results stop appearing.
