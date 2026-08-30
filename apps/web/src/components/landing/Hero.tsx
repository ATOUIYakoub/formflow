"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center motion-safe:animate-[fadeIn_0.5s_ease-out]">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Build forms that adapt to every answer
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 mt-6 max-w-2xl mx-auto">
            Create dynamic forms with conditional logic, real-time validation, and instant analytics — without wrestling with form infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mt-10">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-zinc-900 text-white rounded-full px-8 py-3.5 text-[15px] font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
            >
              Start building — it's free
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto border border-zinc-200 text-zinc-700 rounded-full px-8 py-3.5 text-[15px] font-semibold hover:bg-zinc-50 transition-all"
            >
              See how it works
            </Link>
          </div>
          
          <p className="text-sm text-zinc-400 mt-6">
            No credit card required · Free forever for individuals
          </p>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto motion-safe:animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
          <div className="absolute inset-0 -z-10 -m-20 hidden md:block">
            <Image
              src="/formflow-hero-abstract.png"
              alt=""
              fill
              className="object-cover opacity-30 blur-2xl rounded-full"
              priority
            />
          </div>

          <div className="relative rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-200/50 bg-white overflow-hidden flex flex-col h-[500px]">
            {/* Top Bar */}
            <div className="h-10 bg-zinc-50 border-b border-zinc-200 flex items-center px-4 relative shrink-0">
              <div className="flex gap-1.5 absolute left-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="w-full text-center text-xs font-medium text-zinc-500">
                Customer Feedback
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-48 border-r border-zinc-200 bg-zinc-50 flex flex-col shrink-0 hidden md:flex">
                <div className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Blocks
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                  {['Short Text', 'Email', 'Number', 'Dropdown', 'Single Choice', 'Multiple Choice'].map((block) => (
                    <div key={block} className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100 cursor-pointer text-sm text-zinc-700">
                      <div className="w-4 h-4 bg-zinc-200 rounded-sm shrink-0" />
                      {block}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Canvas */}
              <div className="flex-1 bg-white p-8 overflow-y-auto">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700">Full Name</label>
                    <div className="w-full h-10 border border-zinc-200 rounded-md bg-zinc-50/50" />
                  </div>
                  
                  <div className="space-y-2 relative">
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 p-1 bg-[#7C6BF0]/10 rounded shadow-sm text-[#7C6BF0]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <label className="flex items-center text-sm font-medium text-zinc-700">
                      Email address
                      <span className="ml-2 text-xs text-red-500">*</span>
                    </label>
                    <div className="w-full h-10 border border-[#7C6BF0] rounded-md bg-white shadow-[0_0_0_1px_#7C6BF0]" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700">Country</label>
                    <div className="w-full h-10 border border-zinc-200 rounded-md bg-zinc-50/50 flex items-center justify-between px-3">
                      <span className="text-zinc-400 text-sm">Select...</span>
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Properties Panel */}
              <div className="w-56 border-l border-zinc-200 bg-zinc-50 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-4 border-b border-zinc-200 text-sm font-medium text-zinc-800">
                  Properties
                </div>
                <div className="p-4 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-500">Label</label>
                    <input type="text" readOnly value="Email address" className="w-full text-sm p-1.5 border border-zinc-200 rounded bg-white text-zinc-800" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-500">Type</label>
                    <div className="w-full text-sm p-1.5 border border-zinc-200 rounded bg-zinc-100 text-zinc-600">Email</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700">Required</span>
                    <div className="w-8 h-4 bg-[#7C6BF0] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="hidden md:block absolute -top-6 -right-6 bg-white rounded-xl shadow-lg border border-zinc-100 px-4 py-3 flex items-center gap-3 motion-safe:animate-[fadeIn_0.5s_ease-out_0.8s_both]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-800">128</div>
              <div className="text-xs text-zinc-500">Responses</div>
            </div>
          </div>

          <div className="hidden md:flex absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-zinc-100 px-4 py-3 items-center gap-2 motion-safe:animate-[fadeIn_0.5s_ease-out_1s_both]">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]" />
            <span className="text-sm font-medium text-zinc-700">Published</span>
          </div>

          <div className="hidden md:flex absolute -bottom-4 -right-12 bg-white rounded-xl shadow-lg border border-zinc-100 px-4 py-3 items-center gap-3 motion-safe:animate-[fadeIn_0.5s_ease-out_1.2s_both]">
            <div className="relative w-8 h-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-zinc-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#7C6BF0]" strokeWidth="3" strokeDasharray="82, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-800">82%</div>
              <div className="text-xs text-zinc-500">Completion</div>
            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}
