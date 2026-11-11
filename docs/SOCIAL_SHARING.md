# Social sharing metadata

`src/index.html` includes static Open Graph metadata for `https://app.rizauddin.com/luluske`: title, description, website type, site name, URL, British English locale, and an HTTPS PNG image with dimensions and alternative text. Matching Twitter large-image card tags are included. The document title is also `luluske?` before Angular starts.

The tags are present in the initial HTML, rather than added only after Angular starts. No calculator values or user-entered data are included in the metadata.

The blue preview image is `src/assets/luluske-og.png` (1200 × 630). Its editable HTML artwork is `scripts/luluske-social-preview.html`; render that at a 1200 × 630 viewport with device scale factor 1 to regenerate the PNG. The existing Angular asset configuration copies the image into the production output.

Verify after building:

```sh
npm run build
node scripts/verify-social-metadata.cjs
```

Deploy the complete `dist/myapps/browser` output, including its `assets` directory. The host must continue serving the Angular entry HTML at `/luluske`, and the image must be public at `https://app.rizauddin.com/assets/luluske-og.png`. These changes are local until deployed; the live page was not verified during implementation. Previously shared previews may remain cached by the sharing service until refreshed.

## Shared entry HTML

This repository currently uses one static HTML entry for all its client-side routes. Luluske metadata is therefore the default metadata in that shared entry. This change does not introduce server rendering, change route handling, or provide separate crawler metadata for other apps. Separate initial HTML/prerendering would be needed if another route requires its own server-delivered social preview. No shared canonical link was added, so unrelated routes are not explicitly canonicalised to Luluske.

Field definitions follow the [Open Graph protocol](https://ogp.me/).
