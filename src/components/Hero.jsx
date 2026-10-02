import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, FileUp, Sparkles, Play, Shield, Terminal } from 'lucide-react';

export default function Hero({ onOpenUploadModal }) {
  const [activeStep, setActiveStep] = useState(0);

  const heroSteps = [
    { label: 'Form Uploaded', status: 'COMPLETE', time: '0.2s', icon: FileUp, detail: 'PDF document scanned & OCR initialized' },
    { label: 'AI Extracting Fields', status: 'IN_PROGRESS', time: '0.8s', icon: Sparkles, detail: '34 total fields parsed, 2 missing required values' },
    { label: 'Missing Information Detected', status: 'FLAGGED', time: '1.1s', icon: AlertTriangle, detail: 'Annual Family Income & Certificate required' },
    { label: 'Validation Completed', status: 'VALIDATED', time: '1.4s', icon: CheckCircle2, detail: 'Cross-checked with regional guidelines' },
    { label: 'Ready to Submit', status: 'READY', time: '1.6s', icon: Shield, detail: 'User approval required before transmission' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % heroSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col justify-between border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      {/* Background Subtle Lines */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-6 divide-x divide-[#0A0A0A]/5 opacity-60 max-w-7xl mx-auto px-6 md:px-12">
        <div />
        <div />
        <div />
        <div />
        <div className="hidden md:block" />
        <div className="hidden md:block" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Top Tagline */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-10 bg-[#0A0A0A]"></div>
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#666666]">
            THE NEXT-GEN FORM COPILOT
          </span>
        </div>

        {/* Editorial Headline & Supporting Paragraph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
          <div className="lg:col-span-7">
            <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[0.9] text-[#0A0A0A] uppercase break-words">
              FORMS<br />
              WITHOUT<br />
              <span className="font-serif-editorial italic font-normal text-[#171717]">THE FRICTION.</span>
            </h1>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 pb-2">
            <div>
              <p className="text-base sm:text-lg font-normal leading-relaxed text-[#171717] font-sans-clean max-w-xl">
                Understand every field. Answer naturally. Validate before you submit. FormPilot AI transforms complex PDFs, scans, and paperwork into effortless, submission-ready forms.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onOpenUploadModal}
                className="group relative px-7 py-4 bg-[#0A0A0A] text-[#F3F1EC] text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#1677FF] flex items-center justify-between shadow-xl"
              >
                <span>START WITH A FORM</span>
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#journey"
                className="px-7 py-4 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-[#F3F1EC] transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                <span>SEE HOW IT WORKS</span>
                <Play className="w-3 h-3 fill-current" />
              </a>
            </div>
          </div>
        </div>


        {/* Cinematic Visual Frame with Live Interactive UI */}
        <div className="mt-8 relative border border-[#0A0A0A] bg-[#0A0A0A] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Image Section */}
            <div className="lg:col-span-7 relative min-h-[380px] md:min-h-[480px]">
              <img
                src="/images/hero.jpg"
                alt="FormPilot AI Cinematic Interface"
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 contrast-125 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80 lg:opacity-40"></div>
              
              {/* Overlay Badge */}
              <div className="absolute top-6 left-6 bg-[#0A0A0A]/90 backdrop-blur-md px-4 py-2 border border-[#F3F1EC]/20 text-[#F3F1EC] font-mono text-xs tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-ping"></span>
                <span>SYSTEM ACTIVE • CONFIDENCE 99.4%</span>
              </div>
            </div>

            {/* Right Interactive Live Status Panel */}
            <div className="lg:col-span-5 bg-[#0A0A0A] p-6 md:p-8 text-[#F3F1EC] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#F3F1EC]/15">
              <div>
                <div className="flex items-center justify-between border-b border-[#F3F1EC]/15 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#1677FF]" />
                    <span className="font-mono text-xs uppercase text-[#D8D6D0] tracking-widest">REAL-TIME COPILOT PIPELINE</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#1677FF]/20 text-[#1677FF] px-2 py-0.5 border border-[#1677FF]/40">
                    LIVE DEMO
                  </span>
                </div>

                {/* Simulated Steps */}
                <div className="space-y-4">
                  {heroSteps.map((step, idx) => {
                    const IconComp = step.icon;
                    const isActive = activeStep === idx;
                    const isPassed = activeStep > idx;

                    return (
                      <div
                        key={step.label}
                        onClick={() => setActiveStep(idx)}
                        className={`p-3.5 border transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-[#171717] border-[#1677FF] translate-x-1 shadow-lg'
                            : isPassed
                            ? 'bg-[#0A0A0A] border-[#F3F1EC]/20 text-[#D8D6D0]'
                            : 'bg-[#0A0A0A] border-[#F3F1EC]/10 text-[#666666]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <IconComp
                              className={`w-4 h-4 ${
                                isActive
                                  ? 'text-[#1677FF]'
                                  : isPassed
                                  ? 'text-[#F3F1EC]'
                                  : 'text-[#666666]'
                              }`}
                            />
                            <span className="font-mono text-xs font-bold tracking-wider">{step.label}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                            isActive
                              ? 'border-[#1677FF] text-[#1677FF]'
                              : isPassed
                              ? 'border-emerald-500/50 text-emerald-400'
                              : 'border-white/10 text-gray-500'
                          }`}>
                            {isPassed ? '✓ PASSED' : isActive ? '● EXECUTING' : 'QUEUED'}
                          </span>
                        </div>
                        {isActive && (
                          <p className="text-xs text-[#D8D6D0] font-sans-clean mt-2 pl-7 border-l-2 border-[#1677FF] py-0.5">
                            {step.detail}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Interactive Bar */}
              <div className="pt-6 mt-6 border-t border-[#F3F1EC]/15 flex items-center justify-between">
                <div className="text-xs text-[#D8D6D0] font-mono">
                  Current Status: <span className="text-[#1677FF] font-bold">{heroSteps[activeStep].label}</span>
                </div>
                <button
                  onClick={onOpenUploadModal}
                  className="px-4 py-2 bg-[#F3F1EC] text-[#0A0A0A] hover:bg-[#1677FF] hover:text-[#F3F1EC] text-[11px] font-mono font-bold tracking-wider transition-colors uppercase"
                >
                  TEST WITH YOUR FORM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
