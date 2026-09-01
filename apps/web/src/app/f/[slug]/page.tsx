"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/Logo";

// We won't use the authenticated `api` utility here because this is public.
// We just use standard fetch.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

type Rule = {
  id: string;
  sourceFieldId: string;
  operator: string;
  value?: any;
  action: "SHOW" | "HIDE";
  targetFieldId: string;
};

function evaluateCondition(operator: string, answer: any, expected: any): boolean {
  const str = (v: any) =>
    Array.isArray(v) ? v.join(", ") : v === null || v === undefined ? "" : String(v);

  const a = str(answer).trim();
  const b = str(expected).trim();

  switch (operator) {
    case "EQUALS":
      return a.toLowerCase() === b.toLowerCase();
    case "NOT_EQUALS":
      return a.toLowerCase() !== b.toLowerCase();
    case "CONTAINS":
      return a.toLowerCase().includes(b.toLowerCase());
    case "GREATER_THAN":
      return parseFloat(a) > parseFloat(b);
    case "LESS_THAN":
      return parseFloat(a) < parseFloat(b);
    case "IS_EMPTY":
      return a === "";
    case "IS_NOT_EMPTY":
      return a !== "";
    default:
      return false;
  }
}

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const watchedValues = watch();

  // Upload a file to the API and set the file metadata as the field value
  const handleFileUpload = async (fieldId: string, file: File) => {
    setUploading((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }

      const storedFile = await res.json();
      // Store file metadata as the field value
      setValue(fieldId, storedFile, { shouldValidate: true });
    } catch (err: any) {
      alert(err.message);
      setValue(fieldId, null, { shouldValidate: true });
    } finally {
      setUploading((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_URL}/public/forms/${slug}`);
        if (!res.ok) throw new Error("Form not found or is no longer accepting responses.");
        const data = await res.json();
        setForm(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  // Evaluate rules -> visibility map (recomputed on every value change)
  const visibleIds = useMemo(() => {
    if (!form) return new Set<string>();

    const fields: { id: string }[] = form.fields || [];
    const rules: Rule[] = form.rules || [];
    const showRules = rules.filter((r) => r.action === "SHOW");
    const hideRules = rules.filter((r) => r.action === "HIDE");
    const showTargets = new Set(showRules.map((r) => r.targetFieldId));

    const map: Record<string, boolean> = {};
    for (const f of fields) {
      // Fields targeted by a SHOW rule start hidden; others start visible
      map[f.id] = !showTargets.has(f.id);
    }
    // SHOW rule met -> visible
    for (const r of showRules) {
      if (evaluateCondition(r.operator, watchedValues?.[r.sourceFieldId], r.value)) {
        map[r.targetFieldId] = true;
      }
    }
    // HIDE rule met -> hidden (overrides SHOW)
    for (const r of hideRules) {
      if (evaluateCondition(r.operator, watchedValues?.[r.sourceFieldId], r.value)) {
        map[r.targetFieldId] = false;
      }
    }
    return new Set(Object.keys(map).filter((id) => map[id]));
  }, [form, watchedValues]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Only submit answers for currently visible fields
      const answers = Object.entries(data)
        .filter(([fieldId]) => visibleIds.has(fieldId))
        .map(([fieldId, value]) => ({ fieldId, value }));

      const res = await fetch(`${API_URL}/public/forms/${slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit form.");
      
      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">Form unavailable</h1>
        <p className="text-zinc-500">{error || "This form could not be loaded."}</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-sm border border-zinc-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Thank you!</h1>
          <p className="text-zinc-500">Your response has been successfully submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12 px-4 md:py-20 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">{form.name}</h1>
          {form.description && (
            <p className="text-lg text-zinc-500 whitespace-pre-wrap">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {form.fields.filter((field: any) => visibleIds.has(field.id)).map((field: any) => (
            <div key={field.id} className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-base font-semibold text-zinc-900 mb-3">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {/* Text / Email / Number */}
              {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER") && (
                <input
                  type={field.type === "EMAIL" ? "email" : field.type === "NUMBER" ? "number" : "text"}
                  {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "This field is required" : false })}
                  placeholder="Your answer"
                  className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              )}

              {/* Long Text */}
              {field.type === "LONG_TEXT" && (
                <textarea
                  {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "This field is required" : false })}
                  placeholder="Your answer"
                  rows={4}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
                />
              )}

              {/* Select */}
              {field.type === "SELECT" && (
                <select
                  {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "Please select an option" : false })}
                  className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Choose an option...</option>
                  {field.options?.map((opt: string, i: number) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {/* Radio */}
              {field.type === "RADIO" && (
                <div className="space-y-3 mt-4">
                  {field.options?.map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          value={opt}
                          {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "Please select an option" : false })}
                          className="w-5 h-5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                      </div>
                      <span className="text-[15px] text-zinc-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {field.type === "CHECKBOX" && (
                <div className="space-y-3 mt-4">
                  {field.options?.map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={opt}
                        {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "This field is required" : false })}
                        className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                      <span className="text-[15px] text-zinc-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* File Upload */}
              {field.type === "FILE" && (
                <div className="space-y-2">
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 21l5-5-5-5M9 21l-5-5 5-5" />
                    </svg>
                    <p className="text-zinc-600">Drag & drop a file here, or click to select</p>
                    <p className="text-xs text-zinc-400 mt-1">Max 10MB · PDF, images, documents</p>
                    <input
                      type="file"
                      {...register(field.id, { required: field.required && visibleIds.has(field.id) ? "This field is required" : false })}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(field.id, file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading[field.id]}
                    />
                  </label>

                  {errors[field.id] && (
                    <p className="text-red-500 text-[13px] font-medium">{errors[field.id]?.message as string}</p>
                  )}

                  {/* Show uploaded file preview */}
                  {watchedValues[field.id] && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{watchedValues[field.id].filename}</p>
                        <p className="text-xs text-zinc-500">{(watchedValues[field.id].size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue(field.id, null, { shouldValidate: true })}
                        className="text-zinc-400 hover:text-red-500 p-1"
                        disabled={uploading[field.id]}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  )}

                  {uploading[field.id] && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Generic error display (skip for FILE which handles inline) */}
              {field.type !== "FILE" && errors[field.id] && (
                <p className="text-red-500 text-[13px] font-medium mt-2">
                  {errors[field.id]?.message as string}
                </p>
              )}
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 text-white font-bold text-[16px] py-4 rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <a href="/" target="_blank" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-600 text-sm font-medium transition-colors">
            <Logo className="w-4 h-4" />
            Powered by <strong>FormFlow</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
