import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { ProductPreview } from '@/components/landing/product-preview';
import { PipelineShowcase } from '@/components/landing/pipeline-showcase';
import { AnalyticsShowcase } from '@/components/landing/analytics-showcase';
import { TeamShowcase } from '@/components/landing/team-showcase';
import { WorkflowShowcase } from '@/components/landing/workflow-showcase';
import { LeadManagementPreview } from '@/components/landing/lead-management-preview';
import { PricingSection } from '@/components/landing/pricing';
import { SecuritySection } from '@/components/landing/security-section';
import { FAQSection } from '@/components/landing/faq';
import { FinalCTASection } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'FWS CRM — Enterprise Sales Operations & Lead Management Platform',
  description:
    'An intelligent, high-performance CRM platform for managing customer relationships, sales pipelines, team activities, and streaming CSV data ingestion.',
  openGraph: {
    title: 'FWS CRM — Turn Leads Into Growth',
    description:
      'One intelligent workspace for your entire sales operation. Real-time pipeline velocity, automated deduplication, and PostgreSQL analytics.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#071A1D] text-[#F1FAFA] flex flex-col selection:bg-[#16C1C8] selection:text-[#071A1D]">
      {/* 1. Premium Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section with Real Product Interface Preview */}
        <LandingHero />

        {/* 3. Product Intelligence Preview */}
        <ProductPreview />

        {/* 4. Sales Pipeline Kanban Visualization */}
        <PipelineShowcase />

        {/* 5. Performance & Analytics Telemetry Dashboard */}
        <AnalyticsShowcase />

        {/* 6. Team Collaboration Operational Workspace */}
        <TeamShowcase />

        {/* 7. Smart Workflow & Automation */}
        <WorkflowShowcase />

        {/* 8. Lead Management Miniature Table */}
        <LeadManagementPreview />

        {/* 9. Transparent SaaS Pricing */}
        <PricingSection />

        {/* 10. Minimalist Security & Trust Strip */}
        <SecuritySection />

        {/* 11. Accessible FAQ Accordion */}
        <FAQSection />

        {/* 12. Minimal & Powerful Final Conversion CTA */}
        <FinalCTASection />
      </main>

      {/* 13. Enterprise Footer */}
      <LandingFooter />
    </div>
  );
}
