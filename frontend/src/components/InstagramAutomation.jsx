import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Sparkles, 
  ArrowUpRight, 
  User,
  Zap,
  Globe,
  Bell
} from 'lucide-react';
import saasPostVisual from '../assets/saas_post_visual.png';

// Sparkle helper component for micro-interactions
const SparkleParticle = ({ delay = 0, style = {} }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0, y: 0 }}
    animate={{ 
      scale: [0, 1.2, 0.8, 0], 
      opacity: [0, 1, 1, 0],
      y: -30,
      x: (Math.random() - 0.5) * 40
    }}
    transition={{ 
      duration: 1.2, 
      delay, 
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: Math.random() * 2 + 1
    }}
    className="absolute text-yellow-300 pointer-events-none"
    style={{ fontSize: '14px', ...style }}
  >
    ✦
  </motion.div>
);

export default function InstagramAutomation() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.3 });
  
  // Animation state index (0 to 7)
  const [step, setStep] = useState(0);
  
  // 3D Tilt states
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Sequence Timer Control
  useEffect(() => {
    let t1, t2, t3, t4, t5, t6, t7, loopTimer;

    const runSequence = () => {
      // Step 0: Reset
      setStep(0);

      // Step 1 (500ms): Comment slides in
      t1 = setTimeout(() => setStep(1), 500);

      // Step 2 (2000ms): AI Badge detected inquiry
      t2 = setTimeout(() => setStep(2), 2000);

      // Step 3 (3000ms): AI Badge fades. Typing starts.
      t3 = setTimeout(() => setStep(3), 3000);

      // Step 4 (3700ms): Typing ends (700ms duration). AI Reply card animates up.
      t4 = setTimeout(() => setStep(4), 3700);

      // Step 5 (4300ms): DM card slides in.
      t5 = setTimeout(() => setStep(5), 4300);

      // Step 6 (5500ms): Success pills pop in.
      t6 = setTimeout(() => setStep(6), 5500);

      // Step 7 (8500ms): Everything fades out
      t7 = setTimeout(() => setStep(7), 8500);

      // Step 8 (9500ms): Restart sequence loop
      loopTimer = setTimeout(runSequence, 9500);
    };

    if (isInView) {
      runSequence();
    } else {
      setStep(0);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(loopTimer);
    };
  }, [isInView]);

  // Handle Mouse Tilt (3D Effect)
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    setIsHovered(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized coordinates (-0.5 to 0.5)
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Smooth angle limits (-3 to 3 degrees)
    setTilt({
      x: normY * -8, // Rotate X based on mouse Y
      y: normX * 8   // Rotate Y based on mouse X
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Spring transition values for Framer Motion
  const springTransition = {
    type: "spring",
    stiffness: 120,
    damping: 14,
    mass: 0.8
  };

  // DM send pulse control
  const showPulse = step >= 5 && step < 7;

  return (
    <div className="w-full bg-white dark:bg-[#080b11] py-16 px-4 md:px-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-[#A855F7]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-indigo-400 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
      </div>

      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Product Context Copy */}
        <div className="lg:col-span-5 space-y-6 text-left z-10">
          <span className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider font-sans border border-purple-200 dark:border-purple-900/30 font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" /> Auto-Engagement Flow
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans leading-none">
            Instagram <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]">Automation</span> on Autopilot
          </h2>
          <p className="text-slate-600 dark:text-neutral-300 text-base md:text-lg leading-relaxed font-sans font-medium">
            Turn comment inquiries into direct sales conversations. When users comment, our AI instantly replies with contextual relevance, pushes custom DMs to their inbox, and captures high-intent leads automatically.
          </p>
          
          {/* List of features with premium checkmarks */}
          <div className="space-y-3 pt-2">
            {[
              { title: "Real-time Inquiry Detection", desc: "Instantly categorizes questions & intent." },
              { title: "Contextual Comment Replies", desc: "Keeps public engagement high with dynamic replies." },
              { title: "Instant Lead-Gen DMs", desc: "Sends immediate links, assets, or coupons privately." }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-full p-0.5 shadow-sm">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The Interactive Visual Sandbox */}
        <div className="lg:col-span-7 flex justify-center items-center relative z-10 w-full">
          
          {/* Main Visual Arena Container */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[620px] aspect-[4/3.2] rounded-[32px] bg-[#0c0d14] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex items-center justify-center cursor-crosshair select-none"
            style={{
              perspective: '1200px'
            }}
          >
            {/* Tech Grid Backdrop */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#3b4260_1px,transparent_1px),linear-gradient(to_bottom,#3b4260_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            {/* Soft Radial Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Micro floating sparkles around the AI Sandbox */}
            <div className="absolute inset-0 pointer-events-none">
              <SparkleParticle delay={0} style={{ top: '25%', left: '15%' }} />
              <SparkleParticle delay={0.6} style={{ top: '70%', right: '12%' }} />
              <SparkleParticle delay={1.2} style={{ bottom: '15%', left: '40%' }} />
            </div>

            {/* Central Animated Interactive Package */}
            <motion.div
              style={{
                rotateX: isHovered ? tilt.x : 0,
                rotateY: isHovered ? tilt.y : 0,
                transformStyle: 'preserve-3d'
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 0.5
              }}
              className="w-full h-full relative flex items-center justify-center p-4 sm:p-8"
            >
              
              {/* ── STEP 1: INSTAGRAM POST MOCKUP ── */}
              <motion.div
                style={{
                  translateZ: '-30px',
                  boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)'
                }}
                className="w-[270px] sm:w-[320px] bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="px-3.5 py-3 flex items-center justify-between border-b border-white/5 bg-slate-950/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFB800] via-[#FF007A] to-[#7600FF] p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[9px] font-bold text-white uppercase">SF</div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white leading-tight">socialfuse.app</h4>
                      <p className="text-[9px] text-neutral-400 leading-none font-medium">Automated Post</p>
                    </div>
                  </div>
                  <div className="flex gap-[3px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                </div>

                {/* Content Image */}
                <div className="w-full aspect-[4/3] bg-neutral-950 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={saasPostVisual} 
                    alt="SaaS automation visual" 
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
                  
                  {/* Subtle Instagram stamp overlay */}
                  <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-white text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg> Post
                  </div>
                </div>

                {/* Action Icons */}
                <div className="px-3.5 py-2.5 flex items-center justify-between text-white/80">
                  <div className="flex gap-3">
                    <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" />
                    <MessageCircle className="w-4 h-4 text-purple-400 stroke-2" />
                    <Send className="w-4 h-4 cursor-pointer hover:text-purple-400 transition-colors" />
                  </div>
                  <Bookmark className="w-4 h-4 cursor-pointer hover:text-yellow-400 transition-colors" />
                </div>

                {/* Caption / Comments Info */}
                <div className="px-3.5 pb-4 text-left font-sans">
                  <p className="text-[10px] text-white/90 leading-relaxed font-medium">
                    <span className="font-bold mr-1.5">socialfuse.app</span> 
                    SaaS templates dropping today! Comment <span className="font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">WEBSITE</span> to access instantly. 🚀👇
                  </p>
                  <p className="text-[8px] text-neutral-500 mt-2 font-semibold tracking-wide uppercase">View all 18 comments</p>
                </div>
              </motion.div>


              {/* ── STEP 2 & 3: SLIDING COMMENT BUBBLE + AI BADGE ── */}
              <AnimatePresence>
                {step >= 1 && step < 7 && (
                  <motion.div
                    initial={{ opacity: 0, x: -140, y: -20, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      x: -50, 
                      y: -40, 
                      scale: 1,
                      z: 20
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -50, transition: { duration: 0.3 } }}
                    transition={springTransition}
                    className="absolute left-6 top-[28%] w-[240px] sm:w-[270px] bg-[#151624]/90 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-3.5 rounded-[22px] text-left z-20 backdrop-blur-md"
                    style={{ transformStyle: 'preserve-3d', translateZ: '30px' }}
                  >
                    <div className="flex gap-2.5 items-start">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                        BM
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-1 overflow-hidden font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white leading-none">@buyer_max</span>
                          <span className="text-[9px] text-neutral-400">1m</span>
                        </div>
                        <p className="text-[11px] text-neutral-200 leading-normal font-medium">
                          Do you have a website where I can learn more? WEBSITE
                        </p>
                      </div>
                    </div>

                    {/* AI Badge Overlay (Step 2/3) */}
                    <AnimatePresence>
                      {step === 2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{ type: "spring", stiffness: 180, damping: 12 }}
                          className="absolute -top-3.5 right-4 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] border border-purple-400/20 text-white font-sans text-[9px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_5px_15px_rgba(124,58,237,0.4)] flex items-center gap-1.5 z-30 uppercase tracking-wider"
                        >
                          <Sparkles className="w-2.5 h-2.5 fill-current text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                          <span>AI detected an inquiry</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* ── STEP 4: TYPING INDICATOR / AI REPLY BUBBLE ── */}
              <AnimatePresence>
                {/* Typing Indicator */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 15, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: 0, transition: { duration: 0.2 } }}
                    className="absolute left-10 top-[45%] w-[120px] bg-slate-900/90 border border-white/10 px-4 py-2.5 rounded-[18px] flex items-center gap-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.3)] z-30"
                  >
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider mr-1 font-sans">AI</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}

                {/* AI Reply Bubble */}
                {step >= 4 && step < 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.85 }}
                    animate={{ 
                      opacity: 1, 
                      y: 20, 
                      scale: 1,
                      z: 40
                    }}
                    exit={{ opacity: 0, scale: 0.85, y: 10, transition: { duration: 0.3 } }}
                    transition={springTransition}
                    className="absolute left-8 top-[44%] w-[240px] sm:w-[270px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white shadow-[0_15px_30px_rgba(124,58,237,0.3)] p-3.5 rounded-[22px] text-left z-20 font-sans"
                    style={{ transformStyle: 'preserve-3d', translateZ: '50px' }}
                  >
                    <div className="flex gap-2 items-start">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-white text-purple-600 flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                        SF
                      </div>
                      
                      {/* Reply Content */}
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white leading-none">socialfuse.app</span>
                          <span className="bg-white/20 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">AI Reply</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-white/95 leading-normal font-medium">
                          Thanks for your interest! 🚀 Tap below to explore everything.
                        </p>
                        
                        {/* Interactive Styled Button inside comment */}
                        <div className="pt-1">
                          <a 
                            href="#website"
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex items-center gap-1.5 bg-white text-purple-750 font-bold text-[9px] uppercase tracking-wider py-1.5 px-3.5 rounded-full hover:bg-neutral-100 transition-colors shadow-md border border-white/20"
                          >
                            <span>Visit Website</span>
                            <ArrowUpRight className="w-2.5 h-2.5 stroke-[3.5]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* ── STEP 5: SLIDING FLOATING INSTAGRAM DM CARD ── */}
              <AnimatePresence>
                {step >= 5 && step < 7 && (
                  <motion.div
                    initial={{ opacity: 0, x: 140, y: 15, scale: 0.9, rotate: 10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 35, 
                      y: 5, 
                      scale: 1, 
                      rotate: -2,
                      z: 60
                    }}
                    exit={{ opacity: 0, scale: 0.9, x: 80, transition: { duration: 0.3 } }}
                    transition={springTransition}
                    className="absolute right-6 top-[20%] w-[240px] sm:w-[270px] bg-slate-900/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[22px] text-left z-30 p-0 overflow-hidden font-sans backdrop-blur-md"
                    style={{ transformStyle: 'preserve-3d', translateZ: '70px' }}
                  >
                    
                    {/* DM Send Pulse Visual Overlay (behind the card) */}
                    {showPulse && (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1.15, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 border-2 border-purple-500 rounded-[22px] pointer-events-none"
                      />
                    )}

                    {/* Header */}
                    <div className="px-3.5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[8px] uppercase">
                          SF
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-white leading-tight">socialfuse.app</h4>
                          <p className="text-[8px] text-neutral-400 leading-none font-medium">Instagram DM</p>
                        </div>
                      </div>
                      <div className="flex gap-[3px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider leading-none">
                        Active
                      </div>
                    </div>

                    {/* Message Bubble Body */}
                    <div className="p-3.5 space-y-3">
                      {/* DM text */}
                      <div className="space-y-2">
                        <div className="bg-purple-600 text-white rounded-[16px] rounded-bl-sm py-1.5 px-3 text-[10px] inline-block max-w-[85%] font-medium shadow-sm">
                          Hey 👋
                        </div>
                        <br />
                        <div className="bg-purple-600 text-white rounded-[16px] rounded-tl-sm py-1.5 px-3 text-[10px] inline-block max-w-[85%] font-medium shadow-sm">
                          Thanks for commenting!
                        </div>
                        <br />
                        <div className="bg-slate-800 text-white rounded-[16px] rounded-br-sm py-1.5 px-3 text-[10px] inline-block max-w-[85%] font-medium float-right border border-white/5 shadow-sm">
                          Here's our website:
                        </div>
                        <div className="clear-both" />
                        
                        {/* Link Card Bubble */}
                        <div className="bg-slate-800 border border-white/10 rounded-[16px] p-2.5 space-y-1 shadow-md w-full">
                          <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            <Globe className="w-2.5 h-2.5" /> Website Access
                          </p>
                          <p className="text-[10px] text-white leading-tight font-medium">Click to unlock our SaaS toolkit.</p>
                          <p className="text-[9px] text-neutral-400 underline font-mono">🔗 social-fuse.app</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* ── STEP 6: FLOATING SUCCESS INDICATORS ── */}
              <AnimatePresence>
                {step >= 6 && step < 7 && (
                  <div className="absolute inset-0 pointer-events-none z-40">
                    
                    {/* Indicator 1: Reply Sent */}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ ...springTransition, delay: 0 }}
                      className="absolute bottom-10 left-4 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 font-sans text-[10px] font-bold px-3 py-2 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.2)] flex items-center gap-2"
                    >
                      {/* Checkmark Animation */}
                      <span className="w-4 h-4 bg-emerald-500 text-emerald-950 rounded-full flex items-center justify-center p-0.5">
                        <svg className="w-3 h-3 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <motion.path 
                            initial={{ pathLength: 0 }} 
                            animate={{ pathLength: 1 }} 
                            transition={{ duration: 0.3 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </span>
                      <span>Reply Sent</span>
                    </motion.div>

                    {/* Indicator 2: DM Delivered */}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ ...springTransition, delay: 0.3 }}
                      className="absolute top-10 right-4 bg-indigo-950/90 border border-indigo-500/30 text-indigo-300 font-sans text-[10px] font-bold px-3 py-2 rounded-full shadow-[0_10px_25px_rgba(99,102,241,0.2)] flex items-center gap-2"
                    >
                      <span className="w-4 h-4 bg-indigo-500 text-indigo-950 rounded-full flex items-center justify-center p-0.5">
                        <svg className="w-3 h-3 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <motion.path 
                            initial={{ pathLength: 0 }} 
                            animate={{ pathLength: 1 }} 
                            transition={{ duration: 0.3 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </span>
                      <span>DM Delivered</span>
                    </motion.div>

                    {/* Indicator 3: Lead Captured */}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ ...springTransition, delay: 0.6 }}
                      className="absolute bottom-8 right-8 bg-purple-950/90 border border-purple-500/30 text-purple-300 font-sans text-[10px] font-bold px-3 py-2 rounded-full shadow-[0_10px_25px_rgba(168,85,247,0.2)] flex items-center gap-2"
                    >
                      <span className="w-4 h-4 bg-purple-500 text-purple-950 rounded-full flex items-center justify-center p-0.5">
                        <svg className="w-3 h-3 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <motion.path 
                            initial={{ pathLength: 0 }} 
                            animate={{ pathLength: 1 }} 
                            transition={{ duration: 0.3 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </span>
                      <span>Lead Captured</span>
                    </motion.div>

                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </div>

      </div>

      {/* Decorative Gradient Line Dividers */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </div>
  );
}
