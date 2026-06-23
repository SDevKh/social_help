import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, Clock, ArrowRight, Sparkles, X, Link } from 'lucide-react';

const categories = ['All', 'AI & Safety', 'Tutorials', 'E-commerce', 'Community'];

const fallbackBlogPosts = [
  {
    id: 5,
    title: "Introducing SocialFuse: The Ultimate AI Guardian for Instagram Comment Sections",
    slug: "introducing-socialfuse-ai-moderator",
    excerpt: "Learn how automated AI moderation protects your brand reputation, eliminates spam bots, and boosts organic engagement.",
    category: "AI & Safety",
    author: "SocialFuse Team",
    date: "June 23, 2026",
    readTime: "4 min read",
    image: "✨",
    featured: true,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">In the digital age, social media is the lifeblood of brand reputation and customer engagement. But for creators, brands, and agencies, Instagram comment sections have increasingly become a battleground. From spam bots pushing fake crypto prizes to competitors hijacking comments with redirect links, manually moderating comments is a time-consuming, frustrating uphill battle.</p>
      
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Enter SocialFuse: The Next-Gen AI Shield</h3>
      <p class="mb-4"><strong>SocialFuse</strong> was built from the ground up to solve this exact problem. By connecting directly to the Instagram Graph API and utilizing advanced AI models, SocialFuse automatically scans, filters, and moderates comment threads in real time.</p>
      
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Key Features of the Platform</h3>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Direct Meta Integration:</strong> Secure connection via standard Meta OAuth without sharing credentials.</li>
        <li><strong>Real-Time Scanning & Detection:</strong> Comments are processed instantly as they are posted.</li>
        <li><strong>Customizable Toxicity Thresholds:</strong> Tailor the AI's sensitivity to match your brand's voice and tolerance.</li>
        <li><strong>Robust Keyword & Phrase Filtering:</strong> Block specific words, links, and known spam patterns instantly.</li>
        <li><strong>Auto-Reply and Auto-Delete:</strong> Automatically reply publicly or send a direct message (DM) when users trigger a keyword, and auto-delete harmful comments.</li>
      </ul>
      
      <h3 class="text-xl font-bold text-black mt-8 mb-4">How SocialFuse AI Works</h3>
      <p class="mb-4">When a comment is posted, SocialFuse runs it through a series of analysis layers:</p>
      <ol class="list-decimal pl-6 space-y-2 mb-6">
        <li><strong>Keyword Matching:</strong> Instant lookup against your customized list of prohibited terms.</li>
        <li><strong>AI Sentiment & Toxicity Analysis:</strong> Evaluation using specialized language models (like VADER, HuggingFace toxicity scanners, and Groq LLMs) to evaluate the true intent, detecting sarcasm or hidden toxic statements that simple keyword blocks miss.</li>
        <li><strong>Automatic Moderation Action:</strong> Based on the outcome, the comment is safely kept, flagged for manual review on the dashboard, or deleted automatically via the Instagram API.</li>
      </ol>
      
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Next Steps to Build Brand Loyalty and Boost Organic Engagement</h3>
      <p class="mb-4">A clean comment section is more than just safe—it’s profitable. When spam is removed immediately:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li>Real followers feel safer and engage more.</li>
        <li>Competitor links do not steal your traffic or sales.</li>
        <li>Social algorithms favor comment threads with high-quality, authentic conversations, leading to increased organic reach and crawling efficiency.</li>
      </ul>
      <p class="mb-4">Ready to secure your community? Sign up for a SocialFuse plan today and let AI handle the heavy lifting!</p>
    `
  },
  {
    id: 1,
    title: "How AI is Combating Comment Impersonator Bots on Social Media",
    slug: "how-ai-combats-impersonator-bots",
    excerpt: "Explore how deep learning pattern sweep engines identify and hide fake prize giveaways and scam links automatically.",
    category: "AI & Safety",
    author: "Dr. Ryan Vance",
    date: "May 24, 2026",
    readTime: "5 min read",
    image: "🤖",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Comment impersonator bots have become highly sophisticated. They copy the avatar and handle of popular creators, add subtle special characters, and post automated links claiming you have won a prize.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">The Danger of Impersonator Bots</h3>
      <p class="mb-4">These bots hijack user trust, directing fans to malicious phishing sites. This damages creator credibility and leads to security warnings. Standard filters block static words, but bots adapt by using weird symbols (like 🅶🅸🆅🅴🅰🆆🅰🆈).</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">How Advanced AI Pattern Scanners Win</h3>
      <p class="mb-4">Modern AI doesn't just read the letters; it looks at the semantic intent and semantic structure. Neural networks identify intent markers (requests for shipping fees, redirection to third-party profiles) regardless of character substitution or obfuscation.</p>
    `
  },
  {
    id: 2,
    title: "Meta API Redirection Rules: A 2026 Guide for Agencies",
    slug: "meta-api-redirection-rules-agency-guide",
    excerpt: "Learn how to configure secure login redirect permissions across multi-brand client portfolios without password sharing.",
    category: "Tutorials",
    author: "Elena Rostova",
    date: "May 18, 2026",
    readTime: "8 min read",
    image: "🔑",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Managing multiple client Instagram accounts requires robust API security. This guide details how Meta's latest permission model facilitates secure delegation without credential sharing.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">The Principle of Least Privilege</h3>
      <p class="mb-4">Agencies should never ask for direct client passwords. Instead, use Facebook Business Manager to request partner access. This grants your system tokens with scopes like <code>instagram_manage_comments</code> and <code>pages_show_list</code>.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Configuring OAuth Redirects Safely</h3>
      <p class="mb-4">Ensure your redirect URI uses strict SSL and matches the domain verified in your Meta App Dashboard. Use cryptographically secure <code>state</code> parameters to validate the flow on your callback handler.</p>
    `
  },
  {
    id: 3,
    title: "Maximizing Ad ROIs by Suppressing Comment Link Hijacks",
    slug: "maximizing-ad-rois-suppressing-hijacks",
    excerpt: "How e-commerce stores protect their ad budgets by cleaning social comment sections from competitor discount hijackers.",
    category: "E-commerce",
    author: "David Vance",
    date: "May 12, 2026",
    readTime: "4 min read",
    image: "🛒",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">You pay for every click on your Instagram Ads. But did you know competitors and dropshippers are placing links to cheaper items directly in your comment sections?</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">The E-commerce Leak</h3>
      <p class="mb-4">When a customer is interested in your ad, they open the comment thread. If they see a link saying "get it cheaper here!", they click away. You are effectively paying for their advertising.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Securing the ROI</h3>
      <p class="mb-4">By setting up real-time links detection and competitor filters, you protect your digital ad budget. Auto-deleting suspicious links guarantees that the traffic generated by your ad stays focused on your store.</p>
    `
  },
  {
    id: 4,
    title: "The Psychology of Clean Comment Sections for Fan Engagement",
    slug: "psychology-clean-comment-sections",
    excerpt: "Why creating safe, toxic-free spaces increases positive customer comments, brand loyalty, and organic engagement.",
    category: "Community",
    author: "Sarah Jenkins",
    date: "May 08, 2026",
    readTime: "6 min read",
    image: "💬",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Humans are deeply affected by the social environment of a page. A comment thread filled with toxic arguments, spam, and insults discourages authentic users from participating.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">The Broken Window Theory of Comments</h3>
      <p class="mb-4">If a comment thread has unresolved spam and abuse, more spam and abuse will follow. If a page maintains clean, constructive threads, users are psychologically primed to write positive, engaging feedback.</p>
      <h3 class="text-xl font-bold text-black mt-8 mb-4">Boosting Organic Reach</h3>
      <p class="mb-4">When community members converse positively under your posts, algorithms notice the engagement length and push your posts to the Explore page. Keeping spam out keeps fans talking.</p>
    `
  }
];

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);

  // Fetch blog posts from Django API
  useEffect(() => {
    fetch('/api/blog/')
      .then(res => {
        if (!res.ok) throw new Error("API call failed");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Map backend slug, date formats if needed
          const formatted = data.map(post => ({
            ...post,
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            category: post.category,
            author: post.author,
            date: post.date ? new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Recent',
            readTime: post.read_time || '5 min read',
            image: post.image || '📝',
            featured: post.featured,
            contentHtml: post.content_html
          }));
          setDbPosts(formatted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Could not load database posts. Using default fallback posts.", err);
        setLoading(false);
      });
  }, []);

  const finalPosts = dbPosts.length > 0 ? dbPosts : fallbackBlogPosts;

  // Handle URL query parameters for dynamic post reading (?post=slug)
  useEffect(() => {
    const postSlug = searchParams.get('post');
    if (postSlug && finalPosts.length > 0) {
      const found = finalPosts.find(p => p.slug === postSlug);
      if (found) {
        setActivePost(found);
      }
    } else {
      setActivePost(null);
    }
  }, [searchParams, finalPosts]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (activePost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activePost]);

  const handleOpenPost = (post) => {
    setSearchParams({ post: post.slug });
  };

  const handleClosePost = () => {
    setSearchParams({});
  };

  const filteredPosts = finalPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];

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

        {/* Featured Post (If available and not searching) */}
        {featuredPost && !searchQuery && selectedCategory === 'All' && (
          <div className="mb-16">
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-0 text-left group">
              <div className="lg:col-span-7 bg-[#C2FF81]/10 flex items-center justify-center text-7xl p-12 lg:p-20 select-none border-b lg:border-b-0 lg:border-r border-slate-200/60">
                {featuredPost.image}
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-800">
                    <span className="bg-[#C2FF81] text-black px-2.5 py-1 rounded-md">{featuredPost.category}</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-black leading-tight font-display">
                    {featuredPost.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-xs font-bold text-black border border-black/10">
                      SF
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-black">{featuredPost.author}</p>
                      <p className="text-slate-500">{featuredPost.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOpenPost(featuredPost)}
                    className="px-5 py-3 rounded-full bg-black hover:bg-slate-900 text-[#C2FF81] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    Read Featured Post
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-200/60 pb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
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
          {filteredPosts.filter(p => !p.featured || searchQuery || selectedCategory !== 'All').map((post) => (
            <article 
              key={post.id} 
              className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 text-left group cursor-pointer"
              onClick={() => handleOpenPost(post)}
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
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-black leading-snug group-hover:text-black transition-colors font-display">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-650 leading-relaxed line-clamp-3">{post.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{post.date}</span>
                  <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
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
              <button className="px-6 py-3 rounded-xl bg-black hover:bg-slate-900 text-[#C2FF81] font-bold text-sm transition-all shadow-md cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Dynamic Overlay Modal Reader */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePost}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-zoom-out"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 text-left"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <span className="bg-[#C2FF81] text-black px-2 py-0.5 rounded">{activePost.category}</span>
                  <span className="text-slate-500">{activePost.readTime}</span>
                </div>
                <button 
                  onClick={handleClosePost}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
                {/* visual icon header */}
                <div className="w-20 h-20 bg-[#C2FF81]/20 border border-slate-200/60 rounded-2xl flex items-center justify-center text-4xl select-none">
                  {activePost.image}
                </div>

                {/* title & meta */}
                <div className="space-y-4">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-black leading-tight font-display">
                    {activePost.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-800">{activePost.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{activePost.date}</span>
                    </div>
                  </div>
                </div>

                {/* HTML post body content */}
                <div 
                  className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed text-slate-800"
                  dangerouslySetInnerHTML={{ __html: activePost.contentHtml }}
                />

                {/* Call To Action Box */}
                <div className="bg-[#C2FF81]/10 border border-[#C2FF81]/40 rounded-3xl p-6 sm:p-8 space-y-4 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg font-bold text-black font-display">Secure Your Comment Threads with SocialFuse AI</h3>
                    <p className="text-xs sm:text-sm text-slate-650">
                      Eliminate bot spam, block scams, and create a positive space for your community. Get started in minutes.
                    </p>
                  </div>
                  <a 
                    href="/pricing/"
                    onClick={() => { handleClosePost(); }}
                    className="px-6 py-3 rounded-full bg-black hover:bg-slate-900 text-[#C2FF81] font-bold text-sm whitespace-nowrap shadow-md transition-all cursor-pointer"
                  >
                    View Pricing & Plans
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
