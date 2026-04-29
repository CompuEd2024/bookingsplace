'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { motion } from 'motion/react';
import Image from 'next/image';

export function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-6 mb-24 pt-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest text-sm uppercase mb-4 block font-headline"
          >
            {t('ourStory')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-8 leading-[1.1] font-headline"
          >
            {t('aboutHeroTitle')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed"
          >
            {t('aboutHeroSubtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button className="iris-gradient text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg">
              {t('exploreVenues')}
            </button>
            <button className="bg-surface-container-high text-on-surface font-semibold px-8 py-4 rounded-full hover:bg-surface-container-highest transition-all">
              {t('meetTeam')}
            </button>
          </motion.div>
        </div>
        <div className="md:col-span-5 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
          >
            <Image
              fill
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdxEg6CpoZAvlpY1VXK3_sGJ-WePITxaYbU5jXL7yfKm7f-te40idil_NEz4E91_sNKwHnljeng34xupRL9g1_aNCDhZI1sy7DN1ofCOdDR-ZzrHgIUWRoAJLgzptpRvlgvn_Uq3S0Mq1Wk0AuhQZNR2KsqOZ84LkDD5dK4cKz7xW4VLJmtDxBrk3KwgaV1L5xxDHz9oPnCxfpgHOgr8Ypo8_bZ0AtOinQelI-sDjON-2xqdqlwhlB2orOnB1vS2nPgJbCOhlDtTRd"
              alt="Chic modern event space"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 iris-gradient rounded-full opacity-20 blur-3xl -z-0"></div>
        </div>
      </div>
    </section>
  );
}
