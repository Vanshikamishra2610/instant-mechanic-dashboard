"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LineChart, ClipboardList, Wrench, Wrench as LogoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/mechanics", label: "Mechanics", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-base-border bg-base-surface md:flex">
      <div className="flex items-center gap-2.5 border-b border-base-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <LogoIcon size={17} strokeWidth={2.25} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-base-text">
            Instant Mechanic
          </p>
          <p className="mt-1 text-[11px] leading-none text-base-muted">Operations Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/12 text-accent"
                  : "text-base-muted hover:bg-base-surface2 hover:text-base-text"
              )}
            >
              <Icon size={16} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-base-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-base-faint">
          Built for the Full Stack Developer Internship assignment.
        </p>
      </div>
    </aside>
  );
}
