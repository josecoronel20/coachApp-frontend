export function ProofCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-5">
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm leading-6 text-text-muted">{text}</p>
    </div>
  );
}
