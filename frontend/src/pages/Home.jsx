import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import instagramIcon from '../assets/instagram.png';
import CommentVisualiser from '../components/CommentVisualiser';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.215, 0.610, 0.355, 1.000] }
  }),
};

export default function Home() {
  return (
    <div className="w-full bg-white text-black landing-page-container relative select-none">

      {/* ── 1. HERO SECTION ── */}
      <div className="relative w-full min-h-[90vh] flex flex-col justify-between py-12 md:py-20 overflow-hidden">
        {/* Decorative Green Blobs */}
        <div className="absolute top-[12%] -left-[10%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-60 filter blur-[90px] pointer-events-none z-0" />
        <div className="absolute bottom-[8%] -right-[15%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-60 filter blur-[90px] pointer-events-none z-0" />

        {/* Main Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center relative z-10 py-12 space-y-10">

          {/* Main Headline */}
          <div className="flex">
            <img
              src={instagramIcon}
              alt="Instagram"
              className="w-6 h-6 object-contain mr-2"
            />
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className='text-black font-black'
            >
              Meta api Approved
            </motion.h1>
          </div>
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hero-header-text max-w-5xl tracking-tighter"
          >
            STOP TOXIC COMMENTS<br />BEFORE THEY DAMAGE YOUR BRAND
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl text-slate-800 max-w-3xl leading-relaxed mx-auto font-medium font-sans"
          >
            AI-powered social media moderation that detects spam, hate speech, and harmful comments in real time—so creators and brands can focus on growing their audience.
          </motion.p>

          {/* Trust line */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="trusted-serif-text"
          >
            Trusted by: <span className="font-bold">Creators, Startups, and Growing Brands.</span>
          </motion.p>

          {/* Centered CTA Action Buttons */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 pt-4"
          >
            {/* Start Now Pill Button */}
            <a href="/signup/" className="btn-start-now group">
              <span className="text-lg md:text-xl">Start Now</span>
              <div className="arrow-circle">
                <ArrowUpRight className="w-6 h-6 stroke-[3]" />
              </div>
            </a>

            {/* Live Demo Pill Button */}
            <Link to="/demo" className="btn-live-demo-pill text-lg md:text-xl">
              Live Demo
            </Link>
          </motion.div>

          {/* ListBulb Badge */}
          <motion.div
            custom={3.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="pt-4 flex flex-col items-center"
          >
            <a href="https://www.listbulb.com/tools/socialfuse" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-[1.03] hover:opacity-90 active:scale-95 transition-all duration-250">
              <img
                src="https://www.listbulb.com/featured-on-listbulb-light.svg"
                alt="Featured on ListBulb"
                height={240}
                className="h-16 md:h-20 w-auto object-contain"
              />
            </a>
          </motion.div>

        </div>

        {/* Three point features strip at the very bottom */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-y-5 md:gap-x-16 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-center text-black">
            <div>
              Protect your <span className="highlight-brush">community.</span>
            </div>
            <div>
              Save hours <span className="highlight-brush">every week.</span>
            </div>
            <div>
              <span className="highlight-brush">Respond</span> faster with AI.
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 2. SCROLLING TICKER STRIP ── */}
      <div className="w-full bg-black border-y border-neutral-950 overflow-hidden relative z-10">
        <div className="nb-ticker-inner py-5 text-white text-xs sm:text-sm font-black tracking-widest uppercase flex gap-12 whitespace-nowrap">
          {/* Track 1 */}
          <div className="flex gap-12 items-center">
            {["COMMENT MODERATION", "GROWTH ANALYTICS", "BRAND SAFETY", "TEAM WORKFLOWS", "AUTO-REPURPOSING", "14,000+ BRANDS GROWING", "AI CONTENT CREATION"].map((text, idx) => (
              <React.Fragment key={idx}>
                <span>{text}</span>
                <span className="text-[#b5ff66] font-normal">✦</span>
              </React.Fragment>
            ))}
          </div>
          {/* Track 2 (Duplicate for seamless loop) */}
          <div className="flex gap-12 items-center" aria-hidden="true">
            {["COMMENT MODERATION", "GROWTH ANALYTICS", "BRAND SAFETY", "TEAM WORKFLOWS", "AUTO-REPURPOSING", "14,000+ BRANDS GROWING", "AI CONTENT CREATION"].map((text, idx) => (
              <React.Fragment key={idx}>
                <span>{text}</span>
                <span className="text-[#b5ff66] font-normal">✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. STATS SECTION ── */}
      <div className="w-full bg-gradient-to-r from-[#8ad43a] via-[#b5ff66] to-[#76bd21] py-12 md:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center text-white">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">10X</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Faster Content Creation</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">40HRS</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Saved Per Month</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">14,000+</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Comments Moderated</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">97%</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Accuracy of AI</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. CORE MESSAGE SECTION ── */}
      <div className="w-full bg-white py-20 md:py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.215, 0.610, 0.355, 1.000] }}
            className="w-full bg-black rounded-[40px] md:rounded-[56px] border-4 border-[#b5ff66] px-8 py-16 sm:py-24 md:py-28 sm:px-16 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Ambient subtle green glow inside card */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#b5ff66]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none text-white font-display">
                Social Media Tools Were Built for Posting.
              </h2>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none text-[#b5ff66] font-display">
                SocialFuse Was Built for Growth.
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-4xl mx-auto leading-relaxed uppercase tracking-wider font-bold font-sans pt-4">
                Instead of manually coordinating posts, writing copy, and fighting moderation chaos, SocialFuse is your automated AI marketing team — keeping you consistent, protected, and growing.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 5. DESIGNED FOR THOSE WHO SCALE ── */}
      <div className="w-full bg-white pb-24 relative z-10 text-center">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">

          {/* Pill Tag */}
          <span className="bg-black text-white text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            Who It's For
          </span>

          {/* Section Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase mb-16">
            Designed for those <span className="font-serif italic lowercase text-[#6bb51f] normal-case">who scale.</span>
          </h2>

          {/* Row 1 (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mx-auto mb-8">

            {/* Creators Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-black rounded-[32px] p-10 sm:p-12 md:p-14 border border-neutral-900 text-left hover:border-[#b5ff66]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#112415] text-[#39ff14] border border-[#22c55e]/20 text-xs md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-wider mb-6 inline-block font-sans">
                  Creators
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase mb-6">
                  For <span className="text-[#39ff14]">Creators</span>
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-neutral-300 leading-relaxed uppercase tracking-wider font-bold font-sans">
                  Stop staring at a blank screen. Generate a month of content ideas, repurpose across platforms, and schedule everything automatically.
                </p>
              </div>
            </motion.div>

            {/* Agencies Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-black rounded-[32px] p-10 sm:p-12 md:p-14 border border-neutral-900 text-left hover:border-[#b5ff66]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#0c1f24] text-[#06b6d4] border border-[#06b6d4]/20 text-xs md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-wider mb-6 inline-block font-sans">
                  Agencies
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase mb-6">
                  For <span className="text-[#06b6d4]">Agencies</span>
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-neutral-300 leading-relaxed uppercase tracking-wider font-bold font-sans">
                  Run every client's content calendar, approvals, and moderation from one AI-powered dashboard. Scale without scaling headcount.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Row 2 (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mx-auto">

            {/* Brands Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-black rounded-[32px] p-10 sm:p-12 md:p-14 border border-neutral-900 text-left hover:border-[#b5ff66]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#241315] text-[#f43f5e] border border-[#f43f5e]/20 text-xs md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-wider mb-6 inline-block font-sans">
                  Brands
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-6">
                  For <span className="text-[#f43f5e]">Brands</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed uppercase tracking-wider font-bold font-sans">
                  Stay consistent across every channel, without a large team. Schedule campaigns and track growth from one command center.
                </p>
              </div>
            </motion.div>

            {/* E-Commerce Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-black rounded-[32px] p-10 sm:p-12 md:p-14 border border-neutral-900 text-left hover:border-[#b5ff66]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#1e1124] text-[#a855f7] border border-[#a855f7]/20 text-xs md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-wider mb-6 inline-block font-sans">
                  E-Commerce
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-6">
                  For <span className="text-[#a855f7]">E-Commerce</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed uppercase tracking-wider font-bold font-sans">
                  Stay consistent across every channel, without a large team. Schedule campaigns and track growth from one command center.
                </p>
              </div>
            </motion.div>

            {/* Influencers Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-black rounded-[32px] p-10 sm:p-12 md:p-14 border border-neutral-900 text-left hover:border-[#b5ff66]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="bg-[#24111d] text-[#ec4899] border border-[#ec4899]/20 text-xs md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-wider mb-6 inline-block font-sans">
                  Influencers
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase mb-6">
                  For <span className="text-[#ec4899]">Influencers</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed uppercase tracking-wider font-bold font-sans">
                  Grow your audience faster with AI-optimized content, cross-platform scheduling, and a protected content section.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </div>

      {/* ── 6. HOW IT WORKS (SIMPLE, AUTONOMOUS EXECUTION.) ── */}
      <div className="w-full bg-white py-24 relative z-10 text-center">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Pill Tag */}
          <span className="bg-black text-[#b5ff66] text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            How It Works
          </span>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase mb-16 font-sans">
            Simple, autonomous execution.
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mx-auto">
            {/* Card 1 */}
            <div className="flex flex-col p-10 bg-gradient-to-b from-[#0b240c] to-[#040e05] rounded-[32px] text-left border border-[#164319] hover:shadow-[0_15px_30px_rgba(11,36,12,0.25)] transition-all duration-300">
              <span className="text-[#b5ff66] font-display text-5xl md:text-6xl font-black mb-6">01</span>
              <h3 className="text-white text-xl md:text-2xl font-black tracking-tight uppercase mb-4">Connect Channels</h3>
              <p className="text-[#a4df87] text-[11px] md:text-xs font-bold leading-relaxed uppercase tracking-wider">
                Securely link your social profiles via official Meta authentication. No passwords, fully compliant.
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col p-10 bg-gradient-to-b from-[#0b240c] to-[#040e05] rounded-[32px] text-left border border-[#164319] hover:shadow-[0_15px_30px_rgba(11,36,12,0.25)] transition-all duration-300">
              <span className="text-[#b5ff66] font-display text-5xl md:text-6xl font-black mb-6">02</span>
              <h3 className="text-white text-xl md:text-2xl font-black tracking-tight uppercase mb-4">Automate & Schedule</h3>
              <p className="text-[#a4df87] text-[11px] md:text-xs font-bold leading-relaxed uppercase tracking-wider">
                Use our AI workspace to draft content, schedule posts, and activate automated comment moderation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col p-10 bg-gradient-to-b from-[#0b240c] to-[#040e05] rounded-[32px] text-left border border-[#164319] hover:shadow-[0_15px_30px_rgba(11,36,12,0.25)] transition-all duration-300">
              <span className="text-[#b5ff66] font-display text-5xl md:text-6xl font-black mb-6">03</span>
              <h3 className="text-white text-xl md:text-2xl font-black tracking-tight uppercase mb-4">Track Growth</h3>
              <p className="text-[#a4df87] text-[11px] md:text-xs font-bold leading-relaxed uppercase tracking-wider">
                Watch your reach expand and monitor automated actions in real-time through a data-packed analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6.5 INTERACTIVE COMMENT THREAT VISUALISER ── */}
      <div className="w-full bg-[#f8fafc] py-24 relative z-10 text-center border-y border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <span className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            Live Threat Analysis
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 uppercase mb-4 font-sans">
            Interactive Threat Visualizer
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed mb-12 uppercase tracking-wider font-bold">
            Drag to rotate or scroll the page to zoom depth. Explore a real-time stream of toxicity, hate speech, and spam comments auto-hidden and quarantined by SocialFuse.
          </p>

          <div className="w-full h-[550px] md:h-[650px] rounded-[32px] overflow-hidden border border-slate-200 shadow-xl relative bg-white">
            <CommentVisualiser />
            {/* Absolute overlay instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-650 text-[9px] sm:text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest pointer-events-none flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
              <span>← Drag to Rotate / Scroll Page to Zoom Depth →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. SOCIAL PROOF (TRUSTED BY BUILDERS & BRANDS) ── */}
      <div className="w-full bg-[#071600] py-24 relative z-10 text-center overflow-hidden">

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#b5ff66]/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#39ff14]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Pill Tag */}
          <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-pink-300 text-slate-900 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            What people are saying
          </span>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-16 font-sans">
            Loved by builders.
          </h2>
        </div>

        {/* Testimonials Scrolling Container */}
        <div className="w-full flex flex-col gap-6 relative z-10 marquee-group overflow-hidden">

          {/* Edge Fading Overlays */}
          <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#08080c] to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#08080c] to-transparent pointer-events-none z-20" />

          {/* Row 1 (Scrolls Left) */}
          <div className="w-full mask-gradient-horizontal overflow-hidden">
            <div className="animate-marquee-left flex gap-6 py-2">
              {/* First Track */}
              {[
                {
                  name: "JoelGG",
                  handle: "@JoelGG",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "This is awesome! This replaces my manual moderation control."
                },
                {
                  name: "Wi_F_I",
                  handle: "@Wi_F_I",
                  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "been checking out SocialFuse and it's pretty simple: it's a tool to organize and run work with AI moderators instead of a bunch of separate automations it gives you comments log, filter rules, auto-replies and template workflows all in one place so you're not wiring..."
                },
                {
                  name: "alexander",
                  handle: "@4tt4r",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Just what I was looking for to protect our community."
                },
                {
                  name: "yash",
                  handle: "@yashns1",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "The framing here is what makes it interesting. Not \"here is a basic moderation bot.\" It actually understands Hinglish profanity and context-specific spam. The shift from manual checking to automated control is game changing."
                }
              ].map((item, idx) => (
                <div key={idx} className="w-[380px] sm:w-[440px] shrink-0 bg-[#161619]/90 border border-neutral-800/80 rounded-[20px] p-6 text-left hover:border-neutral-700/50 hover:bg-[#1a1a1f] transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">{item.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono leading-none">{item.handle}</span>
                      </div>
                    </div>
                    {/* Twitter / X logo */}
                    <svg className="w-3.5 h-3.5 text-neutral-600 hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed font-medium whitespace-normal font-sans">
                    {item.text}
                  </p>
                </div>
              ))}
              {/* Duplicate Track for loop */}
              {[
                {
                  name: "JoelGG",
                  handle: "@JoelGG",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "This is awesome! This replaces my manual moderation control."
                },
                {
                  name: "Wi_F_I",
                  handle: "@Wi_F_I",
                  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "been checking out SocialFuse and it's pretty simple: it's a tool to organize and run work with AI moderators instead of a bunch of separate automations it gives you comments log, filter rules, auto-replies and template workflows all in one place so you're not wiring..."
                },
                {
                  name: "alexander",
                  handle: "@4tt4r",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Just what I was looking for to protect our community."
                },
                {
                  name: "yash",
                  handle: "@yashns1",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "The framing here is what makes it interesting. Not \"here is a basic moderation bot.\" It actually understands Hinglish profanity and context-specific spam. The shift from manual checking to automated control is game changing."
                }
              ].map((item, idx) => (
                <div key={`dup1-${idx}`} className="w-[380px] sm:w-[440px] shrink-0 bg-[#161619]/90 border border-neutral-800/80 rounded-[20px] p-6 text-left hover:border-neutral-700/50 hover:bg-[#1a1a1f] transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">{item.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono leading-none">{item.handle}</span>
                      </div>
                    </div>
                    {/* Twitter / X logo */}
                    <svg className="w-3.5 h-3.5 text-neutral-600 hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed font-medium whitespace-normal font-sans">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 (Scrolls Right) */}
          <div className="w-full mask-gradient-horizontal overflow-hidden">
            <div className="animate-marquee-right flex gap-6 py-2">
              {/* First Track */}
              {[
                {
                  name: "John Holloway",
                  handle: "@JohnHolloway",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Great for orchestrating comment replies and auto-moderation for dev, content, social, marketing, and anything else for an autonomous biz."
                },
                {
                  name: "Numman Ali",
                  handle: "@nummanali",
                  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "I've never seen a community management system that operates across all business platforms And, neither have I seen one that has been built with great taste i.e. design and UX quality like Linear etc SocialFuse seems to be special - no manual overhead either"
                },
                {
                  name: "Evan Drake",
                  handle: "@eamevandrake",
                  avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "The rise of automated social moderation is inevitable. I tested SocialFuse today and it blew my mind. I suggest giving it a spin."
                },
                {
                  name: "Cathy Stanley",
                  handle: "@cathystanley",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Running thousands of ads, it was getting very hard to monitor all comments. SocialFuse is extremely useful and time-saving for our e-commerce business."
                }
              ].map((item, idx) => (
                <div key={idx} className="w-[380px] sm:w-[440px] shrink-0 bg-[#161619]/90 border border-neutral-800/80 rounded-[20px] p-6 text-left hover:border-neutral-700/50 hover:bg-[#1a1a1f] transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">{item.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono leading-none">{item.handle}</span>
                      </div>
                    </div>
                    {/* Twitter / X logo */}
                    <svg className="w-3.5 h-3.5 text-neutral-600 hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed font-medium whitespace-normal font-sans">
                    {item.text}
                  </p>
                </div>
              ))}
              {/* Duplicate Track for loop */}
              {[
                {
                  name: "John Holloway",
                  handle: "@JohnHolloway",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Great for orchestrating comment replies and auto-moderation for dev, content, social, marketing, and anything else for an autonomous biz."
                },
                {
                  name: "Numman Ali",
                  handle: "@nummanali",
                  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "I've never seen a community management system that operates across all business platforms And, neither have I seen one that has been built with great taste i.e. design and UX quality like Linear etc SocialFuse seems to be special - no manual overhead either"
                },
                {
                  name: "Evan Drake",
                  handle: "@eamevandrake",
                  avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "The rise of automated social moderation is inevitable. I tested SocialFuse today and it blew my mind. I suggest giving it a spin."
                },
                {
                  name: "Cathy Stanley",
                  handle: "@cathystanley",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
                  text: "Running thousands of ads, it was getting very hard to monitor all comments. SocialFuse is extremely useful and time-saving for our e-commerce business."
                }
              ].map((item, idx) => (
                <div key={`dup2-${idx}`} className="w-[380px] sm:w-[440px] shrink-0 bg-[#161619]/90 border border-neutral-800/80 rounded-[20px] p-6 text-left hover:border-neutral-700/50 hover:bg-[#1a1a1f] transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">{item.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono leading-none">{item.handle}</span>
                      </div>
                    </div>
                    {/* Twitter / X logo */}
                    <svg className="w-3.5 h-3.5 text-neutral-600 hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed font-medium whitespace-normal font-sans">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 8. CTA SECTION ── */}
      <div className="w-full bg-white py-24 relative z-10 text-center">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center">
          {/* Header text with decorative italic serif and brush underline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase mb-6 leading-tight max-w-5xl">
            <span className="text-[#39b54a] mr-3">SWITCH TO AUTOMATED FACEBOOK &</span>
            <span className="relative inline-block text-black font-serif italic lowercase normal-case">
              Instagram comment moderation
              {/* Hand-drawn/squiggly underline SVG */}
              <svg className="absolute left-0 bottom-[-4px] w-full h-[10px] text-[#00bfff]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q25,1 50,5 T100,5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-black tracking-widest text-[#555555] uppercase mb-16 max-w-3xl">
            SocialFuse WILL HELP YOU MODERATE, PRIORITIZE AND REPLY IN A FRACTION OF THE TIME.
          </p>

          {/* Big Green Oval Banner */}
          <div className="w-full bg-gradient-to-br from-[#8ad43a] via-[#b5ff66] to-[#6bb51f] rounded-[50%_50%] py-16 px-8 sm:py-24 sm:px-16 md:py-28 md:px-32 flex flex-col items-center text-center justify-center shadow-xl relative overflow-hidden min-h-[320px] md:min-h-[420px]">
            {/* Dark green grid lines inside banner for depth */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6 md:space-y-8 flex flex-col items-center">
              <h3 className="text-sm sm:text-lg md:text-2xl font-black tracking-tight text-black leading-snug uppercase">
                Join 14,000+ brands and creators that scale content publishing and community moderation with SocialFuse.
              </h3>

              {/* Start for free black button */}
              <a href="/signup/" className="flex items-center gap-6 bg-black text-white hover:bg-neutral-900 transition-all duration-300 rounded-full py-2.5 px-2.5 pl-6 pr-2.5 sm:py-3.5 sm:px-3.5 sm:pl-8 sm:pr-3.5 border border-black group">
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase">Start For Free</span>
                <div className="bg-white text-black rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
