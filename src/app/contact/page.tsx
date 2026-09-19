import type { Metadata } from "next";
import { Mail, MessageSquare, Newspaper } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { ContactForm } from "@/components/blog/contact-form";

export const metadata: Metadata = {
  title: "Contact — TechPulse",
  description:
    "Get in touch with the TechPulse newsroom: story tips and corrections, press enquiries and reader support.",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Newsroom",
    address: "redaction@techpulse.news",
    body: "Story tips, corrections and editorial feedback. We read everything.",
  },
  {
    icon: Newspaper,
    title: "Press",
    address: "presse@techpulse.news",
    body: "Launches, embargoes and interview requests for the editors.",
  },
  {
    icon: MessageSquare,
    title: "Reader support",
    address: "support@techpulse.news",
    body: "Account, reading and newsletter help — answered within two working days.",
  },
] as const;

/**
 * Contact page — `/contact`.
 *
 * Server wrapper (metadata + layout) around the client `ContactForm`, plus the
 * three newsroom channels rendered as Figma cards on the shared 1200px measure.
 */
export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            Contact
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Talk to the newsroom.
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A tip, a correction, a partnership idea? Write to us — an editor reads every message.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <ContactForm />

          <aside aria-labelledby="channels-heading" className="flex flex-col gap-4">
            <h2 id="channels-heading" className="sr-only">
              Contact channels
            </h2>

            {CONTACT_CHANNELS.map((channel) => (
              <article
                key={channel.address}
                className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/60"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-link">
                  <channel.icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {channel.title}
                </h3>
                <a
                  href={`mailto:${channel.address}`}
                  className="w-fit text-sm font-medium text-link transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {channel.address}
                </a>
                <p className="text-sm leading-relaxed text-muted-foreground">{channel.body}</p>
              </article>
            ))}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
