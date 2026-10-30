# Personal-site design and review

## Direction

Start with the intended reader: an employer deciding whether to contact the person, a supervisor assessing research fit, a client looking at work, or friends reading a journal. Make the relevant evidence discoverable.

Professional default: editorial hierarchy, clear name and purpose, readable summary, restrained color, evidence-led projects. Academic: field and education alongside project question, methods and actual contribution. Creative portfolio: let real work and imagery lead. Warm personal: photographic light and personal expression when asked. A gift relationship, star field, cinematic intro or letter is never inferred solely from a person's name.

Use the bundled theme only as a foundation. Honor a user's explicit reference. If they want a visual draft first, show a real draft before implementation; if they ask for a quick runnable site, do not force several image-generation rounds.

For substantial new visual decisions, research compatible maintained open-source projects as needed. Stars are one signal; also verify license, source quality, accessibility and maintenance. Current references: Vue/create-vue and Vite for the foundation; Inspira UI and shadcn-vue for Vue interaction patterns; Magic UI for selective motion inspiration. Do not import a React runtime to copy one visual effect.

## Controls and motion

One obvious primary action; secondary links should stay distinguishable. Include hover, focus-visible and pressed feedback, not just a static rounded rectangle. A shared component must preserve RouterLink-generated hrefs; do not pass href:undefined onto its rendered anchor.

Keep any animation subordinate to reading and interaction. Text remains readable without motion. Background effects should pause when hidden. Add a cinematic sequence only on request, with a static fallback and a reduced-motion state. Do not restore discarded effects such as simulated book-page turns without a new request.

## Concrete review

Check representative 360px, 768px and wide layouts (or user-specified sizes). Inspect actual screenshots and document width, not just successful builds.
- Primary navigation, in-page anchors, independent modules, details and return paths.
- Long names, long project titles, absent photos and empty sections.
- Photo dimensions and source labels, enlargement and focus restoration.
- Keyboard access and visible focus; practical touch target sizes.
- Links keep their address and sensible native behavior.
- User-supplied Markdown cannot introduce executable HTML or unsafe links.
- Reduced-motion behavior: test when supported; otherwise report source inspection accurately.
- Console errors, missing assets, build output and any material limitations.

Keep the actual owner copy. Suggestions should not silently become facts. Present ongoing projects as ongoing, distinguish team and individual results, and include evidence links only when real and publishable.
