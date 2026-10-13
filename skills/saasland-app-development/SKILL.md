---
name: saasland-app-development
description: Create ordinary HTTP SaaS apps for saasland.io ZIP or folder deployment, using the supported runtime and browser SDK.
---

## SaaSland contract version 3

Use `import { saasland } from "/_saasland/sdk.js"` and `X-Saasland-*` trusted headers. This contract is intentionally breaking; previous SDK names, routes, cookies and message names have no aliases. The version 3 package is prepared locally; adopt it together with the corresponding platform deployment. Existing apps need source updates and redeployment.


# Build an app for saasland.io

Contract revision: 2026-10-12. Read the public [developer documentation](https://saasland.io/developers) without signing in. Check current MCP tool schemas and portal feature availability. Do not claim deployment until get_app_status or the portal reports Ready.

## Default approach: call the resource directly

For new apps and examples, use the simplest supported SDK call from the user's feature action: `profile.read`, `profile.checkAge18`, `wallet.check`, or `wallet.charge` with its required limits, purpose, expiry and action key. Omit `grantId`. The platform checks consent, shows its review when approval is missing, and continues after approval. Existing grants are silent; denial ends the current call with `permission_denied`. A later call can ask again; do not automatically retry denied calls. Handle partial profile results and explain any unavailable feature in the app.

Do not add a permission preflight, custom consent screen, grant-ID storage or a separate “Request permissions” button to a starter app. `profile.request`, `profile.requestAge18`, `wallet.requestCheck`, `wallet.requestRecurring` and `permissions.request` are advanced options for an intentional review-in-advance flow or an existing explicit-grant integration. They are not prerequisites for resource calls. One-time paid actions still use `wallet.authorize` followed by completion advice, and prepaid plans use `wallet.subscribe`; these calls include their own required consent.

Profile and wallet permissions need no developer declaration in app configuration. Supported scopes are requested at runtime and only the user can approve them. MCP OAuth grants permission to manage apps; it never grants a hosted app access to an end user's profile or wallet.

These SDK calls require an authenticated app page. For a public landing page, follow [Sign-in and public paths](#sign-in-and-public-paths): make its complete asset dependency tree public and render it without importing the protected SDK. A public `/` does not make `/styles.css`, `/app.js` or `/assets/*` public.

## Find the right workflow

- [Getting started and quick start](https://saasland.io/developers#quick-start): a complete minimal HTTP project and deployment steps.
- [User identities](https://saasland.io/developers#identity): private account IDs, stable app-scoped subjects and permission-protected usernames.
- [Permissions and profile](https://saasland.io/developers#permissions): username-only requests, partial approval, expiry and revocation.
- [Payments](https://saasland.io/developers#wallet-contract), [subscriptions](https://saasland.io/developers#subscriptions) and [usage permissions](https://saasland.io/developers#recurring-payments): choose the right payment lifecycle.
- [Files and data](https://saasland.io/developers#storage-contract), [preferences](https://saasland.io/developers#appearance-contract), [navigation](https://saasland.io/developers#navigation) and [HTTPS APIs](https://saasland.io/developers#connections).
- [Configuration and secrets](https://saasland.io/developers#manifest), [private testing and publication](https://saasland.io/developers#publication), [support and refunds](https://saasland.io/developers#operations).
- [SDK reference](https://saasland.io/developers#sdk-reference), [troubleshooting](https://saasland.io/developers#troubleshooting) and [capabilities and limits](https://saasland.io/developers#available-today).

## SDK at a glance

Import `{ saasland }` from `/_saasland/sdk.js` on authenticated pages only. Every call is detailed in the sections below.

| Feature | Calls |
| --- | --- |
| Identity | `saasland.me()` |
| App data and files | `store.get/put/delete`, `files.list/upload/download` |
| Profile and age | `profile.read`, `profile.checkAge18`, `profile.getAge` (advanced: `profile.request`, `profile.requestAge18`) |
| Credit checks and usage charges | `wallet.check`, `wallet.charge` (advanced: `wallet.requestCheck`, `wallet.requestRecurring`) |
| One-time payments | `wallet.authorize` → `wallet.advice` or `wallet.release`; `wallet.payment` for status |
| Prepaid subscriptions | `wallet.subscribe`, `wallet.subscription` |
| Explicit permission requests | `permissions.request`, `permissions.status` (advanced only) |
| Online presence | `presence.start` → `stop`, `presence.get(userIds)` |
| Language and appearance | `preferences.get`, `preferences.subscribe` |
| Platform menu | `navigation.register` |
| Visitor cookie choices | `storageConsent.get`, `storageConsent.subscribe` |

Developers manage apps through the saasland.io MCP tools (`list_apps`, `create_app`, `create_source_upload`, `deploy_source`, `redeploy_app`, environment, firewall, database and browser-storage tools, deployments, activity and logs) or the portal. Publication is portal-only.

Local HTTP tests do not provide platform sign-in, SDK endpoints or real payment approval. Use clearly labeled test doubles locally and verify the actual integration in a private deployed app. Unsupported app APIs include scheduled jobs, WebSockets, unrestricted container internet access, custom domains, GitHub imports, camera/microphone, and payout operations. The separate developer workspace supports reviewed manual payout preparation; it does not send money. saasland.io does not age-gate visits: public paths are open to everyone, the app decides who sees its signed-in pages, and the platform checks the `minimumAge` you attach to paid features (see [Age limits](#age-limits)). Birthday and age disclosure do not verify age.

## Credit prices and the approved coin

Every visible credit price, balance, limit, payment button and refund amount uses the approved saasland.io two-coin logo beside the number. Black, white and colorful variants are all acceptable; choose a readable color for the surface. Do not replace the coin with the word “credits”, a credit-card icon, emoji, generic coin or arrow. An Answer action costing one credit should read visually as **Answer · [coin] 1**, with no navigation arrow. Reserve new-tab arrows for actual new-tab links. Keep the unit “credit”/“credits” available to screen readers and in explanatory prose; EUR prices and supplier earnings are money, not credits.

The plugin and skills-only package include these approved assets next to this skill. Copy the chosen file into the app's own static assets and include it in the source ZIP; do not depend on the platform repository or a runtime hotlink:

| Variant | SVG (bundled) | Transparent 512px PNG (download) |
| --- | --- | --- |
| Color | [credits-coin.svg](assets/credits-coin.svg) | [credits-coin.png](https://saasland.io/assets/credits-coin.png) |
| Black | [credits-coin-black.svg](assets/credits-coin-black.svg) | [credits-coin-black.png](https://saasland.io/assets/credits-coin-black.png) |
| White | [credits-coin-white.svg](assets/credits-coin-white.svg) | [credits-coin-white.png](https://saasland.io/assets/credits-coin-white.png) |

Prefer the bundled SVG. If an app needs a PNG, download it from the link above once and bundle the file in the app.

When using only the downloaded public SKILL.md without its sibling assets folder, download the chosen filename from `https://saasland.io/assets/` (for example [color SVG](https://saasland.io/assets/credits-coin.svg)), then bundle it locally. Preserve the supplied geometry, aspect ratio, transparency and SVG masks. Render at least 20px square beside compact amounts; larger balances may scale the icon with the number. Use white artwork on dark/saturated buttons, black on light surfaces, or the color artwork where it has enough contrast.

```html
<button type="button" class="paid-action">
  Answer · <span class="credit-price"><img src="/public/assets/credits-coin-white.svg"
    width="20" height="20" alt="" aria-hidden="true"> 1<span class="sr-only"> credit</span></span>
</button>
<style>
.paid-action { display:inline-flex; align-items:center; gap:8px; min-height:44px; background:#6c47ff; color:#fff; border:0; border-radius:8px; padding:12px 16px; font:inherit; }
.credit-price { display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
.credit-price img { display:block; flex:none; object-fit:contain; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
</style>
```

If using the portable saasland.io design kit, reuse `creditsMarkup(amount)` from `ui.js` with its unchanged `styles.css` and bundled coin SVGs. `creditIcon('auto' | 'black' | 'white' | 'color')` supplies a decorative coin; `auto` follows the surrounding text color. These are presentation helpers, not wallet APIs. Check desktop/phone, light/dark and disabled states before delivery, and confirm the deployed app serves the bundled artwork.

## Deliver a complete project

Create the requested app with source, a Dockerfile, dependency declarations and lockfiles where applicable, and concise local run/test instructions. Provide the exact portal settings to enter. No saasland.io manifest file is required. Do not require access to the platform repository, AWS credentials, or a public GitHub repository.

Deliver a downloadable source ZIP. When the user asks to deploy and saasland.io MCP tools are available, use MCP plus its signed HTTP ZIP upload. List the user's apps first; if it is unclear whether to update an existing app or create a new one, ask that choice before writing. Reuse the selected app's slug for updates. For an explicit new app, create_app reserves a private draft with technical settings; create_source_upload → HTTP PUT of the ZIP → deploy_source saves its next version for review. Reuse returned identifiers on retries, verify awaiting-publish and give the owner its portal review link. If the bundled saasland-apps skill is available, follow its detailed upload workflow.

Prepare the optional content self-check, app details, categories, artwork, policies through MCP using the source and authorized requirements. Use get_app_configuration/set_app_configuration and the artwork upload tools, then get_app_publication_review to finish setup. The owner reviews the saved changes and publishes in the portal. MCP cannot publish or unpublish; updating an existing app preserves its publication state. Do not automate Chrome, browser extensions, portal uploads or form filling. If MCP or local-file HTTP upload is unavailable, provide the actual ZIP and manual instructions below; do not substitute browser automation or claim upload succeeded. Sign-in and required account agreements are completed by the user.

Prefer Node.js 22 or Python 3.13: both example containers have passed build, image scan and Lambda health tests. These are tested examples, not a promise that every library or framework works. Other languages can work when packaged in a compatible container but are not individually verified. Containers supply their own runtime; Lambda's managed language runtime list does not limit this container contract.

## HTTP container requirements

- One Linux x86-64 (amd64) image, at most 1 GB uncompressed including the platform wrapper. No Docker Compose or multi-service deployment.
- Start the HTTP server through Dockerfile CMD/ENTRYPOINT. Listen on `0.0.0.0` and `process.env.PORT` or its language equivalent, default 8080. EXPOSE alone does not start or configure a listener.
- Respond to `GET /health` with exactly HTTP 200, quickly and without authentication or external dependencies. The health path is configurable.
- The platform adds Lambda Web Adapter; do not implement a Lambda handler or add another adapter. Serve browser assets from the app's own origin.
- Treat execution as stateless and restartable. The image filesystem is read-only; `/tmp` is temporary. Use platform storage for durable data. Do not rely on process memory or local files persisting between requests.
- Request timeout is 1–20 seconds; memory is 256, 512, 1024 or 2048 MB. Defaults: 20 seconds and 512 MB. Ports are 1024–65535 except reserved 3000 and 9001.
- WebSockets, permanent background workers, scheduled jobs, unrestricted container internet access and direct external database connections are not supported. External HTTPS APIs use ordinary server-side HTTP clients, app-owned API keys in environment variables and owner-configured Outgoing firewall destinations. The HTTP client must honor the supplied HTTPS_PROXY setting; saving an API key alone does not grant network access.
- Install dependencies in the Dockerfile from public sources. Installed dependency folders and virtual environments are excluded from uploads. Private package/build credentials are not supported. Use maintained base images and dependencies; OS image scans must complete with no HIGH or CRITICAL findings. Scanning does not certify all libraries or application behavior.

Minimal Node project:

```dockerfile
FROM node:22-alpine
RUN apk upgrade --no-cache
WORKDIR /app
COPY main.mjs ./
ENV PORT=8080
EXPOSE 8080
CMD ["node", "main.mjs"]
```

```js
// main.mjs — replace the root response with your app and its asset routes.
import http from 'node:http';
http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(req.url === '/health' ? 'ok' : 'hello world');
}).listen(Number(process.env.PORT || 8080), '0.0.0.0');
```

## Upload and configuration

For manual upload, direct the user to [Your apps](https://saasland.io/?view=apps): choose Create app for a new app, or open the selected app and choose Upload new version for an update or already-created draft. The user selects the project directory or ZIP and reviews the excluded files. A typed local path alone does not give a website access to a directory. Relative paths are retained; a common outer wrapper folder is removed. Provide the ZIP and these steps; the user operates the portal.

Enter app name/address and description, Dockerfile path (`Dockerfile`), build context (`.`), port (`8080`), health path (`/health`), memory (`512` MB), timeout (`20` seconds), and required Files/Datastore capabilities. No source manifest is needed. New apps are private; use Manage testers for invited users and publish separately when ready and eligible.

Limits: 25 MiB compressed ZIP, 100 MiB expanded, 5,000 entries; uploads are not limited per day and each one replaces the previous ZIP; 10 publishes (builds and deployments) per creator per UTC day. Unsafe paths, symlinks, special files, encrypted/split/ZIP64 archives and duplicate/case-colliding paths are rejected.

Exclude credentials and secrets from source. The uploader excludes `.env*`, `.git`, credential directories, private keys and installed dependencies, but cannot detect every hardcoded secret. Root `.env` values can be reviewed locally and imported individually with masked opt-in. Simple single-line NAME=value syntax only; no shell evaluation or interpolation. Runtime settings are stored separately and never supplied to the image build. Frontend code must never receive secrets. Limits: 30 keys and 2,500 JSON bytes; platform/runtime/database-reserved keys cannot be overridden.

Upload new version reuses saved configuration and runtime settings. Omitted keys remain; remove keys explicitly. The platform validates source, builds with AWS CodeBuild, scans in ECR and checks the candidate Lambda before switching traffic. A failed replacement leaves the current app running. Consult Deployment history for progress and failures.

After a successful source deployment, **Your apps → app → Environment variables** lists configured names and supports add, replace and delete without a new source upload. Saved values are write-only in settings/APIs; review shows names and actions only. Values are literal strings, so Secret Manager ARNs, paths and interpolation templates are not resolved. The platform stores an app-specific secret bundle and injects values into the replacement runtime before startup. Save the runtime draft, then review and Publish to apply changes. Server code reads its provider API keys from this environment. Configure **Outgoing firewall** for the corresponding public destinations. The platform reserves proxy variables and injects its standard HTTPS proxy when active. Platform/database variables stay separately managed. Undeployed drafts can save variables for the first deployment without starting a runtime. Check portal availability before offering runtime updates.

With MCP, call `get_app_environment` for names and the shared settings revision, then `set_app_environment` with that `revision`, a UUID `requestId`, and `variables: [{name, value}]` to add or replace authorized literal values. Omitted names remain unchanged; `remove: [name]` removes explicitly selected variables. Reuse the same requestId and arguments on uncertain retries. Reads and save responses never return values. Saving prepares a draft for the owner's Publish review and does not restart the app. Keep values out of source, browser responses, logs and summaries; never add an endpoint or read logs to recover saved secrets. Runtime code can read its own environment, so write-only management does not stop deliberately modified app code from exposing it. If the tools are absent, hand off the portal environment editor.

## Online friends and app presence

On authenticated game/lobby pages, call `const presence = saasland.presence.start({ onError })` once to track this page while visible and connected. Query `const { users } = await saasland.presence.get(friendIds)` for up to 50 known app-scoped `usr_…` IDs; results are `{ userId, online }`. Your app owns friendship, nicknames and the friend list. No platform-wide activity, account IDs, user directory or last-seen times are disclosed. Same-app callers who know an ID can query it; presence is not friend-only authorization.

The SDK sends a heartbeat every 30 seconds while visible. Hidden pages pause and send a best-effort offline update; returning resumes. Multiple tabs/devices are independent; one visible tab keeps the user online. Lost connections expire within 90 seconds. `await presence.stop()` disables this page's tracking and removes listeners/timers. SDK import and presence queries alone do not start tracking. Client IDs live only in memory; this feature adds no localStorage or cookie declaration.

Poll known friends about every 30 seconds while visible, handle rejected requests as status unavailable, and clear stale online indicators after failures. Unknown, inaccessible, expired and other-app IDs return offline without confirming an account exists. Do not use presence to authorize moves, payments or multiplayer actions: it is approximate page activity, not proof a person is available. Explain presence to users and offer stop tracking when they disable the feature. Profile fields retain their separate permission requirements.

Limits: 50 queried IDs, 4 KiB JSON, 20 presence requests per app/user/minute, 32 recent tab leases. Normal gateway limits also apply. Browser SDK calls use protected `POST /_saasland/presence/query` (`{ userIds }`) and `/heartbeat` (`{ clientId, sequence, online }`) with same-origin sessions and CSRF; do not call from public anonymous pages or invent server credentials.

## Sign-in and public paths

New apps start with `/`, `/public` and `/public/*` configured. Review or change them in **Your apps → Configuration → Access** before publishing: `/` for home only, `/public` for that exact path, and `/public/*` for its descendants (add both to include the parent). Paths are case-sensitive; queries do not affect matching. Use at most 50 paths, 256 characters each, with ASCII letters, digits, slash, dot, underscore, tilde and hyphen; only a final `/*` wildcard is supported. Only saved exceptions allow anonymous requests. Private apps stay private. Listed paths can be viewed without logging in once the app is published; there is no separate acknowledgement, so put only intentionally public content there. Changes apply without restart and may require permission reapproval; runtime updates preserve them. Publication sends playback-check issues to Public-page checks, where owners can view status, start an inspection or open a prefilled support request for investigation/Admin review.

### Prevent unstyled or broken signed-out pages

**Making the HTML page public does not make its dependencies public.** With the defaults, `/styles.css`, `/app.js`, `/icon.svg` and `/assets/*` still require sign-in. The browser receives login redirects instead of CSS, JavaScript or artwork; the result can be bare HTML, broken images and a permanent “Connecting” message. An owner preview can hide this error because it is authenticated.

For new apps with public pages, serve their static files at URLs beneath `/public/` and use those URLs in the HTML. For example, this landing page works with the default access paths when the server implements these routes:

```html
<link rel="stylesheet" href="/public/styles.css">
<link rel="icon" href="/public/icon.svg" type="image/svg+xml">
<script type="module" src="/public/landing.js"></script>
<a href="/app">Sign in to use the app</a>
```

Keep `/app` protected in this example. `landing.js` renders public content without importing `/_saasland/sdk.js`. Load SDK-dependent modules only on authenticated pages, based on the trusted server `X-Saasland-Authenticated` header; do not infer authentication from browser storage or a successful HTML fetch. Show a usable signed-out state and a sign-in link instead of waiting for SDK initialization.

Check the **served URL**, not the source folder name: a filesystem `public/` folder mounted at `/` still produces protected `/styles.css`. Include nested JavaScript imports, lazy chunks, CSS `@import` and `url()` dependencies, fonts, images, icons and any intentionally public data requests. Bundle portable design-kit dependencies under the same public URL subtree while preserving their relative imports. Public routes must not expose private data or paid operations.

For existing apps, either move public dependencies under an already allowed subtree and update their references, or prepare the exact additional paths through set_app_configuration.publicPaths (for example `/styles.css`, `/app.js`, `/icon.svg`). A dedicated static subtree such as `/assets/*` is an alternative only when all its contents are intended to be public. Do not replace the access list with `/*` or expose API routes to repair styling. Preserve saved access choices; MCP prepares public-path drafts, while the owner performs the final publication review.

Before handoff, check the source's public-page dependency URLs against the intended access list. Once the owner publishes, verify in a fresh signed-out browser with an empty cache: the page is styled, images render, public interactions work, and every required resource returns the intended body and content type without an authentication redirect. Check the Network panel for redirect chains and login HTML returned as a final 200. Confirm protected pages and SDK services still require sign-in. A private owner/tester preview, localhost run, or Ready status does not verify anonymous production access; report that check as pending until it has actually run.

Public pages run directly at the app URL. Anonymous requests have `X-Saasland-Authenticated: false` and no `X-Saasland-User-ID`, cookies, profile or payment authority. With a valid authorized app session, the header is `true` and scoped identity is supplied. Treat missing identity as anonymous; never substitute a shared user ID. App/account/platform services under `/_saasland/` and authentication routes stay protected even with `/*`. Avoid loading the protected SDK on anonymous pages. Link to a protected app path to start sign-in; the destination path and query are preserved. Public mutation routes still require the existing same-origin request rules and do not enable external webhooks. Check the portal for feature availability; configured exceptions never make an unpublished app public.

## User identities

saasland.io manages sign-in and app sessions. Use verified `X-Saasland-User-ID`, `X-Saasland-App-ID`, `X-Saasland-Request-ID` and `X-Saasland-Theme` runtime headers, never client-provided identity parameters. User IDs are stable opaque subjects unique to each app/account pair and match `saasland.me().user.id`. They survive sign-in and profile changes. Existing custom databases keyed by the older global ID need an operator-reviewed migration; built-in datastore contents remain accessible.

There are three distinct identities:

| Value | Contract |
| --- | --- |
| Platform account ID, shown in Profile & settings | Private to platform services. Used by the creator portal to invite testers; never returned to hosted apps. |
| App user ID, `usr_…` | Stable within one app/account pair, different in other apps. Use it as the durable user key and verify server requests through `X-Saasland-User-ID`. |
| Platform username, such as `bright-otter-42` | Editable display handle, disclosed only through an explicit `username` profile grant. Never use as a database ownership key. |

`saasland.me()` returns `{ platformOrigin, user: { id }, app, preferences, csrfToken }`. Username, name, email, gender, birthday and avatar are absent. The global account ID remains private even after profile approval and even when the user owns the app. The username is permission-protected because it is shared across apps and may be identifying. A profile grant does not change the app user ID. The CSRF token is a session request token, not an identity; do not log or send it to providers. The app ID stays stable when its public hostname changes; use returned addresses or browser origin rather than constructing a hostname from it.

HTTP request bodies may be at most 1 MiB, decoded responses at most 4 MiB. App/account requests cap at 60 per minute, with 600 per minute shared across an app and at most four active invocations per creator across all apps. Handle 429 responses without losing user input. Redirects stay within the app origin and cannot target reserved auth or SDK routes. Service workers, arbitrary embedded frames and objects are unsupported; public pages have the controlled YouTube exception below. Serve scripts from your app origin and use the browser SDK for platform services.

For an admin allowlist, ask the owner to open the app while signed in, then open its saasland.io menu → **Your ID in this app** → **Copy ID**. Store this app-specific `usr_…` ID in server configuration, such as `ADMIN_USER_ID`. On every protected route and operation, require `X-Saasland-Authenticated: true`, a configured admin ID, and an exact match with the trusted `X-Saasland-User-ID`. Deny missing or mismatched identity. Browser-only checks, client-supplied IDs, usernames, email addresses and the platform ID from Settings cannot authorize app admin access. Other apps have different IDs; profile permission is unnecessary for this check.

## Session expiry and unfinished work

Protected fetch/API requests return HTTP 401 JSON with code/error `session_expired`, a platform-generated `signInUrl` and `X-Saasland-Session: expired`. Document visits still redirect to sign-in. Do not treat arbitrary HTML, redirects, 401s from your own services, offline failures, 403s or 5xx errors as proof of platform sign-out. For raw fetch, require status 401 plus this platform header, or verify with `saasland.session.check()`. The SDK does not replace global fetch/XHR.

`saasland.session.check()` resolves `{ authenticated: true, user: { id } }` or `{ authenticated: false, code: 'session_expired', signInUrl }`; unknown/network/permission errors reject. `saasland.session.onExpired(callback)` and `saasland.session.onRestored(callback)` return unsubscribe functions. While subscribed, checks run on focus, visibility, pageshow and reconnect, coalescing concurrent requests and skipping hidden/offline pages. SDK operations including `saasland.store` throw `error.code === 'session_expired'` with status 401 and signInUrl, once per failed operation; the expiry callback fires once until recovery.

Keep editors/game state mounted, pause protected actions, retain failed inputs, and offer a clear sign-in action. Call `await saasland.signIn({ returnTo: location.pathname + location.search + location.hash })` from that action after preserving draft state. It uses a trusted separate sign-in window, preserves the original app document and resolves only after verifying the same app user. The shell supplies a visible retry if popup opening is blocked. Return paths must be app-relative and cannot target auth/SDK routes. The helper does not redirect the original page or replay operations. Cancellation/timeout reject with `session_sign_in_cancelled` / `session_sign_in_timeout`; a different app user produces `session_user_changed` on identity checks. Require an explicit reload to switch account, keeping the previous user's draft separate.

Autosave while authorized and distinguish unsaved, saving, saved and failed states. Preserve input on 401, 429, offline and server errors. In-memory retention does not survive reload or tab closure: offer copy/export when appropriate. Persist local drafts only using declared, appropriately consented browser storage, with original-user scoping, truthful retention and cleanup. Never store credentials. Mark unsaved navigation with `navigation.update({ dirty: true })`. After recovery, reload/reconcile server state before explicitly saving; retain original idempotency keys and query payment/action status when outcomes are uncertain. Never automatically replay a payment, game move or mutation after sign-in.

## Storage, SDK access and appearance

The browser SDK is served by the platform at the app's own origin. Do not package a replacement or use workspace `/api/apps/` endpoints from an app session:

```js
import { saasland } from '/_saasland/sdk.js';
const me = await saasland.me();
const value = await saasland.store.get('note');
await saasland.store.put('note', { text: 'hello world' });
await saasland.store.delete('note');
const { files } = await saasland.files.list();
await saasland.files.upload(file); // Browser File object
const { url } = await saasland.files.download('notes.txt');
const unsubscribe = saasland.preferences.subscribe(({ colorScheme }) => {
  document.documentElement.dataset.colorScheme = colorScheme;
});
// Unsubscribe when the component is removed; implement matching light/dark CSS.
```

Datastore and files are scoped to both app and user and require the corresponding portal capability. Store keys: 1–100 letters, numbers, underscores or hyphens. File names: 1–128 letters, numbers, dots, hyphens or underscores; files up to 5 MB. The SDK handles the app's request tokens. Display errors and preserve user input on failures.

`store.get` returns the value directly, or null when missing; the underlying HTTP response is `{value}`. `store.put/delete` return `{ok:true}`. JSON request bodies cap at 32 KiB. The datastore has no query/list, compare-and-set or multi-record transaction API: do not use browser read-modify-write to serialize payment delivery. File names must start with a letter or digit. `files.list` returns at most 100 entries with key/size/modifiedAt; pagination and file deletion are not exposed. `files.upload` resolves without a value after the transfer, and a same-name upload replaces the current file. Download returns `{url,method}` with a signed URL valid for 120 seconds. Do not log or persist these as permanent public URLs.

For multiple pages, `saasland.navigation.register({ items, active, onNavigate, onError })` integrates with the platform menu. Items use `{ id, label, path }`; use local app paths and at most 12 items. It returns `update({ active, dirty })`, `openMenu()` and `dispose()`. Navigation is presentation, never permission enforcement.

Optional managed PostgreSQL is configured separately in the portal and is distinct from Files and the per-user key-value datastore. Once ready, it supplies `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE` and `PGSSLROOTCERT` automatically. Use `DATABASE_URL` or the individual `PG*` settings in a packaged server-side PostgreSQL client, with certificate verification. The platform manages these variables; their names and status appear in Environment variables without exposing values or allowing edits. App-login credentials rotate automatically, and the runtime receives refreshed settings. Configuration changes can cause cold starts; handle transient connection failures and release idle connections. Never put database credentials in browser code or logs. Database costs belong to the creator.

Prepare PostgreSQL before the first source deployment when the app needs it. The developer's Publish action starts the requested database and the worker attaches its managed variables to the candidate before health checks. Database usage joins daily hosting charges; no separate cost confirmation is required. Handle transient connection failures while the database starts.

## Preferred languages

Users can save optional primary and secondary language choices in saasland.io Settings. Apps decide whether to follow them and supply their own translations. The platform does not automatically translate your pages. The recommended order is supported primary, then supported secondary, then your app default. An app-specific language selector can take precedence if your app offers one.

`saasland.preferences.get()`, `(await saasland.me()).preferences` and preference subscriptions expose `primaryLanguage` and `secondaryLanguage`, each a canonical language tag (for example `lv`, `en-GB`, `zh-Hant`) or `null` when unset. Both default to null for existing accounts. Subscriptions notify on language-only changes as well as appearance changes, refresh while visible and on focus, and retain the last good value on failures. Apps cannot save global account choices.

Server-rendered pages receive `X-Saasland-Primary-Language` and `X-Saasland-Secondary-Language` when set. Use the same app matching/fallback policy for server and browser rendering. `Accept-Language` is a separate browser hint, which an app may use if there is no matching account preference; it is not the saved account choice. Do not infer nationality or location from language preferences.

Example for an app supporting English, Latvian and German (place an h1 with id greeting in the page):

```js
import { saasland } from '/_saasland/sdk.js';

// Supply translations for the languages your app actually supports.
const greetings = { en: 'Hello!', lv: 'Sveiki!', de: 'Hallo!' };
function showLanguage({ primaryLanguage, secondaryLanguage }) {
  let language = 'en'; // App default when neither choice is supported.
  for (const tag of [primaryLanguage, secondaryLanguage]) {
    const base = tag?.split('-')[0];
    if (Object.hasOwn(greetings, base)) { language = base; break; }
  }
  document.documentElement.lang = language;
  document.querySelector('#greeting').textContent = greetings[language];
}
const unsubscribe = saasland.preferences.subscribe(showLanguage);
// Your HTML needs <h1 id="greeting">Hello!</h1>.
// Call unsubscribe() when this component is removed.
```

This example deliberately uses base-language translations (en-GB matches en). Apps with distinct script/region translations should use a locale matcher that fits their own supported languages and preserve script distinctions. Update translated labels and document lang together, handle direction for RTL languages, and retain user drafts while switching language.

## Permissions and profile access

Request only the profile fields the selected feature needs. Sign-in, tester invitation, payment and app ownership do not grant profile access. If the app only needs a display handle, request `username` alone; it does not need name, email or gender.

```js
// Run from a user click in the saasland.io app shell.
const { profile } = await saasland.profile.read({
  fields: ['username'], purpose: 'Display your username beside saved notes',
});
if (profile.username) {
  // Render profile.username with textContent, not untrusted HTML.
}
```

Separate permission requests are optional. `profile.read` without a grant ID checks current access and opens the trusted review only if permission is missing. After partial approval it reads only the approved fields. Catch request/read failures and offer a useful fallback. With the optional `profile.request` helper, `approval.terms.fields` is the approved subset; pass only that subset to an explicit grant read. Unsupported, unavailable, unselected, expired or revoked fields are not disclosed. Partial approval must not unlock a feature that needs a missing required field. Profile grants do not allow access to the private platform ID, avatar or provider credentials. See the shared permission lifecycle and SDK calls below.

## Credits, permission lifecycle and developer responsibility

Credits are integer customer usage units. For one-time paid features, saasland.io holds the approved credits and consumes them after the app advises completion. Qualifying delivered usage is recorded for separately assessed EUR supplier compensation under the agreed policy; purchased credits never become developer money and no credit-to-payout exchange rate is promised. Self, related-party and test usage cannot generate payable earnings. Apps cannot mint credits, reward users, select arbitrary recipients or cash credits out. Only the platform handles verified purchase funding and original-transaction corrections. The old `/v1/balance` and `/v1/debits` integrations are retired. Never request platform billing keys.

Before deploying, provide the actual developer's legal name/type, country, business or service address, company registration where applicable, and public HTTPS terms, privacy and refund-policy links. Users contact you through Feedback in the saasland.io menu; read and reply under App feedback. The deployment form does not ask for a support email or support website. Include any legally required trader contact information in your public policies and offers. These are public disclosures, not verification of the developer or policies. Profile fields and wallet operations request user approval at runtime, without a configuration declaration. The developer is responsible for accurate prices, authorized charges, delivery, support and valid app-related refund claims under the developer terms. The permission screen links to Feedback for that app. Users can also contact saasland.io for platform or unresolved issues. Mandatory consumer rights remain intact.

Call the resource directly from the user’s feature action. The SDK checks server permissions first and opens the trusted saasland.io sheet only when approval is missing. Existing grants return immediately without a dialog or another permission record. Denial ends the current SDK call with `status: 403, code: "permission_denied"`; revocation stops future access. A later direct call opens fresh review for missing permissions, including previously denied or revoked fields. Users can also choose Allow in Permissions. Your app must explain which functionality needs the missing permission and provide a useful fallback; do not retry to pressure a new prompt. Keep the purpose consistent for the same use; a materially different purpose needs fresh approval. The sheet shows the purpose as a message from your app, shows every requested field, marks previously approved fields Already enabled, leaves new fields unselected, and closes after a confirmed decision. Older shells may use a separate review window. The app sandbox cannot open arbitrary windows. The platform shows the developer, purpose, scope, limits and expiry, and offers approval or denial. Never substitute an app-rendered dialog, a browser message, or a local balance for server approval. Closing, blocking or denying the review grants nothing. Users inspect and revoke access at `/?view=permissions`. New requests require the developer's current terms acknowledgement; this does not turn a review draft into an effective agreement.

Recommended browser calls (consent is handled automatically):

- `saasland.profile.read({fields,purpose?,expiresAt?})` returns `{profile}` containing only requested, granted fields. Request only the needed `username`, `name`, `email`, `gender`, `birthday`, derived `age18` or `age` fields. Users select fields individually; check for missing required fields. Revocation stops future platform disclosure, not copies already received.
- `saasland.profile.checkAge18({purpose?,expiresAt?})` returns `{is18OrOver:true|false|null}` without disclosing birthday. It uses the saved, self-declared birthday; it is not verified proof of age.
- `saasland.wallet.check({credits,comparison,purpose?,expiresAt?})` returns only `{matches}` for the exact threshold and comparator (`lt`, `lte`, `gt`, `gte`). A different threshold needs fresh consent. This check does not reserve funds; a payment flow does not need a balance preflight.
- `saasland.wallet.authorize({credits,idempotencyKey,productName?,description?,purpose,supplyType?})` reviews a new payment, holds the approved credits and returns a payment ID. The default supply type is `service`; use `digital_content` only for accurately classified one-time digital content. The platform requires separate unchecked immediate-performance and withdrawal-rule confirmations; an app cannot approve them for the customer. Retrying an authorized or completed payment returns its existing result without a dialog. Holds expire 24 hours after approval.
- `saasland.wallet.advice(paymentId)` completes that authorization, consuming its exact held credits and recording the original supplier's compensation source. It takes no amount or recipient and is safe to retry.
- `saasland.wallet.payment(paymentId)` reads the app/user-scoped payment status. `saasland.wallet.release(paymentId)` releases an unfinished hold without paying the developer; completed payments cannot be released.
- `saasland.wallet.subscribe({credits,period,cancellation,idempotencyKey,purpose,productName?,description?})` includes consent for a prepaid weekly/monthly/annual subscription. `saasland.wallet.subscription(id)` checks active access; see the subscription contract below.
- `saasland.wallet.charge({credits,maxCredits,totalCredits,period,expiresAt,purpose,idempotencyKey,productName?,description?})` performs one recurring charge, requesting missing consent within its explicit per-charge and UTC `day`/`month` budget. Persist the policy and one unique key per logical action; reuse the exact parameters for retries. This does not schedule subscriptions or offline jobs.

Reuse preserves the original approval date, expiry and used payment budget; asking for a later expiry does not extend it. A partial approval returns only the approved subset for that call. A later call that requests missing fields opens review again; previously approved fields stay enabled. Do not automatically loop or poll a denied resource call. Policy/source changes or expiry can invalidate a grant; direct calls recheck this automatically. Profile permissions appear separately by field in the compact, app-filterable register. Profile/threshold grants default to 30 days and are capped at one year. Recurring charges require an explicit expiry. Camera and microphone are blocked for hosted apps.

### Advanced: request consent in advance

Use explicit helpers only when the app intentionally reviews consent separately from the feature action: `profile.request({fields,purpose,expiresAt?})`, `profile.requestAge18({purpose?,expiresAt?})`, `wallet.requestCheck({credits,comparison,purpose,expiresAt?})`, `wallet.requestRecurring({maxCredits,totalCredits,period,expiresAt,purpose})`, or the generic `permissions.request` with a supported kind. They reuse current grants and open fresh review for missing permission just like direct calls.

These helpers resolve to `{id,status:'approved',grantId,terms,...}`; a profile approval's `terms.fields` is the selected subset. Existing integrations may pass `{grantId,fields}` to `profile.read`, `{grantId}` to `profile.checkAge18`, `{grantId,credits,comparison}` to `wallet.check`, or `{grantId,credits,idempotencyKey,...}` to recurring `wallet.charge`. Keep reads within the returned field subset and validity. Do not teach this two-step form as the default.

Capped per-action recurring charges attest completed delivery: save the completed action durably before charging and reuse its persistent key. They consume usage and record pending developer credits. Use one-time authorization/advice for work that may fail, or prepaid subscriptions for ongoing paid access. Completed one-time/capped actions and earned subscription periods start a separate 24-hour settlement delay; statutory refund rights continue after settlement. Self-use can fund hosting but never cash compensation. Old recurring approvals without current immediate-performance consent need fresh platform review. A threshold check reveals only `{matches}` and does not reserve credits. Every protected action must verify its trusted payment/charge/subscription headers and expected price/operation or plan on the server.

### Prepaid subscriptions

Use the platform subscription API when available. In a user click handler:

```js
const subscription = await saasland.wallet.subscribe({
  credits: 70, period: 'weekly', // weekly | monthly | annual
  cancellation: 'proportional', // or full_period; required
  productName: 'Editor Pro', purpose: 'Use the paid editor', description: 'Weekly editor access',
  idempotencyKey: enrollment.id, // persist for this enrollment's retries
});
// Save subscription.id against the app-scoped user and the agreed plan.
const { active } = await saasland.wallet.subscription(subscription.id);
if (!active) throw Error('Subscribe before using this feature.');
await fetch('/paid-operation', {
  method: 'POST', headers: { 'X-Saasland-Subscription-ID': subscription.id },
});
```

Approval holds the first period's exact credits. At period end the platform consumes the elapsed usage and records a compensation source for the original supplier under that period's economic policy, then holds the next period's credits if available and the approved app/user policy still permits renewal. No advice call is needed. Insufficient credits end access without debt or automatic resumption after a top-up. Periods follow the approval's UTC anniversary, with calendar month/year clamping and leap-day restoration. Whole missed renewal periods are never charged retroactively.

`full_period` cancellation stops renewal and leaves access active until the prepaid period ends. `proportional` cancellation ends access immediately and releases unused credits; earned credits remain held until the original period end. Earned cost is the elapsed fraction of the period, rounded down to whole credits. Users cancel in Wallet and retain permanent subscription history with subscribed/cancelled timestamps and validity end.

Browser calls return only `{id, active}`; cancellation details and user balances stay private. Reusing an enrollment key returns the same subscription even after cancellation; changed terms with the same key fail. A new enrollment needs a new key and fresh user consent. Subscriptions have their own period holds, not the one-time 24-hour expiry.

Your server must check every paid operation. The gateway verifies `X-Saasland-Subscription-ID` against the app and current user, rejects inactive access, and supplies trusted `X-Saasland-Subscription-Active: true`, `X-Saasland-Subscription-Credits`, `X-Saasland-Subscription-Period`, and `X-Saasland-Subscription-Cancellation-Policy`. Require these headers and compare price/period/rule to the feature's actual plan. Bind the ID to that app-scoped user/plan; a browser's success message or a different cheaper subscription is not authorization. These headers disclose the agreed rule, not whether the user cancelled. App sessions can poll `GET /_saasland/wallet/subscriptions/:id`; no separate offline merchant credential is added. Legacy capped per-action usage grants remain separate and do not create prepaid subscriptions.

### Check whether the user is 18 or over

Request the separate `age18` permission at runtime; no configuration declaration is needed. Use a consistent purpose:

```js
const { is18OrOver } = await saasland.profile.checkAge18({
  purpose: 'Check whether the adult feature is available',
});
if (is18OrOver === true) {
  // A positive result based on the currently saved, self-declared birthday.
} else {
  // false means under 18; null means the date of birth is unavailable or invalid.
  // Explain why this feature is unavailable and offer an appropriate fallback.
}
```

Catch `permission_denied` as with other profile calls. `profile.requestAge18({purpose,expiresAt?})` is the optional explicit permission helper; `checkAge18({grantId})` can use an approved grant. Generic `profile.read({fields:['age18'],purpose})` returns `{profile:{age18:true|false|null}}`. This permission shares neither birthday nor exact age, and no other thresholds are accepted. The platform computes a calendar comparison in UTC and rechecks the source on every read. A February 29 birthday reaches the threshold on March 1 in a non-leap year. This is self-declared information, not verified proof of age. saasland.io does not block app launch by age; your app decides what an under-18 or unknown-age user sees on signed-in pages. A birthday grant and an age18 grant are separate.

For other limits, request the separate `age` permission at runtime:

```js
const { age } = await saasland.profile.getAge({ purpose: 'Show pages suitable for your age' });
// age is whole years from the saved, self-declared date of birth, or null when unknown.
if (age === null || age < 16) showGeneralVersion(); else showFullVersion();
```

`profile.read({fields:['age'],purpose})` returns `{profile:{age:number|null}}`. It never shares the date itself. Users who decline, or have not saved a date of birth, give you `permission_denied` or `null`: treat both as unknown age.

### Age-limited paid features

Add `minimumAge` (a whole number from 1 to 21) to `wallet.authorize`, `wallet.subscribe`, `wallet.requestRecurring` or an implicit `wallet.charge` when the feature has an age limit. saasland.io checks it against the payer's self-declared date of birth before any credits are held or charged:

```js
const payment = await saasland.wallet.authorize({ credits: 5, idempotencyKey: operation.id, minimumAge: 18,
  productName: 'Mature story pack', purpose: 'Unlock the story pack you chose (ages 18+)' });
```

The saasland.io payment review shows the limit. When the date of birth is missing, it asks for it before the user can approve; a payer below the limit is told the purchase is unavailable and cannot approve it. Your app sees the same outcome as a declined payment, so the user's age is never revealed and you cannot probe it with different limits. Mention the limit in your own button or page so users know before they start. Recurring grants recheck the limit on every `wallet.charge`, and refuse with `age_restricted` or `birthday_required` if the saved date changed. The limit is part of the payment terms, so reuse the same value on retries with the same action key. Leave `minimumAge` out when the feature has no age limit; choosing the right number is your responsibility, and the optional age self-check in Configuration suggests one.

### One-time payment: authorize, complete the action, advice

Use the platform authorization/advice API when available. The former `requestOneTime` / `chargeOnce` helpers and one-time use of `wallet.charge` are retired. Existing recurring grants continue using `wallet.charge`.

`authorize` returns `{id,status,credits,app,idempotencyKey,authorizedAt,expiresAt,completedAt?}`, with status `authorized` (held), `captured` (completed), `released` or `expired`. No balance, global customer ID or merchant account ID is disclosed. The authorization's idempotency key identifies one logical operation permanently. Save the operation key before requesting payment and save the returned ID. Retry with the same key and exact terms after an uncertain response; do not generate a new key for that operation. A released/expired payment cannot be captured or reauthorized with its old key.

Browser example (in a user click handler; `operation` is your saved operation record):

```js
import { saasland } from '/_saasland/sdk.js';
const payment = await saasland.wallet.authorize({
  credits: 1, idempotencyKey: operation.id,
  productName: 'Greeting', description: 'Generate one greeting', purpose: 'Generate the greeting you requested',
});
// Persist payment.id with operation.id before proceeding.
const response = await fetch('/api/greeting', {
  method: 'POST', headers: { 'X-Saasland-Payment-ID': payment.id },
});
if (!response.ok) throw Error('Check the saved operation before retrying or releasing its payment.');
// Only after confirmed, durable completion. Repeating advice is safe.
await saasland.wallet.advice(payment.id);
```

For backend actions, the gateway replaces spoofed headers and supplies trusted `X-Saasland-Payment-ID`, `X-Saasland-Payment-Credits`, `X-Saasland-Payment-Key`, `X-Saasland-Payment-Status` and `X-Saasland-Payment-Expires-At`. Your server must check the expected amount and operation binding, atomically save completed output against the payment ID, and return the saved output on retries. A hold is authorization, not a completed receipt. Finish within its expiry and handle release/policy invalidation before settlement.

For reliable server-side advice, return `X-Saasland-Payment-Advice: <the verified payment ID>` on the successful 2xx response **after** durably completing the action. The gateway validates the response, calls the same advice operation before delivering it, and strips this internal response header. It accepts only the payment bound to that request. This survives a closed browser; the browser may also call `wallet.advice` safely. Do not emit advice for failed or incomplete work. A settlement failure leaves the operation saved so a retry can complete payment without repeating the work. No platform credential or global account ID belongs in the app.

On definite action failure, call `wallet.release(payment.id)`. On an uncertain network response, inspect your saved operation and `wallet.payment` before deciding whether to retry advice or release; do not automatically release work that may have succeeded. Users can release outstanding holds in Permissions. Expiry releases credits automatically after 24 hours, with background processing on the next worker run and immediate enforcement on payment/permission/wallet reads. Advice, release and expiry compete atomically; only one final result wins. No partial capture or direct bank transfer occurs through these SDK methods.

Completed advice creates a receipt under the payment ID. Existing trusted `X-Saasland-Charge-ID/Credits/Key` receipt checks remain available for completed payments and recurring charges. Recurring charges still return `{id,debited,app,chargedAt,grantId,replayed?}` and retain their approved period budgets. Apps have no mint or refund endpoint; refer completed-payment remedies through Feedback/platform support.

## App privacy notice

Every app you build includes its own privacy notice page at `/public/privacy`, which is public with the default access paths. Serve it as plain HTML with its styles under `/public/` as described in [Sign-in and public paths](#sign-in-and-public-paths), and link it from the app footer. The owner enters `https://<app-address>.saasland.io/public/privacy` as the app privacy notice URL; the first-time Go live page fills it in.

Write it from what the code actually does, in plain language, and update it whenever processing changes:

- who provides the app: the developer named in Business & tax, supplying it through saasland.io, whose operator SIA "DryBits" sells paid services and runs the platform; link the platform notice at `https://saasland.io/privacy` for sign-in, wallet, payments and cookies handled by saasland.io
- what the app stores and why: its saasland.io pseudonymous user ID, app data the user creates, any profile fields it requests (only after the user allows them), and how long each is kept
- every outside service the app's firewall rules let it call (for example an AI or email provider), what is sent and why
- the app's cookies and browser storage, matching the declaration, and that optional storage waits for the user's choice
- how users ask questions or exercise their rights: Feedback in the saasland.io menu
- no claims the code does not support, no legal certifications, and no age-restricted content

Do not invent a company name, address, registration number or contact email; leave the developer to complete anything the code cannot tell you.

## Completion checks

Run the server locally, verify HTTP 200 at the configured health path, exercise the requested UI, test denial/revocation/insufficient-funds/retry handling and confirm assets load. Verify Linux/amd64 build and configured port where Docker is available; otherwise disclose what was not tested. Keep paid actions disabled on environments that do not yet expose these SDK methods. Provide the project and portal settings, distinguish local tests from cloud deployment, and never claim a successful upload or charge without evidence.

For apps with public pages, include the exact public-path requirements and the signed-out dependency check above. Keep anonymous publication verification separate from authenticated preview results; do not publish through MCP to complete a test.

## App logo and promotional image

The portal and MCP accept an optional logo and promotional image separately from your source ZIP or folder. For MCP use get_app_artwork to preview, create_artwork_upload → signed HTTP PUT → complete_artwork_upload to upload/replace, and remove_app_artwork to prepare removal. Read get_app_configuration for the latest revision before each image. Use JPEG/PNG files up to 2 MB and 4 megapixels each; square logos and 16:9 promotional images work best. Logos retain transparency. The whole image is fitted without cropping. Creators can preview, replace or remove artwork from app details. Published apps display it on the landing page; private artwork stays restricted. Omitting artwork on redeploy preserves it. Artwork is saved as a draft; the active images remain unchanged until the developer reviews and publishes. No manifest field or app SDK permission is required.

## Marketplace categories

Use set_app_configuration with categories, or the portal editor, to select the groups that fit your app: Productivity, Creative, Games, Health & wellbeing, Education, Business, Finance, Lifestyle or Utilities. Multiple selections are supported. Categories can be edited from the app detail page without uploading a new runtime. They are separate discovery metadata, not app permissions or source-manifest fields. Category changes are drafts until the owner reviews and publishes.

## Outgoing firewall and provider API keys

Configure exact domains or public IPv4 addresses under **Outgoing firewall** (port 443, at most 20, no paths/wildcards). Store provider keys in **Environment variables** and use ordinary server-side HTTP/provider SDK calls. Empty rules deny every destination.

Activated runtimes receive HTTP_PROXY/HTTPS_PROXY, lowercase equivalents, loopback-only NO_PROXY and NODE_USE_ENV_PROXY=1. Use maintained Node 24 for native environment-proxy HTTP/HTTPS/fetch support; older Node/custom agents may need the library's standard proxy agent. Python requests and Go default HTTP transport honor standard proxy configuration. A client that ignores the proxy cannot bypass private network isolation. Keep keys and proxy URLs out of logs and browser code. The platform never injects provider authentication into the new firewall tunnel.

TLS stays end to end, with streaming/binary content allowed within execution limits. Each redirected hostname needs a rule. Private networks, IPv6, other ports and external SQL remain unsupported. The proxy authenticates the app/deployment, resolves and pins public DNS, and rechecks rules before dial and during open tunnels. It does not inspect encrypted HTTP contents. Inspect provider state before retrying a mutation after an ambiguous failure. Configure provider spending limits separately.

Check the editor's availability: saved rules do not activate infrastructure. Existing apps need one runtime update after the shared proxy is deployed; later rule edits need no restart. Users see allowed destinations in the app menu. This is not actual request history or a profile-sharing grant.

Owners save runtime memory, timeout, port, health path, Files/Datastore and masked variables as a draft, then review all changes and press Publish. This reuses the deployed image and keeps the current version active until checks pass. Build instructions still require Upload new version.


### Product names, transaction history and refunds

Supply `productName` (1–120 plain-text characters) in `wallet.authorize`, `wallet.subscribe`, and each recurring `wallet.charge`. One-time and subscription confirmations show it, and each completed payment records it in permanent Wallet history; use `description` for an optional short reason. If omitted, the platform records the description or approved purpose for compatibility with older clients. Reuse identical product and payment terms for retries under the same action key.

Users see the app, product/reason, transaction ID and credits consumed in Wallet. They can request a full or partial refund through Feedback using that transaction ID. The current original app owner can Refund and reply in the platform inbox. The platform verifies the payer and remaining paid amount and commits the credit restoration, supplier compensation adjustment and reply together. A supplier's insufficient earnings cannot block a valid refund; an adjustment can create separately recorded supplier debt. A refund does not cancel a subscription or reset recurring permission budgets. Mandatory monetary reimbursement remains a separate DryBits obligation; restoring credits alone does not override it. Hosted apps have no refund, mint or arbitrary transfer endpoint. Use the platform Feedback workflow; check current portal availability.

## Age limits

saasland.io splits age responsibility three ways (owner decision 2026-10-10):

- **Public paths** are open to everyone, signed in or not. Keep them, previews, logos and artwork suitable for all ages.
- **Signed-in pages** are the developer's decision. Use `profile.getAge()` or `profile.checkAge18()` when content needs an age, and plan for users whose age is unknown.
- **Paid features** carry `minimumAge`; the platform checks it at payment. Users give their date of birth when they first top up their wallet or reach an age-limited payment.

The **Age self-check** in Configuration is optional and does not block publishing. Its content questions suggest a minimum age for the paid features and signed-in pages above; when requested, prepare truthful answers from the code and authorized requirements using set_app_configuration. Ask for unknown facts; the owner reviews the draft at Publish. It is an original saasland.io guide, not IARC certification or legal advice, and country restrictions are no longer applied by the platform.

saasland.io prohibits sexual content and all nudity, including nude pictures, sexual services, sexual violence and sexual content, sexualization or exploitation involving minors, throughout apps including signed-in and age-limited pages, user content, links and AI output. Educational/artistic labels and an age limit create no exception. Ordinary non-sexual content involving children is not prohibited. Declaring prohibited content in the self-check blocks publication and user access with a policy reminder; remove the actual content before updating the answers. See the [content policy](https://saasland.io/developer-terms#prohibited-sexual-content).

## Cookies and browser storage

When building with the saasland.io plugin, inspect your generated source and libraries and register their storage through MCP. Call `get_app_browser_storage` for the current declaration, owner-preview discoveries, `policyVersion`, `revision` and `appVersion`; then `set_app_browser_storage` with those revision/version values and a complete reviewed `browserStorage` object (`version`, `confirmed:true`, `mode`, `entries`). Include every existing and detected supported key with its technology, category, purpose, provider, retention and necessity justification where applicable. Register known keys before source deployment and reconcile newly discovered keys as development continues. These are developer-management tools, not a browser SDK or app runtime API. Do not guess unknown purposes, mark optional uses necessary, or write redaction placeholders. Registration does not grant visitor consent, accept agreements or publish. After inventory registration, prepare the app cookie policy text using set_app_configuration.cookiePolicy for final Publish review. If the tools are unavailable, provide the inventory for the portal form and state that it has not been registered. The bundled saasland-apps skill describes the full workflow.

When previewing as the app owner, saasland.io discovers supported storage names and types, including blocked attempts, without collecting values. In app Configuration, open **Cookies & browser storage → Review storage & cookie notice** to explain detected items. Purpose, provider, category and retention require your input; saved declarations generate the visitor notice. Publication is blocked by unexplained detected items. Open every feature and manually add anything discovery misses; previews are not exhaustive scans. Use fixed keys without personal data in names. New deployments start a new observed inventory. Changed declarations require visitors to review optional consent again. Server-set cookies remain unsupported and are flagged for source correction.

Saving a storage declaration creates an unpublished draft. After Publish, the new declaration needs an app reload, not a rebuild. Rejected-name findings show the storage type and reason; bounded identifier names are displayed, while unsafe strings are omitted. Older reports may show Name unavailable: reload the owner preview, try the failing feature and reopen settings to refresh the details. Names must be 1–80 letters, digits, dots, colons, underscores or hyphens, starting with a letter or digit and without reserved platform prefixes (`__Host-`, `__Secure-`, `saasland`, `cognito`). Fix invalid names in source, deploy the corrected version and preview again; redeploying unchanged code does not fix them.

Declare every cookie, localStorage and sessionStorage item in the portal's Cookies & browser storage form, including libraries: name, type, category, purpose, provider, retention (1 second to 180 days), and a strict necessity explanation when relevant. Choose No app browser storage explicitly when appropriate and reconfirm each uploaded version. Private MCP source-only drafts wait for portal review and Publish before building; missing declarations grant no browser storage and cannot be published. IndexedDB, Cache Storage, workers, third-party trackers and fingerprinting are unsupported. App-server Set-Cookie is always stripped. Cookie writes must be host-only with Path=/ and cannot use reserved platform names.

Optional processing starts only when saasland.storageConsent.get().categories includes its category (preferences, analytics or marketing). Use saasland.storageConsent.subscribe(listener) to stop work on withdrawal; it returns an unsubscribe function. Check before loading optional code or sending data, not merely before a write. Reads/writes of undeclared or declined local/session keys throw or return no data; cookie writes are ignored. Catch storage failures and keep core features usable. Missing SDK/guard/consent means denied. The gateway manages namespaced local/session records with expiry; do not read their physical keys or bypass the controls. Browser guarding is defense in depth, not a substitute for compliant source code.

Keep the app notice and declaration accurate before purposes, recipients, names or retention change. Users review and withdraw through the trusted saasland.io Cookie settings. Do not present your own fake consent, fingerprint users, restore refused identifiers, or combine cookie choices with profile grants, payments or contract acceptance. See /cookies and the Developer Services Agreement.

## Public content

### Deliberate public playback

Do not start audible media automatically or from timers, scrolling, menu buttons or generic first-click handlers. Start it only when the user deliberately chooses Play/Listen or enables sound. The platform adds autoplay policy and best-effort playback guards to public paths. Use a labelled native button with `data-saasland-play` for custom audio, and handle `NotAllowedError`. Do not evade the controls.

For a public YouTube video use `<saasland-video video-id="M7lc1UVf-VE" title="Explain this video"></saasland-video>`. The helper displays **Load YouTube video**, then a player with autoplay disabled; the user chooses Play inside it. It uses `youtube-nocookie.com`, but this is not a storage/privacy exemption: disclose provider processing and obtain any required consent. Arbitrary frames remain blocked.

Uploaded source is checked for playback patterns, and public candidate pages receive a bounded anonymous browser inspection. API presence alone is not a violation. Review/incomplete results require Admin assessment, and confirmed unsolicited playback requires corrected source. Public-path changes and new deployments need fresh evidence. Older healthy code stays active while a candidate waits for review. Use Feedback for help or a disputed finding. Checks do not certify audio/video content or age suitability. These controls are locally implemented; production availability depends on the coordinated release.

Everyone can open public pages, so public pages, previews and artwork must contain no age-restricted images, video, animation or audio, even when the app's paid features or signed-in pages are age-limited. Put age-limited content behind sign-in or an age-limited payment. If an app issue needs attention, saasland.io Support Team sends a Feedback notice. Fix it and reply; a human review may lead to immediate blocking or additional time depending on severity. Internal checks never substitute for the developer’s responsibility for public content.

Uploaded artwork uses the platform's background image checks. Those checks do not complete the content questionnaire or certify compliance. AI prepares truthful behavioral answers from the app and requirements; unknown facts need clarification, and the owner reviews the draft at Publish.

## Shared company information

Save company information once in Business & tax for all apps. Saved fields are locked; missing fields may be added later. Request corrections from saasland.io Support in Feedback and support. Publication needs only the supplier identity (type, legal name, country, registration number and business address for companies and self-employed people) plus the two supplier confirmations; tax, VAT, representative and beneficial-owner details are needed before the first supplier payment. Deployment collects app-specific policy links without repeating company fields. Bank details remain in Payouts & bank.

## AI preparation and publication review

Use `get_app_firewall` and `set_app_firewall` to prepare exact outgoing destinations, including before the first deployment. Use `get_app_database` and `provision_app_database` with `slug` and the current `revision` to prepare managed PostgreSQL; no separate database charge approval is required. Source uploads, declarations and settings remain unpublished until the developer reviews the complete change list and presses Publish. That action starts requested database setup, with usage included in daily hosting charges. Report `awaiting-publish` as prepared for review; do not poll expecting it to deploy automatically. The database worker can provision and connect the first candidate before its health checks. MCP cannot publish, retrieve managed credentials or accept agreements.
