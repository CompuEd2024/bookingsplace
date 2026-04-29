'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AboutHero } from '@/components/AboutHero';
import { ValueBento } from '@/components/ValueBento';
import { LegalSection } from '@/components/LegalSection';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col selection:bg-primary-container/30 overflow-x-hidden">
      <Header />
      <div className="flex-grow">
        <AboutHero />
        <ValueBento />
        <LegalSection />
      </div>
      <Footer />
    </main>
  );
}
