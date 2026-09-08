'use client';

import * as React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What makes FWS CRM different from conventional CRMs?',
      answer:
        'FWS CRM combines high-speed streaming CSV & XLSX data ingestion, interactive column mapping with strict unmapped data filtering, and real-time pipeline telemetry into a unified workspace with strict tenant security.',
    },
    {
      question: 'How does the spreadsheet import handle large volumes without crashing?',
      answer:
        'The ingestion engine processes files asynchronously in transactional batches of 100 records. Duplicates are filtered in real-time, unmapped columns are completely discarded from memory, and validation results are logged with drill-down audit logs.',
    },
    {
      question: 'Can I manage sales teams with granular role permissions?',
      answer:
        'Yes. FWS CRM implements a 5-tier Role-Based Access Control (RBAC) model supporting Super Admin, Admin, Manager, Agent, and Viewer roles with strict database isolation.',
    },
    {
      question: 'Does the CRM support real-time analytics and reporting?',
      answer:
        'Yes. The analytics engine performs direct PostgreSQL aggregation queries to generate live metrics on pipeline velocity, deal attribution by source, and team win conversion.',
    },
    {
      question: 'How fast can our sales team onboard?',
      answer:
        'Organization provisioning takes less than 30 seconds. Once registered, you can immediately begin creating leads, uploading CSV or Excel prospect lists, and configuring pipeline stages.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#F6F9F9] border-b border-[#E1EBEB] text-[#071A1D]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7F84] uppercase tracking-wider mb-2">
            <HelpCircle className="h-3.5 w-3.5" /> FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#071A1D]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-[#4A6B6F] font-normal">
            Everything you need to know about the platform, data security, and setup.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E1EBEB] bg-white transition-all hover:border-[#16C1C8]/60 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus:ring-1 focus:ring-[#16C1C8]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-[#071A1D]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#4A6B6F] transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-[#0D7F84]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4A6B6F] border-t border-slate-100 leading-relaxed font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
