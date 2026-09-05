import React from 'react';
import Image from 'next/image';

export default function ProblemSection() {
  const painPoints = [
    'UI scaffolding',
    'Input validation',
    'Conditional logic',
    'Backend wiring',
    'Response storage',
    'Data analysis',
  ];

  const steps = [
    { number: 1, name: 'Build', description: 'Drag & drop form fields' },
    { number: 2, name: 'Validate', description: 'Set rules and logic' },
    { number: 3, name: 'Publish', description: 'Share or embed anywhere' },
    { number: 4, name: 'Collect', description: 'Analyze responses' },
  ];

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Part 1 - The Problem */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full inline-block">
            THE PROBLEM
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mt-6">
            Forms shouldn&apos;t feel like an engineering project.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 max-w-2xl mx-auto">
            {painPoints.map((point) => (
              <div
                key={point}
                className="rounded-xl border border-zinc-100 px-4 py-3 text-center"
              >
                <span className="text-sm text-zinc-500 font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2 - The Solution */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-semibold text-zinc-900">
            With FormFlow, it&apos;s four simple steps.
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 mt-12">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="text-sm font-semibold text-zinc-900 mt-3">
                    {step.name}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[140px] text-center">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="w-16 h-[2px] border-t-2 border-dashed border-zinc-200 mt-6 hidden md:block md:-translate-y-6" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto flex justify-center">
            <Image
              src="/formflow-workflow-illustration.png"
              alt="FormFlow workflow visualization showing the build, validate, publish, and collect steps"
              width={800}
              height={400}
              className="rounded-2xl opacity-90 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
