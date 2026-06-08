"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Library, Users } from "lucide-react";

const DashboardBottomNav = () => {
  const pathname = usePathname();
  const shouldHideBottomNav = pathname.startsWith("/dashboard/athlete/");
  const isRoutinesActive = pathname.startsWith("/dashboard/routines");
  const isAthletesActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/athlete");

  if (shouldHideBottomNav) {
    return null;
  }

  return (
    <BottomNav
      items={[
        {
          href: "/dashboard",
          label: "Atletas",
          icon: <Users />,
          active: isAthletesActive,
        },
        {
          href: "/dashboard/routines",
          label: "Rutinas",
          icon: <Library />,
          active: isRoutinesActive,
        },
      ]}
    />
  );
};

export default DashboardBottomNav;
