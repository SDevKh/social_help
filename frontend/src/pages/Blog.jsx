import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, Clock, ArrowRight, Sparkles } from 'lucide-react';

const categories = ['All', 'AI & Safety', 'Tutorials', 'E-commerce', 'Community'];

const blogPosts = [
  {
    id: 1,
    title: "How AI is Combating Comment Impersonator Bots on Social Media",
    excerpt: "Explore how deep learning pattern sweep engines identify and hide fake prize giveaways and scam links automatically.",
    category: "AI & Safety",
    author: "Dr. Ryan Vance",
    date: "May 24, 2026",
    readTime: "5 min read",
    image: "🤖",
    featured: true,
  },
  {
    id: 2,
    title: "Meta API Redirection Rules: A 2026 Guide for Agencies",
    excerpt: "Learn how to configure secure login redirect permissions across multi-brand client portfolios without password sharing.",
    category: "Tutorials",
    author: "Elena Rostova",
    date: "May 18, 2026",
    readTime: "8 min read",
    image: "🔑",
    featured: false,
  },
  {
    id: 3,
    title: "Maximizing Ad ROIs by Suppressing Comment Link Hijacks",
    excerpt: "How e-commerce stores protect their ad budgets by cleaning social comment sections from competitor discount hijackers.",
    category: "E-commerce",
    author: "David Vance",
    date: "May 12, 2026",
    readTime: "4 min read",
    image: "🛒",
    featured: false,
  },
  {
    id: 4,
    title: "The Psychology of Clean Comment Sections for Fan Engagement",
    excerpt: "Why creating safe, toxic-free spaces increases positive customer comments, brand loyalty, and organic engagement.",
    category: "Community",
    author: "Sarah Jenkins",
    date: "May 08, 2026",
    readTime: "6 min read",
    image: "💬",
    featured: false,
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(p => p.featured);

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent text-slate-900">
      {/* Background gradients */}
      <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-[#C2FF81]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#C2FF81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
            Resources & Blog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black font-display">
            AI & Safety Insights
          </h1>
          <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
            Stay up to date with the latest tactics in community moderation, brand safety settings, and AI engagement automation.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-200/60 pb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all ${
                  selectedCategory === cat 
                    ? 'bg-black text-[#C2FF81] border-black shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-black shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, safety guides..."
              className="w-full bg-white border border-slate-200 focus:border-black focus:outline-none rounded-full py-3 pl-11 pr-4 text-sm text-slate-900 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 text-left group"
            >
              {/* Header Visual icon */}
              <div className="aspect-video bg-[#C2FF81]/15 border-b border-slate-200/60 flex items-center justify-center text-5xl select-none">
                {post.image}
              </div>

              {/* Copy details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    {post.category}
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-black leading-snug group-hover:text-black transition-colors font-display">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{post.date}</span>
                  <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300 font-epunda">
                    Read article 
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Capture Section */}
        <section className="bg-slate-50 border border-slate-200 p-8 rounded-3xl max-w-4xl mx-auto text-left relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2FF81]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Stay updated
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-black font-display">Join the Safety newsletter</h2>
              <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                Weekly insights on combatting spam bots, algorithms upgrades, and safety guidelines.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full sm:flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-black transition-colors shadow-inner"
              />
              <button className="px-6 py-3 rounded-xl bg-black hover:bg-slate-900 text-[#C2FF81] font-bold text-sm transition-all shadow-md">
                Subscribe
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
