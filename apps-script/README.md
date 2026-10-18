# Contact form backend (Google Apps Script)

The site is static (GitHub Pages), so the contact form in `contact-us.html`
posts to a Google Apps Script web app that emails `info@florezaus.com` and
saves each message in a Google Sheet.

## Setup (once, ~15 min)

Do this logged in with the company Google Workspace account (ideally `info@florezaus.com`).

1. Create a new Google Sheet, e.g. **"Floreza - Contact form"**.
2. In the sheet: **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with `contact-form.gs` from this folder. Save.
4. Select `testDoPost` in the toolbar and click **Run**. Accept the permissions
   (Gmail send + Sheets). Check that a test email arrived and a `Messages` tab
   with one row appeared in the sheet.
5. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
7. In `contact-us.html`, replace the form `action` placeholder
   `https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec` with that URL.
   Commit and push.

## Updating the script

After editing the code: **Deploy → Manage deployments → (pencil) → Version: New version → Deploy**.
This keeps the same URL, so the website does not need to change.

## Quick test without the website

```bash
curl -L -X POST "https://script.google.com/macros/s/<ID>/exec" \
  --data-urlencode "con_name=Test" \
  --data-urlencode "con_email=you@example.com" \
  --data-urlencode "con_message=Hello"
# → {"ok":true}
```

## Limits

Workspace accounts can send ~1,500 emails/day via `MailApp`. To disable the form
backend: **Deploy → Manage deployments → Archive**.
