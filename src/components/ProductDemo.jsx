import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Mic, Send, Volume2, Sparkles, ShieldCheck, ArrowRight, RefreshCw, FileText } from 'lucide-react';

export default function ProductDemo({ onOpenUploadModal }) {
  const [formFields, setFormFields] = useState([
    { id: 1, name: 'Full Name', value: 'Eleanor Vance', status: 'VALID', type: 'Text' },
    { id: 2, name: 'Date of Birth', value: '14 / 08 / 1994', status: 'VALID', type: 'Date' },
    { id: 3, name: 'Address', value: '742 Evergreen Terrace, Springfield', status: 'VALID', type: 'Address' },
    { id: 4, name: 'Email', value: 'eleanor.vance@example.com', status: 'VALID', type: 'Email' },
    { id: 5, name: 'Annual Family Income', value: '3,00,000 INR ($3,600 USD)', status: 'WARNING', type: 'Currency', isTarget: true },
    { id: 6, name: 'Income Certificate', value: 'Pending Document Attachment', status: 'WARNING', type: 'File' },
  ]);

  const [voiceActive, setVoiceActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'AI', text: 'Your annual family income is required. You can answer by typing or speaking naturally.' }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const simulateVoiceInput = () => {
    setVoiceActive(true);
    setTimeout(() => {
      setUserInput('Meri annual family income 3 lakh hai.');
      setVoiceActive(false);
    }, 1800);
  };

  const handleSendMessage = (textToSend) => {
    const messageText = textToSend || userInput;
    if (!messageText.trim()) return;

    setIsProcessing(true);
    const newLogs = [...chatLog, { sender: 'USER', text: messageText }];
    setChatLog(newLogs);
    setUserInput('');

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Mapped to: Annual Family Income ($3,600 / ₹3,00,000). Field validated.',
          mappedField: 'Annual Family Income',
          confidence: '99.2%'
        }
      ]);

      // Update form state
      setFormFields((prev) =>
        prev.map((field) =>
          field.name === 'Annual Family Income'
            ? { ...field, status: 'VALID', value: '₹3,00,000 / $3,600 (Verified)' }
            : field
        )
      );
      setIsProcessing(false);
    }, 1200);
  };

  const completedCount = formFields.filter((f) => f.status === 'VALID').length;
  const completionPercent = Math.round((completedCount / formFields.length) * 100);

  return (
    <section id="product" className="py-24 px-6 md:px-12 border-b border-[#0A0A0A]/10 bg-[#F3F1EC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A0A0A] pb-8 mb-16">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#666666] uppercase mb-3">
              03 // INTERACTIVE SIMULATION
            </div>
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-[#0A0A0A] uppercase">
              ONE COPILOT.<br />
              EVERY FORM.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-[#171717] max-w-md text-sm font-sans-clean leading-relaxed">
            Interact with the FormPilot engine live. Speak or type in your native dialect—our copilot maps context directly to strict form fields.
          </p>
        </div>

        {/* Realistic FormPilot UI Container */}
        <div className="border border-[#0A0A0A] bg-[#0A0A0A] text-[#F3F1EC] shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="bg-[#171717] px-6 py-4 border-b border-[#F3F1EC]/15 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="font-mono text-xs text-[#D8D6D0] ml-2 font-bold tracking-wider">
                FORMPILOT WORKSPACE v2.4 • [NATIONAL SCHOLARSHIP APPLICATION]
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#666666]">FORM STATUS:</span>
                <span className="px-2 py-0.5 bg-[#1677FF]/20 text-[#1677FF] border border-[#1677FF]/40 font-bold animate-pulse">
                  ● {completionPercent}% COMPLETE
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#F3F1EC]/15">
            {/* Left Panel: Form Fields Checklist */}
            <div className="lg:col-span-5 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#F3F1EC]/15 pb-4">
                <h3 className="font-editorial text-lg font-bold tracking-wider uppercase text-[#F3F1EC]">
                  EXTRACTED FORM FIELDS
                </h3>
                <span className="text-xs font-mono text-[#D8D6D0]">{completedCount}/{formFields.length} DONE</span>
              </div>

              <div className="space-y-3">
                {formFields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-3.5 border transition-all ${
                      field.status === 'VALID'
                        ? 'bg-[#171717]/60 border-[#F3F1EC]/15'
                        : 'bg-[#1677FF]/10 border-[#1677FF] shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {field.status === 'VALID' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#1677FF] animate-bounce" />
                        )}
                        <span className="font-mono text-xs font-bold">{field.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                        field.status === 'VALID'
                          ? 'border-emerald-500/30 text-emerald-400'
                          : 'border-[#1677FF] text-[#1677FF] font-bold'
                      }`}>
                        {field.status === 'VALID' ? 'VALIDATED' : 'NEEDS INPUT'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-sans-clean text-[#D8D6D0] pl-7 flex justify-between">
                      <span className="truncate max-w-[240px]">{field.value}</span>
                      <span className="font-mono text-[10px] text-[#666666]">{field.type}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Summary */}
              <div className="pt-4 border-t border-[#F3F1EC]/15 space-y-2 font-mono text-xs text-[#D8D6D0]">
                <div className="text-[#666666] font-bold uppercase tracking-wider text-[10px] mb-1">
                  SYSTEM INTEGRITY REPORT
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Required fields format validated</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>No conflicting personal information</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Income certificate attachment optional for preliminary review</span>
                </div>
              </div>
            </div>

            {/* Right Panel: AI Assistant Chat & Voice Input */}
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-[#F3F1EC]/15 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1677FF]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F1EC]">
                      AI ASSISTANT INTERACTION
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#D8D6D0]">MULTILINGUAL PARSER ONLINE</span>
                </div>

                {/* Chat Log Window */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                  {chatLog.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 border text-xs font-sans-clean ${
                        msg.sender === 'AI'
                          ? 'bg-[#171717] border-[#F3F1EC]/20 text-[#F3F1EC]'
                          : 'bg-[#1677FF]/20 border-[#1677FF] text-[#F3F1EC] ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-[#666666]">
                        <span>{msg.sender === 'AI' ? 'FORMPILOT AI' : 'YOU (VOICE/TEXT)'}</span>
                        {msg.confidence && (
                          <span className="text-[#1677FF]">CONFIDENCE: {msg.confidence}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{msg.text}</p>
                      {msg.mappedField && (
                        <div className="mt-2 inline-block px-2 py-0.5 bg-[#1677FF] text-white text-[10px] font-mono uppercase font-bold">
                          Mapped to: {msg.mappedField}
                        </div>
                      )}
                    </div>
                  ))}

                  {isProcessing && (
                    <div className="p-4 bg-[#171717] border border-[#1677FF] text-xs font-mono text-[#1677FF] flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing natural language audio waveform...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice & Input Controls */}
              <div className="space-y-4 pt-4 border-t border-[#F3F1EC]/15">
                {/* Voice Simulation Preset */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={simulateVoiceInput}
                    disabled={voiceActive}
                    className={`w-full sm:w-auto px-4 py-3 border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      voiceActive
                        ? 'bg-[#1677FF] border-[#1677FF] text-white animate-pulse'
                        : 'bg-[#171717] border-[#F3F1EC]/30 text-[#F3F1EC] hover:border-[#1677FF]'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-[#1677FF]" />
                    <span>{voiceActive ? 'LISTENING TO SPEECH...' : 'SIMULATE VOICE INPUT'}</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Meri annual family income 3 lakh hai.')}
                    className="w-full sm:w-auto px-4 py-3 bg-[#171717] border border-[#F3F1EC]/20 hover:border-[#F3F1EC] text-[#D8D6D0] text-xs font-mono truncate transition-all text-left"
                  >
                    Sample Speech: <span className="text-white italic">"Meri annual family income 3 lakh hai."</span>
                  </button>
                </div>

                {/* Text Input Row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type answer in plain words (e.g. My annual family income is $3,600)..."
                    className="flex-1 px-4 py-3 bg-[#171717] border border-[#F3F1EC]/20 text-xs font-sans-clean text-[#F3F1EC] placeholder-[#666666] focus:outline-none focus:border-[#1677FF]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-5 py-3 bg-[#1677FF] text-white hover:bg-[#1677FF]/90 font-bold text-xs tracking-wider transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Submission CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs font-mono text-[#D8D6D0]">
                    Strict Human Verification Enabled before Final Dispatch.
                  </span>

                  <button
                    onClick={() => setSubmitted(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#F3F1EC] text-[#0A0A0A] hover:bg-[#1677FF] hover:text-[#F3F1EC] text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>REVIEW & SUBMIT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submitted Confirmation Modal Overlay */}
        {submitted && (
          <div className="fixed inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#F3F1EC] border-2 border-[#0A0A0A] max-w-xl w-full p-8 space-y-6 text-[#0A0A0A] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[#0A0A0A]/20 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#1677FF]" />
                  <h3 className="font-editorial text-2xl font-bold uppercase">SUBMISSION READY</h3>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-mono text-xs font-bold hover:underline"
                >
                  CLOSE [X]
                </button>
              </div>

              <p className="text-sm font-sans-clean leading-relaxed text-[#171717]">
                Your form has passed all structural integrity checks, field mapping validations, and rules compliance. No missing required fields detected.
              </p>

              <div className="p-4 bg-[#0A0A0A] text-[#F3F1EC] font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Target Portal:</span>
                  <span className="text-[#1677FF]">State Scholarship Service</span>
                </div>
                <div className="flex justify-between">
                  <span>Fields Mapped:</span>
                  <span>6 / 6 Validated</span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Timestamp:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 border border-[#0A0A0A] text-xs font-mono font-bold uppercase hover:bg-[#0A0A0A] hover:text-[#F3F1EC] transition-colors"
                >
                  EDIT FIELDS
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    onOpenUploadModal();
                  }}
                  className="px-6 py-3 bg-[#0A0A0A] text-[#F3F1EC] hover:bg-[#1677FF] text-xs font-mono font-bold uppercase transition-colors"
                >
                  DOWNLOAD SUBMISSION PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
