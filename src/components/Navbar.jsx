import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, LogOut, Sparkles, UserCheck } from 'lucide-react';

export default function Navbar({ onOpenAuthModal, onOpenUploadModal, currentUser, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'HOW IT WORKS', href: '#journey' },
    { name: 'FEATURES', href: '#product' },
    { name: 'USE CASES', href: '#use-cases' },
    { name: 'ABOUT', href: '#trust' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F3F1EC]/90 backdrop-blur-md border-b border-[#0A0A0A]/10 py-4 shadow-sm'
          : 'bg-transparent py-6 border-b border-[#0A0A0A]/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-[#0A0A0A] flex items-center justify-center text-[#F3F1EC] text-xs font-mono font-bold tracking-tighter">
            FP
          </div>
          <span className="font-editorial text-lg md:text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase group-hover:text-[#1677FF] transition-colors">
            FORMPILOT <span className="text-[#1677FF] font-sans text-xs uppercase tracking-widest px-1.5 py-0.5 border border-[#1677FF]/30 ml-1">AI</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold tracking-widest text-[#171717]/80 hover:text-[#0A0A0A] hover:underline underline-offset-8 transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold tracking-widest text-[#171717]/80 hover:text-[#0A0A0A] flex items-center gap-1 transition-colors"
          >
            GITHUB <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#0A0A0A]/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-[#0A0A0A]">{currentUser.fullName || currentUser.email}</span>
              </div>
              <button
                onClick={onOpenUploadModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] hover:bg-[#1677FF] text-[#F3F1EC] text-xs font-bold tracking-wider uppercase transition-all shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-[#1677FF] group-hover:text-white" />
                <span>OPEN WORKSPACE</span>
              </button>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-[#666666] hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="text-xs font-semibold tracking-widest text-[#0A0A0A] hover:text-[#1677FF] transition-colors"
              >
                LOGIN
              </button>
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="group relative inline-flex items-center justify-center px-5 py-2.5 bg-[#0A0A0A] text-[#F3F1EC] text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#1677FF] shadow-md hover:shadow-lg"
              >
                <span>GET STARTED</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#0A0A0A] hover:opacity-75 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#F3F1EC] border-b border-[#0A0A0A]/15 px-6 py-8 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold tracking-widest text-[#0A0A0A] border-b border-[#0A0A0A]/10 pb-3"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-2">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 p-3 bg-white border border-[#0A0A0A]/10 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Logged in as <strong>{currentUser.fullName || currentUser.email}</strong></span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUploadModal();
                  }}
                  className="w-full text-center py-3 bg-[#0A0A0A] text-[#F3F1EC] text-xs font-bold tracking-widest uppercase hover:bg-[#1677FF] transition-colors"
                >
                  LAUNCH WORKSPACE
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-center py-2 text-xs text-red-600 border border-red-200"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('signup');
                  }}
                  className="w-full text-center py-3 bg-[#0A0A0A] text-[#F3F1EC] text-xs font-bold tracking-widest uppercase hover:bg-[#1677FF] transition-colors"
                >
                  GET STARTED
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('signin');
                  }}
                  className="w-full text-center py-2.5 bg-white border border-[#0A0A0A]/20 text-[#0A0A0A] text-xs font-bold tracking-widest uppercase hover:border-[#1677FF]"
                >
                  LOGIN
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
