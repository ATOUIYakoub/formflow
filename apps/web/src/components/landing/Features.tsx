export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C6BF0] bg-[#7C6BF0]/10 px-3 py-1 rounded-full inline-block">
            FEATURES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mt-6">
            Everything you need to build smarter forms
          </h2>
          <p className="text-lg text-zinc-500 mt-4 max-w-2xl mx-auto">
            Powerful enough for complex workflows. Simple enough to use in minutes.
          </p>
        </div>

        <div className="mt-16">
          {/* Row 1: 2 large cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Dynamic Forms */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Dynamic Forms</h3>
                <p className="text-sm text-zinc-500">
                  Build forms with flexible field types — text, email, dropdowns, checkboxes, and more — without writing a single line of form markup.
                </p>
              </div>
              <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex-1">
                <div className="space-y-3">
                  <div className="h-9 bg-white border border-zinc-200 rounded-md px-3 py-2 flex items-center">
                    <div className="w-16 h-2 bg-zinc-200 rounded"></div>
                  </div>
                  <div className="h-9 bg-white border border-zinc-200 rounded-md px-3 py-2 flex items-center">
                    <div className="w-24 h-2 bg-zinc-200 rounded"></div>
                  </div>
                  <div className="h-9 bg-white border border-zinc-200 rounded-md px-3 py-2 flex justify-between items-center">
                    <div className="w-20 h-2 bg-zinc-200 rounded"></div>
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Conditional Logic */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Conditional Logic</h3>
                <p className="text-sm text-zinc-500">
                  Show or hide fields based on previous answers. Your forms become intelligent conversations.
                </p>
              </div>
              <div className="mt-6 bg-zinc-50 rounded-xl p-6 border border-zinc-100 flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-xs space-y-4">
                  <div className="bg-white border border-zinc-200 rounded-lg p-3 text-sm text-zinc-700 text-center font-medium shadow-sm">
                    Country = <span className="text-[#7C6BF0]">Algeria</span>
                  </div>
                  <div className="flex justify-center">
                    <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="bg-[#7C6BF0]/5 border border-[#7C6BF0]/20 rounded-lg p-3 text-sm text-[#7C6BF0] text-center font-medium border-dashed">
                    Show Wilaya field
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 3 medium cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Card 3: Powerful Validation */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Powerful Validation</h3>
                <p className="text-sm text-zinc-500">
                  Validate responses consistently on both frontend and backend. Required fields, email formats, number ranges — handled automatically.
                </p>
              </div>
              <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex-1 flex items-center justify-center">
                <div className="w-full bg-white border-2 border-[#7C6BF0] rounded-md p-3 flex justify-between items-center shadow-sm relative">
                   <div className="absolute -top-2 -right-2 bg-[#7C6BF0] text-white rounded-full p-0.5">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <div className="w-1/2 h-2 bg-zinc-800 rounded"></div>
                   <span className="text-[10px] text-[#7C6BF0] font-bold">REQUIRED</span>
                </div>
              </div>
            </div>

            {/* Card 4: Real-time Preview */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Real-time Preview</h3>
                <p className="text-sm text-zinc-500">
                  See exactly how your form looks and behaves while you build it. No save-and-refresh cycle.
                </p>
              </div>
              <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex-1 flex gap-2 h-32">
                <div className="w-1/2 bg-white border border-zinc-200 rounded flex flex-col p-2 space-y-2 opacity-70">
                  <div className="h-2 w-1/3 bg-zinc-200 rounded"></div>
                  <div className="h-6 w-full border border-dashed border-zinc-300 rounded"></div>
                </div>
                <div className="w-1/2 bg-white border border-zinc-200 rounded flex flex-col p-2 space-y-2 shadow-sm">
                   <div className="h-2 w-1/3 bg-zinc-800 rounded"></div>
                   <div className="h-6 w-full border border-zinc-200 rounded bg-zinc-50"></div>
                </div>
              </div>
            </div>

            {/* Card 5: Submission Management */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Submission Management</h3>
                <p className="text-sm text-zinc-500">
                  View, filter, and manage every response. Export data when you need it.
                </p>
              </div>
              <div className="mt-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex-1 flex flex-col justify-center">
                 <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden text-[10px] text-zinc-500 shadow-sm">
                    <div className="flex bg-zinc-50 border-b border-zinc-200 px-3 py-1.5 font-medium">
                      <div className="w-1/3">Name</div>
                      <div className="w-1/3">Status</div>
                      <div className="w-1/3">Date</div>
                    </div>
                    <div className="flex border-b border-zinc-100 px-3 py-1.5">
                      <div className="w-1/3 text-zinc-800">John D.</div>
                      <div className="w-1/3 text-green-600">New</div>
                      <div className="w-1/3">Oct 12</div>
                    </div>
                    <div className="flex border-b border-zinc-100 px-3 py-1.5">
                      <div className="w-1/3 text-zinc-800">Sarah M.</div>
                      <div className="w-1/3 text-zinc-400">Read</div>
                      <div className="w-1/3">Oct 11</div>
                    </div>
                    <div className="flex px-3 py-1.5">
                      <div className="w-1/3 text-zinc-800">Ali K.</div>
                      <div className="w-1/3 text-green-600">New</div>
                      <div className="w-1/3">Oct 10</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Row 3: Full-width card */}
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 overflow-hidden">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-zinc-500">
                  Understand your forms with views, completion rates, drop-off points, and submission trends.
                </p>
              </div>
              
              <div className="mt-6 bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Views</div>
                    <div className="text-2xl font-bold text-zinc-900">1,428</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Started</div>
                    <div className="text-2xl font-bold text-zinc-900">832</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Completed</div>
                    <div className="text-2xl font-bold text-zinc-900">641</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Rate</div>
                    <div className="text-2xl font-bold text-[#7C6BF0]">77%</div>
                  </div>
                </div>

                <div className="h-32 w-full flex items-end relative overflow-hidden bg-white border border-zinc-200 rounded-lg shadow-sm">
                  <svg className="w-full h-full text-[#7C6BF0]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M0,100 L0,70 Q10,60 20,80 T40,60 T60,50 T80,30 T100,20 L100,100 Z"
                      fill="url(#gradient)"
                      opacity="0.2"
                    />
                    <polyline
                      points="0,70 10,60 20,80 30,70 40,60 50,55 60,50 70,60 80,30 90,35 100,20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
