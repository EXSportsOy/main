// Supabase settings for the feedback section.
// NOTE: the anon key is meant to be public (visible in the browser). This is safe.
// NEVER put the service_role key here.
// Fill in from Supabase Dashboard → Project Settings → API.

window.FEEDBACK_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-ref.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-PUBLIC-ANON-KEY",

  // Set to false to hide the optional email field everywhere.
  ASK_EMAIL: true,
};
