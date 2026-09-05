type Section = { heading: string; body: string };

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="rounded-lg border border-border/60 bg-card p-6">
            <h2 className="text-xl">{section.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        Last updated {new Date().toLocaleDateString()}.
      </p>
    </div>
  );
}
