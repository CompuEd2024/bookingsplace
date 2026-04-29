'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  index: number;
  onClick?: () => void;
}

export function ServiceCard({ icon: Icon, title, description, price, index, onClick }: ServiceCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="bg-surface-container-lowest rounded-3xl p-8 shadow-luminous hover:scale-[1.02] transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary-container/20 flex flex-col h-full"
    >
      <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-full mb-6 group-hover:bg-primary-container transition-all duration-300">
        <Icon className="text-primary group-hover:text-white transition-colors duration-300 w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-3 font-headline leading-none">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">{description}</p>
      <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-wider font-headline">{t('startingFrom')}</span>
        <span className="text-primary font-black text-lg">{price}</span>
      </div>
    </motion.div>
  );
}
