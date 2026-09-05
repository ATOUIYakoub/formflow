"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await api("/auth/me");
        setUser(userData);
        setIsLoading(false);
      } catch {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
            <span className="text-[18px] font-bold text-zinc-900 tracking-tight">FormFlow</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard/forms"
            className={`flex items-center px-3 py-2 text-[14px] font-medium rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/forms")
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            Forms
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center px-3 py-2 text-[14px] font-medium rounded-lg transition-colors ${
              pathname === "/dashboard/settings"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-zinc-900 truncate pr-2">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-[13px] text-zinc-500 hover:text-zinc-900"
              title="Log out"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header (Hidden on md+) */}
        <header className="md:hidden h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
            <span className="text-[18px] font-bold text-zinc-900 tracking-tight">FormFlow</span>
          </div>
          <button onClick={handleLogout} className="text-[14px] font-medium text-zinc-600">
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
