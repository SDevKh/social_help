import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, ChevronDown, ChevronUp, ArrowRight, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    planKey: 'starter',
    desc: 'Perfect for content creators and indie brands starting out.',
    priceMonthly: 15,
    priceYearly: 12,
    features: [
      'Up to 5,000 comments scanned / mo',
      'Toxicity sentiment scan shield',
      'Hindi & Hinglish profanity lexicon',
      'Custom keywords blocklist',
      '1 Connected Instagram Business profile',
      'Standard support callback (24h)',
    ],
    cta: 'Choose Starter',
    popular: false,
    contactSales: false,
  },
  {
    name: 'Pro',
    planKey: 'pro',
    desc: 'For growing e-commerce brands and active creators.',
    priceMonthly: 49,
    priceYearly: 39,
    features: [
      'Up to 25,000 comments scanned / mo',
      'AI Engagement Pilot replies',
      'Sarcasm scan detection filters',
      'Link & Crypto scam blockers',
      'Up to 3 Social profiles connected',
      'Premium priority support (4h)',
      'Shared moderator dashboard access',
    ],
    cta: 'Upgrade to Pro Now',
    popular: true,
    contactSales: false,
  },
  {
    name: 'Agency',
    planKey: 'agency',
    desc: 'For multi-brand agencies and enterprise marketing teams.',
    priceMonthly: 149,
    priceYearly: 119,
    features: [
      'Up to 150,500 comments scanned / mo',
      'Team seats allocation (Up to 10 admins)',
      'Custom API & Webhooks integrations',
      'Bespoke toxicity threshold training',
      'Unlimited Social profiles connected',
      'Dedicated account manager assistance',
      'Dedicated uptime SLAs (99.9%)',
    ],
    cta: 'Contact Sales',
    popular: false,
    contactSales: true,
  },
];

const faqs = [
  {
    q: 'Can I cancel or change my plan anytime?',
    a: 'Yes, absolutely. You can upgrade, downgrade, or cancel at any time from your account dashboard. No contracts, no penalties.',
  },
  {
    q: 'Is connecting my account safe?',
    a: "Yes. We authenticate exclusively via Meta's official OAuth flow. We never see or store your passwords.",
  },
  {
    q: 'What happens if I exceed my monthly comment limits?',
    a: 'We notify you at 80% and 100% of your limits. If exceeded, we queue comments but pause auto-hiding until you upgrade or your cycle resets.',
  },
  {
    q: 'Do you support multi-lingual moderation?',
    a: 'Yes! Our models are trained on English, Spanish, Hindi, Hinglish, and several local dialects.',
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [commentVolume, setCommentVolume] = useState(10000);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [currentUserPlan, setCurrentUserPlan] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const r = await fetch('/api/subscription/status/', { credentials: 'include' });
        if (r.ok) {
          const data = await r.json();
          if (data.is_paid && data.tier) {
            setCurrentUserPlan(data.tier);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    fetchStatus();
  }, []);

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  };

  const handleCheckout = async (planKey) => {
    setCheckoutLoading(planKey);
    try {
      const r = await fetch('/api/polar/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        credentials: 'include',
        body: JSON.stringify({ tier: planKey }),
      });
      if (!r.ok) {
        if (r.status === 401 || r.status === 403) {
           throw new Error(`Authentication error (${r.status}). Ensure you are fully logged in and CSRF tokens are valid.`);
        }
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to start checkout');
      }
      const data = await r.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      alert(e.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const hoursSpentMod = Math.round((commentVolume * 25) / 3600);
  const costSavings = Math.round(hoursSpentMod * 22);
  const toggleFaq = (i) => setExpandedFaq(expandedFaq === i ? null : i);

  return (
    <div className="w-full min-h-screen bg-white">

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <span className="neon-tag neon-tag-purple mb-6 inline-block">Pricing Plans</span>
        <h1 className="text-5xl sm:text-7xl font-display text-[#0a0a0a] mb-4">
          Simple, Transparent<br /><span className="text-[#3d00d6]">Pricing.</span>
        </h1>
        <p className="text-[#0a0a0a]/60 text-base sm:text-lg max-w-xl mx-auto font-medium">
          Choose a plan that matches your scale. Save 20% with annual billing.
        </p>
      </section>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-14">
        <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]/40'}`}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="w-14 h-8 rounded-full bg-white border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] p-1 flex items-center"
        >
          <div className={`w-5 h-5 rounded-full border-2 border-[#0a0a0a] transition-all duration-200 ${billingCycle === 'yearly' ? 'translate-x-6 bg-[#3d00d6]' : 'translate-x-0 bg-[#ff2d78]'}`} />
        </button>
        <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]/40'}`}>
          Yearly
          <span className="ml-2 neon-tag neon-tag-cyan text-[10px] py-0.5 px-2">Save 20%</span>
        </span>
      </div>

      {/* Pricing cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const isPro = plan.planKey === 'pro';
            const isAgency = plan.planKey === 'agency';
            const cardBg = isPro ? 'bg-[#3d00d6]' : isAgency ? 'bg-[#ff2d78]' : 'bg-white';
            const textMain = isPro || isAgency ? 'text-white' : 'text-[#0a0a0a]';
            const textMuted = isPro || isAgency ? 'text-white/70' : 'text-[#0a0a0a]/60';
            const checkColor = isPro || isAgency ? 'text-[#ffe600]' : 'text-[#3d00d6]';
            const divider = isPro || isAgency ? 'border-white/20' : 'border-[#0a0a0a]/10';
            const isLoading = checkoutLoading === plan.planKey;

            return (
              <div
                key={plan.name}
                className={`${cardBg} border-[3px] border-[#0a0a0a] rounded-2xl p-8 flex flex-col justify-between relative shadow-[6px_6px_0px_#0a0a0a] transition-transform hover:-translate-y-1`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 neon-tag neon-tag-yellow whitespace-nowrap">
                    ⚡ Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className={`text-2xl font-display ${textMain}`}>{plan.name}</h3>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>{plan.desc}</p>
                  <div className={`pt-2 flex items-baseline gap-1 border-t-2 ${divider}`}>
                    <span className={`text-5xl font-display ${textMain}`}>${price}</span>
                    <span className={`text-sm ${textMuted}`}>/ mo</span>
                  </div>
                </div>

                <ul className={`space-y-3 my-8 border-t-2 ${divider} pt-6 flex-1`}>
                  {plan.features.map((feat) => (
                    <li key={feat} className={`flex items-start gap-2.5 text-sm ${textMuted}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.contactSales ? (
                  <a
                    href="mailto:hello@socialfuse.app"
                    className="nb-btn-ghost w-full py-3.5 text-sm font-display text-center block"
                    style={{ borderColor: 'white', color: 'white' }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.planKey)}
                    disabled={isLoading || currentUserPlan === plan.planKey}
                    className={`w-full py-3.5 text-sm font-display text-center rounded-full border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0a0a0a] ${
                      isPro
                        ? 'bg-[#ffe600] text-[#0a0a0a]'
                        : 'bg-white text-[#0a0a0a]'
                    }`}
                  >
                    {isLoading ? 'Loading...' : (currentUserPlan === plan.planKey ? 'Current Plan' : plan.cta)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ROI Calculator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bento-card-yellow p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border-2 border-[#0a0a0a] flex items-center justify-center shadow-[3px_3px_0px_#3d00d6]">
              <ShieldCheck className="w-6 h-6 text-[#ffe600]" />
            </div>
            <div>
              <h2 className="text-2xl font-display text-[#0a0a0a]">ROI & Savings Calculator</h2>
              <p className="text-[#0a0a0a]/60 text-sm">See how much time and money you save.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#0a0a0a]">Monthly Comment Volume</span>
                <span className="neon-tag neon-tag-purple">{commentVolume.toLocaleString()}</span>
              </div>
              <input
                type="range" min="1000" max="100000" step="5000"
                value={commentVolume}
                onChange={(e) => setCommentVolume(Number(e.target.value))}
                className="w-full h-2 appearance-none cursor-pointer accent-[#3d00d6] bg-[#0a0a0a]/20"
              />
              <div className="flex justify-between text-[10px] text-[#0a0a0a]/50 font-mono-nb font-bold uppercase">
                <span>1k</span><span>50k</span><span>100k</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bento-card-indigo p-5 text-center">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono-nb block mb-1">Hours Saved</span>
                <span className="text-3xl font-display text-[#ffe600]">{hoursSpentMod}</span>
                <span className="text-xs text-white/60 block mt-1">hrs / month</span>
              </div>
              <div className="bento-card p-5 text-center">
                <span className="text-[10px] font-bold text-[#0a0a0a]/50 uppercase tracking-widest font-mono-nb block mb-1">Money Saved</span>
                <span className="text-3xl font-display text-[#3d00d6]">${costSavings.toLocaleString()}</span>
                <span className="text-xs text-[#0a0a0a]/50 block mt-1">avg. mod wage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-4xl font-display text-[#0a0a0a] text-center mb-10">FAQs</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="bento-card overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-base font-bold text-[#0a0a0a] text-left"
                >
                  <span>{faq.q}</span>
                  {isOpen
                    ? <ChevronUp className="w-5 h-5 text-[#3d00d6] shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-[#0a0a0a]/40 shrink-0" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-sm text-[#0a0a0a]/60 leading-relaxed border-t-2 border-[#0a0a0a]/10 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
