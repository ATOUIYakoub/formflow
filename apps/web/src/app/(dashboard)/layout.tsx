"use client";

import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import { api } from"@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const checkAuth = async () => {
 try {
 await api("/auth/me");
 setIsLoading(false);
 } catch (err) {
 // If unauthenticated, redirect to login
 router.push("/login");
 }
 };

 checkAuth();
 }, [router]);

 if (isLoading) {
 return (
 <div className="flex min-h-screen items-center justify-center bg-zinc-50">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
 </div>
 );
 }

 return <div className="min-h-screen bg-zinc-50">{children}</div>;
}
