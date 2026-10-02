import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Problem from './components/Problem';
import ProductDemo from './components/ProductDemo';
import Comparison from './components/Comparison';
import UseCases from './components/UseCases';
import Trust from './components/Trust';
import CTA from './components/CTA';
import Footer from './components/Footer';
import FormUploadModal from './components/FormUploadModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Load existing session on initial render
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('formpilot_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('formpilot_user');
    }
  }, []);

  const handleOpenAuthModal = (mode = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    // After login, launch the form copilot workspace directly
    setUploadModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('formpilot_user');
    localStorage.removeItem('formpilot_token');
    setCurrentUser(null);
  };

  const handleOpenUploadModal = () => {
    if (!currentUser) {
      // Prompt user to sign in or use demo first
      handleOpenAuthModal('signin');
    } else {
      setUploadModalOpen(true);
    }
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F1EC] text-[#0A0A0A] font-sans-clean selection:bg-[#0A0A0A] selection:text-[#F3F1EC]">
      {/* Fixed Editorial Header Navigation */}
      <Navbar
        onOpenAuthModal={handleOpenAuthModal}
        onOpenUploadModal={handleOpenUploadModal}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main>
        {/* Hero Section */}
        <Hero onOpenUploadModal={handleOpenUploadModal} />

        {/* 5-Step Journey Section */}
        <Journey onOpenUploadModal={handleOpenUploadModal} />

        {/* Problem Section */}
        <Problem />

        {/* Live Copilot Product Interactive Demo */}
        <ProductDemo onOpenUploadModal={handleOpenUploadModal} />

        {/* Differentiation & Comparison Matrix */}
        <Comparison onOpenUploadModal={handleOpenUploadModal} />

        {/* Real Life Use Cases Grid */}
        <UseCases onOpenUploadModal={handleOpenUploadModal} />

        {/* Trust & Principles */}
        <Trust />

        {/* Final Editorial Call to Action */}
        <CTA onOpenUploadModal={handleOpenUploadModal} />
      </main>

      {/* Footer */}
      <Footer onOpenUploadModal={handleOpenUploadModal} />

      {/* Auth Modal (Login / Sign Up / Instant Demo) */}
      <AuthModal
        isOpen={authModalOpen}
        defaultMode={authMode}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Interactive Form Copilot Modal */}
      <FormUploadModal isOpen={uploadModalOpen} onClose={handleCloseUploadModal} />
    </div>
  );
}
