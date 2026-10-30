# Brief and content contract

## Minimal brief

```json
{
  "name": "你的姓名",
  "info": { "title": "", "bio": "", "school": "", "major": "" },
  "sections": ["关于我", "教育背景", "能力", "科研项目", "获奖情况", "作品"]
}
```

name is required. info can be a string (biography) or object. sections is a nonempty array of supported names or objects. purpose, theme, language, siteTitle and showPlaceholders are optional. Default language is zh-CN. The starter's controls are Chinese; a different language also requires localizing control and fallback copy, not only changing the HTML language tag. Default theme is academic for a research/academic purpose, otherwise editorial. User choices always win.

Section types: about, education, skills, projects, awards, works, experience, journal, gallery, contact, custom. Common Chinese aliases are normalized. Unknown names become custom text/list sections, preserving the user's title. Letter, authentication and administration requests require a separate extension; do not imply the static starter implements them.

Use an object for exact control:

```json
{
  "id": "research",
  "type": "projects",
  "title": "科研与项目",
  "layout": "page",
  "empty": "placeholder",
  "items": [{
    "id": "my-research",
    "title": "用户提供的项目名称",
    "summary": "",
    "role": "",
    "contribution": "",
    "methods": [],
    "outcome": "",
    "body": "这里放用户提供的 Markdown 正文。"
  }]
}
```

layout is section (in-page) or page (independent route). empty is placeholder or hide. enabled:false hides a section or entry. The generator stores entry body text in a Markdown file and writes bodyFile in the index. Plain custom section body can be Markdown.

## Generated data

content/site.json is the index:
- schemaVersion: 1
- siteTitle, description, language, theme, isExample
- profile: name, title, bio, school, major, location, tagline, image (optional), links
- sections: ordered objects with id, type, title, layout, enabled, empty, intro, body, items

Entry fields: id, title, summary, date, period, issuer, question, role, contribution, methods (strings), outcome, tags (strings), href, isExample, enabled, bodyFile, image.
Image object: src, width, height, alt, caption, isAI. Gallery entries use image; the owner portrait uses profile.image.

bodyFile is relative to content, such as entries/research/my-research.md. Images use /media/file.ext and attachments /attachments/file.pdf. Runtime asset helpers account for Vite base paths; do not concatenate a repository name manually.

IDs are stable lowercase Latin letters, digits and hyphens, 1–80 characters. Human titles may be Chinese or other Unicode. Unknown Chinese section names receive a deterministic identifier, not an unstable array position. Never change a published ID without accounting for old links.

## Routes

/ is the overview; /section/:sectionId shows an independent module; /entry/:sectionId/:entryId shows its Markdown detail. Vue uses hash history, so deployed URLs contain #/. Disabled and hidden empty sections do not leave dead navigation. Missing routes show a real not-found state and a way home.

showPlaceholders defaults true. If false, empty ordinary sections hide. About can still show the supplied profile; contact is empty until there are actual links. No default email, awards or project claims are invented.

Keep long-form content in Markdown, short structured fields in JSON. Avoid HTML in Markdown; the renderer disables raw HTML and sanitizes output.
