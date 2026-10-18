# Resume

Single-page resume on GitHub Pages — custom Jekyll layout, no theme. English at `/`, Korean at `/ko/` (EN · KO toggle in the top bar).

- Content: `_data/resume/en.yml` and `_data/resume/ko.yml` — same structure, one file per language (profile, focus, ad-domain map, projects, experience, skills, education, UI strings)
- Layout: `_layouts/default.html` (picks the data file from `page.lang`; the campaign concept and creative-agent request flow are inline SVGs)
- Contact: the Email disclosure reveals the address below the header link, including without JavaScript.
- Styles: `assets/main.css` (plain CSS, light/dark via `prefers-color-scheme`, Korean typography overrides under `html[lang="ko"]`)
- Diagrams: `assets/diagrams.js` (1/2 selection, five-second rotation, pause/play; pauses on hover, keyboard focus and hidden tabs, and starts paused for reduced motion)

After editing either data file, check that the two still match:

```
ruby _scripts/check_i18n.rb
node _scripts/check_diagrams.js
```

Keep the two languages equivalent in scope, dates and ownership. Distinguish implemented features from ongoing work, and check claims against current code and contribution history. The structure check does not verify translation quality or factual accuracy. Keep internal sources and unverified performance figures out of the public page.

## How to run locally
```
bundle install
bundle exec jekyll serve
```
