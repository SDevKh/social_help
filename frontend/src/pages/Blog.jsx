import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, User, Clock, ArrowRight, Sparkles, Link, ArrowLeft } from 'lucide-react';

const categories = ['All', 'AI & Safety', 'Tutorials', 'E-commerce', 'Community'];

const fallbackBlogPosts = [
  {
    id: 5,
    title: "How to Automatically Delete Spam Comments on Instagram",
    slug: "how-to-automatically-delete-spam-comments-on-instagram",
    excerpt: "Discover the step-by-step guide to automate your comment moderation, eliminate spam bots, and protect your brand reputation in real-time.",
    category: "AI & Safety",
    author: "SocialFuse Engineering Team",
    date: "June 23, 2026",
    readTime: "6 min read",
    image: "✨",
    featured: true,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">In the modern digital economy, social media engagement is the single most valuable asset for brand authority and customer acquisition. However, as profiles scale, comment sections quickly descend into vulnerability vectors. From coordinate crypto phishing bots to competitor link hijackers, manual moderation is an expensive and losing battle. SocialFuse introduces an enterprise-grade AI guardian to secure your digital spaces automatically.</p>
      
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The Modern Threat Landscape of Social Spaces</h2>
      <p class="mb-4">Standard spam filters rely on simple static keyword checks, which are easily bypassed by modern bad actors using character substitutions (e.g., using 🅵🆁🅴🅴 instead of "free"). This lack of moderation leads to significant challenges:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Ad Spend Leakage:</strong> Competitors post affiliate discount codes under your paid promotion posts, hijacking traffic you bought.</li>
        <li><strong>Brand Degradation:</strong> Customer service threads are hijacked by fake support accounts offering refunds or stealing billing info.</li>
        <li><strong>Algorithmic Penalties:</strong> High concentrations of spam and user reports trigger shadowbans or decreased visibility in the Instagram Explore feed.</li>
      </ul>
      
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The SocialFuse Moderation Architecture</h2>
      <p class="mb-4">SocialFuse doesn't just filter text; it understands human intent. When a comment is posted on your connected Instagram business accounts, it traverses a real-time analysis pipeline within milliseconds:</p>
      
      <h3 class="text-xl font-bold text-black mt-6 mb-3">1. Multi-Stage Natural Language Processing (NLP)</h3>
      <p class="mb-4">Using advanced lexical models, the platform analyzes text structures. It calculates toxicity probabilities and cross-references them against custom keyword rules, detecting hostile, abusive, or spammy statements even when written using internet slang or typos.</p>
      
      <h3 class="text-xl font-bold text-black mt-6 mb-3">2. Sarcasm and Sentiment Resolution</h3>
      <p class="mb-4">Traditional tools flag neutral words and miss toxic statements wrapped in sarcasm. SocialFuse uses semantic context analysis (via LLM models) to evaluate the core emotional sentiment, assuring genuine feedback stays untouched while disguised hostility is neutralized.</p>
      
      <h3 class="text-xl font-bold text-black mt-6 mb-3">3. Immediate API Action and Dashboard Control</h3>
      <p class="mb-4">Once categorized, the system acts. Toxic comments are immediately deleted or hidden via Meta’s Graph API. Clean comments remain live, and uncertain statements are routed to a dashboard for quick manual approval.</p>
      
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">Optimizing Indexing and Algorithmic Crawls</h2>
      <p class="mb-4">A clean comment thread signals high quality to the platform algorithm. When toxic noise is purged:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li>Followers spend more time in your comment threads, boosting the "dwell time" metric that triggers viral discovery.</li>
        <li>Your post crawl eligibility improves, ensuring clean indexing for organic search presence.</li>
      </ul>
      
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">Secure and Compliance-First OAuth Setup</h2>
      <p class="mb-4">SocialFuse integrates natively using Meta's secure partner authentication protocols. You do not need to share passwords or account credentials. You delegate only comment management scopes, keeping your account fully secure and compliant with platform policies.</p>
      <p class="mb-6 font-semibold">Join the creators and marketing agencies who trust SocialFuse to protect their community footprint on autopilot.</p>
    `
  },
  {
    id: 1,
    title: "How to Delete Spam Comments on Instagram Automatically",
    slug: "how-to-delete-spam-comments-on-instagram-automatically",
    excerpt: "Learn the latest API workflows and AI rules to clean your Instagram comment sections from spam bots instantly.",
    category: "AI & Safety",
    author: "Dr. Ryan Vance",
    date: "May 24, 2026",
    readTime: "5 min read",
    image: "🤖",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Comment impersonator bots have become highly sophisticated. They copy the avatar and handle of popular creators, add subtle special characters, and post automated links claiming you have won a prize.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The Danger of Impersonator Bots</h2>
      <p class="mb-4">These bots hijack user trust, directing fans to malicious phishing sites. This damages creator credibility and leads to security warnings. Standard filters block static words, but bots adapt by using weird symbols (like 🅶🅸🆅🅴🅰🆆🅰🆈).</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">How Advanced AI Pattern Scanners Win</h2>
      <p class="mb-4">Modern AI doesn't just read the letters; it looks at the semantic intent and semantic structure. Neural networks identify intent markers (requests for shipping fees, redirection to third-party profiles) regardless of character substitution or obfuscation.</p>
    `
  },
  {
    id: 2,
    title: "Best Instagram Comment Moderation Tools in 2026",
    slug: "best-instagram-comment-moderation-tools-in-2026",
    excerpt: "An in-depth review and comparison of the top AI-powered comment filtration platforms for creators and enterprise brands.",
    category: "Tutorials",
    author: "Elena Rostova",
    date: "May 18, 2026",
    readTime: "8 min read",
    image: "🔑",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Managing multiple client Instagram accounts requires robust API security. This guide details how Meta's latest permission model facilitates secure delegation without credential sharing.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The Principle of Least Privilege</h2>
      <p class="mb-4">Agencies should never ask for direct client passwords. Instead, use Facebook Business Manager to request partner access. This grants your system tokens with scopes like <code>instagram_manage_comments</code> and <code>pages_show_list</code>.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">Configuring OAuth Redirects Safely</h2>
      <p class="mb-4">Ensure your redirect URI uses strict SSL and matches the domain verified in your Meta App Dashboard. Use cryptographically secure <code>state</code> parameters to validate the flow on your callback handler.</p>
    `
  },
  {
    id: 3,
    title: "CommentGuard vs SocialFuse: The Honest Comparison",
    slug: "commentguard-vs-socialfuse",
    excerpt: "Which Instagram comment moderation tool fits your agency workflow best? We compare features, AI accuracy, and API limits.",
    category: "E-commerce",
    author: "David Vance",
    date: "May 12, 2026",
    readTime: "4 min read",
    image: "🛒",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">You pay for every click on your Instagram Ads. But did you know competitors and dropshippers are placing links to cheaper items directly in your comment sections?</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The E-commerce Leak</h2>
      <p class="mb-4">When a customer is interested in your ad, they open the comment thread. If they see a link saying "get it cheaper here!", they click away. You are effectively paying for their advertising.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">Securing the ROI</h2>
      <p class="mb-4">By setting up real-time links detection and competitor filters, you protect your digital ad budget. Auto-deleting suspicious links guarantees that the traffic generated by your ad stays focused on your store.</p>
    `
  },
  {
    id: 4,
    title: "How AI Detects Toxic Comments on Social Media",
    slug: "how-ai-detects-toxic-comments",
    excerpt: "Unpacking the deep learning models, toxicity scoring, and lexical rules that shield digital community discussions.",
    category: "Community",
    author: "Sarah Jenkins",
    date: "May 08, 2026",
    readTime: "6 min read",
    image: "💬",
    featured: false,
    contentHtml: `
      <p class="lead text-lg font-medium text-slate-700 mb-6">Humans are deeply affected by the social environment of a page. A comment thread filled with toxic arguments, spam, and insults discourages authentic users from participating.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">The Broken Window Theory of Comments</h2>
      <p class="mb-4">If a comment thread has unresolved spam and abuse, more spam and abuse will follow. If a page maintains clean, constructive threads, users are psychologically primed to write positive, engaging feedback.</p>
      <h2 class="text-2xl font-bold text-black mt-10 mb-4">Boosting Organic Reach</h2>
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

  // Inject FAQ Schema on active post load
  useEffect(() => {
    if (activePost && activePost.slug === "how-to-automatically-delete-spam-comments-on-instagram") {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does SocialFuse work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SocialFuse connects to Instagram and uses AI to detect spam and toxic comments."
            }
          },
          {
            "@type": "Question",
            "name": "Can SocialFuse delete comments automatically?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, users can configure moderation rules and automate comment management."
            }
          },
          {
            "@type": "Question",
            "name": "Who should use SocialFuse?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Creators, brands, agencies, and businesses."
            }
          }
        ]
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'faq-jsonld-schema';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById('faq-jsonld-schema');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [activePost]);

  // Lock/reset scroll when changing posts
  useEffect(() => {
    window.scrollTo(0, 0);
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

  // If a blog post is open, render the complete post page view
  if (activePost) {
    const relatedPosts = finalPosts.filter(p => p.slug !== activePost.slug).slice(0, 4);

    return (
      <div className="relative z-10 w-full min-h-screen bg-transparent text-slate-900">
        {/* Background gradients */}
        <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-[#C2FF81]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
          {/* Back button */}
          <button
            onClick={handleClosePost}
            className="group flex items-center gap-2 text-sm font-bold text-slate-650 hover:text-black transition-colors mb-12 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-255" />
            Back to articles
          </button>

          {/* Article Header info */}
          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-700">
              <span className="bg-[#C2FF81] text-black px-3 py-1 rounded-full border border-black/5 shadow-sm">
                {activePost.category}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activePost.readTime}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight leading-tight font-display">
              {activePost.title}
            </h1>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <span className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-sm font-bold text-black border border-black/10">
                SF
              </span>
              <div>
                <p className="text-sm font-bold text-black">{activePost.author}</p>
                <p className="text-xs text-slate-500">{activePost.date}</p>
              </div>
            </div>
          </div>

          {/* Hero visual header */}
          <div className="aspect-[21/9] bg-[#C2FF81]/15 border border-slate-200/80 rounded-3xl flex items-center justify-center text-7xl select-none mb-12 shadow-inner">
            {activePost.image}
          </div>

          {/* Post Body */}
          <article 
            className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-6 prose-li:leading-relaxed prose-ul:mb-6 text-slate-800 text-base"
            dangerouslySetInnerHTML={{ __html: activePost.contentHtml }}
          />

          {/* FAQ Accordion Section */}
          {activePost.slug === "how-to-automatically-delete-spam-comments-on-instagram" && (
            <div className="mt-16 border-t border-slate-200/60 pt-12 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight font-display">FAQs</h3>
              <div className="space-y-6">
                <div className="border border-slate-200/80 p-5 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-900 text-base mb-2">How does SocialFuse work?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    SocialFuse connects to Instagram and uses AI to detect spam and toxic comments.
                  </p>
                </div>
                <div className="border border-slate-200/80 p-5 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-900 text-base mb-2">Can SocialFuse delete comments automatically?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Yes, users can configure moderation rules and automate comment management.
                  </p>
                </div>
                <div className="border border-slate-200/80 p-5 rounded-2xl bg-slate-50/50">
                  <h4 className="font-bold text-slate-900 text-base mb-2">Who should use SocialFuse?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Creators, brands, agencies, and businesses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Related Articles segment (Internal Linking) */}
          <div className="mt-16 border-t border-slate-200/60 pt-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mb-8 font-display">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => handleOpenPost(post)}
                  className="glass-panel glass-panel-hover p-6 border border-slate-200/80 rounded-2xl cursor-pointer text-left flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#C2FF81] px-2 py-0.5 rounded-md border border-black/5">{post.category}</span>
                    <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-black transition-colors font-display line-clamp-2">{post.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-250">
                    Read article <ArrowRight className="w-4.5 h-4.5 text-black" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Author bio segment */}
          <div className="border-t border-slate-200/60 py-8 my-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <span className="w-14 h-14 rounded-full bg-[#C2FF81]/20 flex items-center justify-center text-2xl font-bold border border-black/5">
              🛡️
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-black">Written by the {activePost.author}</h4>
              <p className="text-xs text-slate-650 leading-relaxed">
                We design and engineer real-time social automation layers, brand security systems, semantic moderation rules, and compliance infrastructure.
              </p>
            </div>
          </div>

          {/* Call to Action segment */}
          <div className="cta bg-gradient-to-br from-[#C2FF81]/25 to-black/[0.01] border border-[#C2FF81]/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black font-display tracking-tight">Protect Your Instagram Community</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl mx-auto">
              Let SocialFuse detect and remove toxic comments automatically.
            </p>
            <a 
              href="/signup/"
              onClick={handleClosePost}
              className="inline-block px-8 py-4 rounded-full bg-black hover:bg-slate-900 text-[#C2FF81] font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Start Free →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Blog list view
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
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
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
    </div>
  );
}
