'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export function PartnerSection() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="mb-24 px-6 max-w-7xl mx-auto">
      <div className="relative rounded-[40px] overflow-hidden min-h-[440px] flex items-center shadow-luminous">
        <Image
          fill
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDCm5wGn1awXMPkPJMXm_WCAidSrqzJkljiZnoc3ziT6pm_n8i3deKDDqYTFIie_WFCzP5gn3CMUw_6dCeLS22ylj4cJkNmkEMMU5cVEsI63LCRx29ukOdJYOllgZBqONS8fim7XDbSF1ou4lOnxvonsgZDAYHeC8hzpta5iPxGUe61BAnzM4fYChsnhB-Qm-Q51qHAF8zSyTWDDeQIfGFa74PwGAfcXGT0pIBx78H1avjxLBpy6L-iqeAA4eNBuKRSyOicCBQ_1--"
          alt="Become a Partner"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-on-background/40 backdrop-blur-[4px]"></div>
        
        <div className="relative z-10 px-8 md:px-20 py-16 max-w-2xl text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 font-headline leading-tight">
              {t('becomePartner')}
            </h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              {t('partnerDescription')}
            </p>
            <Link 
              href={isLoggedIn ? "/provider" : "/provider?mode=signup"} 
              className="inline-block bg-primary-container text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-primary transition-all duration-300 hover:scale-105"
            >
              {t('joinNow')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
