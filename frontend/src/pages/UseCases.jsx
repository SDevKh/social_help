import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShoppingCart, Briefcase, Play, 
  TrendingUp, Award, Quote, HelpCircle, ShieldCheck 
} from 'lucide-react';

const useCases = [
  {
    id: 'creators',
    title: 'Content Creators',
    icon: Users,
    problem: 'Manually creating content daily, staying consistent across platforms, and managing community engagement is exhausting and unsustainable.',
    solution: 'SocialFuse generates 30 days of content in minutes, schedules across platforms automatically, and handles community moderation so you can focus on creating.',
    metrics: [
      { label: 'Content creation time saved', value: '10x faster' },
      { label: 'Time saved per week', value: '12 hrs' },
      { label: 'Increase in posting consistency', value: '+90%' },
    ],
    testimonial: {
      text: "SocialFuse changed everything. I went from posting twice a week to every day across 4 platforms — without burning out.",
      author: "@fitness_coach_emma",
      role: "YouTube & Instagram Creator"
    },
    accentColor: '#C2FF81',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Brands',
    icon: ShoppingCart,
    problem: 'Social media is a massive sales channel but managing consistent content, product posts, and community engagement across platforms drains the whole team.',
    solution: 'AI-generated product content, automated cross-platform scheduling, and comment protection keeps buyers focused on buying — not competitor spam.',
    metrics: [
      { label: 'More reach per post', value: '+38%' },
      { label: 'Increase in organic sales conversions', value: '+14%' },
      { label: 'Hours saved on content weekly', value: '20hrs' },
    ],
    testimonial: {
      text: "We tripled our posting frequency without hiring anyone. SocialFuse basically acts as our social media team.",
      author: "Sarah Jenkins",
      role: "Marketing Director at CosmeCart"
    },
    accentColor: '#C2FF81',
  },
  {
    id: 'agencies',
    title: 'Marketing Agencies',
    icon: Briefcase,
    problem: 'Managing dozens of client content calendars, approvals, and social profiles across multiple platforms is a logistical nightmare that kills margins.',
    solution: 'One unified AI dashboard to manage all client content workflows, scheduling, and moderation simultaneously — without scaling headcount.',
    metrics: [
      { label: 'Client profiles managed per seat', value: 'Unlimited' },
      { label: 'Reduction in operational overhead', value: '-60%' },
      { label: 'Client retention rating', value: '99.2%' },
    ],
    testimonial: {
      text: "SocialFuse let us scale our social media packages to 40+ brands without hiring more people. It's our secret weapon.",
      author: "Alex Rivers",
      role: "Founder at SparkMedia Group"
    },
    accentColor: '#C2FF81',
  },
  {
    id: 'youtubers',
    title: 'YouTubers & Video Pros',
    icon: Play,
    problem: 'Video creators spend hours repurposing content for different platforms, writing captions, and keeping up with a consistent publishing schedule.',
    solution: 'AI repurposes your video content into platform-optimized posts, writes captions automatically, and schedules everything so your audience stays engaged.',
    metrics: [
      { label: 'Content repurposed per video', value: '5+ posts' },
      { label: 'Audience engagement lift', value: '+52%' },
      { label: 'Time saved on cross-posting', value: '8hrs/week' },
    ],
    testimonial: {
      text: "I upload one video and SocialFuse turns it into a week of content across Instagram, Twitter, and LinkedIn. Game changer.",
      author: "TechReviewPro",
      role: "2.4M YouTube Subscriber Channel"
    },
    accentColor: '#C2FF81',
  }
];

export default function UseCases() {
  const [activeUseCase, setActiveUseCase] = useState('creators');

  const selectedCase = useCases.find(uc => uc.id === activeUseCase);

  return (
    <div className="relative z-10 w-full min-h-screen bg-white text-slate-900">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-[#C2FF81]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#C2FF81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
            Use Cases
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
            Built for Every Growth Stage
          </h1>
          <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
            Whether you're a solo creator or a 50-client agency, SocialFuse has a workflow built for how you grow.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            const isActive = uc.id === activeUseCase;
            return (
              <button
                key={uc.id}
                onClick={() => setActiveUseCase(uc.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all ${
                  isActive 
                    ? 'bg-black border-black text-[#C2FF81] shadow-lg' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? '#C2FF81' : '#64748b' }} />
                {uc.title}
              </button>
            );
          })}
        </div>

        {/* Active Use Case Details */}
        <AnimatePresence mode="wait">
          {selectedCase && (
            <motion.div
              key={selectedCase.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Text Specs */}
              <div className="space-y-8 text-left">
                <div className="space-y-4">
                  <h2 className="text-3xl font-extrabold text-black flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-black" style={{ color: '#C2FF81' }} />
                    For {selectedCase.title}
                  </h2>
                  
                  {/* Problem & Solution block */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        The Problem
                      </span>
                      <p className="text-slate-650 text-sm leading-relaxed">{selectedCase.problem}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-black bg-[#C2FF81] border border-black/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        The Solution
                      </span>
                      <p className="text-slate-650 text-sm leading-relaxed">{selectedCase.solution}</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative">
                  <Quote className="absolute top-4 right-6 w-12 h-12 text-black/5 pointer-events-none" />
                  <p className="text-slate-700 text-sm italic mb-4 leading-relaxed">
                    "{selectedCase.testimonial.text}"
                  </p>
                  <div>
                    <h4 className="text-sm font-bold text-black">{selectedCase.testimonial.author}</h4>
                    <p className="text-xs text-slate-500">{selectedCase.testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Display */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                  {selectedCase.metrics.map((metric) => (
                    <div key={metric.label} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{metric.label}</span>
                        <span className="text-2xl font-extrabold text-black">{metric.value}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-150">
                        <TrendingUp className="w-5 h-5 text-black" style={{ color: '#C2FF81' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
