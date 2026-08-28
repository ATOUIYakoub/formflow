"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

// We won't use the authenticated `api` utility here because this is public.
// We just use standard fetch.
const API_URL = "http://localhost:3001/api";

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Transform react-hook-form data (key is field.id) to our API structure
      const answers = Object.entries(data).map(([fieldId, value]) => ({
        fieldId,
        value,
      }));

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
          {form.fields.map((field: any) => (
            <div key={field.id} className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-base font-semibold text-zinc-900 mb-3">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {/* Text / Email / Number */}
              {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER") && (
                <input
                  type={field.type === "EMAIL" ? "email" : field.type === "NUMBER" ? "number" : "text"}
                  {...register(field.id, { required: field.required ? "This field is required" : false })}
                  placeholder="Your answer"
                  className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              )}

              {/* Long Text */}
              {field.type === "LONG_TEXT" && (
                <textarea
                  {...register(field.id, { required: field.required ? "This field is required" : false })}
                  placeholder="Your answer"
                  rows={4}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
                />
              )}

              {/* Select */}
              {field.type === "SELECT" && (
                <select
                  {...register(field.id, { required: field.required ? "Please select an option" : false })}
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
                          {...register(field.id, { required: field.required ? "Please select an option" : false })}
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
                        {...register(field.id, { required: field.required ? "This field is required" : false })}
                        className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                      />
                      <span className="text-[15px] text-zinc-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {errors[field.id] && (
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
          <a href="/" target="_blank" className="text-zinc-400 hover:text-zinc-600 text-sm font-medium transition-colors">
            Powered by <strong>FormFlow</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
