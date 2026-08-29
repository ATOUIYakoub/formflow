"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type Overview = {
  views: number;
  starts: number;
  completions: number;
  completionRate: number;
};

type ChartPoint = { date: string; count: number };

type AnalyticsData = {
  overview: Overview;
  submissionsPerDay: ChartPoint[];
  viewsPerDay: ChartPoint[];
  startsPerDay: ChartPoint[];
};

export default function AnalyticsPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    api(`/forms/${formId}`)
      .then(setForm)
      .catch(() => {});
  }, [formId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (from) query.set("from", from);
      if (to) query.set("to", to);

      const [overview, submissionsPerDay, viewsPerDay, startsPerDay] = await Promise.all([
        api(`/forms/${formId}/analytics/overview?${query.toString()}`),
        api(`/forms/${formId}/analytics/submissions-per-day?${query.toString()}`),
        api(`/forms/${formId}/analytics/views-per-day?${query.toString()}`),
        api(`/forms/${formId}/analytics/starts-per-day?${query.toString()}`),
      ]);

      setData({
        overview,
        submissionsPerDay,
        viewsPerDay,
        startsPerDay,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [formId, from, to]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (n: number) =>
    n.toLocaleString(undefined, { notation: "compact", compactDisplay: "short" });

  const formatRate = (rate: number) => `${rate}%`;

  const getMaxValue = (points: ChartPoint[]) =>
    points.reduce((max, p) => Math.max(max, p.count), 0);

  const renderBar = (count: number, max: number, color: string) => {
    if (max === 0) return <div className="h-full bg-zinc-100 rounded-t" />;
    const height = Math.max(4, (count / max) * 100);
    return <div className="h-full bg-zinc-100 rounded-t" style={{ height: `${100 - height}%` }} />;
  };

  const renderChart = (title: string, points: ChartPoint[], color: string) => {
    const max = getMaxValue(points);
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h3 className="text-[14px] font-semibold text-zinc-900 mb-4">{title}</h3>
        {points.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-[14px] text-zinc-500">No data for this period</p>
          </div>
        ) : (
          <div className="relative" style={{ height: "240px" }}>
            <div className="absolute inset-0 flex items-end justify-between gap-1.5 px-1 pb-8">
              {points.map((p) => (
                <div key={p.date} className="flex-1 flex flex-col items-center justify-end min-w-[20px] relative group" title={`${p.date}: ${p.count}`}>
                  <div className="w-full flex items-end h-[192px]">
                    <div
                      className={`w-full rounded-t ${color} transition-all duration-300`}
                      style={{ height: max > 0 ? `${Math.max(3, (p.count / max) * 100)}%` : "3%" }}
                    />
                  </div>
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 whitespace-nowrap w-auto">
                    {p.date.split("-").slice(1).join("-")}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] text-zinc-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <Link
            href={`/dashboard/forms/${formId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 mb-2 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.14645 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            Back to builder
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-1">
            {form?.name || "Analytics"}
          </h1>
          <p className="text-[15px] text-zinc-500">Form performance overview</p>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-8 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); fetchAnalytics(); }}
            className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-900"
            title="From date"
          />
          <span className="text-zinc-400 text-[13px]">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); fetchAnalytics(); }}
            className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-900"
            title="To date"
          />
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); fetchAnalytics(); }}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors"
              title="Clear filters"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isLoading ? "animate-spin" : ""}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6">{error}</div>
      )}

      {/* Overview Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Views</p>
            <p className="text-[32px] font-bold text-zinc-900">{formatNumber(data.overview.views)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Started</p>
            <p className="text-[32px] font-bold text-zinc-900">{formatNumber(data.overview.starts)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-[32px] font-bold text-zinc-900">{formatNumber(data.overview.completions)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Completion Rate</p>
            <p className="text-[32px] font-bold text-emerald-600">{formatRate(data.overview.completionRate)}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderChart("Submissions per day", data.submissionsPerDay, "bg-zinc-900")}
          {renderChart("Views per day", data.viewsPerDay, "bg-blue-600")}
          {renderChart("Starts per day", data.startsPerDay, "bg-amber-600")}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-6">
              <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4 animate-pulse" />
              <div className="h-48 bg-zinc-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}