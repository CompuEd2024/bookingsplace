'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { ServiceCard } from './ServiceCard';
import { services, arServices } from '@/lib/constants';

export function ServiceGridSection({ onSelect }: { onSelect?: (title: string) => void }) {
  const { t, language } = useLanguage();

  const data = language === 'en' ? services.map(s => ({
    ...s,
    title: s.titleKey,
    description: s.descKey
  })) : arServices.map((s, index) => ({
    ...s,
    icon: services[index].icon
  }));

  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase block mb-2">{t('curatedCollections')}</span>
        <h2 className="text-4xl font-black text-on-surface tracking-tighter font-headline">
          {t('explorePremium')}
        </h2>
        <div className="h-1.5 w-20 iris-gradient rounded-full mx-auto mt-6"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {data.map((service, index) => (
          <ServiceCard
            key={service.id}
            index={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
            price={service.price}
            onClick={() => onSelect?.(service.title)}
          />
        ))}
      </div>
    </section>
  );
}
