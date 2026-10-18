/**
 * Floreza - Contact form backend (Google Apps Script)
 *
 * Receives POSTs from contact-us.html, emails them to RECIPIENT and
 * appends a row to the bound Google Sheet. See apps-script/README.md.
 */

var RECIPIENT = 'info@florezaus.com';
var SHEET_NAME = 'Messages';
var MAX_MESSAGE_LENGTH = 5000;
var MAX_FIELD_LENGTH = 200;

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Honeypot: real users never fill this hidden field. Pretend success so bots move on.
  if (p.website) {
    return json_({ ok: true });
  }

  var data = {
    name: clean_(p.con_name, MAX_FIELD_LENGTH),
    email: clean_(p.con_email, MAX_FIELD_LENGTH),
    subject: clean_(p.con_subject, MAX_FIELD_LENGTH),
    phone: clean_(p.con_phone, MAX_FIELD_LENGTH),
    message: String(p.con_message || '').trim().slice(0, MAX_MESSAGE_LENGTH)
  };

  if (!data.name || !data.message || !isEmail_(data.email)) {
    return json_({ ok: false, error: 'Please fill in your name, a valid email and a message.' });
  }

  try {
    saveToSheet_(data);
  } catch (err) {
    console.error('Sheet error: ' + err);
  }

  try {
    MailApp.sendEmail({
      to: RECIPIENT,
      replyTo: data.email,
      name: 'Floreza Website',
      subject: '[Web] ' + (data.subject || 'New message') + ' - ' + data.name,
      body:
        'Name: ' + data.name + '\n' +
        'Email: ' + data.email + '\n' +
        'Phone: ' + (data.phone || '-') + '\n' +
        'Subject: ' + (data.subject || '-') + '\n\n' +
        'Message:\n' + data.message + '\n'
    });
  } catch (err) {
    console.error('Mail error: ' + err);
    return json_({ ok: false, error: 'Sorry, your message could not be sent. Please email us at ' + RECIPIENT + '.' });
  }

  return json_({ ok: true });
}

function saveToSheet_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message']);
    sheet.setFrozenRows(1);
  }
  // Prefix with ' so values starting with = + - @ are not evaluated as formulas.
  sheet.appendRow([new Date()].concat(
    [data.name, data.email, data.phone, data.subject, data.message].map(function (v) {
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    })
  ));
}

function clean_(value, max) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run from the editor to test email + sheet without the website. */
function testDoPost() {
  var res = doPost({ parameter: {
    con_name: 'Test', con_email: RECIPIENT, con_subject: 'Test',
    con_phone: '+1 (305) 505-8321', con_message: 'Test message from Apps Script editor.'
  }});
  Logger.log(res.getContent());
}
