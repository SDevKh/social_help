import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import UseCases from './pages/UseCases';
import ModerationDemo from './pages/ModerationDemo';
import Pricing from './pages/Pricing';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';


function AppInner() {
  const { isDark } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const wrapperBg = isDark ? 'bg-[#0a0a0a] text-[#f5f0e8]' : 'bg-transparent text-slate-900';

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${wrapperBg}`}>
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/demo" element={<ModerationDemo />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postSlug" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer showNewsletter={!isHome} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppInner />
      </Router>
    </ThemeProvider>
  );
}

export default App;
