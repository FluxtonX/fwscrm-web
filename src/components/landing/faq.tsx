'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is FWS CRM?',
      answer:
        'FWS CRM is a modern, production-grade Customer Relationship Management platform designed to streamline lead acquisition, tracking, pipeline progression, and bulk CSV data ingestion within a secure multi-tenant architecture.',
    },
    {
      question: 'Who is this CRM for?',
      answer:
        'It is built for scaling sales organizations, lead generation agencies, and enterprise sales teams who require reliable duplicate detection, strict team role permissions, and high-performance ingestion of bulk prospect records.',
    },
    {
      question: 'Can I manage leads and customers with custom fields?',
      answer:
        'Yes. You can manage complete lead profiles including First Name, Last Name, Email, Phone, Country, Lead Source, Referrer, and custom tags, with full search, sorting, and multi-column filtering.',
    },
    {
      question: 'How does the CSV import handle large files and duplicates?',
      answer:
        'The backend utilizes a streaming CSV ingestion worker that processes files in transactional batches of 500 rows. Duplicate emails within your organization are detected and filtered, and any validation errors are logged row-by-row with drill-down audit capabilities.',
    },
    {
      question: 'Can I manage team members and control access permissions?',
      answer:
        'Yes. FWS CRM implements comprehensive Role-Based Access Control (RBAC) supporting Super Admin, Admin, Manager, Agent, and Viewer roles. Every query enforces strict organization tenant boundaries.',
    },
    {
      question: 'Does the CRM support real-time analytics and reporting?',
      answer:
        'Yes. The system performs direct SQL aggregation queries to provide live metrics on total leads, active pipeline value, conversion rate by source, and team stage velocity.',
    },
    {
      question: 'How do I get started?',
      answer:
        'You can create your organization in seconds by clicking "Get Started Free". Once registered, you can immediately begin creating leads or uploading your existing CSV prospect lists.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-crm-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Got Questions?
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-crm-muted">
            Everything you need to know about the platform, data security, and setup.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-crm-border bg-white transition-shadow hover:shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-crm-teal rounded-xl"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-crm-header">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-crm-muted transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-crm-teal' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-crm-muted border-t border-slate-100 leading-relaxed">
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
