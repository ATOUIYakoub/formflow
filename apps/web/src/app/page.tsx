"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  database: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isConnected = health?.status === "ok";
  const isDbConnected = health?.database === "connected";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 rounded-2xl bg-white p-10 shadow-sm dark:bg-zinc-900">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            FormFlow
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            System Status
          </p>
        </div>

        {/* Status Cards */}
        <div className="flex w-full flex-col gap-4">
          {/* API Status */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4 dark:border-zinc-700">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                API Server
              </span>
              <span className="text-xs text-zinc-400">
                NestJS · localhost:3001
              </span>
            </div>
            {loading ? (
              <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-300" />
            ) : isConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Disconnected
              </span>
            )}
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-5 py-4 dark:border-zinc-700">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Database
              </span>
              <span className="text-xs text-zinc-400">
                PostgreSQL · localhost:5432
              </span>
            </div>
            {loading ? (
              <span className="h-3 w-3 animate-pulse rounded-full bg-zinc-300" />
            ) : isDbConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Disconnected
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        {health && (
          <div className="w-full rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
            <pre className="text-xs text-zinc-600 dark:text-zinc-400">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full rounded-xl bg-red-50 p-4 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠ {error}
            </p>
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={checkHealth}
          disabled={loading}
          className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {loading ? "Checking..." : "Refresh"}
        </button>
      </main>
    </div>
  );
}
