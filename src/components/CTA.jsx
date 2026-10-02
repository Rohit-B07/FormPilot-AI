import React from 'react';
import { ArrowRight, Sparkles, FileText, Code2 } from 'lucide-react';

export default function CTA({ onOpenUploadModal }) {
  return (
    <section className="py-28 px-6 md:px-12 bg-[#0A0A0A] text-[#F3F1EC] relative overflow-hidden border-b border-[#F3F1EC]/15">
      {/* Subtle Background Lines */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-6 divide-x divide-[#F3F1EC]/5 max-w-7xl mx-auto px-6 md:px-12">
        <div />
        <div />
        <div />
        <div />
        <div className="hidden md:block" />
        <div className="hidden md:block" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1677FF]/20 border border-[#1677FF]/40 text-[#1677FF] font-mono text-xs tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE ZERO-FRICTION PAPERWORK FUTURE</span>
            </div>

            <h2 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-[0.88] text-[#F3F1EC] uppercase">
              STOP FIGHTING<br />
              <span className="font-serif-editorial italic font-normal text-[#D8D6D0]">WITH FORMS.</span>
            </h2>

            <p className="mt-8 text-lg md:text-xl font-sans-clean text-[#D8D6D0] max-w-xl leading-relaxed">
              Start filling smarter with FormPilot AI. Upload your first PDF, speak your answers naturally, and submit with total confidence.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <button
              onClick={onOpenUploadModal}
              className="w-full px-8 py-5 bg-[#F3F1EC] text-[#0A0A0A] hover:bg-[#1677FF] hover:text-[#F3F1EC] text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-between shadow-2xl group"
            >
              <span>TRY FORMPILOT AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full px-8 py-5 border border-[#F3F1EC]/30 text-[#F3F1EC] hover:bg-[#F3F1EC] hover:text-[#0A0A0A] text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 text-center"
            >
              <Code2 className="w-4 h-4" />
              <span>VIEW GITHUB</span>
            </a>


            <div className="pt-4 text-center font-mono text-[10px] text-[#666666]">
              NO CREDIT CARD REQUIRED • OPEN-SOURCE READY • SOC-2 AUDITED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
