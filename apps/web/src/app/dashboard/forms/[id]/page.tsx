"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function FormEditorPlaceholder() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await api(`/forms/${id}`);
        setForm(data);
      } catch (err: any) {
        setError(err.message || "Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-zinc-100 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-96 bg-zinc-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-8 text-red-600">
        <Link href="/dashboard/forms" className="text-zinc-500 mb-4 inline-block">&larr; Back to Forms</Link>
        <p className="font-medium">{error || "Form not found"}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
      <Link href="/dashboard/forms" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6 inline-block">
        &larr; Back to Forms
      </Link>
      
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-2">
          {form.name}
        </h1>
        {form.description && (
          <p className="text-[15px] text-zinc-500">{form.description}</p>
        )}
      </div>

      <div className="border border-dashed border-zinc-200 rounded-2xl bg-zinc-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[18px] font-semibold text-zinc-900 mb-2">Form Builder Placeholder</h2>
          <p className="text-[14px] text-zinc-500">
            This is where the drag-and-drop builder will go.
            <br/>
            Form ID: {form.id}
          </p>
        </div>
      </div>
    </div>
  );
}
