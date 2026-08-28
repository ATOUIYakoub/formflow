"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type Column = { id: string; label: string; type: string };
type Answer = { fieldId: string; value: any; label: string | null; type: string | null };
type Submission = {
  id: string;
  version: number;
  createdAt: string;
  answers: Answer[];
};
type ListResponse = {
  items: Submission[];
  columns: Column[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

function isFileObject(value: any): boolean {
  return value && typeof value === 'object' && 'key' in value && 'filename' in value && 'url' in value;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "—";
  if (isFileObject(value)) return value.filename;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatFileCell(value: any): React.ReactNode {
  if (isFileObject(value)) {
    return (
      <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-zinc-900 hover:text-zinc-600 underline">
        {value.filename}
      </a>
    );
  }
  return formatValue(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [data, setData] = useState<ListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  // Details modal
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    api(`/forms/${formId}`)
      .then(setForm)
      .catch(() => {});
  }, [formId]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) query.set("search", debouncedSearch.trim());
      if (from) query.set("from", from);
      if (to) query.set("to", to);

      const res = await api(`/forms/${formId}/submissions?${query.toString()}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [formId, page, debouncedSearch, from, to]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleDelete = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await api(`/forms/${formId}/submissions/${submissionId}`, { method: "DELETE" });
      fetchSubmissions();
      if (selected?.id === submissionId) setSelected(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Columns: fields from the latest published version (resolved server-side)
  const columns: Column[] = (data?.columns || []).slice(0, 4);

  const answerMap = (submission: Submission) => {
    const map: Record<string, any> = {};
    for (const a of submission.answers) {
      map[a.fieldId] = a.value;
    }
    return map;
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
            {form?.name || "Submissions"}
          </h1>
          <p className="text-[15px] text-zinc-500">
            <span className="font-semibold text-zinc-900">{data?.total ?? 0}</span> total submissions
          </p>
        </div>
      </div>

      {/* Toolbar: search + date filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM10.8916 8.8219C11.5874 7.8835 12 6.7394 12 5.5C12 2.46243 9.53757 0 6.5 0C3.46243 0 1 2.46243 1 5.5C1 8.53757 3.46243 11 6.5 11C7.7394 11 8.8835 10.5874 9.8219 9.8916L13.1521 13.2218C13.3474 13.4171 13.664 13.4171 13.8593 13.2218C14.0546 13.0265 14.0546 12.7099 13.8593 12.5147L10.8916 8.8219ZM9.88719 8.88719L9.75 8.75L9.61281 8.88719C9.61281 8.88719 9.61281 8.88719 9.61281 8.88719L9.88719 8.88719Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-zinc-200 rounded-lg text-[14px] focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-900"
            title="From date"
          />
          <span className="text-zinc-400 text-[13px]">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="h-10 px-3 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-700 focus:outline-none focus:border-zinc-900"
            title="To date"
          />
          {(from || to || search) && (
            <button
              onClick={() => { setSearch(""); setFrom(""); setTo(""); setPage(1); }}
              className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6">{error}</div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full mx-auto"></div>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline><rect x="1" y="8" width="15" height="13" rx="1"></rect><path d="M23 3v13h-4"></path></svg>
          </div>
          <h3 className="text-[16px] font-semibold text-zinc-900 mb-1">No submissions yet</h3>
          <p className="text-[14px] text-zinc-500 mb-2 max-w-sm">
            {search || from || to
              ? "No submissions match your search or filters."
              : "Share your form to start collecting responses."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {columns.map((field) => (
                      <th key={field.id} className="px-5 py-3 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                        {field.label}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((submission) => {
                    const values = answerMap(submission);
                    return (
                      <tr
                        key={submission.id}
                        onClick={() => setSelected(submission)}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        {columns.map((field) => (
                          <td key={field.id} className="px-5 py-3.5 text-[14px] text-zinc-700 max-w-[240px] truncate">
                            {values[field.id] !== undefined ? formatFileCell(values[field.id]) : "—"}
                          </td>
                        ))}
                        <td className="px-5 py-3.5 text-[14px] text-zinc-500 whitespace-nowrap">
                          {formatDate(submission.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => handleDelete(submission.id, e)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete submission"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[13px] text-zinc-500">
                Page <span className="font-semibold text-zinc-900">{data.page}</span> of{" "}
                <span className="font-semibold text-zinc-900">{data.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-[13px] font-semibold text-zinc-700 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-[13px] font-semibold text-zinc-700 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-zinc-900/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-zinc-200 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-[16px] font-bold text-zinc-900">Submission details</h2>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  {formatDateTime(selected.createdAt)} · Version {selected.version}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-zinc-900 p-1"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.557 2.99385 11.193 2.99385 10.9684 3.2184L7.49999 6.68682L4.03157 3.2184C3.80702 2.99385 3.44295 2.99385 3.2184 3.2184C2.99385 3.44295 2.99385 3.80702 3.2184 4.03157L6.68682 7.49999L3.2184 10.9684C2.99385 11.193 2.99385 11.557 3.2184 11.7816C3.44295 12.0062 3.80702 12.0062 4.03157 11.7816L7.49999 8.31316L10.9684 11.7816C11.193 12.0062 11.557 12.0062 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31316 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selected.answers.length === 0 ? (
                <p className="text-[14px] text-zinc-500">This submission has no answers.</p>
              ) : (
                selected.answers.map((answer, idx) => {
                  const val = answer.value;
                  const isFile = isFileObject(val);
                  return (
                    <div key={idx}>
                      <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                        {answer.label || "Unknown field"}
                        {answer.label === null && (
                          <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded align-middle">
                            v{selected.version}
                          </span>
                        )}
                      </p>
                      {isFile ? (
                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                          <a href={val.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-900 hover:text-zinc-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span className="font-medium truncate max-w-[300px]">{val.filename}</span>
                          </a>
                          <span className="text-xs text-zinc-500">({(val.size / 1024).toFixed(1)} KB)</span>
                          {val.mimeType?.startsWith('image/') && (
                            <a href={val.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-zinc-400 hover:text-zinc-600">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-[14px] text-zinc-900 whitespace-pre-wrap">
                          {formatValue(val)}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 flex justify-end shrink-0">
              <button
                onClick={(e) => handleDelete(selected.id, e)}
                className="px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
