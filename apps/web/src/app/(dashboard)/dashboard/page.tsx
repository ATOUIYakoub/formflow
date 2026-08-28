"use client";

import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import { api } from"@/lib/api";

export default function DashboardPage() {
 const router = useRouter();
 const [user, setUser] = useState<any>(null);

 useEffect(() => {
 api("/auth/me").then(setUser).catch(() => {});
 }, []);

 const handleLogout = async () => {
 try {
 await api("/auth/logout", { method:"POST" });
 router.push("/login");
 } catch (err) {
 console.error("Failed to logout", err);
 }
 };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zinc-50">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
            F
          </div>
          <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">
            FormFlow
          </h1>
        </div>
        
        <div className="flex items-center gap-5">
          <span className="text-[14px] font-medium text-zinc-600">
            {user?.name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-[13px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-full hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] transition-all shadow-sm"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-10 md:px-12 md:py-16">
        <div className="mb-10">
          <h2 className="text-[32px] font-bold tracking-tight text-zinc-900 mb-2">
            Workspaces
          </h2>
          <p className="text-[16px] text-zinc-500">
            Select a workspace or create a new one to start building forms.
          </p>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          
          {/* Existing Workspace Card */}
          <div className="group flex flex-col justify-between cursor-pointer p-6 h-[160px] bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
            <div>
              <h3 className="text-[16px] font-semibold text-zinc-900 mb-1">
                Personal Workspace
              </h3>
              <p className="text-[14px] text-zinc-500">1 form</p>
            </div>
            <div className="flex items-center text-[13px] font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
              Open workspace &rarr;
            </div>
          </div>
          
          {/* Create New Workspace Card */}
          <div className="group flex flex-col items-center justify-center cursor-pointer p-6 h-[160px] rounded-2xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100/50 transition-all">
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center mb-3 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-zinc-500 group-hover:text-zinc-900 transition-colors">
              New Workspace
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}
