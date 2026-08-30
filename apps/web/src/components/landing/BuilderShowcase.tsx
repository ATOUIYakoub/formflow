import React from 'react';

export default function BuilderShowcase() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left column */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#7C6BF0] bg-[#7C6BF0]/10 px-3 py-1 rounded-full inline-block">
              BUILDER
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 mt-6">
              Build once. Let the form do the work.
            </h2>
            <p className="text-lg text-zinc-500 mt-4">
              Drag fields, set conditions, toggle requirements — then publish. FormFlow handles validation, storage, and analytics automatically.
            </p>
            
            <ul className="mt-8 space-y-4">
              {[
                'Drag-and-drop field ordering',
                'Auto-save with real-time sync',
                'Instant publish to shareable link'
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#7C6BF0]/10 text-[#7C6BF0] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-zinc-700">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column (mockup) */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
            {/* Top bar */}
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-sm font-medium text-zinc-600 font-sans">
                Job Application
              </div>
            </div>
            
            {/* Mockup content */}
            <div className="flex h-80">
              {/* Form canvas */}
              <div className="flex-1 p-6 bg-zinc-50/50">
                <div className="bg-white border-2 border-[#7C6BF0] rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-semibold text-zinc-900">Are you currently employed? <span className="text-red-500">*</span></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-300"></div>
                      <div className="text-sm text-zinc-700">Yes</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-300"></div>
                      <div className="text-sm text-zinc-700">No</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Properties panel */}
              <div className="w-64 border-l border-zinc-200 bg-white p-5 space-y-6">
                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Field Settings</div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[13px] font-medium text-zinc-700 mb-1.5">Type</div>
                      <div className="bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-[13px] text-zinc-700 flex justify-between items-center">
                        Radio
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium text-zinc-700">Required</div>
                      <div className="w-9 h-5 bg-[#7C6BF0] rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
