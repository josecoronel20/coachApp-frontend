"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavedRoutinesSection from "../dashboardComponents/SavedRoutinesSection";

const SavedRoutinesPage = () => {
  return (
    <main className="app-page">
      <div className="app-container app-safe-bottom relative flex max-w-[980px] flex-col gap-6 py-8 lg:py-10">
        <Button
          asChild
          variant="ghost"
          className="w-fit rounded-app-full px-0 text-text-secondary hover:bg-transparent hover:text-text-primary"
        >
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            Volver a atletas
          </Link>
        </Button>

        <SavedRoutinesSection variant="page" />
      </div>
    </main>
  );
};

export default SavedRoutinesPage;
