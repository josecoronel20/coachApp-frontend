"use client";
import Link from "next/link";
import Image from "next/image";
import FeedbackBtn from "./FeedbackBtn";
import PaymentsBtn from "./PaymentsBtn";
import UserMenuBtn from "./UserMenuBtn";
import { useMiddleware } from "@/hooks/useMiddleware";


export default function Header() {
  useMiddleware();
  
  return (
    <header className="fixed top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 w-full justify-between">
      {/* Logo and name */}
      <div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/logo.png"
            width={32}
            height={32}
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-lg  ">GymBro Coach</span>
        </Link>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2">
        {/* Feedback button */}
        <FeedbackBtn />

        {/* Payments button */}
        <PaymentsBtn />

        {/* User menu button */}
        <UserMenuBtn />
      </div>
    </header>
  );
}
