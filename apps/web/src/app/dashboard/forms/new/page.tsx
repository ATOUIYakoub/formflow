"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

export default function CreateFormPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = async (data: CreateFormValues) => {
    try {
      setError(null);
      const newForm = await api("/forms", {
        method: "POST",
        body: JSON.stringify(data),
      });
      // Redirect to the newly created form
      router.push(`/dashboard/forms/${newForm.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create form");
    }
  };

  return (
    <div className="max-w-[600px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/forms"
        className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6 inline-block"
      >
        &larr; Back to Forms
      </Link>
      
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight mb-2">
          Create a new form
        </h1>
        <p className="text-[15px] text-zinc-500 mb-8">
          Give your form a name and an optional description to get started.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-zinc-900">
              Form Name
            </label>
            <input
              {...register("name")}
              type="text"
              autoFocus
              placeholder="E.g., Customer Feedback"
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-[15px] placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-shadow"
            />
            {errors.name && <p className="text-[13px] text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-zinc-900">
              Description (Optional)
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="What is this form for?"
              className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-[15px] placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-shadow resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-[15px] font-semibold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
