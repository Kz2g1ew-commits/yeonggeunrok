import type { ReactNode } from "react";

export function InfoPageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main className="shell py-14 sm:py-20">
      <header className="max-w-3xl"><span className="eyebrow">{eyebrow}</span><h1 className="display-serif text-balance mt-5 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">{title}</h1><p className="muted mt-5 text-base leading-8 sm:text-lg">{intro}</p></header>
      <div className="mt-10 grid gap-5">{children}</div>
    </main>
  );
}

export function InfoSection({ title, children, marker }: { title: string; children: ReactNode; marker?: string }) {
  return <section className="surface p-5 sm:p-7"><div className="flex items-baseline gap-3">{marker && <span className="display-serif text-xl text-[#d8b66a]">{marker}</span>}<h2 className="section-title">{title}</h2></div><div className="muted mt-4 text-sm leading-7 sm:text-base sm:leading-8">{children}</div></section>;
}
