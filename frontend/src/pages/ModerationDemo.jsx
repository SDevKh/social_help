import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Cpu, Terminal, Sparkles, 
  RefreshCw, CornerDownRight, CheckCircle2, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

const presets = [
  { text: "Love this package design! When is the next release?", label: "Safe", desc: "Constructive positive sentiment" },
  { text: "This brand is a total scam. Complete fraud, do not buy!", label: "Toxic", desc: "High negativity index & defamation indicators" },
  { text: "👉 Win free Bitcoin! Limited time link in my bio!!!", label: "Spam", desc: "Spam link pattern & promotional emoji spam" },
  { text: "Go die in hell you stupid idiot trolls.", label: "Hate Speech", desc: "Hate indicators & severe toxicity profile" },
  { text: "Interesting update... hope it doesn't break everything like last time.", label: "Uncertain", desc: "Sarcastic/borderline tone: Routed to Groq LLM." },
];

export default function ModerationDemo() {
  const [commentInput, setCommentInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineState, setPipelineState] = useState('idle'); // 'idle' | 'keyword_filter' | 'spam_rules' | 'hf_classifier' | 'review_required' | 'groq_ai' | 'done'
  const [hfScore, setHfScore] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);

  const testPreset = (preset) => {
    setCommentInput(preset.text);
    runAnalysis(preset.text);
  };

  const runAnalysis = (textToAnalyze) => {
    const text = textToAnalyze || commentInput;
    if (!text.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);
    setHfScore(null);
    setPipelineState('keyword_filter');

    // 1. Keyword Filter (0.8s)
    setTimeout(() => {
      const textLower = text.toLowerCase();
      if (textLower.includes("win free") || textLower.includes("bitcoin") || textLower.includes("link in my bio")) {
        const result = {
          text,
          label: "Spam (Keyword Match)",
          score: 95,
          desc: "Triggered custom keyword/lexicon filter rules.",
          decision: "Hide",
          timestamp: new Date().toLocaleTimeString(),
          source: "Keyword Filter"
        };
        setAnalysisResult(result);
        setHistory(prev => [result, ...prev].slice(0, 5));
        setPipelineState('done');
        setAnalyzing(false);
        return;
      }

      // 2. Spam Rules (0.8s)
      setPipelineState('spam_rules');
      setTimeout(() => {
        const toxicWords = [
          "hate", "idiot", "stupid", "scam", "fake", "kill", "die", "garbage", 
          "terrible", "shit", "fuck", "fucker", "fucking", "bitch", "asshole", 
          "bastard", "cunt", "slut", "whore", "motherfucker", "dick", "pussy", 
          "hell", "disgusting", "trash", "loser", "moron", "retard", "scum",
          "randi", "raand", "bhenchod", "bc", "madarchod", "mc", "chutiya", 
          "bhosdike", "bsdk", "bhosdi", "saala", "saale", "kutta", "kutte", 
          "kamina", "kaminey", "haramkhor", "gandu", "suar", "tatti", "hijra", 
          "kamine", "lodu", "lode", "laude", "bhadwa", "mutthal", "chinal"
        ];
        
        const severePhrases = [
          "not upto the mark", "not up to the mark", "should not exist", 
          "should not exists", "kill yourself", "go to hell", "burn in hell", 
          "waste of life", "waste of space", "wish you were dead", "rot in hell",
          "worst ever", "utter garbage", "complete trash", "never exist"
        ];

        const hasToxicWord = toxicWords.some(w => {
          const regex = new RegExp(`\\b${w}\\b`, 'i');
          return regex.test(textLower);
        });

        const hasSeverePhrase = severePhrases.some(phrase => textLower.includes(phrase));

        if (hasToxicWord || hasSeverePhrase) {
          const result = {
            text,
            label: "Toxic (Spam Rules)",
            score: 95,
            desc: "Triggered standard profanity and severe toxic phrase dictionary.",
            decision: "Hide",
            timestamp: new Date().toLocaleTimeString(),
            source: "Spam Rules"
          };
          setAnalysisResult(result);
          setHistory(prev => [result, ...prev].slice(0, 5));
          setPipelineState('done');
          setAnalyzing(false);
          return;
        }

        // 3. Hugging Face Toxicity Classifier (1.0s)
        setPipelineState('hf_classifier');
        setTimeout(() => {
          let score = 0.12 + Math.random() * 0.15; // Default Clean
          let isUncertain = false;
          
          const highlyToxicKeywords = ["scam", "fraud", "garbage", "trash", "worst", "terrible", "sucks", "awful", "rubbish", "useless", "fake"];
          const borderlineKeywords = ["hope", "break", "interesting", "genius", "madness", "...", "bad", "poor", "disappointed", "fail"];

          if (highlyToxicKeywords.some(keyword => textLower.includes(keyword))) {
            score = 0.88 + Math.random() * 0.08; // High toxicity (e.g. 88% - 96%)
          } else if (borderlineKeywords.some(keyword => textLower.includes(keyword))) {
            score = 0.65 + Math.random() * 0.15; // Borderline score (e.g. 65% - 80%)
            isUncertain = true;
          }

          setHfScore(Math.round(score * 100));

          if (!isUncertain) {
            const isToxic = score >= 0.85;
            const result = {
              text,
              label: isToxic ? "Toxic (HF Classifier)" : "Safe (HF Classifier)",
              score: Math.round(score * 100),
              desc: isToxic ? "Hugging Face model flagged comment as high toxicity." : "Hugging Face model verified comment as clean.",
              decision: isToxic ? "Hide" : "Approve",
              timestamp: new Date().toLocaleTimeString(),
              source: "Hugging Face Toxicity Model"
            };
            setAnalysisResult(result);
            setHistory(prev => [result, ...prev].slice(0, 5));
            setPipelineState('done');
            setAnalyzing(false);
          } else {
            // 4. Review Required -> Route to Groq AI (1.0s)
            setPipelineState('review_required');
            setTimeout(() => {
              setPipelineState('groq_ai');
              // 5. Groq LLM Final Decision (1.5s)
              setTimeout(() => {
                const finalDecision = (textLower.includes("break") || textLower.includes("bad") || textLower.includes("poor") || textLower.includes("fail") || textLower.includes("disappointed")) ? "Hide" : "Approve";
                const desc = finalDecision === "Hide" 
                  ? "Groq LLM resolved borderline comment: Flagged as passive-aggressive/constructive toxicity." 
                  : "Groq LLM resolved borderline comment: Approved as valid user sarcasm / friendly feedback.";
                const result = {
                  text,
                  label: finalDecision === "Hide" ? "Toxic (Resolved by Groq)" : "Safe (Resolved by Groq)",
                  score: Math.round(score * 100),
                  desc,
                  decision: finalDecision,
                  timestamp: new Date().toLocaleTimeString(),
                  source: "Groq LLM"
                };
                setAnalysisResult(result);
                setHistory(prev => [result, ...prev].slice(0, 5));
                setPipelineState('done');
                setAnalyzing(false);
              }, 1500);
            }, 1000);
          }
        }, 1000);
      }, 800);
    }, 800);
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent text-slate-900">
      {/* Background gradients */}
      <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-[#C2FF81]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#C2FF81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            Moderation Architecture Demo
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black font-display">
            Hierarchical AI Moderation
          </h1>
          <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
            Experience our premium dual-engine moderation pipeline. 95% of comments are instantly processed using a free Hugging Face classifier, while uncertain ones are automatically routed to Groq LLM.
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
                  placeholder="Type a borderline comment, toxic phrase, or normal question..."
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
                      Analyzing Pipeline...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-[#C2FF81]" />
                      Run Pipeline Scan
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
                        : preset.label === "Uncertain"
                        ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
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
            <div className="glass-panel p-6 rounded-3xl min-h-[420px] flex flex-col justify-between border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                <span className="text-xs font-bold text-slate-855 font-display">PIPELINE EXECUTION TRACE</span>
                <span className="text-xs text-slate-500 font-epunda">Dual-Engine AI Status</span>
              </div>

              {/* Pipeline Step Tracker */}
              {analyzing && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 mt-4 text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Pipeline Steps</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      {pipelineState === 'keyword_filter' ? (
                        <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className={pipelineState === 'keyword_filter' ? 'font-bold text-black' : 'text-slate-500'}>
                        1. Keyword Filter Checks
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {pipelineState === 'spam_rules' ? (
                        <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
                      ) : (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${pipelineState === 'keyword_filter' ? 'text-slate-300' : 'text-emerald-500'}`} />
                      )}
                      <span className={pipelineState === 'spam_rules' ? 'font-bold text-black' : 'text-slate-500'}>
                        2. Spam Lexicon & Profanity Rules
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {pipelineState === 'hf_classifier' ? (
                        <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
                      ) : (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${['keyword_filter', 'spam_rules'].includes(pipelineState) ? 'text-slate-300' : 'text-emerald-500'}`} />
                      )}
                      <span className={pipelineState === 'hf_classifier' ? 'font-bold text-black' : 'text-slate-500'}>
                        3. Hugging Face Toxicity Model Scan
                      </span>
                    </div>

                    {['review_required', 'groq_ai'].includes(pipelineState) && (
                      <div className="flex items-center gap-2 text-xs">
                        {pipelineState === 'review_required' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="font-bold text-amber-700">
                          4. Borderline range detected! Routing to Groq LLM...
                        </span>
                      </div>
                    )}

                    {pipelineState === 'groq_ai' && (
                      <div className="flex items-center gap-2 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span className="font-bold text-blue-700 animate-pulse">
                          5. Groq LLM resolving context...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <AnimatePresence mode="wait">
                  {!analyzing && analysisResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full text-left space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Audit Report</span>
                          <h4 className="text-lg font-bold text-black flex items-center gap-2 font-display">
                            {analysisResult.label}
                          </h4>
                          <div className="text-xs text-slate-500">
                            Processed via: <strong className="text-black">{analysisResult.source}</strong>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-full border font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto ${
                          analysisResult.decision === "Approve" 
                            ? "bg-[#C2FF81] border-black/10 text-black shadow-sm" 
                            : "bg-black border-black text-[#C2FF81] shadow-sm"
                        }`}>
                          {analysisResult.decision === "Approve" ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-black" />
                              Approved (Keep)
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-[#C2FF81]" />
                              Flagged (Delete)
                            </>
                          )}
                        </div>
                      </div>

                      {hfScore !== null && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>HF Toxicity Score:</span>
                            <span>{hfScore}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                hfScore >= 85 ? 'bg-red-500' : hfScore >= 55 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${hfScore}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>Clean (&lt;55%)</span>
                            <span className="text-amber-500 font-bold">Uncertain Review (55%-85%)</span>
                            <span>Toxic (&gt;85%)</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-slate-500" />
                          Decision Context
                        </div>
                        <p className="text-xs text-slate-650 leading-relaxed">{analysisResult.desc}</p>
                      </div>
                    </motion.div>
                  ) : !analyzing ? (
                    <motion.div 
                      key="empty"
                      className="text-center space-y-3"
                    >
                      <Cpu className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Enter comments or try one of the testing presets to trigger the AI moderation classification pipeline trace.
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="border-t border-slate-200/60 pt-3 text-[10px] text-slate-500 text-left">
                Safety parameters: Upper boundary (0.85), Lower boundary (0.55), Sarcasm module active, Lexicons enabled.
              </div>
            </div>

            {/* Quick stats / History */}
            {history.length > 0 && (
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">Session Audit Logs</h4>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {history.map((hist, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-700 truncate flex-1 font-medium">"{hist.text}"</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{hist.source}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          hist.decision === "Approve" ? "text-black bg-[#C2FF81] border border-black/5" : "text-[#C2FF81] bg-black"
                        }`}>
                          {hist.decision}
                        </span>
                      </div>
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
