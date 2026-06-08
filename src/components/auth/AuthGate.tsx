"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStatus } from "@/hooks/useAuthStatus";

type Mode = "require-auth" | "redirect-if-auth";

export default function AuthGate({
  mode,
  children,
}: {
  mode: Mode;
  children: React.ReactNode;
}) {
  const { status } = useAuthStatus();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (mode === "require-auth" && status === "unauthenticated") {
      if (pathname !== "/auth/login") router.push("/auth/login");
      return;
    }

    if (mode === "redirect-if-auth" && status === "authenticated") {
      if (!pathname.startsWith("/dashboard")) router.push("/dashboard");
    }
  }, [mode, pathname, router, status]);

  // Mientras resolvemos auth evitamos render “parpadeante”.
  if (status === "loading") return null;

  if (mode === "require-auth" && status === "unauthenticated") return null;

  return <>{children}</>;
}

