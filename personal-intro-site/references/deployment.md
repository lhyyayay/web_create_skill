# Deployment when requested

Do not publish solely because a site can be built. First obtain the repository/provider target and required authorization. Preserve an existing deployment.

## Static starter

npm run build produces dist. Hash routing and base:"./" support root domains and repository subpaths. Point a static provider to dist; Cloudflare Pages typically uses npm run build and dist as the output folder. The generated application does not require a Node production server.

For Cloudflare Workers static assets, a minimal wrangler.jsonc has a user-chosen name and assets.directory "./dist". Use a current supported compatibility date and verify the official configuration for the account. Do not copy any previous user's Worker name, account ID or Durable Object binding.

A Git-connected provider rebuilds the configured production branch; saving on another branch is not necessarily production publication. A branch preview is optional and must remain distinct from production.

## Checks are separate

1. Source tests, content validation and build success.
2. Provider deployment success for the exact production commit.
3. Live URL shows the expected version and its links/images work.

A GitHub Actions green check alone is not proof Cloudflare published. Inspect the provider's own check or dashboard. On GitHub the known integration may appear as Workers Builds, but verify the actual project and result rather than hardcoding a check name.

## Cloudflare preview and backend caveats

Cloudflare non-production previews may use a different command than production. A preview-command configuration error can coexist with a passing application build. Read the exact log and branch settings. Do not silently replace a production deploy command or bypass required checks.

If a future feature needs a server (authentication, owner uploads, permanent letter deletion), static publishing is insufficient. Choose persistence deliberately. A deletion flag must survive redeploys; browser localStorage does not implement global permanent deletion. Do not test destructive behavior against a real user's live content. Repository history and backups are not erased by an application delete button.

GitHub invitations, access changes and domain/DNS changes are separate authorized actions. Provide a preview or draft PR for review if that is the user's established process; never merge a requested preview before approval.
