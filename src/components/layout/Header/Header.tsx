"use client";
import Link from "next/link";
import GlobalNotificationsBtn from "./GlobalNotificationsBtn";
import UserMenuBtn from "./UserMenuBtn";
import { ImpruVLogo } from "@/components/brand/ImpruVLogo";
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";

export default function Header() {
  return (
    <header className="fixed top-0 z-10 h-16 w-full border-b border-border-subtle bg-bg-base/90 text-text-primary backdrop-blur-xl">
      <div className="app-container flex h-full items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="flex cursor-pointer items-center"
          >
            {/* Mobile: solo isotipo */}
            <span className="block sm:hidden">
              <ImpruVLogo size={28} color="#A78BFA" />
            </span>
            {/* Desktop: wordmark completo */}
            <span className="hidden sm:block">
              <ImpruVWordmark size="sm" color="#ffffff" />
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <GlobalNotificationsBtn />
          <UserMenuBtn />
        </div>
      </div>
    </header>
  );
}
