"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Form = {
  id: string;
  name: string;
  _count?: { submissions: number };
  updatedAt: string;
};

export default function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for renaming
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const data = await api("/forms");
      setForms(data);
    } catch (err: any) {
      setError(err.message || "Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation if wrapped in Link
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await api(`/forms/${id}`, { method: "DELETE" });
      setForms(forms.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startRename = (form: Form, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingId(form.id);
    setEditName(form.name);
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editName.trim()) return setEditingId(null);
    try {
      await api(`/forms/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName }),
      });
      setForms(forms.map(f => (f.id === id ? { ...f, name: editName } : f)));
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-1">Forms</h1>
          <p className="text-[15px] text-zinc-500">Manage your forms and collect responses.</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="px-4 py-2 bg-zinc-900 text-white text-[14px] font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
        >
          Create Form
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[140px] bg-zinc-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-zinc-900 mb-1">No forms yet</h3>
          <p className="text-[14px] text-zinc-500 mb-6 max-w-sm">
            You haven't created any forms. Create your first form to start collecting responses.
          </p>
          <Link
            href="/dashboard/forms/new"
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[14px] font-semibold rounded-lg hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {forms.map(form => (
            <Link
              key={form.id}
              href={`/dashboard/forms/${form.id}`}
              className="group flex flex-col justify-between p-6 h-[160px] bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all relative"
            >
              <div>
                {editingId === form.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleRenameSubmit(form.id)}
                    onKeyDown={e => e.key === "Enter" && handleRenameSubmit(form.id)}
                    onClick={e => e.preventDefault()}
                    className="text-[16px] font-semibold text-zinc-900 bg-zinc-50 border border-zinc-300 rounded px-2 py-1 w-full outline-none focus:border-zinc-900"
                  />
                ) : (
                  <h3 className="text-[16px] font-semibold text-zinc-900 mb-1 truncate pr-8">
                    {form.name}
                  </h3>
                )}
                <p className="text-[13px] text-zinc-500">
                  {form._count?.submissions || 0} submissions
                </p>
              </div>

              {/* Actions Dropdown Trigger (Simplified as icons for now) */}
              <div className="absolute top-5 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startRename(form, e)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                  title="Rename"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button
                  onClick={(e) => handleDelete(form.id, e)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md ml-1"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

              <div className="text-[12px] font-medium text-zinc-400">
                Updated {new Date(form.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
