import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Eye, ShieldAlert, Sparkles, LineChart, 
  ArrowRight, ShieldCheck, Cpu, RefreshCw, Send, CheckCircle2 
} from 'lucide-react';

const steps = [
  {
    number: 'Step 1',
    title: 'Connect Social Accounts',
    desc: 'Authorize SocialFuse through Meta\'s official secure OAuth login. No passwords required.',
    icon: Key,
    badge: 'Security first',
    accentColor: '#6366f1', // purple
  },
  {
    number: 'Step 2',
    title: 'Real-time AI Scanning',
    desc: 'Our sentiment analyzer scans every comment the millisecond it is posted on your content.',
    icon: Eye,
    badge: 'Under 100ms latency',
    accentColor: '#3b82f6', // blue
  },
  {
    number: 'Step 3',
    title: 'Flag & Hide Toxicity',
    desc: 'Abusive comments, hate speech, and spam links get automatically flagged and hidden.',
    icon: ShieldAlert,
    badge: 'Brand Protection',
    accentColor: '#f43f5e', // red/coral
  },
  {
    number: 'Step 4',
    title: 'Generate Intelligent Replies',
    desc: 'AI drafts context-aware replies for customer inquiries, keeping your engagement rate high.',
    icon: Sparkles,
    badge: 'Engagement boost',
    accentColor: '#10b981', // green
  },
  {
    number: 'Step 5',
    title: 'Analytics Dashboard Updates',
    desc: 'Track moderation actions, sentiment metrics, and growth stats in real time.',
    icon: LineChart,
    badge: 'Insights report',
    accentColor: '#f59e0b', // orange
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  // Helper render mock screen for the selected step
  const renderDashboardPreview = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center p-8 space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-[#c2ff81] flex items-center justify-center shadow-lg shadow-[#c2ff81]/10">
              <Key className="w-8 h-8 text-[#c2ff81]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">OAuth Secure Permissions</h3>
              <p className="text-xs text-slate-400 max-w-xs">We request only moderation and page engagement permissions. No content posting without your consent.</p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-[#c2ff81] text-black font-extrabold text-sm transition-all border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-[1px]">
              Link Instagram Business
            </button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#c2ff81] animate-spin-slow" />
                <span className="text-xs font-bold text-slate-400">AI STREAM SCANNER</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#c2ff81]/15 text-[#c2ff81] text-[10px] font-bold border border-[#c2ff81]/20">READY</span>
            </div>
            
            <div className="space-y-3 py-4 flex-1 flex flex-col justify-center">
              <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-start">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">U</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-350">@user_prime</span>
                    <span className="text-[10px] text-slate-500">10ms ago</span>
                  </div>
                  <p className="text-xs text-slate-300">How much does this bundle cost?</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c2ff81]" />
                Processing comments stream...
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400">MODERATION ACTION QUEUE</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">SHIELD ACTIVE</span>
            </div>

            <div className="space-y-3 py-4 flex-1 flex flex-col justify-center">
              <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">@bad_actor_bot</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold">SPAM (98%)</span>
                </div>
                <p className="text-xs text-slate-400">Buy cryptocash now! Visit my profile link!!</p>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    Hidden automatically on Instagram
                  </span>
                  <button className="text-[10px] text-slate-300 hover:text-white font-semibold">Undo</button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400">AI ENGAGEMENT PILOT</span>
              <span className="px-2 py-0.5 rounded-full bg-[#c2ff81]/15 text-[#c2ff81] text-[10px] font-bold border border-[#c2ff81]/20">SUGGESTION READY</span>
            </div>

            <div className="space-y-4 py-4 flex-1 flex flex-col justify-center">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-350">@loyal_fan: "Where can I purchase?"</span>
                <div className="bg-[#0c0a21] border border-white/5 p-2 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#c2ff81] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Suggested Reply
                    </span>
                    <button className="p-1 rounded bg-[#c2ff81] text-black border border-black hover:bg-[#b0f56a]">
                      <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">You can buy directly on our website! Checking our DM guides for a discount code link.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400">ANALYTICS SNAPSHOT</span>
              <span className="px-2 py-0.5 rounded-full bg-[#c2ff81]/15 text-[#c2ff81] text-[10px] font-bold border border-[#c2ff81]/20">LIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 flex-1">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Toxicity Index</span>
                <span className="text-xl font-bold text-red-400">1.2%</span>
                <span className="text-[9px] text-slate-500">Very Low Risk</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Replies Sent</span>
                <span className="text-xl font-bold text-emerald-400">182</span>
                <span className="text-[9px] text-slate-500">AI Engagement Pilot</span>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent text-slate-900">
      {/* Background blurs */}
      <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-[#c2ff81]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#c2ff81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
            Interactive Tour
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black font-display">
            How SocialFuse Works
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Click through the workflow steps below to see how our AI system interacts with your social media profiles in real time.
          </p>
        </div>

        {/* Timeline Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          {/* Steps Timeline (Left Columns) */}
          <div className="lg:col-span-3 space-y-6">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === activeStep;
              return (
                <div 
                  key={step.title}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer text-left p-6 rounded-3xl border-2 border-black transition-all relative flex gap-5 items-start ${
                    isActive 
                      ? 'bg-[#c2ff81] shadow-[6px_6px_0px_rgba(0,0,0,1)] translate-y-[-2px]' 
                      : 'bg-white hover:bg-slate-50 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]'
                  }`}
                >
                  {/* Step active border glow indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="timelineGlow"
                      className="absolute inset-0 rounded-3xl border-2 border-black pointer-events-none"
                    />
                  )}

                  {/* Icon */}
                  <div className={`p-3 rounded-xl border-2 border-black transition-colors flex items-center justify-center shrink-0 ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'bg-slate-55 border-black text-black'
                  }`}>
                    <StepIcon className="w-6 h-6 animate-pulse" style={{ color: step.accentColor }} />
                  </div>

                  {/* Copy */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{step.number}</span>
                      <span className="text-[10px] font-bold text-black px-2.5 py-0.5 rounded-full bg-white border border-black shadow-sm">{step.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold text-black">{step.title}</h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Screen Preview Panel (Right Columns) */}
          <div className="lg:col-span-2">
            <div className="relative aspect-square w-full rounded-[32px] border-2 border-black p-[2px] shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-black">
              <div className="w-full h-full bg-[#0f1319] rounded-[28px] overflow-hidden flex items-center justify-center border border-white/5">
                <AnimatePresence mode="wait">
                  {renderDashboardPreview()}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
