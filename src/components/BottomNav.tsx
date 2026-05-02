"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, BookOpen, AlertCircle, CreditCard } from "lucide-react";

const tabs = [
  { href: "/sos", label: "SOS", icon: AlertCircle },
  { href: "/video-call", label: "Appel", icon: Video },
  { href: "/e-learning", label: "Apprendre", icon: BookOpen },
  { href: "/payment", label: "Services", icon: CreditCard },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide on home (onboarding), video call, and doctor pages
  if (pathname === "/" || pathname === "/video-call" || pathname === "/doctor") return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 ${
                active
                  ? "text-navy"
                  : "text-muted hover:text-muted-foreground"
              }`}
            >
              {active && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-amber" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.6}
              />
              <span className="text-[10px] font-semibold tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
