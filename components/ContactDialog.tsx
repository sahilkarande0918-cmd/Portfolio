"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { closeDialog, openDialog } from "./dialog";
import { Star } from "./Header";

/*
  A short enquiry, one question at a time. Nothing is sent from this site: the last step opens
  your own email app with a draft addressed to me, and says so.
*/
const steps = [
  { name: "topic", q: "What would you like to talk about?", options: ["An internship or role", "A project you'd like built", "A hackathon or collaboration", "Tamrivo", "Something else"] },
  { name: "when", q: "When are you thinking?", options: ["As soon as possible", "In the next 1–3 months", "Later this year", "Just exploring"] },
  { name: "who", q: "Who's writing?", options: ["A company or recruiter", "A startup or founder", "An agency", "A student or developer", "Someone else"] },
] as const;
const TOTAL = steps.length + 1;

export default function ContactDialog() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const email = site.email.join("@");

  // any element with data-contact opens it, anywhere on the site
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("[data-contact]");
      if (!t) return;
      e.preventDefault();
      setStep(0);
      setErr("");
      setDone(false);
      openDialog(dlg.current);
    };
    document.addEventListener("click", on);
    return () => document.removeEventListener("click", on);
  }, []);

  useEffect(() => {
    dlg.current?.querySelector<HTMLElement>("legend")?.focus({ preventScroll: true });
  }, [step]);

  const pick = (name: string, v: string) => {
    setAns((a) => ({ ...a, [name]: v }));
    setErr("");
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL - 1)), 160);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < steps.length) {
      if (!ans[steps[step].name]) return setErr("Pick one to carry on.");
      return setStep(step + 1);
    }
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim(), from = String(f.get("email") ?? "").trim(), msg = String(f.get("message") ?? "").trim();
    if (!name) return setErr("Add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) return setErr("Add an email address I can reply to.");
    if (msg.length < 20) return setErr("Tell me a little more — a sentence or two is plenty.");
    const subject = `${ans.topic ?? "Hello"} — from ${name}`;
    const body = `${msg}\n\n—\nTopic: ${ans.topic}\nTiming: ${ans.when}\nFrom: ${ans.who}\nName: ${name}\nReply to: ${from}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDone(true);
  };

  const s = steps[step];
  return (
    <dialog className="modal" ref={dlg} aria-labelledby="mTitle" onClick={(e) => e.target === dlg.current && closeDialog(dlg.current)}>
      <div className="modal__panel">
        <button className="x-btn" aria-label="Close" onClick={() => closeDialog(dlg.current)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l16 16M20 4 4 20" />
          </svg>
        </button>
        {!done ? (
          <>
            <div className="mhead">
              <p>Let&apos;s talk</p>
              <h2 id="mTitle">Tell me what you have in mind.</h2>
              <small>Four quick steps. It ends as an email draft in your own mail app.</small>
            </div>
            <form className="mform" onSubmit={submit} noValidate>
              <div className="qz__top" aria-hidden="true">
                <span>
                  {step + 1} of {TOTAL}
                </span>
                <span className="qz__bar">
                  <i style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
                </span>
              </div>
              {s ? (
                <fieldset className="qz" key={s.name}>
                  <legend tabIndex={-1}>{s.q}</legend>
                  {s.options.map((o) => (
                    <label className="qc" key={o}>
                      <input type="radio" name={s.name} value={o} checked={ans[s.name] === o} onChange={() => pick(s.name, o)} />
                      <span>{o}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <fieldset className="qz" key="last">
                  <legend tabIndex={-1}>Last step: how do I reach you?</legend>
                  <label>
                    <span>Name</span>
                    <input name="name" autoComplete="name" maxLength={80} required placeholder="Your name" />
                  </label>
                  <label>
                    <span>Email</span>
                    <input name="email" type="email" autoComplete="email" maxLength={120} required placeholder="you@company.com" />
                  </label>
                  <label>
                    <span>Message</span>
                    <textarea name="message" rows={4} minLength={20} maxLength={1500} required placeholder="What's it about? Links help." />
                  </label>
                </fieldset>
              )}
              <p className="qz__err" role="alert">
                {err}
              </p>
              <div className="mform__bot">
                {step > 0 ? (
                  <button type="button" className="qz__back" onClick={() => (setErr(""), setStep(step - 1))}>
                    Back
                  </button>
                ) : (
                  <small>Opens a draft — nothing is sent from this site.</small>
                )}
                <button type="submit" className="pill pill--dark pill--arrow">
                  {step < steps.length ? "Next" : "Write the email"}
                  <span className="pill__badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="msuccess" role="status">
            <div className="msuccess__badge">
              <Star />
            </div>
            <h2 id="mTitle">Your draft is ready</h2>
            <p>Your email app should have opened with the message filled in. It isn&apos;t sent until you press send there.</p>
            <p>
              Didn&apos;t open? Write to <a href={`mailto:${email}`}>{email}</a>.
            </p>
            <button className="pill pill--dark" onClick={() => closeDialog(dlg.current)}>
              Close
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
