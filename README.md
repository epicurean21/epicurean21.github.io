# Resume

Single-page resume on GitHub Pages — custom Jekyll layout, no theme. English at `/`, Korean at `/ko/` (EN · KO toggle in the top bar).

- Content: `_data/resume/en.yml` and `_data/resume/ko.yml` — same structure, one file per language (profile, focus, ad-domain map, projects, experience, skills, education, UI strings)
- Layout: `_layouts/default.html` (picks the data file from `page.lang`; the creative-agent request flow is an inline SVG)
- Styles: `assets/main.css` (plain CSS, light/dark via `prefers-color-scheme`, Korean typography overrides under `html[lang="ko"]`)

After editing either data file, check that the two still match:

```
ruby _scripts/check_i18n.rb
```

Keep the two languages equivalent in scope, dates and ownership. Distinguish implemented features from ongoing work, and check claims against current code and contribution history. The structure check does not verify translation quality or factual accuracy. Keep internal sources and unverified performance figures out of the public page.

## How to run locally
```
bundle install
bundle exec jekyll serve
```
