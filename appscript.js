var EMAIL_FROM_NAME = 'Elisa & Arden';
var EMAIL_SUBJECT   = 'We received your RSVP ❤️';

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  logEvent(data);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var params = e.parameter;

  if (params.action === 'get_guestlist') {
    return getGuestlist();
  }

  if (params.action === 'check_guest') {
    return checkGuest(params.firstName, params.lastName);
  }

  if (params.action === 'rsvp_response') {
    return rsvpResponse(params.firstName, params.lastName, params.response, params.email, params.timezone, params.dialCode, params.phone, params.dietary, params.plusOneAnswer, params.plusOneFn, params.plusOneLn, params.plusOneDietary, params.welcomeDinner, params.plusOneWelcomeDinner, params.bringingKids, params.joiningDinner, params.plusOneJoiningDinner, params.deviceId);
  }

  var data = JSON.parse(params.data);
  logEvent(data);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logEvent(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');

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

function rsvpResponse(firstName, lastName, response, email, timezone, dialCode, phone, dietary, plusOneAnswer, plusOneFn, plusOneLn, plusOneDietary, welcomeDinner, plusOneWelcomeDinner, bringingKids, joiningDinner, plusOneJoiningDinner, deviceId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  var now = new Date();
  var date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

  sheet.appendRow([date, time, timezone || '', firstName, lastName, response, email || '', dialCode || '', phone || '', dietary || '', plusOneAnswer || 'NA', plusOneFn || '', plusOneLn || '', plusOneDietary || '', welcomeDinner || 'NA', plusOneWelcomeDinner || '', bringingKids || 'NA', joiningDinner || '', plusOneJoiningDinner || '', deviceId || '']);

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
      plusOneDietary: plusOneDietary || '',
      welcomeDinner: welcomeDinner || '',
      plusOneWelcomeDinner: plusOneWelcomeDinner || '',
      bringingKids: bringingKids || '',
      joiningDinner: joiningDinner || '',
      plusOneJoiningDinner: plusOneJoiningDinner || ''
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
  function capitalizeList(str) {
    if (!str) return 'None';
    return str.split(', ').map(function(s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(', ');
  }
  var dietary = capitalizeList((data.dietary || '').trim().toLowerCase());
  var plusOneName = ((data.plusOneFn || '') + ' ' + (data.plusOneLn || '')).trim();
  var plusOneDietary = capitalizeList((data.plusOneDietary || '').trim().toLowerCase());

  var h = [];
  h.push('<!DOCTYPE html>');
  h.push('<html><body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,serif;">');
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:14px 14px 40px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="600" cellpadding="0" cellspacing="0" style="background:#f5efe9;border-radius:10px;overflow:hidden;">');
  h.push('<tr><td align="center" style="background:#c8967a;padding:40px 40px 32px;">');
  h.push('<h1 style="margin:0;font-size:32px;font-weight:400;color:#fff;font-family:Georgia,serif;">Elisa &amp; Arden</h1>');
  h.push('<p style="margin:12px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">AUGUST 20–21, 2027</p>');
  h.push('<p style="margin:4px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#fff;font-family:Helvetica Neue,Arial,sans-serif;">JUMEIRAH BALI, INDONESIA</p>');
  h.push('</td></tr>');
  h.push('<tr><td style="padding:32px 32px 32px;">');
  var greeting = plusOneName ? ('Dear ' + firstName + ' &amp; ' + (data.plusOneFn || plusOneName) + ',') : ('Dear ' + firstName + ',');
  h.push('<p style="margin:0 0 16px;font-size:16px;color:#3a3028;">' + greeting + '</p>');
  h.push('<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3a3028;">We\'re so happy you\'ll be joining us! Your RSVP has been received and we can\'t wait to celebrate with you in Bali.</p>');
  var labelStyle = 'margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#a09080;font-family:Helvetica Neue,Arial,sans-serif;';
  var valueStyle = 'margin:4px 0 0;font-size:15px;color:#3a3028;font-family:Helvetica Neue,Arial,sans-serif;';
  var cardStyle = 'background:#ffffff;border-radius:8px;padding:20px 24px;margin:0 0 16px;';
  var fieldGap = '<div style="height:16px;"></div>';
  var cardTitle = function(t) { return '<p style="margin:0 0 16px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#c8967a;font-family:Helvetica Neue,Arial,sans-serif;font-weight:600;">' + t + '</p>'; };

  h.push('<div style="' + cardStyle + '">');
  h.push(cardTitle('Your Details'));
  h.push('<p style="' + labelStyle + '">Name</p>');
  h.push('<p style="' + valueStyle + '">' + data.firstname + ' ' + data.lastname + '</p>');
  h.push(fieldGap);
  h.push('<p style="' + labelStyle + '">Mobile</p>');
  h.push('<p style="' + valueStyle + '">' + (data.dialCode || '') + ' ' + (data.phone || '') + '</p>');
  h.push(fieldGap);
  h.push('<p style="' + labelStyle + '">Dietary</p>');
  h.push('<p style="' + valueStyle + '">' + dietary + '</p>');
  if (data.bringingKids === 'Yes') {
    h.push(fieldGap);
    h.push('<p style="' + labelStyle + '">Bringing Kids</p>');
    h.push('<p style="' + valueStyle + '">Yes</p>');
  }
  h.push(fieldGap);
  h.push('<p style="' + labelStyle + '">Welcome Dinner</p>');
  h.push('<p style="' + valueStyle + '">' + (data.welcomeDinner === 'Yes' ? 'Joining' : 'Not joining') + '</p>');
  if (data.joiningDinner) {
    h.push(fieldGap);
    h.push('<p style="' + labelStyle + '">Dinner Reception</p>');
    h.push('<p style="' + valueStyle + '">' + (data.joiningDinner === 'Yes' ? 'Joining' : 'Not joining') + '</p>');
  }
  h.push('</div>');

  if (plusOneName) {
    h.push('<div style="' + cardStyle + '">');
    h.push(cardTitle('Plus One'));
    h.push('<p style="' + labelStyle + '">Name</p>');
    h.push('<p style="' + valueStyle + '">' + plusOneName + '</p>');
    h.push(fieldGap);
    h.push('<p style="' + labelStyle + '">Dietary</p>');
    h.push('<p style="' + valueStyle + '">' + plusOneDietary + '</p>');
    if (data.plusOneWelcomeDinner) {
      h.push(fieldGap);
      h.push('<p style="' + labelStyle + '">Welcome Dinner</p>');
      h.push('<p style="' + valueStyle + '">' + (data.plusOneWelcomeDinner === 'Yes' ? 'Joining' : 'Not joining') + '</p>');
    }
    if (data.plusOneJoiningDinner) {
      h.push(fieldGap);
      h.push('<p style="' + labelStyle + '">Dinner Reception</p>');
      h.push('<p style="' + valueStyle + '">' + (data.plusOneJoiningDinner === 'Yes' ? 'Joining' : 'Not joining') + '</p>');
    }
    h.push('</div>');
  }
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
  h.push('<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:14px 14px 40px;">');
  h.push('<tr><td align="center">');
  h.push('<table width="600" cellpadding="0" cellspacing="0" style="background:#f5efe9;border-radius:10px;overflow:hidden;">');
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
