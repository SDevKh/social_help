import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MessageSquare, Phone, Calendar, Clock, 
  Send, Sparkles, AlertCircle, CheckCircle, ShieldCheck 
} from 'lucide-react';

const timeSlots = [
  '09:00 AM', '10:30 AM', '11:00 AM', 
  '01:30 PM', '03:00 PM', '04:30 PM'
];

export default function Contact() {
  const [selectedDate, setSelectedDate] = useState('2026-06-01');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', company: '', note: '' });
  const [booked, setBooked] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedTime) return;
    setBooked(true);
  };

  return (
    <div className="relative z-10 w-full min-h-screen bg-white text-black grid-bg-white select-none">
      {/* Decorative Green Blobs */}
      <div className="absolute top-[12%] -left-[10%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-40 filter blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[8%] -right-[15%] w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] bg-[#b5ff66] rounded-full opacity-40 filter blur-[90px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-black text-[#b5ff66] text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-6 font-sans">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0a0a0a] uppercase">
            Schedule a Live Demo
          </h1>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Want to see how SocialFuse scales to handle millions of comments? Select a time slot below to connect with our brand safety architects.
          </p>
        </div>

        {/* Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start text-left">
          
          {/* Info cards & Founder message (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick contact channels */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">Contact Channels</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="glass-panel glass-panel-hover p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">General Inquiry</h4>
                    <p className="text-xs text-slate-750 font-bold">hello@social-fuse.app</p>
                  </div>
                </div>

                <div className="glass-panel glass-panel-hover p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-brand-orange/10 text-brand-orange">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Support & Helpdesk</h4>
                    <p className="text-xs text-slate-750 font-bold">support@social-fuse.app</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Message Card */}
            <div className="glass-panel glass-panel-hover p-6 rounded-[28px] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                A Note from our Founders
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                "We built SocialFuse because managing social community threads manually is a huge headache that takes hours away from actual creative production. Our goal is to automate brand safety so creators can get their time and peace back."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-purple flex items-center justify-center font-bold text-xs text-white">
                  SF
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">The SocialFuse Team</h5>
                  <p className="text-[10px] text-slate-500 font-bold">Co-Founders & Core Builders</p>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Scheduler Widget (Right 3 cols) */}
          <div className="lg:col-span-3">
            <div className="glass-panel p-8 rounded-[28px] space-y-6 relative">
              <AnimatePresence mode="wait">
                {booked ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/5">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900">Demo Scheduled Successfully!</h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
                        We have sent a calendar invitation containing the Zoom link to <strong className="text-brand-orange">{bookingForm.email}</strong>. See you on {selectedDate} at {selectedTime}!
                      </p>
                    </div>
                    <button 
                      onClick={() => { setBooked(false); setSelectedTime(''); }}
                      className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 transition-colors"
                    >
                      Schedule Another Demo
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    onSubmit={handleBookingSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <span className="text-xs font-black text-slate-500">SCHEDULER PANEL</span>
                      <span className="text-xs text-slate-700 flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                        Next Available: Tomorrow
                      </span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">Full Name</label>
                        <input
                          required
                          type="text"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">Email Address</label>
                        <input
                          required
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Date picker */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase">Select Date</label>
                      <input
                        required
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Time Slots selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase block">Available Time Slots (EST)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {timeSlots.map((slot) => {
                          const isSelected = slot === selectedTime;
                          return (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2 px-3 text-xs font-black rounded-xl border text-center transition-all ${
                                isSelected
                                  ? 'bg-black border-black text-white shadow-md'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!selectedTime}
                      className="w-full py-4 rounded-xl text-sm font-bold text-white bg-black hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-950/5"
                    >
                      Book 30-Min Zoom Demo
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
