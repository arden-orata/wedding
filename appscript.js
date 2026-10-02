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
    return rsvpResponse(params.firstName, params.lastName, params.response, params.email, params.timezone, params.dialCode, params.phone, params.dietary, params.plusOneAnswer, params.plusOneFn, params.plusOneLn, params.plusOneDietary, params.deviceId);
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
      l: data[i][1].toString().toLowerCase().trim(),
      p: data[i][2] && data[i][2].toString().toLowerCase().trim() === 'yes'
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
      var plusOne = data[i][2] && data[i][2].toString().toLowerCase().trim() === 'yes';
      return ContentService.createTextOutput(JSON.stringify({ found: true, plusOne: plusOne }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ found: false }))
    .setMimeType(ContentService.MimeType.JSON);
}

function rsvpResponse(firstName, lastName, response, email, timezone, dialCode, phone, dietary, plusOneAnswer, plusOneFn, plusOneLn, plusOneDietary, deviceId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  var now = new Date();
  var date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

  sheet.appendRow([date, time, timezone || '', firstName, lastName, response, email || '', dialCode || '', phone || '', dietary || '', plusOneAnswer || 'NA', plusOneFn || '', plusOneLn || '', plusOneDietary || '', deviceId || '']);

  try {
    sendConfirmationEmail({
      firstname: firstName,
      lastname: lastName,
      response: response,
      email: email || '',
      dialCode: dialCode || '',
      phone: phone || '',
      dietary: dietary || '',
      plusOneFn: plusOneFn || '',
      plusOneLn: plusOneLn || '',
      plusOneDietary: plusOneDietary || ''
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
  var dietary = (data.dietary || '').trim().toLowerCase();
  if (!dietary) dietary = 'none';
  var plusOneName = ((data.plusOneFn || '') + ' ' + (data.plusOneLn || '')).trim();
  var plusOneDietary = (data.plusOneDietary || '').trim().toLowerCase();

  var h = [];
  h.push('<!DOCTYPE html>');
  h.push('<html><body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 20px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="560" cellpadding="0" cellspacing="0" style="background:#f5efe9;border-radius:10px;overflow:hidden;">');
  h.push('<tr><td align="center" style="background:#c8967a;padding:40px 40px 32px;">');
  h.push('<h1 style="margin:0;font-size:32px;font-weight:400;color:#fff;font-family:Georgia,serif;">Elisa &amp; Arden</h1>');
  h.push('<p style="margin:12px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">AUGUST 20–21, 2027</p>');
  h.push('<p style="margin:4px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">JUMEIRAH BALI, INDONESIA</p>');
  h.push('</td></tr>');
  h.push('<tr><td style="padding:40px 32px 32px;">');
  var greeting = plusOneName ? ('Dear ' + firstName + ' &amp; ' + (data.plusOneFn || plusOneName) + ',') : ('Dear ' + firstName + ',');
  h.push('<p style="margin:0 0 16px;font-size:16px;color:#3a3028;">' + greeting + '</p>');
  h.push('<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3028;">We\'re so happy you\'ll be joining us! Your RSVP has been received and we can\'t wait to celebrate with you in Bali.</p>');
  h.push('<table cellpadding="0" cellspacing="0" style="margin:0 0 24px 20px;">');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Name</td>');
  h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">' + data.firstname + ' ' + data.lastname + '</td></tr>');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Attending</td>');
  h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">Yes</td></tr>');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Mobile</td>');
  h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">' + (data.dialCode || '') + ' ' + (data.phone || '') + '</td></tr>');
  h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Dietary</td>');
  h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">' + dietary + '</td></tr>');
  if (plusOneName) {
    h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Plus One</td>');
    h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">' + plusOneName + '</td></tr>');
    h.push('<tr><td style="padding:6px 0;color:#888;font-size:15px;font-family:Georgia,serif;white-space:nowrap;padding-right:16px;vertical-align:top;">Guest Dietary</td>');
    h.push('<td style="padding:6px 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;">' + (plusOneDietary || 'none') + '</td></tr>');
  }
  h.push('</table>');
  h.push('<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3a3028;">If any of the details above need updating, simply submit another RSVP and we\'ll use your latest response.</p>');
  h.push('<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#3a3028;">More details about the weekend will follow closer to the date. In the meantime, feel free to reach out if you have any questions, or <a href="https://chat.whatsapp.com/ICwTJyTcdkFEv2Uc1DdGEF?mode=gi_t" target="_blank" style="color:#1A8FC4;text-decoration:underline;">join our wedding WhatsApp group for updates</a>.</p>');
  h.push('<p style="margin:24px 0 0;font-size:15px;color:#3a3028;">With love,</p>');
  h.push('<p style="margin:4px 0 0;font-size:18px;color:#c8967a;font-style:italic;">Elisa &amp; Arden</p>');
  h.push('</td></tr>');
  h.push('<tr><td align="center" style="padding:20px 40px;border-top:1px solid #f0e8e3;">');
  h.push('<p style="margin:0;font-size:12px;color:#bbb;font-family:Helvetica Neue,Arial,sans-serif;">This is a confirmation of your RSVP.<br>Please do not reply to this email.</p>');
  h.push('</td></tr>');
  h.push('</table></td></tr></table></body></html>');
  return h.join('');
}

function buildDecliningEmail(firstName) {
  var h = [];
  h.push('<!DOCTYPE html>');
  h.push('<html><body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 20px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="560" cellpadding="0" cellspacing="0" style="background:#f5efe9;border-radius:10px;overflow:hidden;">');
  h.push('<tr><td align="center" style="background:#c8967a;padding:40px 40px 32px;">');
  h.push('<h1 style="margin:0;font-size:32px;font-weight:400;color:#fff;font-family:Georgia,serif;">Elisa &amp; Arden</h1>');
  h.push('<p style="margin:12px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">AUGUST 20–21, 2027</p>');
  h.push('<p style="margin:4px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">JUMEIRAH BALI, INDONESIA</p>');
  h.push('</td></tr>');
  h.push('<tr><td style="padding:40px 48px 32px;">');
  h.push('<p style="margin:0 0 16px;font-size:16px;color:#3a3028;">Dear ' + firstName + ',</p>');
  h.push('<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3028;">Thank you for letting us know. We\'re sorry you won\'t be able to make it, but we appreciate you taking the time to respond. You\'ll be missed!</p>');
  h.push('<p style="margin:24px 0 0;font-size:15px;color:#3a3028;">With love,</p>');
  h.push('<p style="margin:4px 0 0;font-size:18px;color:#c8967a;font-style:italic;">Elisa &amp; Arden</p>');
  h.push('<p style="margin:24px 0 0;font-size:14px;"><a href="https://chat.whatsapp.com/ICwTJyTcdkFEv2Uc1DdGEF?mode=gi_t" target="_blank" style="color:#c8967a;text-decoration:none;font-family:Helvetica Neue,Arial,sans-serif;">For updates and questions, join our wedding WhatsApp group &rarr;</a></p>');
  h.push('</td></tr>');
  h.push('<tr><td align="center" style="padding:20px 40px;border-top:1px solid #f0e8e3;">');
  h.push('<p style="margin:0;font-size:12px;color:#bbb;font-family:Helvetica Neue,Arial,sans-serif;">This is a confirmation of your RSVP.<br>Please do not reply to this email.</p>');
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
