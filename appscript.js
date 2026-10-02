var EMAIL_FROM_NAME = 'Elisa & Arden';
var EMAIL_SUBJECT   = 'We received your RSVP ❤️';

function doGet(e) {
  var params = e.parameter;

  if (params.action === 'get_guestlist') {
    return getGuestlist();
  }

  if (params.action === 'check_guest') {
    return checkGuest(params.firstName, params.lastName);
  }

  if (params.action === 'rsvp_response') {
    return rsvpResponse(params.firstName, params.lastName, params.response, params.email, params.timezone, params.dialCode, params.phone, params.dietary);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
  var data = JSON.parse(params.data);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date', 'Time', 'Event', 'Detail',
      'Device ID', 'IP', 'City', 'Region', 'Country',
      'Device Type', 'Browser', 'OS', 'Screen Size',
      'Pixel Ratio', 'CPU Cores', 'Connection',
      'Language', 'Timezone', 'Referrer',
      'Visible Time', 'Deepest Section'
    ]);
    sheet.getRange(1, 1, 1, 21).setFontWeight('bold');
  }

  var now = new Date();
  var date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

  sheet.appendRow([
    date, time,
    data.event || '', data.detail || '',
    data.deviceId || '', data.ip || '',
    data.city || '', data.region || '', data.country || '',
    data.deviceType || '', data.browser || '', data.os || '', data.screen || '',
    data.pixelRatio || '', data.cpuCores || '', data.connection || '',
    data.language || '', data.timezone || '', data.referrer || '',
    data.visibleTime || '', data.deepestSection || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getGuestlist() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guestlist');
  var data = sheet.getDataRange().getValues();
  var guests = [];
  for (var i = 1; i < data.length; i++) {
    guests.push({
      f: data[i][0].toString().toLowerCase().trim(),
      l: data[i][1].toString().toLowerCase().trim()
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ guests: guests }))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkGuest(firstName, lastName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guestlist');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase().trim() === firstName.toLowerCase().trim() &&
        data[i][1].toString().toLowerCase().trim() === lastName.toLowerCase().trim()) {
      return ContentService.createTextOutput(JSON.stringify({ found: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ found: false }))
    .setMimeType(ContentService.MimeType.JSON);
}

function rsvpResponse(firstName, lastName, response, email, timezone, dialCode, phone, dietary) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  var now = new Date();
  var date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

  sheet.appendRow([date, time, timezone || '', firstName, lastName, response, email || '', dialCode || '', phone || '', dietary || '']);

  try {
    sendConfirmationEmail({
      firstname: firstName,
      lastname: lastName,
      response: response,
      email: email || '',
      phone: phone || '',
      dietary: dietary || ''
    });
  } catch (err) {
    console.error('Email error: ' + err.message);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendConfirmationEmail(data) {
  var email = (data.email || '').trim();
  if (!email) return;

  var firstName = data.firstname || 'Guest';
  var isAttending = data.response === 'Joyfully accepts';

  var htmlBody = isAttending
    ? buildAttendingEmail(data, firstName)
    : buildDecliningEmail(firstName);

  MailApp.sendEmail({
    to: email,
    name: EMAIL_FROM_NAME,
    subject: EMAIL_SUBJECT,
    htmlBody: htmlBody
  });
}

function buildAttendingEmail(data, firstName) {
  var dietary = (data.dietary || '').trim();
  if (!dietary) dietary = 'None';

  var h = [];
  h.push('<!DOCTYPE html>');
  h.push('<html><body style="margin:0;padding:0;background:#fdfbf9;font-family:Georgia,serif;">');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf9;padding:40px 20px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">');
  h.push('<tr><td align="center" style="background:#c8967a;padding:40px 40px 32px;">');
  h.push('<p style="margin:0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">August 20–21, 2027 · Bali, Indonesia</p>');
  h.push('<h1 style="margin:12px 0 0;font-size:32px;font-weight:400;color:#fff;font-family:Georgia,serif;">Elisa &amp; Arden</h1>');
  h.push('</td></tr>');
  h.push('<tr><td style="padding:40px 48px 32px;">');
  h.push('<p style="margin:0 0 16px;font-size:16px;color:#3a3028;">Dear ' + firstName + ',</p>');
  h.push('<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3028;">We\'re so happy you\'ll be joining us! Your RSVP has been received and we can\'t wait to celebrate with you in Bali.</p>');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0e8e3;margin-bottom:24px;">');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:13px;font-family:Georgia,serif;">Name</td>');
  h.push('<td style="padding:6px 0;font-size:13px;font-family:Georgia,serif;">' + data.firstname + ' ' + data.lastname + '</td></tr>');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:13px;font-family:Georgia,serif;">Attending</td>');
  h.push('<td style="padding:6px 0;font-size:13px;font-family:Georgia,serif;">Yes 🎉</td></tr>');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:13px;font-family:Georgia,serif;">Dietary</td>');
  h.push('<td style="padding:6px 0;font-size:13px;font-family:Georgia,serif;">' + dietary + '</td></tr>');
  h.push('</table>');
  h.push('<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#3a3028;">More details about the weekend will follow closer to the date. In the meantime, feel free to reach out if you have any questions.</p>');
  h.push('<p style="margin:24px 0 0;font-size:15px;color:#3a3028;">With love,</p>');
  h.push('<p style="margin:4px 0 0;font-size:18px;color:#c8967a;font-style:italic;">Elisa &amp; Arden</p>');
  h.push('</td></tr>');
  h.push('<tr><td align="center" style="padding:20px 40px;border-top:1px solid #f0e8e3;">');
  h.push('<p style="margin:0;font-size:12px;color:#bbb;font-family:Helvetica Neue,Arial,sans-serif;">This is a confirmation of your RSVP. Please do not reply to this email.</p>');
  h.push('</td></tr>');
  h.push('</table></td></tr></table></body></html>');
  return h.join('');
}

function buildDecliningEmail(firstName) {
  var h = [];
  h.push('<!DOCTYPE html>');
  h.push('<html><body style="margin:0;padding:0;background:#fdfbf9;font-family:Georgia,serif;">');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf9;padding:40px 20px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">');
  h.push('<tr><td align="center" style="background:#c8967a;padding:40px 40px 32px;">');
  h.push('<p style="margin:0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">August 20–21, 2027 · Bali, Indonesia</p>');
  h.push('<h1 style="margin:12px 0 0;font-size:32px;font-weight:400;color:#fff;font-family:Georgia,serif;">Elisa &amp; Arden</h1>');
  h.push('</td></tr>');
  h.push('<tr><td style="padding:40px 48px 32px;">');
  h.push('<p style="margin:0 0 16px;font-size:16px;color:#3a3028;">Dear ' + firstName + ',</p>');
  h.push('<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3028;">Thank you for letting us know. We\'re sorry you won\'t be able to make it, but we appreciate you taking the time to respond. You\'ll be missed!</p>');
  h.push('<p style="margin:24px 0 0;font-size:15px;color:#3a3028;">With love,</p>');
  h.push('<p style="margin:4px 0 0;font-size:18px;color:#c8967a;font-style:italic;">Elisa &amp; Arden</p>');
  h.push('</td></tr>');
  h.push('<tr><td align="center" style="padding:20px 40px;border-top:1px solid #f0e8e3;">');
  h.push('<p style="margin:0;font-size:12px;color:#bbb;font-family:Helvetica Neue,Arial,sans-serif;">This is a confirmation of your RSVP. Please do not reply to this email.</p>');
  h.push('</td></tr>');
  h.push('</table></td></tr></table></body></html>');
  return h.join('');
}

function testEmail() {
  MailApp.sendEmail({
    to: 'ardenelisa.2027@gmail.com',
    name: 'Elisa & Arden',
    subject: 'Test - Email Works!',
    htmlBody: '<p>If you see this, MailApp is authorized and working.</p>'
  });
}
