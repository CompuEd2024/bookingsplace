'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Network, Globe, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export function ValueBento() {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-surface-container-lowest p-12 rounded-[2.5rem] shadow-luminous border border-outline-variant/5"
        >
          <Network className="text-primary h-12 w-12 mb-6" />
          <h3 className="text-3xl font-bold mb-4 tracking-tight font-headline">{t('plannersConcierge')}</h3>
          <p className="text-on-surface-variant text-lg leading-relaxed">{t('plannersConciergeDesc')}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-primary-container p-12 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl"
        >
          <h3 className="text-5xl font-black tracking-tighter font-headline">{t('venueCount')}</h3>
          <p className="text-xl font-medium opacity-90">{t('venueCountDesc')}</p>
          <Globe className="h-16 w-16 opacity-20 self-end" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-low p-12 rounded-[2.5rem] shadow-sm border border-outline-variant/10"
        >
          <ShieldCheck className="text-primary h-12 w-12 mb-6" />
          <h3 className="text-2xl font-bold mb-4 tracking-tight font-headline">{t('trustedVerification')}</h3>
          <p className="text-on-surface-variant leading-relaxed">{t('trustedVerificationDesc')}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-white p-12 rounded-[2.5rem] shadow-luminous border border-outline-variant/10 flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="flex-1">
            <LayoutDashboard className="text-primary h-12 w-12 mb-6" />
            <h3 className="text-2xl font-bold mb-4 tracking-tight font-headline">{t('seamlessIntegration')}</h3>
            <p className="text-on-surface-variant leading-relaxed">{t('seamlessIntegrationDesc')}</p>
          </div>
          <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden relative shadow-inner">
            <Image
              fill
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdCKCDaHQ0BLkxU52UYEMaSQmD8dkuIaeP7mOMyGMJJfNZ981aQuMDpZgTcTJxL_jVg15SMgSutjDFADZ9M4ac3XaHYppxXo8M7Ku4mW3V_Ir-TqN7WhsoyQo1UaRKUcR5UgWYWbWRyekvRT5gEQxvaoumpoDQUuidjuErivvvaPufLBBI1wIN19cGQyYC2r_9zvL7UB5w3V4FBRH1wlI5GMli0tRzb8PVkOF0yyzM-fnKZ2v9a3AbNnC2cL--WPKkBXYh1pCJw1uQ"
              alt="Seamless integration"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
