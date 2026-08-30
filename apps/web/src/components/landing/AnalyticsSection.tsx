import Image from 'next/image';

export default function AnalyticsSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C6BF0] bg-[#7C6BF0]/10 px-3 py-1 rounded-full inline-block">
              ANALYTICS
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 mt-6">
              Know what's working
            </h2>
            <p className="text-lg text-zinc-500 mt-4">
              Track views, starts, completions, and drop-offs. Understand your forms with real-time analytics built right in.
            </p>
          </div>
          
          <div className="relative">
            <Image
              src="/formflow-analytics-illustration.png"
              alt=""
              width={600}
              height={400}
              className="absolute -top-12 -right-12 opacity-20 hidden lg:block -z-10"
              aria-hidden="true"
            />
            
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-zinc-900">1,428</div>
                  <div className="text-xs text-zinc-400 uppercase">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">832</div>
                  <div className="text-xs text-zinc-400 uppercase">Started</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">641</div>
                  <div className="text-xs text-zinc-400 uppercase">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#7C6BF0]">77%</div>
                  <div className="text-xs text-zinc-400 uppercase">Rate</div>
                </div>
              </div>
              
              <div className="w-full h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C6BF0" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#7C6BF0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="#f4f4f5" strokeWidth="1" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#f4f4f5" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#f4f4f5" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <path 
                    d="M 0 100 L 50 80 L 100 85 L 150 60 L 200 40 L 250 50 L 300 20 L 350 10 L 400 30 L 400 120 L 0 120 Z" 
                    fill="url(#gradientArea)" 
                  />
                  
                  {/* Line */}
                  <polyline 
                    points="0,100 50,80 100,85 150,60 200,40 250,50 300,20 350,10 400,30" 
                    stroke="#7C6BF0" 
                    strokeWidth="2" 
                    fill="none" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
