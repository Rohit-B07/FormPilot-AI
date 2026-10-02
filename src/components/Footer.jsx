import React from 'react';
import { ArrowUp, Code2, Globe, Share2, Shield } from 'lucide-react';

export default function Footer({ onOpenUploadModal }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A0A0A] text-[#F3F1EC] pt-20 pb-12 px-6 md:px-12 border-t border-[#F3F1EC]/15">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#F3F1EC]/15">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#F3F1EC] text-[#0A0A0A] flex items-center justify-center text-xs font-mono font-bold tracking-tighter">
                FP
              </div>
              <span className="font-editorial text-2xl font-extrabold tracking-tight text-[#F3F1EC] uppercase">
                FORMPILOT <span className="text-[#1677FF] font-sans text-xs px-1.5 py-0.5 border border-[#1677FF]/40">AI</span>
              </span>
            </div>

            <p className="text-sm font-sans-clean text-[#D8D6D0] max-w-sm leading-relaxed">
              "Your AI Copilot for Every Form." <br />
              Eliminating administrative friction for citizens, students, patients, and workforce worldwide.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-[#666666]">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Code2 className="w-4 h-4" /> GITHUB
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Globe className="w-4 h-4" /> TWITTER
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Share2 className="w-4 h-4" /> LINKEDIN
              </a>
            </div>
          </div>


          {/* Quick Links Column 1 */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs font-bold text-[#1677FF] uppercase tracking-wider">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#D8D6D0]">
              <li><a href="#home" className="hover:text-white transition-colors">HOME</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">HOW IT WORKS</a></li>
              <li><a href="#product" className="hover:text-white transition-colors">FEATURES</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">USE CASES</a></li>
              <li><a href="#trust" className="hover:text-white transition-colors">PRIVACY & TRUST</a></li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs font-bold text-[#1677FF] uppercase tracking-wider">
              GET IN TOUCH
            </h4>
            <p className="text-xs font-sans-clean text-[#D8D6D0] leading-relaxed">
              Have a custom form schema or enterprise integration request? Speak to our engineering team.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenUploadModal}
                className="px-5 py-2.5 border border-[#F3F1EC]/30 hover:border-[#1677FF] hover:text-[#1677FF] text-xs font-mono font-bold uppercase tracking-wider transition-colors"
              >
                REQUEST ENTERPRISE COPILOT
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#666666]">
          <div>
            © {new Date().getFullYear()} FORMPILOT AI INC. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-6">
            <a href="#trust" className="hover:underline">PRIVACY POLICY</a>
            <a href="#trust" className="hover:underline">TERMS OF SERVICE</a>
            <a href="#trust" className="hover:underline">SECURITY AUDIT</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono text-[#D8D6D0] hover:text-[#1677FF] transition-colors"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
