// EXS feedback section — i18n, view navigation, validation, Supabase submit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.FEEDBACK_CONFIG || {};
const root = document.getElementById("feedback");
const lang = document.body.getAttribute("data-lang") || "en";
const dict = (window.FEEDBACK_I18N && window.FEEDBACK_I18N[lang]) || (window.FEEDBACK_I18N && window.FEEDBACK_I18N.en) || {};
const t = (k) => (k in dict ? dict[k] : (window.FEEDBACK_I18N?.en?.[k] ?? k));

const APP_NAMES = { surveytools: "SurveyTools", heda: "Heda", shodia: "Shodia", website: "" };

const configured =
  cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("YOUR-PROJECT") && !cfg.SUPABASE_ANON_KEY.includes("YOUR-PUBLIC");
const supabase = configured ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

/* ---------- Apply translations ---------- */
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) el.setAttribute(attr, t(key));
    else el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  // Machine-translation notice only on non-English pages
  const mt = document.querySelector("[data-mt-notice]");
  if (mt) mt.hidden = (lang === "en");
}
applyI18n();

/* ---------- Selected app label ---------- */
let currentApp = "surveytools";
function setApp(app) {
  currentApp = app;
  const name = APP_NAMES[app] || app;
  root.querySelectorAll("[data-app-label]").forEach((el) => (el.textContent = name));
}

/* ---------- View navigation ---------- */
function showView(id) {
  root.querySelectorAll(".fb-view").forEach((v) => v.classList.toggle("is-active", v.id === id));
  const active = document.getElementById(id);
  if (active && id !== "view-done") {
    const f = active.querySelector("input, textarea, button, select");
    if (f) setTimeout(() => f.focus(), 60);
  }
  root.scrollIntoView({ behavior: "smooth", block: "start" });
}

root.addEventListener("click", (e) => {
  const goto = e.target.closest("[data-goto]");
  if (goto) {
    if (goto.dataset.app) setApp(goto.dataset.app);
    showView(goto.dataset.goto);
    return;
  }
  const back = e.target.closest("[data-back]");
  if (back) {
    const form = back.closest(".fb-view")?.querySelector("form");
    if (form) resetForm(form);
    showView(back.dataset.back);
  }
});

/* ---------- Star rating ---------- */
root.querySelectorAll("[data-rating]").forEach((group) => {
  group.dataset.value = "0";
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", `${i} / 5`);
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z"/></svg>';
    btn.addEventListener("click", () => {
      group.dataset.value = String(i);
      [...group.children].forEach((b, idx) => b.setAttribute("aria-pressed", idx < i ? "true" : "false"));
    });
    btn.addEventListener("mouseenter", () => {
      group.classList.add("is-hovering");
      [...group.children].forEach((b, idx) => b.classList.toggle("is-lit", idx < i));
    });
    group.appendChild(btn);
  }
  group.addEventListener("mouseleave", () => group.classList.remove("is-hovering"));
});

/* ---------- Validation ---------- */
const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function setError(form, name, msg) {
  const field = form.querySelector(`[data-error-for="${name}"]`);
  const input = form.querySelector(`[name="${name}"]`);
  if (field) field.textContent = msg || "";
  if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
}
function validate(form) {
  let ok = true;
  form.querySelectorAll("[required]").forEach((el) => {
    if (!el.value.trim()) { setError(form, el.name, t("err_required")); ok = false; }
    else setError(form, el.name, "");
  });
  const email = form.querySelector('[name="email"]');
  if (email && email.value.trim() && !emailValid(email.value.trim())) { setError(form, "email", t("err_email")); ok = false; }
  else if (email) setError(form, "email", "");
  return ok;
}
function resetForm(form) {
  form.reset();
  form.querySelectorAll("[data-error-for]").forEach((e) => (e.textContent = ""));
  form.querySelectorAll("[aria-invalid]").forEach((e) => e.setAttribute("aria-invalid", "false"));
  const r = form.querySelector("[data-rating]");
  if (r) { r.dataset.value = "0"; r.classList.remove("is-hovering"); [...r.children].forEach((b) => { b.setAttribute("aria-pressed", "false"); b.classList.remove("is-lit"); }); }
  const fe = form.querySelector("[data-form-error]");
  if (fe) fe.hidden = true;
}

/* ---------- Hide optional email field if disabled ---------- */
if (cfg.ASK_EMAIL === false) root.querySelectorAll("[data-email-field]").forEach((f) => f.remove());

/* ---------- Deep link: ?app=heda#bug etc. ---------- */
(function deepLink() {
  const params = new URLSearchParams(location.search);
  const app = params.get("app");
  const hash = location.hash.replace("#", "");
  if (app === "website") { showView("view-website"); return; }
  if (app && APP_NAMES[app] !== undefined) {
    setApp(app);
    if (hash === "bug") showView("view-app-bug");
    else if (hash === "general") showView("view-app-general");
    else showView("view-app-kind");
    return;
  }
  if (hash && document.getElementById("view-" + hash)) showView("view-" + hash);
})();

/* ---------- Build payload ---------- */
function buildPayload(form) {
  const category = form.dataset.category;
  const app = form.dataset.app || currentApp;
  const get = (n) => { const el = form.querySelector(`[name="${n}"]`); return el ? el.value.trim() : ""; };
  const ratingEl = form.querySelector("[data-rating]");
  const rating = ratingEl && Number(ratingEl.dataset.value) > 0 ? Number(ratingEl.dataset.value) : null;

  const row = {
    category,
    app: category === "website" ? "website" : app,
    lang,
    rating,
    email: get("email") || null,
    page_url: location.href,
    user_agent: navigator.userAgent,
  };

  if (category === "program_bug") {
    row.bug_title = get("bug_title");
    row.severity = get("severity") || "medium";
    row.steps = get("steps");
    row.expected = get("expected") || null;
    row.actual = get("actual") || null;
    row.environment = get("environment") || null;
    row.message = [
      get("bug_title"),
      get("steps") && `Steps: ${get("steps")}`,
      get("expected") && `Expected: ${get("expected")}`,
      get("actual") && `Actual: ${get("actual")}`,
    ].filter(Boolean).join("\n");
  } else {
    row.message = get("message");
  }
  return row;
}

/* ---------- Submit ---------- */
root.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formError = form.querySelector("[data-form-error]");
    formError.hidden = true;

    const hp = form.querySelector('input[name="company"]');
    if (hp && hp.value) { showView("view-done"); return; } // bot honeypot

    if (!validate(form)) return;

    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "…";

    try {
      if (!supabase) throw new Error("not-configured");
      const { error } = await supabase.from("feedback").insert(buildPayload(form));
      if (error) throw error;
      resetForm(form);
      showView("view-done");
    } catch (err) {
      formError.hidden = false;
      formError.textContent = err.message === "not-configured" ? t("err_not_configured") : t("err_submit");
      console.error("Feedback submit failed:", err);
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });
});
