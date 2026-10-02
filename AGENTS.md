# Minifield Docs

Read README.md and docs/procedure.md before changing this repository.

- This independent repository owns Minifield’s public documentation, its React static renderer, and static delivery configuration.
- Write pages in content/*.md. Page filenames define URLs. Keep existing URLs stable. Navigation, search, and headings derive from this content.
- Keep product facts grounded in the owning repositories. Record reviewed source paths, revisions, and hashes in docs/sources.json when refreshing technical content.
- Public scope covers MagicBox, Runtime, Command, Observer, and Training. Keep internal application and backend guides in their owning repositories. Data preparation belongs in Training; data generation isn't a separately offered package. The company has no public Stats page.
- Preserve the homepage and blog’s graphite #101112 surface, warm-white #efeeeb text, ember #f09169 interaction accent, Manrope Variable, IBM Plex Mono, text-only wordmark, and Fieldlines favicon geometry.
- Keep technical prose concise. Use contractions. Never use em dashes or a sentence that negates a framing and immediately substitutes another.
- Don't add defensive notes, disclaimers, marketing claims, fake measurements, decorative labels, or screenshots to the site without the user’s request.
- React renders complete HTML at build time. Browser enhancement handles search, copy, and contents tracking. Keep page content and navigation usable without JavaScript.
- Keep interfaces small. src/content.ts owns compilation and content metadata. src/render.tsx owns the page shell. Don't add a router, server runtime, CMS, UI framework, or sibling source dependency.
- Self-host assets. Keep dependencies, generated HTML, caches, and private inputs outside Git. Preserve font licenses.
- Run npm run check and inspect desktop and mobile layouts after visual changes. Check production HTML and direct links. Never claim a local preview is deployed.
- Use a feature branch and conventional commits. Never commit to main or merge without explicit user direction.
- Commit as Proto <TomBombadilsHat@proton.me>. Verify author and committer identities. Use GitHub account protodotdesign and verify it before any push.
- Follow the parent workspace’s artifact budget when operating there. Register new generated locations before use and run build/validation commands through its artifact-budget wrapper.
