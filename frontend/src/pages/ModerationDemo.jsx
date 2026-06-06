import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Cpu, Terminal, Sparkles, 
  Trash2, RefreshCw, Send, HelpCircle, CornerDownRight 
} from 'lucide-react';

const presets = [
  { text: "Love this package design! When is the next release?", label: "Safe", score: 0.99, desc: "Constructive positive sentiment" },
  { text: "This brand is a total scam. Complete fraud, do not buy!", label: "Toxic", score: 0.95, desc: "High negativity index & defamation indicators" },
  { text: "👉 Win free Bitcoin! Limited time link in my bio!!!", label: "Spam", score: 0.98, desc: "Spam link pattern & promotional emoji spam" },
  { text: "Go die in hell you stupid idiot trolls.", label: "Hate Speech", score: 0.99, desc: "Hate indicators & severe toxicity profile" },
  { text: "Check out my page for makeup tips and beauty tutorials!", label: "Promotional", score: 0.88, desc: "Self-promotional trigger phrases" },
];

export default function ModerationDemo() {
  const [commentInput, setCommentInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Auto analyze preset comment when clicked
  const testPreset = (preset) => {
    setCommentInput(preset.text);
    runAnalysis(preset.text);
  };

  const runAnalysis = (textToAnalyze) => {
    const text = textToAnalyze || commentInput;
    if (!text.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    // Simulate AI pipeline processing latency
    setTimeout(() => {
      let label = "Safe";
      let score = 0.95;
      let desc = "Natural positive/neutral engagement context.";
      const textLower = text.toLowerCase();

      if (textLower.includes("scam") || textLower.includes("fraud") || textLower.includes("garbage") || textLower.includes("trash")) {
        label = "Toxic";
        score = 0.92;
        desc = "Flagged due to reputational risk and highly negative comments sentiment.";
      } else if (textLower.includes("btc") || textLower.includes("bitcoin") || textLower.includes("free") || textLower.includes("link in my bio") || textLower.includes("👉")) {
        label = "Spam";
        score = 0.97;
        desc = "Matches known spam link configurations and promotional link text patterns.";
      } else if (textLower.includes("die") || textLower.includes("kill") || textLower.includes("idiot") || textLower.includes("hate")) {
        label = "Hate Speech";
        score = 0.99;
        desc = "Severe violation: Flagged for abusive terms and death wishes.";
      } else if (textLower.includes("check out my page") || textLower.includes("check my profile") || textLower.includes("makeup tips") || textLower.includes("beauty tutorials")) {
        label = "Promotional";
        score = 0.85;
        desc = "Self-promotion request flagged. Tends to clutter premium comments threads.";
      } else {
        // Safe default
        score = 0.94 + Math.random() * 0.05;
      }

      const result = {
        text,
        label,
        score: Math.round(score * 100),
        desc,
        decision: label === "Safe" ? "Approve" : "Hide",
        timestamp: new Date().toLocaleTimeString(),
      };

      setAnalysisResult(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent text-slate-900">
      {/* Background gradients */}
      <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-[#C2FF81]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#C2FF81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
            Interactive Sandbox
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black font-display">
            AI Moderation Playground
          </h1>
          <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
            Test the moderation accuracy of the SocialFuse sentiment filter. Type a custom comment or click one of our test presets.
          </p>
        </div>

        {/* Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Inputs & Presets (Left Side) */}
          <div className="space-y-8">
            {/* Custom Input Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-black flex items-center gap-2 font-display">
                <Terminal className="w-5 h-5 text-black" />
                Input Console
              </h3>
              <div className="relative">
                <textarea
                  rows={4}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Type a toxic comment, spam link, or normal user question..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-black transition-colors resize-none placeholder-slate-450 shadow-inner"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => runAnalysis()}
                  disabled={analyzing || !commentInput.trim()}
                  className="bg-black text-[#C2FF81] hover:bg-slate-900 transition-all font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-epunda"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C2FF81]" />
                      Scanning Content...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-[#C2FF81]" />
                      Run AI Scan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preset comments */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">Test Presets</h3>
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.text}
                    onClick={() => testPreset(preset)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 transition-all p-4 rounded-2xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <span className="text-xs text-slate-700 font-medium italic break-words flex-1 pr-4">"{preset.text}"</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border self-start sm:self-auto ${
                      preset.label === "Safe" 
                        ? "bg-[#C2FF81] border-black/10 text-black shadow-sm" 
                        : "bg-black border-black text-[#C2FF81]"
                    }`}>
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Console (Right Side) */}
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-3xl min-h-[350px] flex flex-col justify-between border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                <span className="text-xs font-bold text-slate-855 font-display">DECISION REPORT</span>
                <span className="text-xs text-slate-500 font-epunda">Live AI Classifier</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <AnimatePresence mode="wait">
                  {analyzing ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 text-center"
                    >
                      <RefreshCw className="w-10 h-10 text-black animate-spin mx-auto" />
                      <p className="text-sm text-slate-500">Processing sentiment matrices & rules-sets...</p>
                    </motion.div>
                  ) : analysisResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full text-left space-y-6"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">Detection Result</span>
                          <h4 className="text-xl font-bold text-black flex items-center gap-2 font-display">
                            {analysisResult.label} ({analysisResult.score}% confidence)
                          </h4>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-full border font-bold text-xs flex items-center gap-1.5 ${
                          analysisResult.decision === "Approve" 
                            ? "bg-[#C2FF81] border-black/10 text-black shadow-sm" 
                            : "bg-black border-black text-[#C2FF81] shadow-sm"
                        }`}>
                          {analysisResult.decision === "Approve" ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-black" />
                              Approved (Visible)
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-[#C2FF81]" />
                              Hidden (Protected)
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-slate-500" />
                          Diagnostic Reason
                        </div>
                        <p className="text-xs text-slate-650 leading-relaxed">{analysisResult.desc}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      className="text-center space-y-3"
                    >
                      <Cpu className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Enter comments or try one of the testing presets to trigger the AI moderation classification pipeline report.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-slate-200/60 pt-3 text-[10px] text-slate-500 text-left">
                Safety parameters: Custom thresholds (0.60), Hindi/Hinglish lexicons enabled, Sarcasm module active.
              </div>
            </div>

            {/* Quick stats / History */}
            {history.length > 0 && (
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">Session Log History</h4>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {history.map((hist, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-700 truncate flex-1">"{hist.text}"</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        hist.decision === "Approve" ? "text-black bg-[#C2FF81] border border-black/5" : "text-[#C2FF81] bg-black"
                      }`}>
                        {hist.decision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
