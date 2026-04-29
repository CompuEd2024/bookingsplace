'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Share2, Globe } from 'lucide-react';

import Link from 'next/link';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-sm">
          <Link href="/" className="text-xl font-bold text-primary tracking-tight font-headline">{t('brandName')}</Link>
          <p className="mt-6 text-on-surface-variant leading-relaxed text-sm">
            {t('footerText')}
          </p>
          <div className="flex gap-4 mt-8">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-on-surface text-sm uppercase tracking-[0.2em] font-headline">{t('platform')}</h4>
            <div className="flex flex-col gap-3">
              <Link className="text-on-surface-variant hover:text-primary transition-all text-sm" href="/about">{t('aboutUs')}</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all text-sm" href="#">{t('helpCenter')}</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all text-sm" href="/">{t('explore')}</Link>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-on-surface text-sm uppercase tracking-[0.2em] font-headline">{t('legal')}</h4>
            <div className="flex flex-col gap-3">
              <Link className="text-on-surface-variant hover:text-primary transition-all text-sm" href="/about#privacyPolicy">{t('privacyPolicy')}</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all text-sm" href="/about#terms">{t('termsOfService')}</Link>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-on-surface text-sm uppercase tracking-[0.2em] font-headline">{t('connect')}</h4>
            <div className="flex flex-col gap-3 text-sm text-on-surface-variant">
              <Link className="hover:text-primary transition-all" href="#">{t('contact')}</Link>
              <p>Riyadh, Saudi Arabia</p>
              <p>info@bookingsplace.com</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-outline-variant/10 text-center md:text-left">
        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.3em] font-headline">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
