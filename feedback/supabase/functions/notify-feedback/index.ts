// ============================================================================
//  Edge Function: notify-feedback
//  Sends an email when a new row is inserted into public.feedback.
//  Triggered by a Supabase Database Webhook (INSERT on public.feedback).
//  Email is sent via Resend (free tier ~3000/month). A Discord/Slack webhook
//  alternative is described in /feedback/README.md.
//
//  Secrets (Supabase → Edge Functions → Secrets):
//    RESEND_API_KEY     re_xxx
//    NOTIFY_EMAIL_TO    where notifications go, e.g. team@exsports.fi
//    NOTIFY_EMAIL_FROM  verified sender, e.g. feedback@exsports.fi
//    WEBHOOK_SECRET     optional shared secret (recommended)
// ============================================================================

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get("WEBHOOK_SECRET");
    if (secret && req.headers.get("x-webhook-secret") !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    const row = payload.record ?? payload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TO = Deno.env.get("NOTIFY_EMAIL_TO");
    const FROM = Deno.env.get("NOTIFY_EMAIL_FROM");
    if (!RESEND_API_KEY || !TO || !FROM) {
      console.error("Missing env vars (RESEND_API_KEY / NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM).");
      return new Response("Missing config", { status: 500 });
    }

    const kinds: Record<string, string> = {
      website: "Website feedback",
      program_general: "App feedback (quick)",
      program_bug: "Bug report",
    };
    const apps: Record<string, string> = {
      website: "Website", surveytools: "SurveyTools", heda: "Heda", shodia: "Shodia",
    };
    const esc = (s: unknown) =>
      String(s ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

    const kind = kinds[row.category] ?? row.category;
    const appName = apps[row.app] ?? row.app;
    const rows: string[] = [];
    const add = (k: string, v: unknown) => {
      if (v !== null && v !== undefined && String(v).trim() !== "")
        rows.push(`<tr><td style="padding:4px 12px 4px 0;color:#86988F;vertical-align:top">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`);
    };

    add("Type", kind);
    add("App", appName);
    add("Title", row.bug_title);
    add("Severity", row.severity);
    if (row.rating) add("Rating", "★".repeat(row.rating) + "☆".repeat(5 - row.rating));
    add("Message", row.message);
    add("Steps", row.steps);
    add("Expected", row.expected);
    add("Actual", row.actual);
    add("Environment", row.environment);
    add("Email", row.email);
    add("Language", row.lang);
    add("Page", row.page_url);
    add("Browser", row.user_agent);
    add("Time", row.created_at);

    const subject = `[Feedback] ${appName} — ${kind}${row.bug_title ? `: ${row.bug_title}` : ""}`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:640px">
        <h2 style="margin:0 0 12px">${esc(subject)}</h2>
        <table style="border-collapse:collapse;font-size:14px">${rows.join("")}</table>
        <p style="color:#9aa3af;font-size:12px;margin-top:16px">Sent automatically from a Supabase Edge Function.</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO.split(",").map((s) => s.trim()),
        subject,
        html,
        reply_to: row.email || undefined,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text());
      return new Response("Email failed", { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("notify-feedback error:", err);
    return new Response("Error", { status: 500 });
  }
});
