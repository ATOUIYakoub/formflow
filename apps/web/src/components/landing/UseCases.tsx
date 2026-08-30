import React from 'react';

const USE_CASES = [
  {
    title: 'Customer Feedback',
    description: 'Collect structured feedback from users and customers after every interaction.',
    icon: (
      <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    bgClass: 'bg-zinc-100'
  },
  {
    title: 'Event Registration',
    description: 'Build registration forms with conditional fields for workshops, conferences, and meetups.',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bgClass: 'bg-blue-50'
  },
  {
    title: 'Lead Generation',
    description: 'Capture qualified leads with smart forms that adapt based on responses.',
    icon: (
      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bgClass: 'bg-violet-50'
  },
  {
    title: 'Internal Requests',
    description: 'Streamline IT tickets, time-off requests, and internal workflows.',
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    bgClass: 'bg-amber-50'
  },
  {
    title: 'Surveys & Research',
    description: 'Design research surveys with branching logic and completion tracking.',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bgClass: 'bg-emerald-50'
  },
  {
    title: 'Job Applications',
    description: 'Create application forms that collect the right information for each role.',
    icon: (
      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bgClass: 'bg-rose-50'
  }
];

export default function UseCases() {
  return (
    <section className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
            Built for every kind of form
          </h2>
          <p className="text-lg text-zinc-500 mt-4">
            From customer feedback to event registration, FormFlow adapts to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {USE_CASES.map((useCase, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-zinc-200 p-6 hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${useCase.bgClass} flex items-center justify-center`}>
                {useCase.icon}
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mt-4">
                {useCase.title}
              </h3>
              <p className="text-sm text-zinc-500 mt-2">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
