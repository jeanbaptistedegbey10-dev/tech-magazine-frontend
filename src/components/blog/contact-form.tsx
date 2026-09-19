"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

type SendStatus = "idle" | "sending" | "sent";
type SentSummary = { name: string; email: string; subject: string };

const SIMULATED_SEND_MS = 1200;
const FIELD_LABEL = "mb-1.5 block text-sm font-medium text-foreground";
const FIELD_INPUT =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-300 outline-none focus:border-primary/70 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Newsroom contact form — labels, placeholders and the confirmation card all
 * come from the `contact.form.*` dictionary entries.
 */
export function ContactForm() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SendStatus>("idle");
  const [summary, setSummary] = useState<SentSummary | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const data = new FormData(event.currentTarget);
    setSummary({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
    });
    setStatus("sending");
    timer.current = setTimeout(() => setStatus("sent"), SIMULATED_SEND_MS);
  }

  function handleReset() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setSummary(null);
    setStatus("idle");
  }

  if (status === "sent" && summary) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-14 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("contact.form.sentHeading", {
            name: summary.name.split(" ")[0] || t("contact.form.name"),
          })}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("contact.form.sentBody", { subject: summary.subject, email: summary.email })}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Send className="size-4" aria-hidden="true" />
          {t("contact.form.writeAnother")}
        </button>
      </div>
    );
  }

  const sending = status === "sending";


return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={FIELD_LABEL}>
            {t("contact.form.name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            disabled={sending}
            placeholder={t("contact.form.placeholderName")}
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={FIELD_LABEL}>
            {t("contact.form.email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            disabled={sending}
            placeholder={t("contact.form.placeholderEmail")}
            className={FIELD_INPUT}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className={FIELD_LABEL}>
          {t("contact.form.subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          minLength={4}
          maxLength={140}
          disabled={sending}
          placeholder={t("contact.form.placeholderSubject")}
          className={FIELD_INPUT}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className={FIELD_LABEL}>
          {t("contact.form.message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          disabled={sending}
          placeholder={t("contact.form.placeholderMessage")}
          className={`${FIELD_INPUT} min-h-[10rem] resize-y leading-relaxed`}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("contact.form.demoNote")}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("contact.form.sending")}
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              {t("contact.form.send")}
            </>
          )}
        </button>
      </div>
      {sending ? (
        <p role="status" className="text-xs text-muted-foreground">
          {t("contact.form.statusNote")}
        </p>
      ) : null}
    </form>
  );
}