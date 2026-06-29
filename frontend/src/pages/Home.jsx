import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Link2, Calendar, TrendingUp, ChevronRight, Shield, Check, Clock, Sparkles } from 'lucide-react';
import instagramIcon from '../assets/instagram.png';
import CommentVisualiser from '../components/CommentVisualiser';
import InstagramAutomation from '../components/InstagramAutomation';
import heroBg from '../assets/hero_bg_optimized.jpg';
import heroBgTiny from '../assets/hero_bg_tiny.jpg';
import tabAutomation from '../assets/tab_automation.png';
import tabInbox from '../assets/tab_inbox.png';
import tabCreation from '../assets/tab_creation.png';
import tabLinkinbio from '../assets/tab_linkinbio.png';
import tabAicreation from '../assets/tab_aicreation.png';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.215, 0.610, 0.355, 1.000] }
  }),
};

const tabsData = [
  {
    id: 'automation',
    label: 'Automation',
    title: 'Schedule AI Automation for deletion of the toxicity and brand damages.',
    description: 'A visual screen that show how your deletion is working with AI, that is protecting you from every deal breakers.',
    bullets: [
      'Define the toxicity parameters.',
      'Define the sarcasm parameters.',
      'Define the Thresholds parameters.',
      'Define the keywords.',
    ],
    image: tabAutomation,
  },
  {
    id: 'inbox',
    label: 'Inbox',
    title: 'Unified inbox to manage every conversation in one place.',
    description: 'See all your DMs, comments, and mentions from every platform in a single stream — respond faster and never miss a lead.',
    bullets: [
      'Merge Instagram & Facebook inboxes.',
      'AI-suggested smart replies.',
      'Priority flagging for hot leads.',
      'Team assignment & collaboration.',
    ],
    image: tabInbox,
  },
  {
    id: 'creation',
    label: 'Creation',
    title: 'Create, schedule, and publish content across platforms.',
    description: 'A drag-and-drop calendar with AI-assisted copywriting so you never run out of ideas or miss a posting window.',
    bullets: [
      'Visual content calendar.',
      'AI caption & hashtag generator.',
      'Multi-platform scheduling.',
      'Post performance predictions.',
    ],
    image: tabCreation,
  },
  {
    id: 'linkinbio',
    label: 'Link in Bio',
    title: 'Build a branded link-in-bio page in minutes.',
    description: 'Convert your bio link into a high-converting landing page with analytics, custom themes, and unlimited links.',
    bullets: [
      'Drag-and-drop link builder.',
      'Custom themes & branding.',
      'Click-through analytics.',
      'E-commerce link blocks.',
    ],
    image: tabLinkinbio,
  },
  {
    id: 'aicreation',
    label: 'Ai and Creation',
    title: 'Let AI generate your next viral post idea.',
    description: 'Powered by trend analysis and your brand voice, the AI engine crafts scroll-stopping content tailored to your audience.',
    bullets: [
      'Trend-aware content suggestions.',
      'Brand-voice fine-tuning.',
      'Engagement score predictions.',
      'Batch content generation.',
    ],
    image: contentai,
  },
];

function ProductShowcaseTabs() {
  const [activeTab, setActiveTab] = useState('automation');
  const active = tabsData.find(t => t.id === activeTab);

  return (
    <div>
      {/* Tab Pills Row */}
      <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-3 mb-10 sm:mb-14 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {tabsData.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide border-2 transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${activeTab === tab.id
              ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-lg'
              : 'bg-white text-[#0a0a0a] border-neutral-300 hover:border-[#0a0a0a] hover:bg-neutral-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panel */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.215, 0.610, 0.355, 1.000] }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
      >
        {/* Left: Text Content */}
        <div className="text-left space-y-5">
          <h3 className="text-xl sm:text-2xl font-black text-[#0a0a0a] leading-snug tracking-tight">
            {active.title}
          </h3>
          <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
            {active.description}
          </p>
          <ul className="space-y-3 pt-2">
            {active.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 font-medium">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#8ad43a] shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Screenshot Image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-200">
            <img
              src={active.image}
              alt={active.label + ' dashboard'}
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Decorative shadow glow behind image */}
          <div className="absolute -inset-4 bg-[#b5ff66]/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}

const bgColors = ["#f1fff7ff", "#e4faffff", "#f2ffd2ff", "rgba(255, 234, 250, 1)", "#ddfff7ff"];

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  const audienceRef = useRef(null);
  const pinRef = useRef(null);

  const audienceCards = [
    {
      tag: "Creators",
      bg: "#00ff62ff",
      title: "For Creators",
      desc: "Stop staring at a blank screen. Generate a month of content ideas, repurpose across platforms, and schedule everything automatically.",
      image: tabCreation,
    },
    {
      tag: "Agencies",
      bg: "#00d5ffff",
      title: "For Agencies",
      desc: "Run every client's content calendar, approvals, and moderation from one AI-powered dashboard. Scale without scaling headcount.",
      image: tabInbox,
    },
    {
      tag: "Brands",
      bg: "#c3ff2bff",
      title: "For Brands",
      desc: "Stay consistent across every channel, without a large team. Schedule campaigns and track growth from one command center.",
      image: tabAutomation,
    },
    {
      tag: "E-Commerce",
      bg: "#ff60baff",
      title: "For E-Commerce",
      desc: "Automate product launches, schedule promotions and keep your storefront active every day with AI.",
      image: tabLinkinbio,
    },
    {
      tag: "Influencers",
      bg: "#67ffdbff",
      title: "For Influencers",
      desc: "Grow your audience faster with AI content planning, scheduling and moderation.",
      image: tabAicreation,
    },
  ];

  // ── Lenis smooth scroll ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      gestureDirection: "vertical",
      smoothTouch: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  // ── Audience section GSAP animation ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      const imgs = gsap.utils.toArray(".audience-image");

      // Set z-index for overlapping slides
      imgs.forEach((img, idx) => {
        img.style.zIndex = imgs.length - idx;
      });

      const gridEl = audienceRef.current?.querySelector('.grid');

      // Scrub timeline for slide wipes, objectPosition parallax, and color transitions
      const triggerTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: gridEl || audienceRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        }
      });

      const imgElements = imgs.map(img => img.querySelector('img'));
      gsap.set(imgElements, {
        clipPath: "inset(0%)",
        objectPosition: "50% 0%",
      });

      imgElements.forEach((img, index) => {
        const nextImage = imgElements[index + 1];
        if (nextImage) {
          triggerTimeline
            .to(img, {
              clipPath: "inset(0px 0px 100%)", // wipe up reveal
              objectPosition: "50% 100%",       // parallax drift
              ease: "none",
              duration: 1.5,
            })
            .to(audienceRef.current, {
              backgroundColor: bgColors[index + 1],
              ease: "none",
              duration: 1.5,
            }, "<");
        }
      });

    }, audienceRef);

    return () => ctx.revert();
  }, []);

  // ── Global parallax animations ──
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // 1. Hero background image — moves slower than scroll (classic parallax)
      gsap.to(".parallax-hero-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 2. Hero neon blobs — float at different rates for depth
      gsap.to(".parallax-blob-1", {
        yPercent: 60,
        xPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".parallax-blob-2", {
        yPercent: 40,
        xPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Hero content — rises slightly faster than scroll
      gsap.to(".parallax-hero-content", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 4. Stats section — numbers slide up with parallax
      gsap.utils.toArray(".parallax-stat").forEach((stat, i) => {
        gsap.from(stat, {
          y: 60 + i * 20,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stat,
            start: "top 90%",
            end: "top 50%",
            scrub: true,
          },
        });
      });

      // 5. Section headings — subtle float up parallax
      gsap.utils.toArray(".parallax-heading").forEach((heading) => {
        gsap.from(heading, {
          y: 50,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heading,
            start: "top 95%",
            end: "top 60%",
            scrub: true,
          },
        });
      });

      // 6. How It Works cards — staggered parallax rise
      gsap.utils.toArray(".parallax-step-card").forEach((card, i) => {
        gsap.from(card, {
          y: 80 + i * 30,
          opacity: 0,
          scale: 0.95,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 95%",
            end: "top 55%",
            scrub: true,
          },
        });
      });

      // 7. Social proof glow orbs — drift with scroll
      gsap.to(".parallax-glow-1", {
        yPercent: -40,
        xPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-social-proof",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".parallax-glow-2", {
        yPercent: 30,
        xPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-social-proof",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // 8. CTA banner — scale up as it enters view
      gsap.from(".parallax-cta-banner", {
        scale: 0.85,
        opacity: 0,
        y: 60,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-cta-banner",
          start: "top 90%",
          end: "top 40%",
          scrub: true,
        },
      });

      // 9. Product showcase ambient glow — parallax drift
      gsap.to(".parallax-showcase-glow", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-showcase",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // Mobile-friendly fade-up (lighter parallax)
    mm.add("(max-width: 767px)", () => {
      gsap.utils.toArray(".parallax-heading, .parallax-step-card, .parallax-stat").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            end: "top 70%",
            scrub: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="w-full bg-white text-black landing-page-container relative select-none">

      {/* ── 1. HERO SECTION ── */}
      <div className="parallax-hero relative w-full min-h-[100svh] sm:min-h-[95vh] flex flex-col justify-between overflow-hidden text-white bg-[#0c0d14]">

        {/* Background Hero Image — progressive load */}
        <div className="parallax-hero-bg absolute inset-0 w-full h-full pointer-events-none z-0 select-none overflow-hidden">
          {/* Tiny blurred placeholder (1 KB — loads instantly) */}
          <img
            src={heroBgTiny}
            alt=""
            aria-hidden="true"
            className="absolute top-0 left-0 h-full w-full object-cover object-center"
            style={{ filter: 'blur(20px)', transform: 'scale(1.1)', opacity: heroLoaded ? 0 : 1, transition: 'opacity 0.6s ease' }}
          />
          {/* Optimized full image (82 KB) */}
          <img
            src={heroBg}
            alt="Man with a phone in hand"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setHeroLoaded(true)}
            className="absolute top-0 left-0 h-full w-full object-cover object-center"
            style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent z-2" />
        </div>

        {/* Ambient Neon Blobs */}
        <div className="parallax-blob-1 absolute top-[10%] -left-[10%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#9333ea] rounded-full opacity-35 filter blur-[120px] pointer-events-none z-[1]" />
        <div className="parallax-blob-2 absolute bottom-[10%] -right-[10%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#A855F7] rounded-full opacity-20 filter blur-[120px] pointer-events-none z-[1]" />

        {/* Main Hero Content */}
        <div className="parallax-hero-content mx-auto px-6 sm:px-8 lg:px-12 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12  relative z-10 ">

          {/* Left Side: Copy and Floating Bubbles */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-4 font-sans pt-30 sm:pt-30">

            {/* Main Headline */}
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-6xl md:text-[5rem] font-black uppercase tracking-tight leading-[0.9] text-white"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              GROW SMARTER,<br />
              <span className="text-transparent text-3xl sm:text-6xl md:text-[5rem] bg-clip-text bg-gradient-to-r from-[#ffffff] to-[#ffffff]">NOT HARDER</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-xl leading-relaxed font-semibold font-sans"
            >
              Focus on Product & Creation. Our Automation will handle the social protection and ideation.
            </motion.p>

            {/* Start Now CTA Button */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="pt-2"
            >
              <a
                href="/signup/"
                className="inline-block bg-[#ff5de2] hover:bg-[#7e22ce] text-white text-md font-bold uppercase tracking-wider px-10 py-4 rounded-full transition-all duration-300 shadow-[0_10px_25px_rgba(147,51,234,0.3)] hover:scale-105"
              >
                Start Now
              </a>
            </motion.div>

            {/* Floating Chat Bubbles Stack */}
            <div className="flex flex-col w-full max-w-md pt-8 space-y-4 items-start">

              {/* Bubble 1: AI Auto Reply (Purple) */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 1.0 }}
                className="ml-8 sm:ml-20 w-[220px] sm:w-[240px] lg:w-[260px] shrink-0 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-3xl p-4 shadow-[0_10px_30px_rgba(124,58,237,0.25)]"
              >
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 flex justify-between">
                </p>
                <p className="text-sm font-semibold mb-3">
                  Hi, here's your PDF link you asked! 🚀
                </p>
                <a
                  href="#pdf"
                  onClick={(e) => e.preventDefault()}
                  className="w-full inline-flex place-content-center items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl border border-white/20 transition-all"
                >
                  Grab Your PDF
                </a>
              </motion.div>

              {/* Bubble 2: User Comment (Grey) */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 2.5 }}
                className="flex items-start gap-2.5 max-w-full sm:max-w-[85%] shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-600 text-xs font-bold text-white flex items-center justify-center shrink-0 uppercase">
                  U
                </div>
                <div className="w-[240px] sm:w-[260px] lg:w-[280px] shrink-0 bg-[#2a2b36] text-white rounded-[20px] p-3.5 shadow-md border border-white/5 text-left">
                  <p className="text-xs font-bold text-neutral-400 mb-0.5">@buyer_max</p>
                  <p className="text-sm font-medium text-neutral-200">
                    Can i get more information or website?
                  </p>
                </div>
              </motion.div>

              {/* Bubble 3: AI Auto DM (Purple) */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 3.5 }}
                className="ml-8 sm:ml-20 w-[220px] sm:w-[240px] lg:w-[260px] shrink-0 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-[24px] p-4 shadow-[0_10px_30px_rgba(124,58,237,0.25)] border border-white/10"
              >
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 flex justify-between">
                  <span>AI Auto DM</span>
                  <span className="font-medium lowercase opacity-70">now</span>
                </p>
                <p className="text-sm font-semibold mb-3">
                  YES Sure! Check this out 👇
                </p>
                <a
                  href="#website"
                  onClick={(e) => e.preventDefault()}
                  className="w-full place-content-center inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl border border-white/20 transition-all"
                >
                  Let's Go!
                </a>
              </motion.div>

            </div>

          </div>

          {/* Right Side: Empty to keep creator photo visible */}
          <div className="hidden lg:block lg:col-span-5" />

        </div>

        {/* Bottom Logo Bar */}
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 relative z-10 mb-8 flex justify-center lg:justify-end">
          <div className="flex items-center gap-3.5 bg-black/45 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-lg">
            <div className="flex gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center p-1">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.46 5.518 3.753 7.158v3.584c0 .325.263.59.588.59.13 0 .256-.043.36-.123l3.966-3.05a10.822 10.822 0 0 0 3.333.518c5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.03 12.268-2.624-2.8-5.116 2.8 5.617-5.967 2.624 2.8 5.116-2.8-5.617 5.967z" />
                </svg>
              </span>
              <span className="w-6 h-6 rounded-full bg-blue-350 text-white flex items-center justify-center font-bold text-sm">f</span>
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FFB800] via-[#FF007A] to-[#7600FF] text-white flex items-center justify-center p-1.5">
                <svg className="w-full h-full stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                </svg>
              </span>
            </div>
            <span className="text-white font-extrabold text-xs tracking-widest uppercase font-sans">
              META API APPROVED
            </span>
          </div>
        </div>

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
      <div className="w-full bg-gradient-to-r from-[#fbff00]  to-[#fbff00] py-12 md:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center text-black">
            <div className="parallax-stat space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">10X</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Faster Content Creation</div>
            </div>
            <div className="parallax-stat space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">40HRS</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Saved Per Month</div>
            </div>
            <div className="parallax-stat space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">14,000+</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Comments Moderated</div>
            </div>
            <div className="parallax-stat space-y-1">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">97%</div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-95">Accuracy of AI</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. PRODUCT SHOWCASE TABS ── */}
      <div className="parallax-showcase w-full bg-white py-20 md:py-28 relative z-10">
        {/* Subtle green ambient glow behind section */}
        <div className="parallax-showcase-glow absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#b5ff66]/15 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="parallax-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase" style={{ fontFamily: 'Sora, sans-serif' }}>
              Designed for those <span className="font-serif italic lowercase text-[#6bb51f] normal-case">who scale.</span>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-base sm:text-lg text-neutral-500 mb-12 font-medium"
          >
            Each one a full product in its own right
          </motion.p>

          {/* Tab Pills */}
          <ProductShowcaseTabs />
        </div>
      </div>

      {/* ── 5. BUILT FOR EVERY GROWTH STAGE (GSAP STICKY SCROLL SECTION) ── */}
      <section
        ref={audienceRef}
        className="relative py-32 text-white transition-colors duration-500 w-full z-10"
        style={{ backgroundColor: bgColors[0] }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="inline-block px-5 py-2 rounded-full bg-black text-white text-xs font-black tracking-widest uppercase border border-white/10">
              Who It's For
            </span>
            <h2 className="mt-8 text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-black font-display">
              Built for every{" "}
              <span className="italic font-serif text-[#6bb51f] normal-case">
                growth stage.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* LEFT: Text description slides */}
            <div className="space-y-4 lg:col-span-5">
              {audienceCards.map((card, index) => (
                <div
                  key={index}
                  className="audience-card h-auto lg:h-screen flex flex-col justify-center py-8 lg:py-0"
                >
                  <div className="p-8 sm:p-12 relative overflow-hidden w-full">
                    <div
                      className="absolute inset-0 opacity-10 audience-glow pointer-events-none"
                      style={{ background: card.color }}
                    ></div>
                    <span
                      className="text-black relative inline-block px-8 py-4 rounded-full text-x uppercase font-black tracking-widest mb-6 sm:mb-8 font-sans"
                      style={{
                        background: card.bg
                      }}
                    >
                      {card.tag}
                    </span>
                    <h3
                      className="relative text-3xl sm:text-5xl font-black uppercase mb-6 sm:mb-8 font-display"
                      style={{ color: card.color }}
                    >
                      {card.title}
                    </h3>
                    <p className="relative leading-relaxed  sm:text-lg font-sans text-black">
                      {card.desc}
                    </p>

                    {/* Mobile Image (Hidden on Desktop) */}
                    <div className="block lg:hidden w-full h-[220px] sm:h-[300px] rounded-2xl overflow-hidden border border-white/5 shadow-lg mt-6 bg-[#0c0d14]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Pinned images container */}
            <div
              ref={pinRef}
              className="hidden lg:flex h-screen items-center justify-center sticky top-0 self-start w-full lg:col-span-7"
            >
              <div className="relative w-full h-[380px] md:h-[480px] rounded-[40px] overflow-hidden  bg-[#0c0d14]">
                {audienceCards.map((card, index) => (
                  <div
                    key={index}
                    className="audience-image absolute inset-0 w-full h-full"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 "
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS (SIMPLE, AUTONOMOUS EXECUTION.) ── */}
      <div className="w-full bg-white py-24 relative z-10 text-center">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Tag */}
          <span className="inline-flex items-center gap-1.5 bg-[#f5f3ff] text-[#6366f1] text-[11px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 border border-[#e0e7ff] font-sans">
            <Sparkles className="w-3.5 h-3.5 fill-[#6366f1]/10" />
            How It Works
          </span>

          {/* Heading */}
          <h2 className="parallax-heading text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 font-sans">
            Simple, <span className="text-[#6366f1]">Autonomous</span> Execution.
          </h2>

          {/* Subtitle */}
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-16">
            SocialFuse runs in the background so you can focus on creating while we handle the noise.
          </p>

          {/* Cards Flex Container (Horizontal on Desktop, Vertical on Mobile) */}
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-3 w-full mx-auto">

            {/* Card 1: Connect Channels */}
            <div className="parallax-step-card flex-1 bg-white border border-slate-100 rounded-[32px] p-8 text-left shadow-[0_20px_50px_rgba(243,232,255,0.45)] hover:shadow-[0_20px_50px_rgba(243,232,255,0.7)] transition-all duration-300 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-xs font-bold text-slate-700">
                    01
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-6">Connect Channels</h3>
                <div className="w-8 h-1 bg-purple-500 rounded-full mt-2.5 mb-4" />
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Securely link your social profiles via official Meta authentication. No passwords. Fully compliant.
                </p>
              </div>

              {/* Bottom Visual: Connected Nodes */}
              <div className="relative h-32 flex items-center justify-center mt-4">
                {/* Connecting dash circles */}
                <div className="absolute w-40 h-40 border border-dashed border-slate-200/80 rounded-full animate-[spin_40s_linear_infinite]" />
                <div className="absolute w-28 h-28 border border-dashed border-slate-200/50 rounded-full" />

                {/* Instagram Node (Center) */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <img src={instagramIcon} alt="Instagram" className="w-8 h-8 object-contain" />
                  </div>
                  {/* Purple Check badge at bottom right */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Left Node: Facebook */}
                <div className="absolute left-10 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>

                {/* Right Node: Chat Bubble */}
                <div className="absolute right-10 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.14 2 11.24c0 2.91 1.455 5.513 3.75 7.234V22l3.354-1.84c.907.25 1.874.39 2.896.39 5.523 0 10-4.14 10-9.24C22 6.14 17.523 2 12 2zm1.18 11.65l-2.02-2.15-3.94 2.15 4.33-4.6 2.07 2.15 3.89-2.15-4.33 4.6z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Desktop Connector Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center self-center px-1 text-slate-300">
              <div className="w-8 h-8 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Card 2: Automate & Schedule */}
            <div className="parallax-step-card flex-1 bg-white border border-slate-100 rounded-[32px] p-8 text-left shadow-[0_20px_50px_rgba(219,234,254,0.45)] hover:shadow-[0_20px_50px_rgba(219,234,254,0.7)] transition-all duration-300 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-xs font-bold text-slate-700">
                    02
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-6">Automate & Schedule</h3>
                <div className="w-8 h-1 bg-blue-500 rounded-full mt-2.5 mb-4" />
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Use our AI workspace to draft content, schedule posts, and activate automated comment moderation.
                </p>
              </div>

              {/* Bottom Visual: Calendar & Moderation Mockup */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mt-4 flex flex-col gap-2.5 relative overflow-hidden h-32 justify-center">
                {/* Visual Calendar Grid Background */}
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 gap-2 p-3 opacity-20 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="border border-slate-300 rounded bg-white" />
                  ))}
                </div>

                {/* Badge 1: Schedule Post */}
                <div className="relative z-10 flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] w-fit self-start">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800">Schedule Post</div>
                    <div className="text-[8px] text-slate-400">Tomorrow, 10:00 AM</div>
                  </div>
                </div>

                {/* Badge 2: Auto Moderation */}
                <div className="relative z-10 flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] w-fit self-end -mt-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800">Auto Moderation</div>
                    <div className="text-[8px] text-emerald-500 font-semibold">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Connector Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center self-center px-1 text-slate-300">
              <div className="w-8 h-8 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Card 3: Track Growth */}
            <div className="parallax-step-card flex-1 bg-white border border-slate-100 rounded-[32px] p-8 text-left shadow-[0_20px_50px_rgba(220,252,231,0.45)] hover:shadow-[0_20px_50px_rgba(220,252,231,0.7)] transition-all duration-300 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-xs font-bold text-slate-700">
                    03
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-6">Track Growth</h3>
                <div className="w-8 h-1 bg-emerald-500 rounded-full mt-2.5 mb-4" />
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Watch your reach expand and monitor automated actions in real-time through a data-packed analytics dashboard.
                </p>
              </div>

              {/* Bottom Visual: Analytics Charts */}
              <div className="grid grid-cols-2 gap-3 mt-4 h-32 items-center">
                {/* Left Card: Reach */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Reach</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">128.4K</div>
                    <span className="text-[7px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-0.5">
                      ▲ 24.6%
                    </span>
                  </div>
                  {/* SVG Sparkline Graph */}
                  <svg className="w-full h-8 stroke-emerald-500 fill-emerald-500/5 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,25 Q15,10 30,20 T60,5 T90,15 T100,8 L100,30 L0,30 Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right Card: Filtered Comments */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Comments Filtered</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-1">1,293</div>
                  </div>
                  {/* Miniature Bar Chart */}
                  <div className="flex items-end gap-1 h-10 mt-1">
                    <div className="bg-emerald-400/30 rounded-t w-full h-4" />
                    <div className="bg-emerald-400/50 rounded-t w-full h-6" />
                    <div className="bg-emerald-400/30 rounded-t w-full h-3" />
                    <div className="bg-emerald-400/80 rounded-t w-full h-8" />
                    <div className="bg-emerald-500 rounded-t w-full h-10" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f8fafc]/80 border border-slate-100 px-6 py-2.5 rounded-full text-[11px] font-semibold text-slate-500 mx-auto mt-16 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Built for creators. Backed by automation. Driven by results.
          </div>
        </div>
      </div>

      {/* ── 6.2 INSTAGRAM AI AUTOMATION ANIMATION SECTION ── */}
      <InstagramAutomation />

      {/* ── 6.5 INTERACTIVE COMMENT THREAT VISUALISER ── */}
      <div className="w-full bg-[#f8fafc] py-24 relative z-10 text-center border-y border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <span className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            Live Threat Analysis
          </span>
          <h2 className="parallax-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 uppercase mb-4 font-sans">
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
      <div className="parallax-social-proof w-full bg-[#071600] py-24 relative z-10 text-center overflow-hidden">

        {/* Glow Effects */}
        <div className="parallax-glow-1 absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#b5ff66]/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="parallax-glow-2 absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#39ff14]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Pill Tag */}
          <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-pink-300 text-slate-900 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            What people are saying
          </span>

          {/* Heading */}
          <h2 className="parallax-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-16 font-sans">
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
          <div className="parallax-cta-banner w-full bg-gradient-to-br from-[#8ad43a] via-[#b5ff66] to-[#6bb51f] rounded-[50%_50%] py-16 px-8 sm:py-24 sm:px-16 md:py-28 md:px-32 flex flex-col items-center text-center justify-center shadow-xl relative overflow-hidden min-h-[320px] md:min-h-[420px]">
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
