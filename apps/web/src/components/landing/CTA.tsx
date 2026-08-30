import Image from 'next/image';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/formflow-cta-background.png"
          alt=""
          fill
          className="object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/85" />
      </div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
          Your next form starts here.
        </h2>
        <p className="text-lg text-zinc-500 mt-6">
          Build your first dynamic form in under five minutes. No credit card, no complexity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/register"
            className="bg-zinc-900 text-white rounded-full px-8 py-3.5 text-[15px] font-semibold hover:bg-zinc-800 shadow-lg transition-colors inline-flex justify-center items-center"
          >
            Start building
          </Link>
          <Link
            href="/dashboard"
            className="border border-zinc-200 text-zinc-700 bg-white rounded-full px-8 py-3.5 text-[15px] font-semibold hover:bg-zinc-50 transition-colors inline-flex justify-center items-center"
          >
            Explore the product
          </Link>
        </div>
      </div>
    </section>
  );
}
