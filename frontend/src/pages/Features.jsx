import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, BarChart2, Share2, Users, Code, Zap,
  CheckCircle, AlertTriangle, MessageSquare, Plus, Trash2, EyeOff 
} from 'lucide-react';

const sections = [
  { id: 'moderation', name: 'AI Moderation', icon: Shield },
  { id: 'analytics', name: 'Real-time Analytics', icon: BarChart2 },
  { id: 'integrations', name: 'Integrations', icon: Share2 },
  { id: 'collaboration', name: 'Team Workflows', icon: Users },
  { id: 'api', name: 'Developer API', icon: Code },
];

const mockComments = [
  { id: 1, user: '@troll_hater_99', text: 'This product is absolute garbage, scam brand!', type: 'Toxic', score: 0.94, action: 'hidden' },
  { id: 2, user: '@crypto_jack_bot', text: '📈 Click my link to win $5000 in BTC instantly!', type: 'Spam', score: 0.98, action: 'hidden' },
  { id: 3, user: '@maria_loves_makeup', text: 'Is this available in the UK? Love the packaging!', type: 'Safe', score: 0.05, action: 'approved' },
  { id: 4, user: '@johndoe_12', text: 'Stupid idiots. Go burn in hell.', type: 'Hate Speech', score: 0.99, action: 'hidden' },
];

export default function Features() {
  const [activeSection, setActiveSection] = useState('moderation');
  const [comments, setComments] = useState(mockComments);

  const deleteComment = (id) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const approveComment = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, action: 'approved' } : c));
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-white text-slate-900">
      {/* Background gradients */}
      <div className="absolute top-20 left-1/3 w-[300px] h-[300px] bg-[#C2FF81]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-[350px] h-[350px] bg-black/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-black uppercase tracking-widest bg-[#C2FF81] px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
            Features Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-black">
            Everything You Need to Grow Faster
          </h1>
          <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
            AI content creation, scheduling, moderation, and analytics — one intelligent platform built for modern growth.
          </p>
        </div>

        {/* Sidebar + Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-2 p-4 bg-slate-50 border border-slate-200/80 shadow-sm rounded-2xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Navigation</h3>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-black text-[#C2FF81] border border-black shadow-sm' 
                        : 'text-slate-600 hover:text-black hover:bg-black/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#C2FF81]' : 'text-slate-500'}`} />
                    {sec.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="lg:col-span-3 space-y-16">
            
            {/* 1. AI Moderation */}
            <section id="moderation" className="bg-white border border-slate-200 shadow-sm p-8 rounded-3xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#C2FF81] border border-black/10 rounded-2xl text-black">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">AI Moderation Shield</h2>
                  <p className="text-slate-650 text-sm">Deep learning classifiers label and filter toxic/spam attacks automatically.</p>
                </div>
              </div>

              {/* Bento Grid layout for moderation details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual moderation simulation widget */}
                <div className="bg-slate-50/50 border border-slate-200/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Moderation Feed</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-3 rounded-xl border transition-all ${
                          comment.action === 'hidden' 
                            ? 'bg-red-50/60 border-red-200/60 opacity-70' 
                            : 'bg-white border-slate-150 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">{comment.user}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            comment.type === 'Safe' 
                              ? 'bg-[#C2FF81] text-black border border-black/5' 
                              : 'bg-black text-[#C2FF81]'
                          }`}>
                            {comment.type} ({Math.round(comment.score * 100)}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{comment.text}</p>
                        
                        <div className="flex items-center justify-end gap-2">
                          {comment.action !== 'hidden' && (
                            <button 
                              onClick={() => deleteComment(comment.id)}
                              className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-650 hover:bg-red-100/80 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {comment.action === 'hidden' && (
                            <button 
                              onClick={() => approveComment(comment.id)}
                              className="text-xs font-bold text-black bg-[#C2FF81] px-2.5 py-1 rounded-lg border border-black/10 hover:bg-[#b0f56d] transition-all"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature details */}
                <div className="space-y-4 flex flex-col justify-center">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-black">Sentiment & Sarcasm Classification</h4>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      SocialFuse goes beyond basic word matches. Our natural language models parse sarcasm, negative sentiment, and multi-lingual profanity matrices (including Hindi/Hinglish).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-black">Custom Threshold Controls</h4>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Configure your own custom toxicity thresholds. Tighten sensitivity during campaigns, or relax it to allow lively banter.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Real-time Analytics */}
            <section id="analytics" className="bg-white border border-slate-200 shadow-sm p-8 rounded-3xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#C2FF81] border border-black/10 rounded-2xl text-black">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Real-time Analytics Dashboard</h2>
                  <p className="text-slate-650 text-sm">Visualize moderation KPIs, comment volume trends, and safety ratings.</p>
                </div>
              </div>

              {/* Bento Grid Item 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-center space-y-2.5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Comments Scanned</span>
                  <div className="text-3xl font-extrabold text-black">48,291</div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block font-bold">
                    +18.5% this week
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-center space-y-2.5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Risky Comments Hidden</span>
                  <div className="text-3xl font-extrabold text-black">1,402</div>
                  <span className="text-xs text-black bg-[#C2FF81] px-2.5 py-0.5 rounded-full inline-block font-bold">
                    Protected Brand Reputation
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-center space-y-2.5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI Accuracy Rate</span>
                  <div className="text-3xl font-extrabold text-black">99.8%</div>
                  <span className="text-xs text-white bg-black px-2.5 py-0.5 rounded-full inline-block font-bold">
                    Tuned Deep-Learning Models
                  </span>
                </div>
              </div>
            </section>

            {/* 3. Integrations */}
            <section id="integrations" className="bg-white border border-slate-200 shadow-sm p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#C2FF81] border border-black/10 rounded-2xl text-black">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Multi-platform Integrations</h2>
                  <p className="text-slate-650 text-sm">Secure and authorized access controls via platform API tokens.</p>
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                SocialFuse connects directly through official APIs without requesting passwords. Supported platforms include Instagram Business, Facebook Pages, YouTube channels, and LinkedIn organizations.
              </p>
            </section>

            {/* 4. Team Workflows */}
            <section id="collaboration" className="bg-white border border-slate-200 shadow-sm p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#C2FF81] border border-black/10 rounded-2xl text-black">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Team Collaboration System</h2>
                  <p className="text-slate-650 text-sm">Work together to review and manage moderated comment backlogs.</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Assign team members, delegate comment approval tasks, and audit logs to track moderator actions. Ensure consistency and audit safety.
              </p>
            </section>

            {/* 5. Developer API */}
            <section id="api" className="bg-white border border-slate-200 shadow-sm p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#C2FF81] border border-black/10 rounded-2xl text-black">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Developer API Access</h2>
                  <p className="text-[#05021a]/80 text-sm">Build your own custom sentiment filters using our REST APIs.</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl overflow-x-auto">
                <code className="text-xs text-slate-300 block whitespace-pre">
{`# Analyze sentiment of comment payload
import requests

url = "https://api.social-fuse.app/v1/moderate/"
payload = {
    "text": "Stupid bots. Tap link to win crypto!!!",
    "account_id": "ig_1784145..."
}
headers = {
    "Authorization": "Bearer YOUR_SECRET_API_KEY",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, timeout=5)
print(response.json())
# Output: {"toxicity_score": 0.98, "decision": "delete", "reason": "spam_phrase"}`}
                </code>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

