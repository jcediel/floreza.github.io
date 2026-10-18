# Catalogues (flip book)

Each folder holds one catalogue as page images (`01.webp`, `02.webp`, ...).
They are shown by `assets/js/catalogue-viewer.js` as a flip book.
A lighter PDF of each catalogue lives in `assets/media/catalogue_<slug>.pdf` for the "Download PDF" buttons.

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

2. Make the downloadable PDF. Designer PDFs are often 30-50 MB because of PNG images;
   rebuild it from ~1700 px JPEG pages (≈0.3 MB per page) if it is over ~10 MB:

   ```bash
   pdftoppm -r 205 -jpeg -jpegopt quality=82 "My Catalogue.pdf" /tmp/$SLUG-dl   # 205 ≈ 1700/595*72 for A4
   python3 -c "import glob;from PIL import Image;p=[Image.open(f).convert('RGB') for f in sorted(glob.glob('/tmp/$SLUG-dl-*.jpg'))];p[0].save('assets/media/catalogue_$SLUG.pdf',save_all=True,append_images=p[1:],resolution=205)"
   ```

3. Add an entry to `CATALOGUES` in `assets/js/catalogue-viewer.js`:
   `'my-catalogue': { title: 'My Catalogue', pages: 12, width: 1000, height: 1414, pdf: 'assets/media/catalogue_my-catalogue.pdf' }`
   (`width`/`height` = pixel size of the page images).

4. Link it from any page (and add a card + "Download PDF" link in the Our Catalogues grid of `products.html`):

   ```html
   <a href="assets/catalogues/my-catalogue/01.webp" data-catalogue="my-catalogue"
      class="btn flosun-button secondary-btn rounded-0">VIEW CATALOGUE</a>
   ```

   Add `data-page="5"` to open it on a specific page.
