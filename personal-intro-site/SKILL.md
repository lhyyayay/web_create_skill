---
name: personal-intro-site
description: Create or extend a personal introduction, résumé, academic profile, portfolio, or personal journal website from a person's name, supplied facts, and requested sections. Includes a runnable Vue starter, content and photo tools, preview checks, and maintenance handoff. Use for personal sites, not general business sites or account administration.
---

# Personal introduction website

Turn a small personal brief into a usable, maintainable website. Preserve the person's facts and chosen visual direction. The starter is a configurable foundation, not a requirement to make every person look alike.

## Intake and scope

Required input: name, supplied personal information (sparse is fine), requested sections. Infer sensible defaults from purpose. Ask only for consequential missing choices; do not make the user fill a technical questionnaire.

- Distinguish supplied facts, content suggestions, placeholders, and AI imagery.
- Keep unspecified credentials, dates, awards and research results empty. Do not invent achievements or attribute team results to one person.
- If use is unclear, default to a professional personal introduction. Ask before introducing romance, a private letter, fictional identity, analytics, a public contact address, or destructive controls.
- Respect the active user's workflow and authorization. A simple new site does not automatically require a branch, several visual variants, or deployment. Existing production work should use the established review and release process.
- Honor an existing repository and framework. Do not replace an established stack just to use this starter. User-specific drive conventions, Cloudflare account IDs, domains, names, and this skill's test fixtures are not global defaults.

## Choose the implementation

For a new ordinary personal site, the bundled starter uses Vue 3, Vite, Vue Router, Markdown-it, DOMPurify, Lucide and PhotoSwipe. Static content avoids needing a server for ordinary profile editing. Read [brief-and-content.md](references/brief-and-content.md) for the precise input and output schema.

Existing sites: inspect current source and content before editing. Use only the schema and workflow guidance relevant to that site. GitHub-only maintenance means edit remote source; local build artifacts or read-only verification copies must not silently become the source of truth.

Use an available design skill when it materially helps. If imagery or animation is requested, use the environment's relevant media workflow. This skill does not assume those tools are installed and does not install them automatically.

## Generate a new site

Write the collected brief as UTF-8 JSON outside the skill directory, then use the bundled generator. Replace the angle-bracket paths with actual absolute paths; they are not literal arguments.

```sh
node "<skill-dir>/scripts/create-site.mjs" --brief "<brief.json>" --out "<new-site-directory>"
```

The output directory must not already exist. The generator does not install dependencies, publish, change account permissions, or overwrite an existing site.

Then use the project's package manager and lockfile. For a fresh generated site:

```sh
npm ci
npm run check:content
npm test
npm run build
npm run dev
```

The starter includes a tested package-lock.json. Keep it committed; dependency upgrades are deliberate changes followed by a build. Use the user's authorized locations for dependencies and caches.

The generated README and two text guides must reflect the actual features, tone, repository and deployment setup. Complete deployment placeholders only from verified information.

## Shape and implement

Read [design-and-review.md](references/design-and-review.md). Prioritize the person's real use: quick self-introduction, evidence of ability, readable projects, and working ways to reach relevant material.

The shipped themes (editorial, academic, studio, warm) are starting points. Adapt hierarchy, spacing, imagery, typography and composition to the brief; do not claim a palette switch alone is a bespoke design. The current website's cinematic desk is a possible direction, not a mandatory asset or visual recipe.

- Homepage: name, concise introduction, clear primary action and navigation.
- About and capability material: readable education, skills, project role, contribution, methods and actual outcomes.
- Optional journal, gallery and detail pages: complete navigation and meaningful empty states.
- Keep text links as links and action buttons as buttons. Verify real hrefs after styling shared controls.
- Respect mobile widths, keyboard focus, image dimensions, reduced motion, and honest sample labels.
- Requested independent pages use section layout "page"; in-page sections use layout "section". Long entries can open detail routes.
- If a requested feature needs authentication, a backend or persistent deletion, plan that extension explicitly. The static starter has no online editor, upload backend, private storage, or permanent server-side deletion.

## Content and images

Read [maintenance.md](references/maintenance.md) when importing material or handing the site over. Use the generated content tools rather than leaving users to coordinate file paths by hand.

```sh
npm run photo:add -- --file "<photo>" --section gallery --caption "配文"
npm run photo:add -- --file "<portrait>" --target portrait --alt "本人照片"
npm run entry:add -- --section projects --input "<entry.json>" --body "<body.md>"
```

Photo tools require project dependencies installed. For AI imagery pass --ai true; keep the source label until genuinely replaced. Never infer image dimensions from a mockup. Import tools copy files into public media and update references together.

Only publish material the user intends to make public. Private repository access and hidden sections do not protect material bundled into a static website. Do not copy source-project personal photos or letters into the reusable package.

## Preview and release

Run the checks the output actually supports, inspect rendered representative mobile and desktop routes, and verify navigation, search if present, image opening, missing content and long content. Do not report planned or unrun checks as passed. Record material limitations.

For deployment, read [deployment.md](references/deployment.md) only when publishing is requested. Keep build success, publish success and live-page verification separate. Do not change domain records, send invitations, grant account access, merge or publish outside the user's authorization.

End with the generated directory, how to preview, what was verified, any real remaining limitation, and how the owner changes content. If the user asked only for a draft or preview, stop there.
