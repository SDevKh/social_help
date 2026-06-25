import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import socialfuseLogo from '../assets/socialfuse-logo.png';

const navigation = [
  { name: 'Product', href: '/' },
  { name: 'Solutions', href: '/features' },
  { name: 'Agencies', href: '/use-cases' },
  { name: 'Pricing', href: '/pricing' },
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

  const isLightPage = location.pathname !== '/';

  const navBg = isLightPage
    ? (scrolled
      ? 'bg-white/70 border-slate-200/50 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]'
      : 'bg-transparent border-transparent shadow-none')
    : (scrolled
      ? 'bg-black/60 border-white/10 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.35)]'
      : 'bg-transparent border-transparent shadow-none');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent"
      style={{
        paddingTop: scrolled ? '0.75rem' : '0px',
        paddingBottom: scrolled ? '0.75rem' : '0px',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <nav
        className={`max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 border transition-all ${scrolled ? 'border-solid' : 'border-transparent'
          } ${navBg}`}
        style={{
          width: scrolled ? '95%' : '100%',
          maxWidth: scrolled ? '80rem' : '100%',
          borderRadius: scrolled ? '9999px' : '0px',
          paddingLeft: scrolled ? '1.5rem' : '2.5rem',
          paddingRight: scrolled ? '1.5rem' : '2.5rem',
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={socialfuseLogo}
            alt="SocialFuse"
            className="h-10 sm:h-12 w-auto object-contain"
            style={isLightPage ? {} : {
              WebkitFilter: 'brightness(2) invert(1)',

              opacity: 0.9
            }}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden ml-[30%] lg:flex items-center gap-1 fixed">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-[1vw] font-bold rounded-full border transition-all duration-200 font-epunda uppercase tracking-wider ${isActive
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
              <span className={`text-[1vw] font-semibold px-3 py-1.5 rounded-full font-epunda border ${isLightPage
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
                className={`text-[0.9vw] font-bold transition-colors font-epunda uppercase tracking-wider ${isLightPage
                  ? 'text-slate-800 hover:text-black'
                  : 'text-white hover:text-purple-300'
                  }`}
              >
                Sign In
              </a>
              <a
                href="/signup/"
                className={`text-[1vw] px-5 py-2.5 font-epunda rounded-full font-bold uppercase tracking-wider transition-all duration-200 border ${isLightPage
                  ? 'bg-[#C2FF81] hover:bg-[#b8fa73] text-black border-black/10 shadow-sm'
                  : 'bg-transparent text-white border-[white] hover:bg-[#7C3AED]/20 shadow-none'
                  }`}
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
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isLightPage
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
            className={`lg:hidden absolute top-[calc(100%-8px)] left-[2.5%] w-[95%] rounded-3xl border p-5 space-y-3 shadow-2xl backdrop-blur-xl ${isLightPage
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
                  className={`block px-4 py-3 rounded-xl border text-base font-bold font-epunda transition-all ${isActive
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
