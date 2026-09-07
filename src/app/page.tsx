import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { TrustSection } from '@/components/landing/trust-section';
import { ProblemSolutionSection } from '@/components/landing/problem-solution';
import { FeaturesSection } from '@/components/landing/features';
import { PipelineShowcase } from '@/components/landing/pipeline-showcase';
import { AnalyticsShowcase } from '@/components/landing/analytics-showcase';
import { TeamShowcase } from '@/components/landing/team-showcase';
import { SecuritySection } from '@/components/landing/security-section';
import { IntegrationsSection } from '@/components/landing/integrations';
import { PricingSection } from '@/components/landing/pricing';
import { FAQSection } from '@/components/landing/faq';
import { FinalCTASection } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'FWS CRM — Manage Customers, Leads & Sales in One Place',
  description:
    'A modern, high-performance CRM platform for managing customers, leads, deals, sales pipelines, tasks, teams, and streaming CSV data ingestion.',
  openGraph: {
    title: 'FWS CRM — Manage Customers, Leads & Sales in One Place',
    description:
      'High-performance CRM platform designed for rapid lead ingestion, streaming CSV processing, and role-based multi-tenant security.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-crm-background text-crm-text flex flex-col selection:bg-teal-500 selection:text-white">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero with interactive CRM UI Preview */}
        <LandingHero />

        {/* 3. Trust & Architecture Positioning */}
        <TrustSection />

        {/* 4. Problem -> Solution Storytelling */}
        <ProblemSolutionSection />

        {/* 5. Core Feature Grid */}
        <FeaturesSection />

        {/* 6. Visual Sales Pipeline Showcase */}
        <PipelineShowcase />

        {/* 7. Analytics & Data Quality Showcase */}
        <AnalyticsShowcase />

        {/* 8. Team Collaboration & Chronological Timeline */}
        <TeamShowcase />

        {/* 9. Enterprise Security Architecture */}
        <SecuritySection />

        {/* 10. Streaming CSV Ingestion & Connectors */}
        <IntegrationsSection />

        {/* 11. Transparent Pricing Tiers */}
        <PricingSection />

        {/* 12. Accessible FAQ Accordion */}
        <FAQSection />

        {/* 13. Final Conversion Call-to-Action */}
        <FinalCTASection />
      </main>

      {/* 14. Comprehensive Professional Footer */}
      <LandingFooter />
    </div>
  );
}
