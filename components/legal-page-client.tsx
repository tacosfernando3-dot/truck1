"use client";

import { BackButton } from "@/components/back-button";
import { useContent } from "@/components/content-provider";
import { useI18n } from "@/lib/i18n";

type LegalKey = "privacy" | "terms";

export function LegalPageClient({ page }: { page: LegalKey }) {
  const { dictionary } = useI18n();
  const { content } = useContent();
  const doc = dictionary[page];
  const email = content.business.email || "hello@loscompadrestaqueriany.com";
  const phone = content.business.phone || "(929) 283-0153";

  return (
    <div className="pb-16 sm:pb-20">
      <section className="border-b border-border-dark bg-background-soft pt-4 pb-12 sm:pt-6 sm:pb-14">
        <div className="container-site">
          <BackButton className="mb-6" />
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            {doc.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl tracking-wide text-white uppercase sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted">{doc.updated}</p>
          <p className="mt-5 max-w-3xl text-muted">{doc.intro}</p>
        </div>
      </section>

      <section className="container-site mt-10 max-w-3xl space-y-8 sm:mt-12">
        {doc.sections.map((section) => (
          <article key={section.title}>
            <h2 className="font-display text-2xl tracking-wide text-yellow uppercase">
              {section.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {section.body}
            </p>
          </article>
        ))}

        <p className="border-t border-border-dark pt-8 text-[15px] leading-relaxed text-muted">
          {doc.contactNote.replace(
            "hello@loscompadrestaqueriany.com",
            email,
          ).replace("(929) 283-0153", phone)}
        </p>
      </section>
    </div>
  );
}
