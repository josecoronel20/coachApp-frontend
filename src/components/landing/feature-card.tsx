import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function FeatureCard({ children }: { children: ReactNode }) {
  return (
    <Card
      variant="elevated"
      className="group relative h-full gap-0 overflow-hidden p-6 transition duration-300 hover:border-purple-primary/50 hover:bg-bg-surface-2"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-purple-primary opacity-0 transition group-hover:opacity-100" />
      {children}
    </Card>
  );
}
