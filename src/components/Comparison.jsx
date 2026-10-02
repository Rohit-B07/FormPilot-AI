import React from 'react';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';

export default function Comparison({ onOpenUploadModal }) {
  const comparisonData = [
    {
      feature: 'Form Understanding',
      ocr: 'Basic Text Scan',
      autofill: 'None (Key-Value match)',
      chatbot: 'Generic QA',
      formpilot: 'Full Semantic & Contextual Parsing',
      highlight: true
    },
    {
      feature: 'Natural Language Input (Voice/Text)',
      ocr: 'No',
      autofill: 'No',
      chatbot: 'Yes (Text only)',
      formpilot: 'Voice + Multilingual Accent Mapping',
      highlight: true
    },
    {
      feature: 'Field Mapping Intelligence',
      ocr: 'No',
      autofill: 'Exact Match Only',
      chatbot: 'No',
      formpilot: 'Automated Ambiguity Resolution',
      highlight: true
    },
    {
      feature: 'Missing Info & Attachment Detection',
      ocr: 'No',
      autofill: 'No',
      chatbot: 'No',
      formpilot: 'Pre-flight Rule & Policy Engine',
      highlight: true
    },
    {
      feature: 'Verification & Final Validation',
      ocr: 'No',
      autofill: 'No',
      chatbot: 'No',
      formpilot: 'Zero-Fault Human Review Gate',
      highlight: true
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-4">
          04 // ARCHITECTURAL PARADIGM
        </div>

        <div className="mb-16">
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-[#0A0A0A] uppercase">
            NOT JUST AUTOFILL.
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#171717] font-sans-clean max-w-2xl leading-relaxed">
            Existing tools only solve a fraction of paperwork friction. FormPilot AI unifies understanding, mapping, filling, and policy validation into a single copilot.
          </p>
        </div>

        {/* Highlight Banner Cards for the 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { step: '01', label: 'UNDERSTANDS', desc: 'Translates legal rules & fine-print questions into plain English.' },
            { step: '02', label: 'MAPS', desc: 'Directly maps conversational voice or text to complex field names.' },
            { step: '03', label: 'FILLS', desc: 'Populates PDF coordinates with precision typesetting.' },
            { step: '04', label: 'VALIDATES', desc: 'Checks compliance & flags missing proof documents.' },
          ].map((pillar, idx) => (
            <div
              key={pillar.label}
              className={`p-6 border transition-all ${
                idx === 3
                  ? 'bg-[#0A0A0A] text-[#F3F1EC] border-[#0A0A0A]'
                  : 'bg-[#171717] text-[#F3F1EC] border-[#171717]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#1677FF] font-bold">{pillar.step}</span>
                <span className="w-2 h-2 rounded-full bg-[#1677FF]"></span>
              </div>
              <h3 className="font-editorial text-xl font-bold tracking-tight mb-2 uppercase">
                {pillar.label}
              </h3>
              <p className="text-xs text-[#D8D6D0] font-sans-clean leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="border border-[#0A0A0A] bg-[#0A0A0A] text-[#F3F1EC] overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#F3F1EC]/20 font-mono text-xs text-[#D8D6D0]">
                <th className="p-6 font-bold uppercase tracking-wider w-1/4">CAPABILITY</th>
                <th className="p-6 font-bold uppercase tracking-wider text-[#666666] w-1/6">OCR</th>
                <th className="p-6 font-bold uppercase tracking-wider text-[#666666] w-1/6">AUTOFILL</th>
                <th className="p-6 font-bold uppercase tracking-wider text-[#666666] w-1/6">CHATBOT</th>
                <th className="p-6 font-bold uppercase tracking-wider text-[#1677FF] bg-[#1677FF]/15 border-x border-[#1677FF]/40 w-1/4">
                  FORMPILOT AI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F1EC]/10 text-xs font-sans-clean">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-[#171717] transition-colors">
                  <td className="p-6 font-medium text-[#F3F1EC]">{row.feature}</td>
                  <td className="p-6 text-[#666666] font-mono">{row.ocr}</td>
                  <td className="p-6 text-[#666666] font-mono">{row.autofill}</td>
                  <td className="p-6 text-[#666666] font-mono">{row.chatbot}</td>
                  <td className="p-6 font-bold text-white bg-[#1677FF]/15 border-x border-[#1677FF]/40 font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1677FF] shrink-0" />
                    <span>{row.formpilot}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[#0A0A0A]/10">
          <span className="text-xs font-mono text-[#666666]">
            UPGRADE FROM SIMPLE AUTOFILL TO AN AUDITED AI COPILOT.
          </span>
          <button
            onClick={onOpenUploadModal}
            className="px-6 py-3 bg-[#0A0A0A] text-[#F3F1EC] hover:bg-[#1677FF] text-xs font-mono font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
          >
            <span>EXPERIENCE FORMPILOT AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
