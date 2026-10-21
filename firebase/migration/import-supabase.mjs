// Copies feedback rows exported from Supabase into Firestore.
//
// Export in Supabase SQL Editor and save the result as JSON:
//   select json_agg(f order by created_at) from public.feedback f;
// For a later delta run add: where created_at > '<last imported created_at>'
//
// Usage (credentials: gcloud auth application-default login):
//   node import-supabase.mjs feedback-export.json --dry-run
//   node import-supabase.mjs feedback-export.json
//
// The Supabase uuid becomes the document id and existing documents are skipped,
// so the import can be repeated safely. Imported documents carry
// source: "supabase-import", which stops the notification function from emailing.
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const PROJECT_ID = 'exsports-verkkosivut';
const FIELDS = ['category', 'app', 'lang', 'message', 'rating', 'email', 'bug_title', 'severity',
  'steps', 'expected', 'actual', 'environment', 'page_url', 'user_agent', 'status'];
const CI_MARKER = '[CI validation probe';

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node import-supabase.mjs <export.json> [--dry-run]');
  process.exit(1);
}
const dryRun = flags.includes('--dry-run');

// Accept a plain array, or the SQL Editor's [{ json_agg: [...] }] result.
let rows = JSON.parse(readFileSync(file, 'utf8'));
if (rows.length === 1 && 'json_agg' in rows[0]) rows = rows[0].json_agg ?? [];
if (typeof rows === 'string') rows = JSON.parse(rows);

function toDocument(row) {
  const data = { source: 'supabase-import', created_at: Timestamp.fromDate(new Date(row.created_at)) };
  for (const key of FIELDS) if (row[key] !== null && row[key] !== undefined) data[key] = row[key];
  return data;
}

const isProbe = (row) => [row.message, row.page_url].some((v) => typeof v === 'string' && v.includes(CI_MARKER));
const selected = rows.filter((row) => !isProbe(row));
const tally = (key) => selected.reduce((acc, row) => ({ ...acc, [row[key]]: (acc[row[key]] || 0) + 1 }), {});
console.log(`Rows in export: ${rows.length}, CI probes skipped: ${rows.length - selected.length}, to import: ${selected.length}`);
console.log('By category:', tally('category'));
console.log('By app:', tally('app'));
console.log('Latest created_at:', selected.at(-1)?.created_at ?? '-');

if (dryRun) process.exit(0);

initializeApp({ projectId: PROJECT_ID });
const db = getFirestore();
const writer = db.bulkWriter();
let created = 0;
let existing = 0;
writer.onWriteError((error) => {
  if (error.code === 6) { existing++; return false; } // ALREADY_EXISTS: copied on an earlier run
  return error.failedAttempts < 3;
});
for (const row of selected) {
  writer.create(db.collection('feedback').doc(row.id), toDocument(row)).then(() => created++, () => {});
}
await writer.close();
console.log(`Created: ${created}, already in Firestore: ${existing}, failed: ${selected.length - created - existing}`);

const total = await db.collection('feedback').where('source', '==', 'supabase-import').count().get();
console.log(`Imported documents now in Firestore: ${total.data().count}`);
