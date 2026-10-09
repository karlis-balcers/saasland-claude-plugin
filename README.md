# saasland.io plugin for Claude

Build, deploy and manage your [saasland.io](https://saasland.io) apps from Claude. The plugin connects Claude to the saasland.io MCP server at `https://saasland.io/mcp` and adds two skills:

- **saasland-apps** - list your apps, inspect status, deployments and logs, upload new source, create private app drafts, and prepare write-only environment variables, managed PostgreSQL, outgoing firewall destinations and cookie/browser-storage declarations.
- **saasland-app-development** - build ordinary HTTP SaaS apps that run on saasland.io, using the supported runtime and browser SDK.

Every change waits for you to review it and press **Publish** in the saasland.io portal. The plugin cannot publish apps, accept agreements, read stored secret values, move credits or administer AWS.

## Install in Claude Code

```
/plugin marketplace add karlis-balcers/saasland-claude-plugin
/plugin install saasland@saasland
```

Start a new session, run `/mcp`, choose **saasland** and sign in. saasland.io asks you to approve the connection and its permissions (`apps:read`, `apps:logs`, `apps:write`). You need a saasland.io account with developer access.

## Sign-in and privacy

The plugin contains no API keys or credentials. Access uses OAuth 2.1 authorization code with PKCE and dynamic client registration. Tokens last up to 15 minutes and connections at most 90 days. Review or revoke connected clients in **Your apps** on saasland.io. Builds and deployments use your normal saasland.io hosting charges.

- Privacy policy: https://saasland.io/privacy
- Terms: https://saasland.io/terms
- Developer documentation: https://saasland.io/developers

## Support

contact@saasland.io - https://saasland.io/about

Published by SIA "DryBits", Latvia.
