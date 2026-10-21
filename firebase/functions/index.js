// Cloud Function: sends an email when a new document is created in `feedback`.
// Email goes out through Proton Mail SMTP submission (custom domain, no extra
// provider account needed).
//
// Secret (Secret Manager):  SMTP_PASSWORD  Proton SMTP submission token
// Params (.env or deploy prompt):
//   SMTP_USERNAME      the Proton address the token was generated for
//   NOTIFY_EMAIL_TO    where notifications go, comma-separated
//   NOTIFY_EMAIL_FROM  sender, must match the token's address

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";
import nodemailer from "nodemailer";
import { buildEmail } from "./email.js";

const SMTP_PASSWORD = defineSecret("SMTP_PASSWORD");
const SMTP_USERNAME = defineString("SMTP_USERNAME", { default: "info@exsports.fi" });
const NOTIFY_EMAIL_TO = defineString("NOTIFY_EMAIL_TO", { default: "info@exsports.fi" });
const NOTIFY_EMAIL_FROM = defineString("NOTIFY_EMAIL_FROM", { default: "info@exsports.fi" });

export const notifyFeedback = onDocumentCreated(
  { document: "feedback/{id}", region: "europe-north1", secrets: [SMTP_PASSWORD], retry: false },
  async (event) => {
    const row = event.data?.data();
    // Rows copied from Supabase were already notified once.
    if (!row || row.source === "supabase-import") return;

    const { subject, html, replyTo } = buildEmail(row, { id: event.params.id, projectId: process.env.GCLOUD_PROJECT });
    const transport = nodemailer.createTransport({
      host: "smtp.protonmail.ch",
      port: 465,
      secure: true,
      auth: { user: SMTP_USERNAME.value(), pass: SMTP_PASSWORD.value() },
    });
    try {
      await transport.sendMail({
        from: NOTIFY_EMAIL_FROM.value(),
        to: NOTIFY_EMAIL_TO.value().split(",").map((s) => s.trim()),
        replyTo,
        subject,
        html,
      });
    } catch (err) {
      logger.error("notify-feedback email failed", { id: event.params.id, error: String(err) });
      throw err;
    } finally {
      transport.close();
    }
  },
);
