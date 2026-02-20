function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Log");
    const payload = JSON.parse(e.postData.contents || "{}");

    // Optional basic auth check.
    // If you want strict checking, set REQUIRED to your Basic header value.
    // Example required header value:
    //   Basic base64(key:secret)
    const auth = (e && e.headers && (e.headers.Authorization || e.headers.authorization)) || "";
    const REQUIRED = ""; // set this if you want auth gating
    if (REQUIRED && auth !== REQUIRED) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const timestamp = payload.timestamp || new Date().toISOString();
    const actor_id = payload.actor && payload.actor.id ? payload.actor.id : "";
    const actor_name = payload.actor && payload.actor.name ? payload.actor.name : "";
    const actor_role = payload.actor && payload.actor.role ? payload.actor.role : "";
    const verb = payload.verb && payload.verb.display && payload.verb.display["en-US"] ? payload.verb.display["en-US"] : (payload.verb ? payload.verb.id : "");
    const object_id = payload.object ? payload.object.id : "";
    const object_name = payload.object && payload.object.definition && payload.object.definition.name ? payload.object.definition.name["en-US"] : "";
    const score = payload.result && payload.result.score ? payload.result.score.raw : "";

    sheet.appendRow([
      timestamp,
      actor_id,
      actor_name,
      actor_role,
      verb,
      object_id,
      object_name,
      score,
      JSON.stringify(payload)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
