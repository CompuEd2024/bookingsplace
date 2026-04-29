'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ServiceGridSection } from '@/components/ServiceGridSection';
import { PartnerSection } from '@/components/PartnerSection';
import { Footer } from '@/components/Footer';
import { ConciergeResults } from '@/components/ConciergeResults';
import { AnimatePresence } from 'motion/react';
import { ServiceCart } from '@/components/ServiceCart';
import { BookingItem } from '@/lib/servicesData';

export default function Home() {
  const [searchCriteria, setSearchCriteria] = useState<{ type: string, date: string, guests: string, time: string } | null>(null);
  const [activeCriteria, setActiveCriteria] = useState<{ type: string, date: string, guests: string, time: string } | null>(null);
  const [confirmedSelections, setConfirmedSelections] = useState<Record<string, BookingItem> | null>(null);

  const handleComplete = (selections: Record<string, BookingItem>) => {
    setConfirmedSelections(selections);
    setActiveCriteria(searchCriteria);
    setSearchCriteria(null);
    // Smooth scroll to the results section 
    setTimeout(() => {
      const element = document.getElementById('your-plan');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  return (
    <main className="min-h-screen flex flex-col selection:bg-primary-container/30">
      <Header />
      <div className="flex-grow">
        <Hero onSearch={(criteria) => setSearchCriteria(criteria)} />
        
        {confirmedSelections && (
          <ServiceCart 
            selections={confirmedSelections} 
            criteria={activeCriteria || { type: '', date: '', guests: '', time: '' }} 
            onRemove={(cat) => {
              setConfirmedSelections(prev => {
                if (!prev) return null;
                const next = { ...prev };
                delete next[cat];
                return Object.keys(next).length > 0 ? next : null;
              });
            }}
            onClear={() => setConfirmedSelections(null)}
          />
        )}

        <ServiceGridSection onSelect={(title) => {
          setSearchCriteria({ type: title, date: '', guests: '', time: '' });
        }} />
        <PartnerSection />
      </div>
      <Footer />

      <AnimatePresence>
        {searchCriteria && (
          <ConciergeResults 
            criteria={searchCriteria} 
            onClose={() => setSearchCriteria(null)} 
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
