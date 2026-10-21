// Firestore security rule tests for the feedback collection.
// Run with `npm run test:rules` (starts the Firestore emulator; needs Java 21+).
import { after, before, beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, setLogLevel, Timestamp, updateDoc } from 'firebase/firestore';

// Denied writes are expected here; keep the SDK from logging each one.
setLogLevel('silent');

let env;
let db;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-exs-feedback',
    firestore: { rules: readFileSync(new URL('../../firebase/firestore.rules', import.meta.url), 'utf8') },
  });
});
after(() => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  db = env.unauthenticatedContext().firestore();
});

const valid = (extra = {}) => ({
  category: 'website', app: 'website', lang: 'en', message: 'Rules test',
  page_url: 'https://www.exsports.fi/feedback/en/', user_agent: 'node',
  status: 'new', created_at: serverTimestamp(), ...extra,
});
const bug = (extra = {}) => valid({
  category: 'program_bug', app: 'heda', bug_title: 'Crash', severity: 'high', steps: 'Open',
  expected: 'Works', actual: 'Crashes', environment: 'Android 16', rating: 3, email: 'a@example.com', ...extra,
});
const create = (data) => addDoc(collection(db, 'feedback'), data);
const without = (key) => { const d = valid(); delete d[key]; return d; };

test('accepts website, quick and bug feedback with optional fields', async () => {
  await assertSucceeds(create(valid()));
  await assertSucceeds(create(valid({ category: 'program_general', app: 'shodia', rating: 5 })));
  await assertSucceeds(create(bug()));
  await assertSucceeds(create(without('lang')));
  await assertSucceeds(create(valid({ message: 'x'.repeat(8000) })));
});

test('rejects missing required fields', async () => {
  for (const key of ['category', 'app', 'message', 'status', 'created_at']) {
    await assertFails(create(without(key)));
  }
});

test('rejects invalid values and lengths', async () => {
  const cases = [
    { category: 'ci_invalid_category' },
    { app: 'other' },
    { message: '' },
    { message: 'x'.repeat(8001) },
    { message: 42 },
    { rating: 0 }, { rating: 6 }, { rating: 4.5 }, { rating: '4' },
    { severity: 'urgent' },
    { lang: 'x'.repeat(9) },
    { email: 'x'.repeat(321) },
    { bug_title: 'x'.repeat(201) },
    { steps: 'x'.repeat(8001) },
    { expected: 'x'.repeat(4001) },
    { actual: 'x'.repeat(4001) },
    { environment: 'x'.repeat(401) },
    { page_url: 'x'.repeat(2001) },
    { user_agent: 'x'.repeat(1001) },
    { email: null },
    { status: 'resolved' },
    { created_at: Timestamp.fromDate(new Date('2020-01-01T00:00:00Z')) },
    { source: 'supabase-import' },
    { company: 'bot' },
  ];
  for (const extra of cases) {
    await assertFails(create(valid(extra)), `should reject ${JSON.stringify(Object.keys(extra))}`);
  }
});

test('browsers cannot read, list, update or delete feedback', async () => {
  await env.withSecurityRulesDisabled(async (admin) => {
    await setDoc(doc(admin.firestore(), 'feedback/existing'), { ...valid(), created_at: Timestamp.now() });
  });
  const ref = doc(db, 'feedback/existing');
  await assertFails(getDoc(ref));
  await assertFails(getDocs(collection(db, 'feedback')));
  await assertFails(updateDoc(ref, { status: 'resolved' }));
  await assertFails(deleteDoc(ref));
  await assertFails(setDoc(ref, valid()));
});

test('signed-in users get no extra rights', async () => {
  const user = env.authenticatedContext('someone').firestore();
  await assertSucceeds(addDoc(collection(user, 'feedback'), valid()));
  await assertFails(getDocs(collection(user, 'feedback')));
});

test('other collections are closed', async () => {
  await assertFails(addDoc(collection(db, 'other'), { a: 1 }));
});
