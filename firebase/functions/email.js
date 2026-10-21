// Builds the notification email for one feedback document.
// Same content as the former Supabase Edge Function (notify-feedback).

const KINDS = {
  website: "Website feedback",
  program_general: "App feedback (quick)",
  program_bug: "Bug report",
};
const APPS = { website: "Website", surveytools: "SurveyTools", heda: "Heda", shodia: "Shodia" };

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

export function buildEmail(row, { id, projectId } = {}) {
  const kind = KINDS[row.category] ?? row.category;
  const appName = APPS[row.app] ?? row.app;
  const rows = [];
  const add = (k, v) => {
    if (v !== null && v !== undefined && String(v).trim() !== "")
      rows.push(`<tr><td style="padding:4px 12px 4px 0;color:#86988F;vertical-align:top">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`);
  };
  const time = typeof row.created_at?.toDate === "function" ? row.created_at.toDate().toISOString() : row.created_at;

  add("Type", kind);
  add("App", appName);
  add("Title", row.bug_title);
  add("Severity", row.severity);
  if (Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5)
    add("Rating", "★".repeat(row.rating) + "☆".repeat(5 - row.rating));
  add("Message", row.message);
  add("Steps", row.steps);
  add("Expected", row.expected);
  add("Actual", row.actual);
  add("Environment", row.environment);
  add("Email", row.email);
  add("Language", row.lang);
  add("Page", row.page_url);
  add("Browser", row.user_agent);
  add("Time", time);

  const subject = `[Feedback] ${appName} — ${kind}${row.bug_title ? `: ${row.bug_title}` : ""}`;
  const consoleUrl = id && projectId
    ? `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/data/~2Ffeedback~2F${id}`
    : null;
  const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:640px">
        <h2 style="margin:0 0 12px">${esc(subject)}</h2>
        <table style="border-collapse:collapse;font-size:14px">${rows.join("")}</table>
        ${consoleUrl ? `<p style="font-size:14px;margin-top:16px"><a href="${esc(consoleUrl)}">Open in Firebase Console</a></p>` : ""}
        <p style="color:#9aa3af;font-size:12px;margin-top:16px">Sent automatically from a Firebase Cloud Function.</p>
      </div>`;

  return { subject, html, replyTo: row.email || undefined };
}
