'use client';

import React from 'react';
import Image from 'next/image';

export default function LogicSection() {
  return (
    <section className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-[#7C6BF0] bg-[#7C6BF0]/10 px-3 py-1 rounded-full inline-block">
            CONDITIONAL LOGIC
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mt-6">
            Forms that think ahead
          </h2>
          <p className="text-lg text-zinc-500 mt-4 max-w-2xl mx-auto">
            Create branching paths based on user responses. Every answer shapes the next question.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* CSS Flow visualization */}
          <div className="flex flex-col items-center">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm text-center w-64">
              <div className="text-sm font-semibold text-zinc-900">What is your country?</div>
            </div>
            
            {/* Line */}
            <div className="w-[2px] h-12 bg-zinc-200 mx-auto"></div>
            
            {/* Step 2 */}
            <div className="inline-block bg-[#7C6BF0]/10 text-[#7C6BF0] rounded-full px-4 py-1.5 text-sm font-semibold mx-auto">
              Algeria
            </div>
            
            {/* Line */}
            <div className="w-[2px] h-12 bg-zinc-200 mx-auto"></div>
            
            {/* Step 3 */}
            <div className="bg-zinc-900 text-white text-xs font-bold px-3 py-1 rounded-full mx-auto">
              SHOW FIELD
            </div>
            
            {/* Line */}
            <div className="w-[2px] h-12 bg-zinc-200 mx-auto"></div>
            
            {/* Step 4 */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm text-center w-64">
              <div className="text-sm font-semibold text-zinc-900 mb-3">Select your Wilaya</div>
              <div className="border border-zinc-200 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 flex justify-between items-center bg-zinc-50">
                Choose a Wilaya
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800">
            <Image 
              src="/formflow-conditional-logic.png"
              alt="Conditional logic flow diagram showing how FormFlow routes questions based on user answers"
              width={800}
              height={600}
              className="w-full h-auto rounded-2xl opacity-90 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
