# Catalogues (flip book)

Each folder holds one catalogue as page images (`01.webp`, `02.webp`, ...).
They are shown by `assets/js/catalogue-viewer.js` as a flip book.
PDFs are not served (they are 10-50 MB; the images are ~1 MB per catalogue).

## Add or replace a catalogue

1. Render the PDF pages (about 1000 px wide; use 1400 for landscape pages):

   ```bash
   SLUG=my-catalogue
   mkdir -p assets/catalogues/$SLUG
   # -r = DPI. For a page 595 pt wide (A4): 1000 / 595 * 72 ≈ 121
   pdftoppm -r 121 -png "My Catalogue.pdf" /tmp/$SLUG
   for f in /tmp/$SLUG-*.png; do
     n=$(basename "$f" .png | sed 's/.*-//'); n=$(printf '%02d' $((10#$n)))
     cwebp -q 78 "$f" -o assets/catalogues/$SLUG/$n.webp   # or any PNG→WebP converter
   done
   ```

2. Add an entry to `CATALOGUES` in `assets/js/catalogue-viewer.js`:
   `'my-catalogue': { title: 'My Catalogue', pages: 12, width: 1000, height: 1414 }`
   (`width`/`height` = pixel size of the page images).

3. Link it from any page:

   ```html
   <a href="assets/catalogues/my-catalogue/01.webp" data-catalogue="my-catalogue"
      class="btn flosun-button secondary-btn rounded-0">VIEW CATALOGUE</a>
   ```

   Add `data-page="5"` to open it on a specific page.
