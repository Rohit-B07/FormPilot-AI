import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Mic, Sparkles, Download, ArrowRight, ShieldCheck, RefreshCw, Eye } from 'lucide-react';

export default function FormUploadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState('UPLOAD'); // UPLOAD -> EXTRACT -> ANSWER -> REVIEW
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const presetForms = [
    {
      id: 'scholarship',
      title: 'National Merit Scholarship Application.pdf',
      type: 'PDF • 3 Pages',
      fieldsCount: 28,
      missingCount: 2,
      presetValues: {
        'Applicant Name': 'Alex Rivera',
        'Date of Birth': '22/10/2002',
        'Institution': 'Stanford University',
        'Annual Household Influx': 'Needs Input',
        'Income Tax Certificate': 'Missing PDF Attachment'
      }
    },
    {
      id: 'passport',
      title: 'Passport Renewal Form DS-11.pdf',
      type: 'PDF • 2 Pages',
      fieldsCount: 19,
      missingCount: 1,
      presetValues: {
        'Full Legal Name': 'Morgan Vance',
        'Social Security Number': '***-**-4910',
        'Previous Passport No.': 'Z-84920419',
        'Emergency Contact': 'Needs Input'
      }
    },
    {
      id: 'health',
      title: 'Patient Medical History Intake.pdf',
      type: 'Scan • 1 Page',
      fieldsCount: 14,
      missingCount: 1,
      presetValues: {
        'Patient Full Name': 'Sam Taylor',
        'Primary Insurance Provider': 'Blue Cross Shield',
        'Allergies Disclosure': 'Penicillin, Shellfish',
        'Emergency Medical Contact': 'Needs Input'
      }
    }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setActiveStep('EXTRACT');
    setTimeout(() => {
      setActiveStep('ANSWER');
    }, 1500);
  };

  const [naturalAnswer, setNaturalAnswer] = useState('');
  const [mappedSuccess, setMappedSuccess] = useState(false);
  const [voiceSimulating, setVoiceSimulating] = useState(false);

  const handleVoiceSimulate = () => {
    setVoiceSimulating(true);
    setTimeout(() => {
      setNaturalAnswer('My annual household income is 4,500 dollars and emergency contact is Sarah Rivera 555-0192.');
      setVoiceSimulating(false);
    }, 1600);
  };

  const handleApplyMapping = () => {
    if (!naturalAnswer.trim()) return;
    setMappedSuccess(true);
    setTimeout(() => {
      setActiveStep('REVIEW');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#F3F1EC] border-2 border-[#0A0A0A] max-w-4xl w-full p-6 md:p-10 text-[#0A0A0A] relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0A0A0A]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0A0A0A] text-[#F3F1EC] flex items-center justify-center font-mono font-bold text-xs">
              FP
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-bold tracking-tight uppercase">
                FORMPILOT COPILOT WORKSPACE
              </h2>
              <p className="text-xs font-mono text-[#666666]">
                AI-POWERED FIELD MAPPER & AUDITOR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F3F1EC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 mb-8 font-mono text-xs">
          {[
            { id: 'UPLOAD', label: '01 SELECT FORM' },
            { id: 'EXTRACT', label: '02 AI EXTRACTION' },
            { id: 'ANSWER', label: '03 SPEAK / MAP' },
            { id: 'REVIEW', label: '04 VALIDATED' },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-2.5 border text-center font-bold transition-colors ${
                activeStep === s.id
                  ? 'bg-[#0A0A0A] text-[#F3F1EC] border-[#0A0A0A]'
                  : 'bg-white border-[#0A0A0A]/20 text-[#666666]'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* STEP 1: UPLOAD OR SELECT PRESET */}
        {activeStep === 'UPLOAD' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleSelectPreset(presetForms[0]);
              }}
              className={`border-2 border-dashed p-10 text-center transition-all bg-white cursor-pointer ${
                dragOver ? 'border-[#1677FF] bg-[#1677FF]/5' : 'border-[#0A0A0A]/30 hover:border-[#0A0A0A]'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-[#0A0A0A]" />
              <h3 className="font-editorial text-2xl font-bold uppercase mb-2">
                DRAG & DROP ANY FORM HERE
              </h3>
              <p className="text-xs text-[#666666] font-sans-clean max-w-md mx-auto mb-4">
                Supports PDFs, Scans, JPGs, PNGs. FormPilot automatically runs neural vision OCR and parses field coordinates.
              </p>
              <button
                onClick={() => handleSelectPreset(presetForms[0])}
                className="px-6 py-3 bg-[#0A0A0A] text-[#F3F1EC] hover:bg-[#1677FF] text-xs font-mono font-bold uppercase tracking-wider transition-colors"
              >
                BROWSE FILES FROM DEVICE
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#0A0A0A]/15"></div>
              <span className="flex-shrink mx-4 font-mono text-xs text-[#666666] uppercase">OR TEST WITH SAMPLE PRESETS</span>
              <div className="flex-grow border-t border-[#0A0A0A]/15"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presetForms.map((pf) => (
                <div
                  key={pf.id}
                  onClick={() => handleSelectPreset(pf)}
                  className="p-5 border border-[#0A0A0A] bg-white hover:border-[#1677FF] cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FileText className="w-5 h-5 text-[#0A0A0A] group-hover:text-[#1677FF]" />
                      <span className="font-mono text-[10px] bg-[#0A0A0A]/10 px-2 py-0.5">{pf.type}</span>
                    </div>
                    <h4 className="font-editorial font-bold text-base uppercase leading-snug mb-2">
                      {pf.title}
                    </h4>
                    <p className="text-xs font-mono text-[#666666]">
                      {pf.fieldsCount} parsed fields • {pf.missingCount} missing flags
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#0A0A0A]/10 text-xs font-mono font-bold text-[#1677FF] flex items-center justify-between">
                    <span>LOAD PRESET</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: EXTRACTING FIELDS */}
        {activeStep === 'EXTRACT' && (
          <div className="py-16 text-center space-y-6">
            <RefreshCw className="w-12 h-12 text-[#1677FF] animate-spin mx-auto" />
            <h3 className="font-editorial text-3xl font-extrabold uppercase">
              ANALYZING DOCUMENT SCHEMA...
            </h3>
            <p className="text-xs font-mono text-[#666666] max-w-md mx-auto">
              Running layoutLM neural model • Identifying target line coordinates • Detecting required field dependencies
            </p>
          </div>
        )}

        {/* STEP 3: NATURAL ANSWER & MAPPING */}
        {activeStep === 'ANSWER' && selectedPreset && (
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] text-[#F3F1EC] p-6 border border-[#0A0A0A] font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-[#F3F1EC]/20 pb-2">
                <span className="text-[#1677FF] font-bold">ACTIVE FORM: {selectedPreset.title}</span>
                <span className="text-[#D8D6D0]">STATUS: 2 FIELDS NEED INPUT</span>
              </div>
              <div className="space-y-1 text-[#D8D6D0]">
                {Object.entries(selectedPreset.presetValues).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{k}:</span>
                    <span className={v.includes('Input') || v.includes('Missing') ? 'text-yellow-400 font-bold' : 'text-emerald-400'}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border border-[#0A0A0A] space-y-4">
              <h4 className="font-editorial text-lg font-bold uppercase">
                AI COPILOT QUESTION:
              </h4>
              <p className="text-sm font-sans-clean text-[#171717]">
                "Please state your annual household income and emergency contact details. You can speak or type in any style."
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleVoiceSimulate}
                    disabled={voiceSimulating}
                    className="px-4 py-3 bg-[#1677FF] text-white hover:bg-[#1677FF]/90 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{voiceSimulating ? 'SIMULATING SPEECH INPUT...' : 'SIMULATE VOICE SPEECH'}</span>
                  </button>

                  <input
                    type="text"
                    value={naturalAnswer}
                    onChange={(e) => setNaturalAnswer(e.target.value)}
                    placeholder="Or type natural answer here..."
                    className="flex-1 px-4 py-3 border border-[#0A0A0A]/30 text-xs font-sans-clean focus:outline-none focus:border-[#1677FF]"
                  />
                </div>

                <button
                  onClick={handleApplyMapping}
                  className="w-full py-3.5 bg-[#0A0A0A] text-[#F3F1EC] hover:bg-[#1677FF] font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#1677FF]" />
                  <span>MAP ANSWER TO FORM FIELDS & VALIDATE</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & DOWNLOAD SUBMISSION */}
        {activeStep === 'REVIEW' && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 border border-emerald-600 text-emerald-900 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>FORM VALIDATION 100% SUCCESSFUL</span>
              </div>
              <p className="font-sans-clean text-xs">
                All mandatory lines mapped with zero ambiguous values. Form is completely submission-ready.
              </p>
            </div>

            <div className="bg-[#0A0A0A] text-[#F3F1EC] p-6 font-mono text-xs space-y-3 border border-[#0A0A0A]">
              <div className="text-[#1677FF] font-bold text-sm border-b border-[#F3F1EC]/15 pb-2">
                FINAL PARSED MATRIX:
              </div>
              <div className="space-y-1.5 text-[#D8D6D0]">
                <div>✓ Applicant Name: Alex Rivera</div>
                <div>✓ Date of Birth: 22/10/2002</div>
                <div>✓ Institution: Stanford University</div>
                <div>✓ Annual Household Influx: $4,500 USD (Mapped from Voice)</div>
                <div>✓ Emergency Contact: Sarah Rivera (555-0192)</div>
                <div>✓ Rule Integrity: Checked against State Policy Manual 2026</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => {
                  setActiveStep('UPLOAD');
                  setSelectedPreset(null);
                  setNaturalAnswer('');
                }}
                className="px-6 py-3.5 border border-[#0A0A0A] text-xs font-mono font-bold uppercase hover:bg-[#0A0A0A] hover:text-[#F3F1EC] transition-colors"
              >
                TEST ANOTHER FORM
              </button>

              <button
                onClick={() => {
                  alert('FormPilot PDF Export generated cleanly!');
                  onClose();
                }}
                className="flex-1 px-6 py-3.5 bg-[#0A0A0A] text-[#F3F1EC] hover:bg-[#1677FF] text-xs font-mono font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD SUBMISSION-READY PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
