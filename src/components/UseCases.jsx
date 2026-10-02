import React from 'react';
import { ArrowUpRight, GraduationCap, Building2, Landmark, Stethoscope, Briefcase, Building } from 'lucide-react';

export default function UseCases({ onOpenUploadModal }) {
  const useCases = [
    {
      title: 'SCHOLARSHIPS',
      subtitle: 'Admissions, scholarships and education forms.',
      desc: 'Financial aid applications, university admission forms, grant applications, and fee waiver requests parsed with 100% precision.',
      image: '/images/scholarship.jpg',
      icon: GraduationCap,
      stats: '4.2M Forms Filled'
    },
    {
      title: 'GOVERNMENT SERVICES',
      subtitle: 'Applications, certificates and public-service forms.',
      desc: 'Passports, tax declarations, civic registration, state welfare schemes, visa applications, and identity renewals handled smoothly.',
      image: '/images/government.jpg',
      icon: Building2,
      stats: '99.8% Compliance'
    },
    {
      title: 'BANKING & INSURANCE',
      subtitle: 'Applications, KYC and financial paperwork.',
      desc: 'Mortgage applications, account opening KYC packets, insurance claims, commercial credit disclosures, and loan verification forms.',
      image: '/images/hero.jpg',
      icon: Landmark,
      stats: 'Bank Grade Security'
    },
    {
      title: 'HEALTHCARE',
      subtitle: 'Administrative and patient forms.',
      desc: 'Medical history intake, patient onboarding, insurance reimbursement, consent waivers, and disability benefits paperwork.',
      image: '/images/problem.jpg',
      icon: Stethoscope,
      stats: 'HIPAA Compliant'
    },
    {
      title: 'HR & ONBOARDING',
      subtitle: 'Employee paperwork and internal processes.',
      desc: 'I-9 verification, tax withholding certificates (W-4), direct deposit setups, non-disclosure agreements, and benefits enrollment.',
      image: '/images/scholarship.jpg',
      icon: Briefcase,
      stats: 'Instant Processing'
    },
    {
      title: 'BUSINESS',
      subtitle: 'Registrations, licenses and compliance forms.',
      desc: 'LLC filings, municipal business permits, trademark registration, vendor onboarding packets, and annual regulatory compliance.',
      image: '/images/government.jpg',
      icon: Building,
      stats: 'Audit Ready'
    },
  ];

  return (
    <section id="use-cases" className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 mb-16">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-3">
              05 // UNIVERSAL ADAPTABILITY
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-[#0A0A0A] uppercase">
              BUILT FOR REAL LIFE.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-[#171717] max-w-md text-sm font-sans-clean leading-relaxed">
            From high-stakes government applications to everyday administrative paperwork—FormPilot AI adapts to any document schema.
          </p>
        </div>

        {/* Editorial Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((uc) => {
            const IconComponent = uc.icon;
            return (
              <div
                key={uc.title}
                onClick={onOpenUploadModal}
                className="group border border-[#0A0A0A] bg-[#0A0A0A] text-[#F3F1EC] flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#1677FF] transition-all duration-500 shadow-lg"
              >
                {/* Top Image Container with Monochrome Filter */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={uc.image}
                    alt={uc.title}
                    className="w-full h-full object-cover grayscale brightness-90 contrast-125 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90"></div>

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="p-2 bg-[#0A0A0A]/90 text-[#F3F1EC] border border-[#F3F1EC]/20 backdrop-blur-md">
                      <IconComponent className="w-4 h-4 text-[#1677FF]" />
                    </span>
                    <span className="font-mono text-[10px] bg-[#1677FF]/20 text-[#1677FF] border border-[#1677FF]/40 px-2 py-0.5 uppercase tracking-wider">
                      {uc.stats}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-editorial text-2xl font-extrabold tracking-tight uppercase text-[#F3F1EC] group-hover:text-[#1677FF] transition-colors">
                      {uc.title}
                    </h3>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4 bg-[#0A0A0A]">
                  <div>
                    <h4 className="font-mono text-xs text-[#D8D6D0] font-bold mb-2 uppercase">
                      {uc.subtitle}
                    </h4>
                    <p className="text-xs text-[#666666] font-sans-clean leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F3F1EC]/15 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#D8D6D0]">START WITH THIS FORM</span>
                    <ArrowUpRight className="w-4 h-4 text-[#1677FF] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
