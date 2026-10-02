import React, { useState } from 'react';
import { Upload, Brain, Mic, ShieldAlert, FileCheck, ArrowRight } from 'lucide-react';

export default function Journey({ onOpenUploadModal }) {
  const [activeTab, setActiveTab] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'UPLOAD',
      subtitle: 'Bring any PDF, scan or image.',
      description: 'Drag and drop standard government PDFs, scanned health intakes, mobile camera photos, or legacy application forms. Instant vision-based OCR processes high-density layouts.',
      icon: Upload,
      previewSnippet: {
        heading: 'Document Ingestion Matrix',
        lines: [
          'File: Passport_Renewal_Form_DS-11.pdf',
          'Resolution: 300 DPI • Multi-page detected',
          'OCR Engine: Layout LMv3 Neural Processor',
        ],
        statusTag: 'INGESTED'
      }
    },
    {
      number: '02',
      title: 'UNDERSTAND',
      subtitle: 'AI explains what every field means.',
      description: 'No more legal jargon or cryptic bureaucratic terms. FormPilot translates complex requirements, clause dependencies, and income rules into plain, accessible language.',
      icon: Brain,
      previewSnippet: {
        heading: 'Field Interpretation',
        lines: [
          'Field 14B: "Adjusted Gross Household Influx"',
          'AI Translation: "Your total annual family income before tax deductions."',
          'Context: Required for tuition waiver eligibility.',
        ],
        statusTag: 'PARSED'
      }
    },
    {
      number: '03',
      title: 'SPEAK / TYPE',
      subtitle: 'Answer naturally in your own words.',
      description: 'Provide answers via voice notes in your native accent/language or quick plain-text notes. FormPilot extracts exact values, dates, and amounts to map them to fields.',
      icon: Mic,
      previewSnippet: {
        heading: 'Natural Language Mapping',
        lines: [
          'Voice Input: "My annual family income is around 3 lakh rupees."',
          'Extracted Value: $3,600 / ₹300,000',
          'Mapped Target: Section 3 • Line 14B',
        ],
        statusTag: 'MAPPED'
      }
    },
    {
      number: '04',
      title: 'VALIDATE',
      subtitle: 'Catch missing info & inconsistencies.',
      description: 'Automated policy engine checks required fields, dates format, income thresholds, and alerts you to missing attached proofs (e.g. tax certificate or identity cards).',
      icon: ShieldAlert,
      previewSnippet: {
        heading: 'Integrity Check Matrix',
        lines: [
          '✓ Format check: SSN & Phone format verified',
          '⚠ Warning: Income tax certificate not yet attached',
          '✓ Logic check: Date of birth matches passport copy',
        ],
        statusTag: 'AUDITED'
      }
    },
    {
      number: '05',
      title: 'READY',
      subtitle: 'Get a verified, submission-ready form.',
      description: 'Preview the final filled document with zero typos or misalignments. Download high-resolution fillable PDF or submit directly with complete peace of mind.',
      icon: FileCheck,
      previewSnippet: {
        heading: 'Final Artifact Verification',
        lines: [
          'Form Readiness: 100% Verified',
          'Export Formats: Fillable PDF, Flat Print PDF, JSON payload',
          'Digital Signature: Ready for User Authorization',
        ],
        statusTag: 'VERIFIED'
      }
    }
  ];

  return (
    <section id="journey" className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC] relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 mb-16">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-3">
              01 // CORE ARCHITECTURE
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-[#0A0A0A] uppercase">
              THE FORM JOURNEY
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-[#171717] max-w-md text-sm font-sans-clean leading-relaxed">
            From raw paper or confusing PDFs to a 100% verified, submission-ready application in five intuitive steps.
          </p>
        </div>

        {/* Workflow Horizontal Desktop Grid / Vertical Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#0A0A0A]/20 border-b border-[#0A0A0A]/20 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isSelected = activeTab === index;

            return (
              <div
                key={step.number}
                onClick={() => setActiveTab(index)}
                className={`p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px] group ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-[#F3F1EC]'
                    : 'hover:bg-[#0A0A0A]/5 text-[#0A0A0A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className={`font-mono text-3xl md:text-4xl font-extrabold tracking-tighter ${
                      isSelected ? 'text-[#1677FF]' : 'text-[#0A0A0A]/30 group-hover:text-[#0A0A0A]'
                    }`}>
                      {step.number}
                    </span>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1677FF]' : 'text-[#666666]'}`} />
                  </div>

                  <h3 className={`font-editorial text-xl font-bold tracking-tight mb-2 uppercase ${
                    isSelected ? 'text-[#F3F1EC]' : 'text-[#0A0A0A]'
                  }`}>
                    {step.title}
                  </h3>

                  <p className={`text-xs leading-relaxed font-sans-clean ${
                    isSelected ? 'text-[#D8D6D0]' : 'text-[#666666]'
                  }`}>
                    {step.subtitle}
                  </p>
                </div>

                <div className="pt-6 border-t border-current/10 flex items-center justify-between text-[11px] font-mono">
                  <span>PHASE {step.number}</span>
                  <span className={isSelected ? 'text-[#1677FF]' : 'opacity-0 group-hover:opacity-100'}>EXPLORE →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Detailed Showcase Panel */}
        <div className="bg-[#0A0A0A] text-[#F3F1EC] border border-[#0A0A0A] p-8 md:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1677FF]/20 border border-[#1677FF]/40 text-[#1677FF] font-mono text-xs tracking-wider">
                <span>STEP {steps[activeTab].number} HIGHLIGHT</span>
              </div>

              <h3 className="font-editorial text-3xl md:text-5xl font-extrabold tracking-tight text-[#F3F1EC] uppercase">
                {steps[activeTab].title}
              </h3>

              <p className="text-base text-[#D8D6D0] leading-relaxed font-sans-clean">
                {steps[activeTab].description}
              </p>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={onOpenUploadModal}
                  className="px-6 py-3 bg-[#F3F1EC] text-[#0A0A0A] hover:bg-[#1677FF] hover:text-[#F3F1EC] text-xs font-bold font-mono uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <span>TRY STEP {steps[activeTab].number} NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Code / Matrix Box */}
            <div className="lg:col-span-6 bg-[#171717] border border-[#F3F1EC]/20 p-6 md:p-8 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F1EC]/15 pb-3">
                <span className="text-[#D8D6D0] font-bold">{steps[activeTab].previewSnippet.heading}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  {steps[activeTab].previewSnippet.statusTag}
                </span>
              </div>

              <div className="space-y-2 text-[#D8D6D0]">
                {steps[activeTab].previewSnippet.lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#1677FF]">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#F3F1EC]/10 text-[10px] text-[#666666] flex justify-between">
                <span>LATENCY: 120ms</span>
                <span>SECURITY: ENCRYPTED AT REST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
