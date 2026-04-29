'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, CreditCard, X, MapPin, Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { BookingItem } from '@/lib/servicesData';
import Image from 'next/image';

interface ServiceCartProps {
  selections: Record<string, BookingItem>;
  criteria: { type: string, date: string, guests: string, time: string };
  onRemove: (category: string) => void;
  onClear: () => void;
}

export function ServiceCart({ selections, criteria, onRemove, onClear }: ServiceCartProps) {
  const { t, language } = useLanguage();
  const selectionKeys = Object.keys(selections);
  
  const totalPrice = selectionKeys.reduce((acc, key) => {
    const priceStr = selections[key].price;
    // Simple extraction for demo: matches "$550" or "5,500 ر.س"
    const numericPart = priceStr.replace(/[^0-9]/g, '');
    return acc + (parseInt(numericPart) || 0);
  }, 0);

  const formattedTotal = language === 'en' 
    ? `$${totalPrice.toLocaleString()}` 
    : `${totalPrice.toLocaleString()} ر.س`;

  if (selectionKeys.length === 0) return null;

  return (
    <section id="your-plan" className="py-24 bg-surface-container-lowest relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full iris-gradient flex items-center justify-center shadow-lg">
                <ShoppingBag className="text-white h-5 w-5" />
              </div>
              <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">
                {language === 'en' ? 'Your Event Portfolio' : 'حقيبة مناسبتكم'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter font-headline mb-4">
              {language === 'en' ? 'Final Event Plan' : 'خطة الحفل النهائية'}
            </h2>
            <div className="flex flex-wrap gap-4 text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/10">
                <Calendar className="h-4 w-4 text-primary" />
                {criteria.date}
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/10">
                <Clock className="h-4 w-4 text-primary" />
                {criteria.time}
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/10">
                <Users className="h-4 w-4 text-primary" />
                {criteria.guests} {t('guests')}
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClear}
            className="text-on-surface-variant hover:text-error font-bold text-sm underline flex items-center gap-2 transition-colors"
          >
            {language === 'en' ? 'Clear Plan' : 'مسح الخطة'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* List of services */}
          <div className="lg:col-span-2 space-y-6">
            {selectionKeys.map((category) => {
              const item = selections[category];
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={category} 
                  className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex flex-col sm:flex-row gap-6 relative group"
                >
                  <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary mb-1 block">{category}</span>
                        <h4 className="text-xl font-black text-on-surface tracking-tight">{item.name}</h4>
                      </div>
                      <span className="text-lg font-black text-primary">{item.price}</span>
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-surface-container rounded-md text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => onRemove(category)}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-md border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-all sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-[40px] p-10 border border-outline-variant/10 shadow-xl sticky top-24">
              <h3 className="text-2xl font-black text-on-surface tracking-tight font-headline mb-8">
                {language === 'en' ? 'Strategy Summary' : 'ملخص الخطة'}
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>{language === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>{language === 'en' ? 'Service Fee' : 'رسوم الخدمة'}</span>
                  <span>{language === 'en' ? '$0' : '0 ر.س'}</span>
                </div>
                <div className="h-px bg-outline-variant/20 my-4" />
                <div className="flex justify-between text-2xl font-black text-on-surface">
                  <span>{language === 'en' ? 'Total' : 'الإجمالي'}</span>
                  <span className="text-primary">{formattedTotal}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full py-5 rounded-[20px] iris-gradient text-white font-black tracking-tight shadow-luminous hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  {language === 'en' ? 'Book & Pay Now' : 'احجز وادفع الآن'}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant opacity-60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {language === 'en' ? 'Secure SSL Encryption' : 'تشفير آمن بنسبة 100%'}
                </div>
              </div>

              <div className="mt-8 p-6 bg-white/50 rounded-3xl border border-outline-variant/10">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {language === 'en' 
                    ? "Our concierge will finalize the availability with all vendors within 24 hours of payment. Your fund is protected by our Bookings Guarantee." 
                    : "سيقوم الكونسيرج بتأكيد التوافر النهائي مع جميع المزودين خلال 24 ساعة من الدفع. أموالكم محمية بضمان بوكينجز بلايس."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
