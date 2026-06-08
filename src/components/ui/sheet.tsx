"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Same casting pattern used in dialog.tsx to satisfy strict TS with Radix types
const SheetOverlayPrimitive = DialogPrimitive.Overlay as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>
>;

const SheetContentPrimitive = DialogPrimitive.Content as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>
>;

const SheetClosePrimitive = DialogPrimitive.Close as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"button"> & React.RefAttributes<HTMLButtonElement>
>;

const SheetTitlePrimitive = DialogPrimitive.Title as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"h2"> & React.RefAttributes<HTMLHeadingElement>
>;

const SheetDescriptionPrimitive = DialogPrimitive.Description as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"p"> & React.RefAttributes<HTMLParagraphElement>
>;

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <SheetOverlayPrimitive
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

const sideClasses = {
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  left:
    "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  top:
    "inset-x-0 top-0 h-auto border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
};

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { side?: keyof typeof sideClasses }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetContentPrimitive
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-bg-surface-1 p-6 shadow-xl duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetClosePrimitive className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
          <XIcon className="size-4 text-text-secondary" />
          <span className="sr-only">Cerrar</span>
        </SheetClosePrimitive>
      </SheetContentPrimitive>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <SheetTitlePrimitive
      className={cn("text-base font-semibold text-text-primary", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return (
    <SheetDescriptionPrimitive
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
