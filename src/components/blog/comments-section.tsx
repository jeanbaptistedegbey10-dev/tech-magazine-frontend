"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

export type CommentsSectionProps = {
  postSlug: string;
  postTitle: string;
};

type Comment = {
  id: string;
  name: string;
  date: string;
  text: string;
  mine?: boolean;
};

type SubmitStatus = "idle" | "sending" | "sent";

const SIMULATED_POST_MS = 1000;
const FIELD_LABEL = "mb-1.5 block text-sm font-medium text-foreground";
const FIELD_INPUT =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-300 outline-none focus:border-primary/70 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Reader discussion under an article.
 * Seeded thread + validated form (Nom, Email, Commentaire),
 * simulated 1s publish and a visual confirmation.
 */
const SEED_COMMENTS: Comment[] = [
  {
    id: "seed-lea",
    name: "Lea Martin",
    date: "Il y a 2 jours",
    text: "Article tres clair, les exemples concrets aident vraiment a comprendre les enjeux. Merci a la redaction !",
  },
  {
    id: "seed-karim",
    name: "Karim Benali",
    date: "Il y a 1 jour",
    text: "D accord sur l essentiel, meme si j aurais aime un comparatif chiffre avec les solutions concurrentes.",
  },
  {
    id: "seed-sophie",
    name: "Sophie Dubois",
    date: "Il y a 5 heures",
    text: "Lecture passionnante. Hate de lire le suivi de ce dossier dans les prochaines editions.",
  },
];

export function CommentsSection({ postSlug, postTitle }: CommentsSectionProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [lastAuthor, setLastAuthor] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const text = String(data.get("comment") ?? "").trim();
    if (!name || !text) return;
    setStatus("sending");
    setLastAuthor(name);
    timer.current = setTimeout(() => {
      setComments((prev) => [
        { id: `${postSlug}-reader-${Date.now()}`, name, date: t("blog.article.commentSentTime"), text, mine: true },
        ...prev,
      ]);
      form.reset();
      setStatus("sent");
    }, SIMULATED_POST_MS);
  }

  function handleWriteAnother() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setLastAuthor("");
    setStatus("idle");
  }

  const sending = status === "sending";
  const sent = status === "sent";

  return (
    <section aria-labelledby="comments-heading" className="mt-12 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 border-b border-border pb-4">
        <span className="inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
          <MessageSquare className="size-3.5" aria-hidden="true" />
          {t("blog.article.discussionEyebrow")}
        </span>
        <h2 id="comments-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("blog.article.commentsHeading", { count: comments.length })}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("blog.article.moderationNote")}
        </p>
      </div>
      {sent ? (
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-3xl border border-primary/30 bg-primary/5 px-6 py-10 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {t("blog.article.commentSentHeading", { name: lastAuthor.split(" ")[0] || "lecteur" })}
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("blog.article.commentSentBody", { title: postTitle })}
          </p>
          <button
            type="button"
            onClick={handleWriteAnother}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Send className="size-4" aria-hidden="true" />
            {t("blog.article.writeAnother")}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`comment-name-${postSlug}`} className={FIELD_LABEL}>
                {t("blog.article.commentName")}
              </label>
              <input
                id={`comment-name-${postSlug}`}
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                disabled={sending}
                placeholder="Ada Lovelace"
                className={FIELD_INPUT}
              />
            </div>
            <div>
              <label htmlFor={`comment-email-${postSlug}`} className={FIELD_LABEL}>
                {t("blog.article.commentEmail")}
              </label>
              <input
                id={`comment-email-${postSlug}`}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={120}
                disabled={sending}
                placeholder="ada@example.com"
                className={FIELD_INPUT}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("blog.article.commentEmailNote")}
              </p>
            </div>
          </div>
          <div>
            <label htmlFor={`comment-text-${postSlug}`} className={FIELD_LABEL}>
              {t("blog.article.commentBody")}
            </label>
            <textarea
              id={`comment-text-${postSlug}`}
              name="comment"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              disabled={sending}
              placeholder={t("blog.article.commentPlaceholder")}
              className={`${FIELD_INPUT} min-h-[7rem] resize-y leading-relaxed`}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("blog.article.commentDemoNote")}
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
            >
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("blog.article.commentSending")}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" />
                  {t("blog.article.commentSubmit")}
                </>
              )}
            </button>
          </div>
        </form>
      )}
      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className={`flex gap-4 rounded-3xl border p-5 sm:p-6 ${
              comment.mine ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-link"
            >
              {authorMonogram(comment.name)}
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                <span className="text-xs text-muted-foreground">{comment.date}</span>
                {comment.mine ? (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-link uppercase">
                    {t("blog.article.commentBadge")}
                  </span>
                ) : null}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function authorMonogram(author: string): string {
  const monogram = author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return monogram || "TP";
}

