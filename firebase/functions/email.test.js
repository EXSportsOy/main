import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEmail } from "./email.js";

test("bug report subject, fields and reply-to", () => {
  const { subject, html, replyTo } = buildEmail({
    category: "program_bug", app: "heda", bug_title: "Crash", severity: "high",
    message: "Crash\nSteps: Open", steps: "Open", email: "user@example.com", rating: 4,
    created_at: { toDate: () => new Date("2026-10-21T08:00:00Z") },
  }, { id: "abc", projectId: "exsports-verkkosivut" });
  assert.equal(subject, "[Feedback] Heda — Bug report: Crash");
  assert.equal(replyTo, "user@example.com");
  assert.match(html, /★★★★☆/);
  assert.match(html, /Crash<br>Steps: Open/);
  assert.match(html, /2026-10-21T08:00:00.000Z/);
  assert.match(html, /project\/exsports-verkkosivut\/firestore\/databases\/-default-\/data\/~2Ffeedback~2Fabc/);
});

test("user input is escaped and absent fields are omitted", () => {
  const { subject, html, replyTo } = buildEmail({ category: "website", app: "website", message: "<script>x</script> & \"q\"" });
  assert.equal(subject, "[Feedback] Website — Website feedback");
  assert.equal(replyTo, undefined);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt; &amp; &quot;q&quot;/);
  assert.doesNotMatch(html, /Rating|Email|Firebase Console/);
});
