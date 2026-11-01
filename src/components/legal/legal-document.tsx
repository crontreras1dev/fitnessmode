import type { LegalDocument } from "@/lib/legal/types";

const bodyClasses =
  "text-text-muted leading-relaxed [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-brand [&_a]:underline [&_strong]:text-text";

export function LegalDocumentView({
  doc,
  contentsLabel,
}: {
  doc: LegalDocument;
  contentsLabel: string;
}) {
  return (
    <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
      <nav aria-label={contentsLabel} className="md:sticky md:top-20 md:self-start">
        <h2 className="text-text-muted text-sm font-semibold tracking-wide uppercase">
          {contentsLabel}
        </h2>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-text-muted hover:text-text">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="max-w-2xl">
        {doc.intro ? <div className={bodyClasses}>{doc.intro}</div> : null}
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 scroll-mt-24">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className={`mt-3 ${bodyClasses}`}>{section.body}</div>
          </section>
        ))}
      </article>
    </div>
  );
}
