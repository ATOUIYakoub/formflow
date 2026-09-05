import React from 'react';

export default function LogoCloud() {
  return (
    <section className="py-20 border-y border-zinc-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Trusted by teams building what&apos;s next
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mt-10">
          <span className="text-xl font-bold tracking-tight text-zinc-300 hover:text-zinc-400 transition-colors">
            Northstar
          </span>
          <span className="text-xl font-extrabold tracking-tighter text-zinc-300 hover:text-zinc-400 transition-colors">
            Luma
          </span>
          <span className="text-xl font-medium tracking-widest text-zinc-300 hover:text-zinc-400 transition-colors uppercase">
            Orbit
          </span>
          <span className="text-xl font-semibold tracking-normal text-zinc-300 hover:text-zinc-400 transition-colors">
            Frame
          </span>
          <span className="text-xl font-black tracking-tight text-zinc-300 hover:text-zinc-400 transition-colors">
            Vertex
          </span>
          <span className="text-xl font-light tracking-widest text-zinc-300 hover:text-zinc-400 transition-colors italic">
            Cascade
          </span>
        </div>
      </div>
    </section>
  );
}
