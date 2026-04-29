'use client';

import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Search, Calendar, Users, LayoutGrid, Sparkles, Clock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export function Hero({ onSearch }: { onSearch?: (criteria: { type: string, date: string, guests: string, time: string }) => void }) {
  const { t, isRtl, language } = useLanguage();
  const [criteria, setCriteria] = React.useState({ type: '', date: '', guests: '', time: '' });
  const [showError, setShowError] = React.useState(false);

  const handleSearch = () => {
    if (!criteria.type || !criteria.date || !criteria.guests || !criteria.time) {
      setShowError(true);
      return;
    }
    if (onSearch) {
      onSearch(criteria);
    }
  };

  return (
    <section className="relative h-[751px] w-full flex items-center justify-center">
      {/* Validation Popup */}
      <AnimatePresence>
        {showError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowError(false)}
              className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-6">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2 font-headline">{t('validationTitle')}</h3>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">
                {t('validationMessage')}
              </p>
              <button 
                onClick={() => setShowError(false)}
                className="w-full bg-on-surface text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
              >
                {language === 'en' ? 'Got it' : 'حسناً'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 z-0">
        <Image
          fill
          priority
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYDaeJAUwfD77I2tOxsXlfYzmoSTnckBWIEFysiya67EnQXlJA8bq-geMqtTwhk6Evm8ea_KgSLa8_kfsEYMWsyyOEyaFPUQEMQc4ELVHyjVweOd_QTLIN2W74M1xUh1GKyanqeWstIWhGsYUcFWpY0y0_ol0qThBqmsKWBZUKtqPG5rw8YnI0gtECln9nm5Todd1WkTAQkQxBewJp7b_jCcas2Dxm6QZk9IwVmppU5dQXqOjfSJjMKQEl3V1CrU-vM8iOK-jK8Hbn"
          alt="Luxury event space"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-on-background/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight font-headline"
        >
          {t('heroTitle').split(t('heroLuminous'))[0]}
          <span className="text-secondary-fixed-dim">{t('heroLuminous')}</span>
          {t('heroTitle').split(t('heroLuminous'))[1]}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          {t('heroSubtitle')}
        </motion.p>
      </div>

      {/* Floating Search Widget */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-6xl px-6 z-20">
        <div className="bg-surface-container-lowest shadow-luminous rounded-2xl md:rounded-full p-2 flex flex-col md:flex-row items-center gap-2 border border-outline-variant/15">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-2 px-4 py-2">
            
            <div className={`flex flex-col ${isRtl ? 'md:border-l' : 'md:border-r'} border-outline-variant/20 py-2 overflow-hidden`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 truncate">{language === 'en' ? 'What are you celebrating?' : 'ماذا تخطط للاحتفال؟'}</label>
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5 flex-shrink-0" />
                <input 
                  type="text" 
                  value={criteria.type}
                  onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. A romantic dinner...' : 'مثلاً: عشاء رومانسي...'}
                  suppressHydrationWarning
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0 placeholder:text-outline-variant outline-none"
                />
              </div>
            </div>

            <div className={`flex flex-col ${isRtl ? 'md:border-l' : 'md:border-r'} border-outline-variant/20 px-0 md:px-4 py-2`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{t('date')}</label>
              <div className="flex items-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                <input 
                  type="date" 
                  value={criteria.date}
                  onChange={(e) => setCriteria({ ...criteria, date: e.target.value })}
                  suppressHydrationWarning
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0 placeholder:text-outline-variant outline-none cursor-pointer [color-scheme:light]"
                />
              </div>
            </div>

            <div className={`flex flex-col ${isRtl ? 'md:border-l' : 'md:border-r'} border-outline-variant/20 px-0 md:px-4 py-2`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{t('time')}</label>
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-5 w-5" />
                <input 
                  type="time" 
                  value={criteria.time}
                  onChange={(e) => setCriteria({ ...criteria, time: e.target.value })}
                  suppressHydrationWarning
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0 placeholder:text-outline-variant outline-none cursor-pointer [color-scheme:light]"
                />
              </div>
            </div>

            <div className="flex flex-col px-0 md:px-4 py-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{t('guests')}</label>
              <div className="flex items-center gap-2">
                <Users className="text-primary h-5 w-5" />
                <input 
                  type="text" 
                  value={criteria.guests}
                  onChange={(e) => setCriteria({ ...criteria, guests: e.target.value })}
                  placeholder={t('guestsPlaceholder')}
                  suppressHydrationWarning
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0 placeholder:text-outline-variant outline-none"
                />
              </div>
            </div>

          </div>
          <button 
            onClick={handleSearch}
            suppressHydrationWarning 
            className="iris-gradient text-white h-14 w-full md:w-auto px-10 rounded-full font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            {t('search')}
          </button>
        </div>
      </div>
    </section>
  );
}
