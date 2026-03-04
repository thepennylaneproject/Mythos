"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/composer", label: "Composer", icon: "✍️", highlight: true },
  { href: "/campaigns", label: "Campaigns", icon: "📢" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/automations", label: "Automations", icon: "⚡" },
];

const BOTTOM_NAV = [
  { href: "/settings/knowledge", label: "Brand Knowledge", icon: "🧠" },
  { href: "/settings/plugins", label: "Integrations", icon: "🔌" },
  { href: "/settings/team", label: "Team", icon: "👤" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show shell on auth/onboarding pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold tracking-tight">Mythos</span>
          </Link>
          <p className="text-xs text-neutral-400 mt-1">Your AI storytelling agent</p>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 py-4">
          <div className="px-3 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Main</span>
          </div>
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    } ${item.highlight && !isActive ? "ring-1 ring-blue-500/50 bg-blue-500/10 text-blue-300" : ""}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="ml-auto text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NEW</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Settings Section */}
          <div className="px-3 mt-6 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Settings</span>
          </div>
          <ul className="space-y-1 px-2">
            {BOTTOM_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User</p>
              <p className="text-xs text-neutral-500 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
