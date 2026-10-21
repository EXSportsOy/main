// Firebase settings for the feedback section.
// NOTE: the web config is meant to be public (visible in the browser). This is safe:
// access is limited by Firestore security rules (create only) and App Check.
// NEVER put a service account key here.
// Fill in from Firebase Console → Project settings → Your apps → Web app.

window.FEEDBACK_CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyDI8zjHu5Q8FG6zNna6aKywNKheazbVAAE",
    authDomain: "exsports-verkkosivut.firebaseapp.com",
    projectId: "exsports-verkkosivut",
    appId: "1:411688443615:web:f65cd863b29d6a4e17136a",
  },

  // reCAPTCHA Enterprise site key for App Check. Leave empty to skip App Check.
  APP_CHECK_SITE_KEY: "",

  // Set to false to hide the optional email field everywhere.
  ASK_EMAIL: true,
};
