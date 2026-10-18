# saasland.io plugin for Claude and OpenAI

Version **3.2.1** adds app preview guidance for features, pricing summaries, supported languages and optional public demos, and updates navigation to **Developer workspace**. Existing apps using the current saasland.io SDK need no source migration for this release.

Build, deploy and manage your [saasland.io](https://saasland.io) apps from Claude Code, Codex or ChatGPT. The same plugin connects your AI client to the saasland.io MCP server at `https://saasland.io/mcp` and adds two skills:

- **saasland-apps** - list your apps, inspect status, deployments and logs, upload new source, create private app drafts, and prepare every app configuration section: details, app previews, ratings, policies, public paths, address, categories, runtime, artwork, write-only environment variables, database lifecycle, optional AppSync Events, firewall and browser-storage declarations. Read the publication checklist and hand off final review.
- **saasland-app-development** - build ordinary HTTP SaaS apps that run on saasland.io with the browser SDK: sign-in, app storage and files, profile and age checks, credit payments and subscriptions, online presence, AppSync Events, languages, appearance and platform navigation.

Every change is saved as a draft and waits for you to review it and press **Publish** in the saasland.io portal. The plugin cannot publish apps, accept agreements, read stored secret values, move credits or administer AWS.

## MCP tools

| Tool | Permission | What it does |
| --- | --- | --- |
| `get_app_configuration` | apps:read | Active and draft setup, AppSync Events service status, shared revision and artwork pointers |
| `set_app_configuration` | apps:write | Draft details, app previews, policies, optional content self-check, access, categories, address, runtime and AppSync Events opt-in |
| `get_app_publication_review` | apps:read | Remaining blockers and saved changes for human Publish review |
| `check_app_address` | apps:read | Check current address availability |
| `get_app_artwork` | apps:read | Preview the owned draft or active artwork |
| `create_artwork_upload` | apps:write | Prepare a checksum-bound JPEG/PNG upload |
| `complete_artwork_upload` | apps:write | Validate and normalize the uploaded image into a draft |
| `remove_app_artwork` | apps:write | Prepare removal while retaining the active artwork |
| `set_app_database` | apps:write | Prepare or cancel database setup, restore, rotation or deletion |
| `list_apps` | apps:read | Lists your apps, including private drafts, with status |
| `get_app_status` | apps:read | Shows one app's settings, status, setup/legal readiness and pending work |
| `list_deployments` | apps:read | Recent builds and deployments with phases and errors |
| `get_app_activity` | apps:read | A page of the app's activity history |
| `get_app_environment` | apps:read | Environment variable names (draft and live), never values |
| `get_app_firewall` | apps:read | Current and draft outgoing firewall destinations |
| `get_app_database` | apps:read | Managed PostgreSQL availability, status and variable names |
| `get_app_browser_storage` | apps:read | Declared cookies/browser storage and what owner previews observed |
| `get_app_logs` | apps:logs | Runtime or build logs, bounded pages with best-effort redaction |
| `create_app` | apps:write | Reserves a new private app draft with technical settings |
| `create_source_upload` | apps:write | Signed HTTP upload address for a source ZIP (up to 25 MiB) |
| `deploy_source` | apps:write | Saves the uploaded ZIP as the next version for review |
| `redeploy_app` | apps:write | Prepares a redeploy of the current image with saved settings |
| `set_app_environment` | apps:write | Adds, replaces or removes write-only environment values |
| `set_app_firewall` | apps:write | Saves the draft list of outgoing HTTPS destinations |
| `provision_app_database` | apps:write | Requests managed PostgreSQL; Publish starts it |
| `set_app_browser_storage` | apps:write | Registers the app's cookie and browser-storage declaration |

Uploads are not counted per day; publishing that builds or restarts an app is limited to 10 per developer per UTC day. Database usage joins the daily hosting charges with no separate approval.

## App previews

Use `get_app_configuration` to read the current revision and active/draft `listing`, then prepare factual features, pricing summaries and language tags with `set_app_configuration.changes.listing`. The object replaces the listing section, so preserve any existing fields you still need. The owner reviews and publishes the draft.

For an optional demo, set `listing.demoPath` and make its route and dependencies public through `publicPaths`. A demo link does not grant anonymous access. Listing prices describe the app; actual paid actions still require platform payment approval. The [management skill](skills/saasland-apps/SKILL.md#prepare-all-app-configuration) lists the supported fields.

## AppSync Events

Read `get_app_configuration` for current/draft `realtimeEnabled` and the active `realtime` service status. Use `set_app_configuration({ slug, revision, changes: { realtimeEnabled: true } })` to prepare opt-in, or `false` to prepare removal. Both wait for your Publish review. After publishing, check that `realtime.enabled` is true and `realtime.status` is `ready`. Each app has an isolated service and attributed usage joins its daily hosting charges. The development skill covers the required backend channel-authorization callback and browser SDK.

## Messages and credit-spending notifications

Both clients include the same [messaging and receipt guidance](skills/saasland-app-development/SKILL.md#messages-to-users-no-email). App backends can send plain-text messages to their own users' **Messages** inbox using a platform-injected key and app-scoped user IDs, without collecting email addresses. Users see an unread badge and can open, download, print or mute app messages. These messages do not trigger email or push notifications; this runtime API is separate from the plugin's MCP tools.

saasland.io automatically creates receipts for one-time payment approval, subscription start and charged renewals, and recurring usage allowance approval. Individual recurring usage charges do not each create a receipt notification. Top-ups and top-up withdrawal acknowledgements also appear in Messages. Platform receipts and withdrawal acknowledgements attempt a short email alert linking to the full inbox message; ordinary app messages and notices never email. Notification delivery is not guaranteed and does not determine payment success. The [full receipt contract](skills/saasland-app-development/SKILL.md#credit-spending-receipts-and-notifications) distinguishes approval, completion and Wallet history.

## Install in Claude (desktop, web and Cowork)

Install **saasland.io** from **Customize → Plugins**. Installing does not sign you in: open the plugin's **Connectors** tab, click **Connect** on saasland and approve the connection on saasland.io. If Claude shows an "Add custom connector" dialog instead, keep the URL `https://saasland.io/mcp`, leave the OAuth Client ID and Client Secret fields empty, click **Add**, then **Connect**.

## Install in Claude Code

```
/plugin marketplace add karlis-balcers/saasland-claude-plugin
/plugin install saasland@saasland
```

Start a new session, run `/mcp`, choose **saasland** and sign in. You can also add `https://saasland.io/mcp` as a remote MCP connector in Claude without the skills.

## Install in Codex or ChatGPT

Install the `saasland` plugin from the plugin directory once it is listed, or add the packaged plugin to a local Codex marketplace. ChatGPT and Codex use the same remote server URL and OAuth sign-in.

## Sign-in and privacy

saasland.io asks you to approve the connection and pick its permissions (`apps:read`, `apps:logs`, `apps:write`). You need a saasland.io account with developer access. The plugin contains no API keys or credentials. Access uses OAuth 2.1 authorization code with PKCE and dynamic client registration. Tokens last up to 15 minutes and connections at most 90 days. Review or revoke connected clients in **Developer workspace → MCP connections** on saasland.io. Builds and deployments use your normal saasland.io hosting charges.

- Privacy policy: https://saasland.io/privacy
- Terms: https://saasland.io/terms
- Developer documentation: https://saasland.io/developers

## Support

contact@saasland.io - https://saasland.io/about

Published by SIA "DryBits", Latvia.

## Public usernames

Use `saasland.me().user.username` for display in games, forums and leaderboards without a permission prompt. Avoid separate app username registration. Users can change their username anytime; always key points, posts, ownership and access by the stable app-scoped `user.id`. Real name, email and other private profile fields still require permission. This package accompanies the platform 3.2.0 public-username release.
