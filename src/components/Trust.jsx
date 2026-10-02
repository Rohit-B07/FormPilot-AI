import React from 'react';
import { Lock, AlertCircle, FileCheck2, UserCheck, Shield } from 'lucide-react';

export default function Trust() {
  const principles = [
    {
      title: 'PRIVACY FIRST',
      tagline: 'Minimal data retention and secure handling.',
      description: 'Your documents are processed in volatile memory with end-to-end encryption. Sensitive identification numbers (SSN, passport IDs) are masked automatically and purged post-session.',
      icon: Lock,
    },
    {
      title: 'CONFIDENCE AWARE',
      tagline: 'Low-confidence fields are flagged for review.',
      description: 'When OCR scans blurry handwriting or complex tax formulas, FormPilot flags uncertainty levels instead of guessing. You are prompted for immediate verification.',
      icon: AlertCircle,
    },
    {
      title: 'VALIDATION',
      tagline: 'Rules and consistency checks before submission.',
      description: 'Built-in validation engines enforce regional format checks, mathematical cross-references, date logic, and attached document integrity audits prior to export.',
      icon: FileCheck2,
    },
    {
      title: 'HUMAN CONTROL',
      tagline: 'No final submission without user confirmation.',
      description: 'AI handles the heavy lifting, but final authority remains 100% with you. FormPilot never dispatches or signs a document without your explicit preview approval.',
      icon: UserCheck,
    },
  ];

  return (
    <section id="trust" className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 mb-16">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-3">
              06 // ETHICAL GOVERNANCE
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-[#0A0A0A] uppercase">
              AI ASSISTS.<br />
              <span className="font-serif-editorial italic font-normal text-[#171717]">YOU DECIDE.</span>
            </h2>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="p-3 bg-[#0A0A0A] text-[#F3F1EC]">
              <Shield className="w-5 h-5 text-[#1677FF]" />
            </div>
            <div className="text-xs font-mono text-[#171717]">
              <div>SOC-2 TYPE II COMPLIANT</div>
              <div className="text-[#666666]">ZERO PERMANENT DATA STORAGE</div>
            </div>
          </div>
        </div>

        {/* 4 Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div
                key={p.title}
                className="border border-[#0A0A0A] bg-white p-8 md:p-10 flex flex-col justify-between hover:border-[#1677FF] transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-[#1677FF] bg-[#1677FF]/10 px-2.5 py-1 border border-[#1677FF]/30">
                      PRINCIPLE 0{idx + 1}
                    </span>
                    <IconComp className="w-6 h-6 text-[#0A0A0A] group-hover:text-[#1677FF] transition-colors" />
                  </div>

                  <h3 className="font-editorial text-2xl md:text-3xl font-extrabold tracking-tight text-[#0A0A0A] mb-2 uppercase">
                    {p.title}
                  </h3>

                  <div className="font-mono text-xs font-semibold text-[#171717] mb-4 uppercase">
                    {p.tagline}
                  </div>

                  <p className="text-xs md:text-sm text-[#666666] font-sans-clean leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#0A0A0A]/10 flex items-center justify-between text-[11px] font-mono text-[#666666]">
                  <span>GUARANTEED SAFETY PROTOCOL</span>
                  <span className="text-[#0A0A0A] font-bold group-hover:text-[#1677FF]">VERIFIED ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
