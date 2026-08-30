import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import LogoCloud from "@/components/landing/LogoCloud";
import ProblemSection from "@/components/landing/ProblemSection";
import Features from "@/components/landing/Features";
import BuilderShowcase from "@/components/landing/BuilderShowcase";
import LogicSection from "@/components/landing/LogicSection";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import UseCases from "@/components/landing/UseCases";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "FormFlow — Build powerful forms without the complexity",
  description: "FormFlow allows teams to create dynamic forms, collect responses, automate workflows, and understand their data without writing form logic from scratch.",
  openGraph: {
    title: "FormFlow — Build powerful forms without the complexity",
    description: "FormFlow allows teams to create dynamic forms, collect responses, automate workflows, and understand their data without writing form logic from scratch.",
    images: [
      {
        url: "/formflow-hero-abstract.png",
        width: 1200,
        height: 630,
        alt: "FormFlow Abstract Background",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoCloud />
        <ProblemSection />
        <Features />
        <BuilderShowcase />
        <LogicSection />
        <AnalyticsSection />
        <UseCases />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
