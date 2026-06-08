import type { ReactNode } from "react";
import { LandingBadge } from "./landing-badge";

export function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="py-16 sm:py-20 lg:py-24">
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <LandingBadge>{eyebrow}</LandingBadge>}
      <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-text-primary sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-text-secondary">{text}</p>
    </div>
  );
}
