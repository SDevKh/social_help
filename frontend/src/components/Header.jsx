import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import socialfuseLogo from '../assets/socialfuse-logo.png';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Use Cases', href: '/use-cases' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Live Demo', href: '/demo' },
  { name: 'Blog', href: '/blog' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (window.DjangoUser && window.DjangoUser.isAuthenticated) {
      setIsAuthenticated(true);
      setUserEmail(window.DjangoUser.email || '');
      const tier = window.DjangoUser.tier || 'free';
      setIsSubscriber(tier === 'starter' || tier === 'pro');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const isLightPage = true;

  const navBg = scrolled
    ? 'bg-white/70 border-slate-200/50 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]'
    : 'bg-white/30 border-white/20 shadow-sm';

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 bg-transparent ${scrolled ? 'py-2' : 'py-4'}`}>
      <nav
        className={`max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-16 sm:h-20 rounded-full border transition-all duration-300 w-[95%] xl:w-full ${navBg}`}
        style={{
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
        }}
      >

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={socialfuseLogo}
            alt="SocialFuse"
            className="h-10 sm:h-12 w-auto object-contain"
            style={isLightPage ? {} : { filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-bold rounded-full border transition-all duration-200 font-epunda ${
                  isActive
                    ? (isLightPage
                        ? 'bg-black text-white border-transparent'
                        : 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white border-transparent shadow-[0_4px_15px_rgba(99,102,241,0.25)]')
                    : (isLightPage
                        ? 'text-slate-800 border-transparent hover:border-black/10 hover:bg-black/5 hover:text-black'
                        : 'text-slate-300 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white')
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full font-epunda border ${
                isLightPage
                  ? 'text-slate-800 bg-slate-100 border-slate-200'
                  : 'text-slate-400 bg-white/5 border-white/10'
              }`}>
                👤 {userEmail}
              </span>
              {isSubscriber ? (
                <a
                  href="/dashboard/"
                  className="bg-[#C2FF81] hover:bg-[#b8fa73] text-black border border-black/10 px-5 py-2.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200"
                >
                  Go to Dashboard
                </a>
              ) : (
                <a
                  href="/pricing/"
                  className="bg-[#C2FF81] hover:bg-[#b8fa73] text-black border border-black/10 px-5 py-2.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200"
                >
                  Upgrade Plan
                </a>
              )}
              <a
                href="/logout/"
                className="text-sm font-bold transition-colors font-epunda text-slate-700 hover:text-rose-600"
              >
                Sign Out
              </a>
            </>
          ) : (
            <>
              <a
                href="/login/"
                className="text-sm font-bold transition-colors font-epunda text-slate-800 hover:text-black"
              >
                Sign In
              </a>
              <a
                href="/signup/"
                className="bg-[#C2FF81] hover:bg-[#b8fa73] text-black border border-black/10 px-5 py-2.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200"
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isLightPage
                ? 'border-slate-200 bg-slate-50 text-slate-800'
                : 'border-white/10 bg-white/5 text-white'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className={`lg:hidden absolute top-[calc(100%-8px)] left-[2.5%] w-[95%] rounded-3xl border p-5 space-y-3 shadow-2xl backdrop-blur-xl ${
              isLightPage
                ? 'bg-white/90 border-slate-200/80 text-black'
                : 'bg-[#080b11]/85 border-white/10 text-white'
            }`}
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl border text-base font-bold font-epunda transition-all ${
                    isActive
                      ? (isLightPage
                          ? 'bg-black text-white border-transparent'
                          : 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white border-transparent')
                      : (isLightPage
                          ? 'text-slate-700 border-slate-200/60 bg-slate-50 hover:bg-slate-100'
                          : 'text-slate-300 border-white/5 bg-white/5 hover:bg-white/5')
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className={`pt-3 flex flex-col gap-3 border-t ${isLightPage ? 'border-slate-200' : 'border-white/10'}`}>
              {isAuthenticated ? (
                <>
                  <span className={`text-center py-2 text-sm font-semibold font-epunda ${isLightPage ? 'text-slate-800' : 'text-slate-400'}`}>
                    👤 {userEmail}
                  </span>
                  {isSubscriber ? (
                    <a
                      href="/dashboard/"
                      className="bg-[#C2FF81] text-black text-center py-3.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200 border border-black/10"
                    >
                      Go to Dashboard
                    </a>
                  ) : (
                    <a
                      href="/pricing/"
                      className="bg-[#C2FF81] text-black text-center py-3.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200 border border-black/10"
                    >
                      Upgrade Plan
                    </a>
                  )}
                  <a
                    href="/logout/"
                    className="text-center py-3 text-sm font-bold font-epunda text-slate-600 hover:text-rose-600"
                  >
                    Sign Out
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/login/"
                    className="text-center py-3 text-sm font-bold font-epunda text-slate-800 hover:text-black"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup/"
                    className="bg-[#C2FF81] text-black text-center py-3.5 text-sm font-epunda rounded-full font-bold shadow-sm transition-all duration-200 border border-black/10"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
