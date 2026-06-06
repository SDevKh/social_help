import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Quote, CheckCircle2, XCircle, Users, 
  Hourglass, BarChart, ArrowRight, ShieldCheck 
} from 'lucide-react';

const stats = [
  { label: 'Creators Protected', value: '12,000+', desc: 'Active channels & accounts' },
  { label: 'Comments Moderated', value: '45.2 Million', desc: 'Real-time NLP scans' },
  { label: 'Toxicity Suppressed', value: '1.8 Million', desc: 'Hidden spam & hate speech' },
  { label: 'Time Saved Globally', value: '120k Hours', desc: 'Auto-scanned & replied' },
];

const reviews = [
  {
    author: '@cooking_with_sam',
    role: 'Food Blogger (450k followers)',
    text: "Before SocialFuse, I dreaded opening my Instagram comments because of constant promo spam and trolls. Now my community is clean, and positive comments shine through.",
    rating: 5,
    avatarColor: 'bg-orange-500/20 text-orange-400'
  },
  {
    author: 'David Vance',
    role: 'E-commerce Manager at DapperThreads',
    text: "Competitors were running bots to post fake review links on our ad posts. SocialFuse blocked 100% of these links in under a second. Our sales conversions went up by 15%!",
    rating: 5,
    avatarColor: 'bg-blue-500/20 text-blue-450'
  },
  {
    author: '@tech_reviews_weekly',
    role: 'YouTube Creator (1.2M subscribers)',
    text: "Giveaway bots were taking over my channel and trying to scam my fans. SocialFuse Sweeper identified the bot patterns and hidden them. Highly recommend for any content creator.",
    rating: 5,
    avatarColor: 'bg-purple-500/20 text-purple-400'
  },
  {
    author: 'Elena Rostova',
    role: 'Operations Lead at ZenAgency',
    text: "We manage social accounts for 20+ corporate clients. Using the agency cockpit in SocialFuse has cut our moderation workload in half. Our clients love the safety reporting logs.",
    rating: 5,
    avatarColor: 'bg-emerald-500/20 text-emerald-400'
  }
];

export default function Testimonials() {
  return (
    <div className="relative z-10 w-full min-h-screen bg-white text-black grid-bg-white select-none">
      {/* Decorative Green Blobs */}
      <div className="absolute top-[12%] -left-[10%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-40 filter blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[8%] -right-[15%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-40 filter blur-[90px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-black text-[#b5ff66] text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            Reviews & Impact
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase">
            Loved by Creators & Brands
          </h1>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            See how SocialFuse protects brand reputation, blocks bot attacks, and saves hours of community management work every single week.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel glass-panel-hover p-6 rounded-[20px] text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">{stat.value}</span>
              <span className="text-[11px] text-slate-600 font-medium block">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Before vs After Audit Card */}
        <section className="glass-panel p-8 rounded-[28px] mb-20 text-left max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BarChart className="w-6 h-6 text-brand-orange" />
              Before & After Moderation
            </h2>
            <p className="text-slate-600 text-sm font-medium">Typical client brand profile before and after integrating SocialFuse.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                WITHOUT SOCIALFUSE
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 shrink-0 font-bold">15-18%</span>
                  <span>Trolls and negative spam links visible in comment threads.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 shrink-0 font-bold">14 hours</span>
                  <span>Average delay in hiding comment threats or offensive content.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 shrink-0 font-bold">High Risk</span>
                  <span>Vulnerable to competitor link hijacking and bot scams.</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                WITH SOCIALFUSE SHIELD
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 shrink-0 font-bold">&lt; 0.2%</span>
                  <span>Toxicity exposure index (Spam is hidden immediately).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 shrink-0 font-bold">&lt; 100ms</span>
                  <span>Scans and hides comments automatically in real time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 shrink-0 font-bold">100% Protected</span>
                  <span>Automatic reply pilots keep positive engagement active.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.author} className="glass-panel glass-panel-hover p-8 rounded-[28px] text-left flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-brand-orange">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-orange" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed font-medium italic">
                  "{rev.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className={`w-9 h-9 rounded-full ${rev.avatarColor} flex items-center justify-center font-bold text-sm`}>
                  {rev.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rev.author}</h4>
                  <p className="text-xs text-slate-650 font-bold">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
