import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import socialfuseLogo from '../assets/socialfuse-logo.png';

const footerLinks = {
  Product: [
    { name: 'Features', href: '/features' },
    { name: 'Live Demo', href: '/demo' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Use Cases', href: '/use-cases' },
  ],
  Resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'API Reference', href: '#' },
    { name: 'System Status', href: '#' },
    { name: 'Community', href: '#' },
  ],
  Company: [
    { name: 'About Us', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Contact Sales', href: '/contact' },
  ],
};

export default function Footer({ showNewsletter = true }) {
  const { isDark } = useTheme();

  const bg = 'grid-bg-white';
  const border = 'border-slate-200';
  const text = 'text-slate-900';
  const muted = 'text-slate-500';

  return (
    <footer className={`${bg} border-t ${border} mt-auto`}>

      {/* Newsletter strip */}
      {showNewsletter && (
        <div className={`border-b ${border}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <div className="bg-[#C2FF81] text-black border border-black/10 mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Stay in the loop
                </div>
                <h3 className="text-xl font-display text-black">Get AI growth updates & tips</h3>
                <p className="text-slate-600 text-sm mt-1">Join 2,800+ brands staying ahead.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-white border border-slate-200 text-black rounded-full px-6 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-[#C2FF81] transition-all placeholder-slate-400 shadow-inner flex-1 md:w-64"
                />
                <button className="bg-black hover:bg-slate-900 text-[#C2FF81] px-6 py-3 text-sm font-display font-bold rounded-full inline-flex items-center gap-2 whitespace-nowrap transition-all shadow-sm">
                  Subscribe <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b ${border}`}>

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <img
              src={socialfuseLogo}
              alt="SocialFuse"
              className="h-16 w-auto object-contain"
            />
            <p className={`text-sm max-w-xs leading-relaxed ${muted}`}>
              The AI-powered social media operating system designed for modern growth and brand safety.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'IG', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              ].map((s) => (
                <a key={s.label} href="#"
                  className={`w-9 h-9 rounded-xl border ${border} flex items-center justify-center bg-slate-100 hover:bg-[#C2FF81] hover:border-black/20 transition-all group`}>
                  <svg className="w-4 h-4 fill-current text-slate-600 group-hover:text-black" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </a>
              ))}
            </div>


          </div>

          {/* Nav groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className={`font-display text-xs tracking-widest uppercase ${text}`}>{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className={`text-sm font-medium transition-colors hover:text-black ${muted}`}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-xs font-mono-nb ${muted}`}>
            © {new Date().getFullYear()} SocialFuse Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-mono-nb">
            {['Privacy Policy', 'Terms of Service', 'Security'].map((l) => (
              <a key={l} href="#" className={`transition-colors hover:text-black ${muted}`}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
