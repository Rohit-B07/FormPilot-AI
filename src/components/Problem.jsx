import React from 'react';
import { HelpCircle, RefreshCw, FileQuestion, Globe2, AlertCircle, XCircle } from 'lucide-react';

export default function Problem() {
  const painPoints = [
    {
      title: 'CONFUSING QUESTIONS',
      desc: 'Legalese and ambiguous phrasing cause users to enter incorrect information.',
      icon: HelpCircle,
    },
    {
      title: 'REPETITIVE DATA ENTRY',
      desc: 'Re-typing the exact same name, SSN, address, and credentials across 20-page packets.',
      icon: RefreshCw,
    },
    {
      title: 'MISSING DOCUMENTS',
      desc: 'Submitting applications without mandatory proof certificates leading to instant rejection.',
      icon: FileQuestion,
    },
    {
      title: 'LANGUAGE BARRIERS',
      desc: 'Non-native speakers struggle with state-specific terms and bureaucratic syntax.',
      icon: Globe2,
    },
    {
      title: 'HIDDEN REQUIREMENTS',
      desc: 'Fine print regulations on line 17C that result in weeks of delay if overlooked.',
      icon: AlertCircle,
    },
    {
      title: 'REJECTION & REWORK',
      desc: 'Millions of forms are sent back every year due to minor formatting discrepancies.',
      icon: XCircle,
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      <div className="max-w-7xl mx-auto">
        {/* Section Tag */}
        <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-4">
          02 // THE FRICTION REALITY
        </div>

        {/* Large Editorial Headline */}
        <div className="mb-16">
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] text-[#0A0A0A] uppercase">
            FORMS WERE BUILT<br />
            FOR SYSTEMS.<br />
            <span className="font-serif-editorial italic font-normal text-[#171717]">NOT PEOPLE.</span>
          </h2>
        </div>

        {/* Split Section: Image & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Documentary Photo */}
          <div className="lg:col-span-5 border border-[#0A0A0A] relative min-h-[420px] bg-[#0A0A0A] overflow-hidden">
            <img
              src="/images/problem.jpg"
              alt="Bureaucratic paperwork burden"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 contrast-125 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90"></div>
            
            <div className="absolute bottom-6 left-6 right-6 text-[#F3F1EC]">
              <div className="font-mono text-xs text-[#1677FF] uppercase mb-1">FACT CHECK</div>
              <p className="font-editorial text-2xl font-bold tracking-tight uppercase leading-snug">
                73% of rejected applications fail due to simple field misunderstandings and missing attachments.
              </p>
            </div>
          </div>

          {/* Right Pain Points Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#0A0A0A]/20 border border-[#0A0A0A]/20">
            {painPoints.map((point) => {
              const IconComp = point.icon;
              return (
                <div key={point.title} className="bg-[#F3F1EC] p-6 flex flex-col justify-between hover:bg-white transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <IconComp className="w-5 h-5 text-[#0A0A0A]" />
                      <span className="text-[10px] font-mono text-[#666666]">SYSTEM FAILURE</span>
                    </div>
                    <h3 className="font-editorial text-lg font-bold tracking-tight text-[#0A0A0A] mb-2 uppercase">
                      {point.title}
                    </h3>
                    <p className="text-xs text-[#666666] font-sans-clean leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
