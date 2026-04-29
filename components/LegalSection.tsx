'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export function LegalSection() {
  const { t } = useLanguage();

  const protections = [
    { icon: Lock, textKey: 'protect1' },
    { icon: ShieldCheck, textKey: 'protect2' },
    { icon: EyeOff, textKey: 'protect3' },
  ];

  const terms = [
    { title: 'userConduct', desc: 'userConductDesc' },
    { title: 'bookingFinality', desc: 'bookingFinalityDesc' },
    { title: 'intellectualProperty', desc: 'intellectualPropertyDesc' },
    { title: 'liability', desc: 'liabilityDesc' },
  ];

  return (
    <section className="bg-surface-container-low py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Privacy Policy */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-outline-variant/30"></div>
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">{t('privacyPolicy')}</h2>
            <div className="h-px flex-1 bg-outline-variant/30"></div>
          </div>
          <div className="space-y-8 text-on-surface-variant leading-[1.8] text-lg">
            <p className="font-bold text-on-surface">{t('lastUpdated')}</p>
            <p>{t('privacyIntro')}</p>
            
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
              <h4 className="text-on-surface font-bold mb-6 text-xl font-headline">{t('howWeProtectTitle')}</h4>
              <ul className="space-y-6">
                {protections.map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <item.icon className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-base">{t(item.textKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p>{t('privacyOutro')}</p>
          </div>
        </div>

        {/* Terms of Use */}
        <div id="terms">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-outline-variant/30"></div>
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">{t('termsOfUse')}</h2>
            <div className="h-px flex-1 bg-outline-variant/30"></div>
          </div>
          <div className="space-y-8 text-on-surface-variant leading-[1.8] text-lg">
            <p>{t('termsIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {terms.map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-6 border border-outline-variant/20 rounded-2xl bg-surface-container-lowest hover:bg-white transition-all shadow-sm"
                >
                  <h4 className="text-on-surface font-bold mb-2 font-headline">{t(item.title)}</h4>
                  <p className="text-sm leading-relaxed">{t(item.desc)}</p>
                </motion.div>
              ))}
            </div>
            <p>{t('termsOutro')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
