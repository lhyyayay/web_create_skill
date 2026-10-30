# Content maintenance and handoff

The generated project separates content/site.json, content/entries/**/*.md and public/media. The public website has no edit/upload screen. GitHub edits or local file edits change the source; the deployed build updates after a successful authorized release.

## Photos

After npm ci:
- npm run photo:add -- --file /absolute/photo.jpg --section gallery --caption "配文"
- npm run photo:add -- --file /absolute/portrait.jpg --target portrait --alt "个人照片"
- npm run photo:add -- --file /absolute/cover.jpg --target cover --section journal --entry my-entry
- Add --ai true for generated imagery.

The tool validates real image dimensions, copies a content-addressed filename to public/media, and updates the corresponding JSON reference. It does not move/delete the original image. It does not automatically publish. Supported starter import formats are JPEG, PNG and WebP; other formats require deliberate conversion. AI tools should correctly declare generated images.

Manual equivalent: upload image, fill src/width/height/alt/caption/isAI, keep other entries, then commit the related files. Correct paths and case matter. Hidden sections do not make public media private.

## Entries

npm run entry:add -- --section projects --input /absolute/entry.json --body /absolute/article.md

The entry JSON must have an id and title. Existing IDs are rejected rather than overwritten. --body creates content/entries/section/id.md and updates bodyFile. Without --body, an inline body string in the JSON is accepted and moved into Markdown. Existing entries can be edited in content/site.json and their referenced bodyFile; preserve their IDs and unrelated fields.

Education, skills, awards, works and experience are structured items in the selected section's items array. Skills can use tags. Project descriptions should cover question, role, contribution, methods and outcomes, with optional Markdown detail and evidence link. Empty optional fields remain empty.

## The three generated documents

README.md introduces the website and its actual modules, not a large technical manual.
给AI的网站维护说明.txt provides file and field mappings, true capabilities, examples and verification steps.
网站使用指南.txt patiently explains where to browse, how to ask an AI for help, how to save a change, and how to confirm deployment.

Adapt tone from user instructions. Friendly and patient is a default; romantic wording requires the user's relationship context. Update deployment instructions only after a provider and branch have actually been configured. A generic guide must not claim that GitHub/Cloudflare is already connected.

For a beginner, guide one action at a time. A ChatGPT session without repository write access cannot claim to have changed the site. Do not ask for passwords, codes or tokens in chat.
