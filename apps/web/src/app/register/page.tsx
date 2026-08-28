"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import * as z from"zod";
import { api } from"@/lib/api";

const registerSchema = z.object({
 name: z.string().min(2,"Name must be at least 2 characters"),
 email: z.string().email("Invalid email address"),
 password: z.string().min(6,"Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
 const router = useRouter();
 const [error, setError] = useState<string | null>(null);

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting },
 } = useForm<RegisterFormValues>({
 resolver: zodResolver(registerSchema),
 });

 const onSubmit = async (data: RegisterFormValues) => {
 try {
 setError(null);
 await api("/auth/register", {
 method:"POST",
 body: JSON.stringify(data),
 });
 router.push("/dashboard");
 } catch (err: any) {
 setError(err.message);
 }
 };

 return (
 <div className="flex min-h-screen items-center justify-center bg-white p-4 font-sans">
 <div className="w-full max-w-[400px]">
 <div className="mb-10 text-center">
 <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight mb-2">
 Create your account
 </h1>
 <p className="text-[15px] text-zinc-500">
 Start building forms like a doc.
 </p>
 </div>

 {error && (
 <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
 <div className="space-y-1.5">
 <label className="block text-[14px] font-semibold text-zinc-900">
 Name
 </label>
 <input
 {...register("name")}
 type="text"
 placeholder="Jane Doe"
 className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-[15px] placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-shadow"
 />
 {errors.name && <p className="text-[13px] text-red-500">{errors.name.message}</p>}
 </div>

 <div className="space-y-1.5">
 <label className="block text-[14px] font-semibold text-zinc-900">
 Email
 </label>
 <input
 {...register("email")}
 type="email"
 placeholder="jane@example.com"
 className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-[15px] placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-shadow"
 />
 {errors.email && <p className="text-[13px] text-red-500">{errors.email.message}</p>}
 </div>

 <div className="space-y-1.5">
 <label className="block text-[14px] font-semibold text-zinc-900">
 Password
 </label>
 <input
 {...register("password")}
 type="password"
 placeholder="••••••••"
 className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-[15px] placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-shadow"
 />
 {errors.password && <p className="text-[13px] text-red-500">{errors.password.message}</p>}
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-[15px] font-semibold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
 >
 {isSubmitting ?"Creating..." :"Sign up"}
 </button>
 </form>

 <p className="mt-8 text-center text-[14px] text-zinc-500">
 Already have an account?{""}
 <a href="/login" className="font-medium text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-900 underline-offset-4 transition-colors">
 Log in
 </a>
 </p>
 </div>
 </div>
 );
}
