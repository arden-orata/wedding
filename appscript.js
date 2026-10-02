function doGet(e) {
  var params = e.parameter;

  if (params.action === 'get_guestlist') {
    return getGuestlist();
  }

  if (params.action === 'check_guest') {
    return checkGuest(params.firstName, params.lastName);
  }

  if (params.action === 'rsvp_response') {
    return rsvpResponse(params.firstName, params.lastName, params.response, params.email, params.timezone, params.phone, params.dietary);
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

function rsvpResponse(firstName, lastName, response, email, timezone, phone, dietary) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  var now = new Date();
  var date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

  sheet.appendRow([date, time, timezone || '', firstName, lastName, response, email || '', phone || '', dietary || '']);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
