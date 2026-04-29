'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, Calendar, Users, MapPin, ChevronRight, Loader2, Star, ArrowLeft, Tent, Building2, Castle, Flower2, Shirt, Palette, Heart, Music, Camera, Gamepad2, ConciergeBell, UtensilsCrossed } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceCard } from './ServiceCard';
import { BookingItem } from '@/lib/servicesData';

interface SearchCriteria {
  type: string;
  date: string;
  time: string;
  guests: string;
}

interface ConciergeResultsProps {
  criteria: SearchCriteria;
  onClose: () => void;
  onComplete?: (selections: Record<string, BookingItem>) => void;
}

interface ListItemProps {
  item: any;
  idx: number;
  selectedCategory: string;
  selections: Record<string, BookingItem>;
  toggleSelection: (category: string, item: BookingItem) => void;
  analysisLoading: boolean;
  itemAnalysis: any;
  language: string;
}

function ListItem({ item, idx, selectedCategory, selections, toggleSelection, analysisLoading, itemAnalysis, language }: ListItemProps) {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border ${selections[selectedCategory]?.id === item.id ? 'border-primary' : 'border-outline-variant/10'} group h-full flex flex-col`}
    >
      <div className="relative h-56 w-full">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold">{item.rating}</span>
        </div>
        {selections[selectedCategory]?.id === item.id && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-2xl scale-110">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-black tracking-tight leading-tight">{item.name}</h4>
          <span className="text-primary font-black">{item.price}</span>
        </div>
        {item.location && (
          <div className="flex items-center gap-1 text-on-surface-variant text-xs mb-4">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          {item.tags.map((tag: string) => (
            <span key={tag} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-surface-container rounded-md text-on-surface-variant">
              {tag}
            </span>
          ))}
        </div>

        {/* Analysis Section */}
        <div className="mt-2 mb-8 space-y-3">
          {analysisLoading && !itemAnalysis[item.name] ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-surface-container rounded w-full"></div>
              <div className="h-3 bg-surface-container rounded w-2/3"></div>
            </div>
          ) : itemAnalysis[item.name] ? (
            <>
              <div className="p-4 rounded-2xl bg-surface-container-low border-l-4 border-primary shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  {itemAnalysis[item.name].practical}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border-l-4 border-secondary shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
                  {itemAnalysis[item.name].emotional}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low border-l-4 border-iris-gradient/30 shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  {itemAnalysis[item.name].dateFactor}
                </p>
              </div>
            </>
          ) : null}
        </div>

        <button 
          onClick={() => toggleSelection(selectedCategory, item)}
          className={`mt-auto w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 ${
            selections[selectedCategory]?.id === item.id 
              ? 'bg-on-surface text-white' 
              : 'iris-gradient text-white hover:opacity-90'
          }`}
        >
          {selections[selectedCategory]?.id === item.id 
            ? (language === 'en' ? 'Remove Selection' : 'إلغاء الاختيار') 
            : (language === 'en' ? 'Select Service' : 'اختر الخدمة')}
          {selections[selectedCategory]?.id === item.id ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </motion.div>
  );
}

export function ConciergeResults({ criteria, onClose, onComplete }: ConciergeResultsProps) {
  const { t, language } = useLanguage();
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [selections, setSelections] = useState<Record<string, BookingItem>>({});
  const [itemAnalysis, setItemAnalysis] = useState<Record<string, { practical: string, emotional: string, dateFactor: string }>>({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const categoryIcons: Record<string, any> = React.useMemo(() => ({
    'Resorts': Building2,
    'Camp and Tents': Tent,
    'Wedding Halls': Castle,
    'Flower Arrangements': Flower2,
    'Wedding Dress': Shirt,
    'Henna': Palette,
    'Hair and Makeup': Heart,
    'Cultural Bands': Music,
    'Photography': Camera,
    'Playgrounds (Soccer for adults)': Gamepad2,
    'Tea and Coffee (Hospitality)': ConciergeBell,
    'Catering': UtensilsCrossed
  }), []);

  // Fetch real services from Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchServices() {
        if (!isSupabaseConfigured) return;
        
        setLoading(true);
        try {
          let finalCategories: string[] = [];
          
          // AI Intent Mapping: Translate general input into DB categories
          if (criteria.type && criteria.type !== '') {
            try {
              const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
              const categories = [
                'Resorts', 'Camp and Tents', 'Wedding Halls', 'Flower Arrangements', 
                'Wedding Dress', 'Henna', 'Hair and Makeup', 'Cultural Bands', 
                'Photography', 'Playgrounds (Soccer for adults)', 'Tea and Coffee (Hospitality)', 'Catering'
              ];

              const mappingPrompt = `
                User is looking for: "${criteria.type}"
                Available categories in our database: ${categories.join(', ')}

                Task: Identify all categories that are RELEVANT to this user's specific request.
                If they ask for something specific like "wedding", return all wedding-related categories.
                If they ask for "romantic dinner", return places and catering.
                Return ONLY a comma-separated list of category names from the available list.
                If none match, return an empty string.
              `;

              const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: mappingPrompt,
              });

              const text = result.text || '';
              finalCategories = text.split(',')
                .map(c => c.trim())
                .filter(c => categories.includes(c));
                
              console.log('AI Mapped Intent to Categories:', finalCategories);
            } catch (aiErr: any) {
              console.error('AI Category Mapping Error:', aiErr);
              if (aiErr.message?.includes('quota') || aiErr.status === 429) {
                setQuotaExceeded(true);
              }
              // Fallback: Use direct match or nothing
              finalCategories = [criteria.type.replace('&', 'and')];
            }
          }

          // Simplified Query: No status or price filters
          let query = supabase
            .from('services')
            .select('*, service_media(url)');

          // Only keep category filter if we have mapped categories
          if (finalCategories.length > 0) {
            query = query.in('service_category', finalCategories);
          }

          const { data, error } = await query;
          
          // Safety Net: Log RAW data
          console.log('RAW DATA FROM SUPABASE:', data);

          if (error) {
            console.log('SUPABASE ERROR DETAILS:', JSON.stringify(error, null, 2));
            throw error;
          }

          // Mapping database data entries
          const mapped = (data || []).map(s => ({
            id: s.id,
            name: s.name,
            title: s.name,
            category: s.service_category,
            description: s.description,
            price: `$${s.base_price}`,
            location: s.city || 'Dubai',
            rating: 4.8,
            reviews: Math.floor(Math.random() * 100) + 10,
            // Image handling per strict rules
            image: (s.service_media && s.service_media.length > 0) 
              ? s.service_media[0].url
              : 'https://picsum.photos/seed/placeholder/800/600',
            tags: ['Premium'],
            media: s.service_media || []
          }));

          setDbServices(mapped);
        } catch (err) {
          console.log('SUPABASE ERROR DETAILS:', JSON.stringify(err, null, 2));
        } finally {
          setLoading(false);
        }
      }

      fetchServices();
    }, 500);

    return () => clearTimeout(timer);
  }, [criteria.type]);

  const groupedCategories = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    dbServices.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [dbServices]);

  const categoryList = React.useMemo(() => {
    return Object.keys(groupedCategories).map(cat => ({
      title: cat,
      icon: categoryIcons[cat] || Sparkles,
      count: groupedCategories[cat].length,
      avgPrice: groupedCategories[cat][0].price
    }));
  }, [groupedCategories, categoryIcons]);

  const activeList = React.useMemo(() => {
    if (viewAll) return dbServices;
    if (selectedCategory) return groupedCategories[selectedCategory] || [];
    return [];
  }, [viewAll, selectedCategory, dbServices, groupedCategories]);

  const toggleSelection = (category: string, item: BookingItem) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (newSelections[category]?.id === item.id) {
        delete newSelections[category];
      } else {
        newSelections[category] = item;
      }
      return newSelections;
    });
  };

  const selectionCount = Object.keys(selections).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      async function getSuggestions() {
        setLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
          
          const prompt = `
            You are the "Luminous Concierge" event planner for "Bookings Place".
            User Request:
            - Event Type: ${criteria.type}
            - Date: ${criteria.date}
            - Time: ${criteria.time}
            - Guest Count: ${criteria.guests}
            - Language: ${language === 'en' ? 'English' : 'Arabic'}

            Task: 
            Provide a sophisticated but EASY TO UNDERSTAND event strategy (2-3 short sentences). 
            Explain why this specific date, time, or guest count works perfectly for this event.
            Use friendly, professional language (no dense jargon).
            If the language is Arabic, respond in clear, modern Arabic.
            Do NOT use markdown bolding.
          `;

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          });

          setSuggestion(response.text || '');
          setQuotaExceeded(false);
        } catch (error: any) {
          console.error("Gemini Error:", error);
          if (error.message?.includes('quota') || error.status === 429) {
            setQuotaExceeded(true);
          }
          setSuggestion(language === 'en' ? "Your vision is our command." : "رؤيتكم هي غايتنا.");
        } finally {
          setLoading(false);
        }
      }

      getSuggestions();
    }, 800);

    return () => clearTimeout(timer);
  }, [criteria, language]);

  // New Effect for Item Analysis
  useEffect(() => {
    if ((!selectedCategory && !viewAll) || activeList.length === 0) return;

    // Caching check: If all items in the current active list already have analysis, skip the AI call.
    const missingAnalysis = activeList.filter((item: any) => !itemAnalysis[item.name]);
    if (missingAnalysis.length === 0) return;

    const timer = setTimeout(() => {
      async function analyzeItems() {
        setAnalysisLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
          
          // Only analyze items that don't have analysis yet
          const itemNames = missingAnalysis.map((i: any) => i.name).join(', ');
          const prompt = `
            Category: ${selectedCategory || 'Various'}
            Event: ${criteria.type}
            Date: ${criteria.date}
            Time: ${criteria.time}
            Guest Count: ${criteria.guests}
            Vendors: ${itemNames}
            Language: ${language === 'en' ? 'English' : 'Arabic'}

            For each vendor, provide:
            1. "Practical Suitability": Explain in simple terms how their capacity or layout fits ${criteria.guests} guests and the ${criteria.type} event at ${criteria.time}.
            2. "Emotional Vibe": Explain how the place or service makes guests feel for this specific event type and time.
            3. "Date Factor": Mention why this service is a great match for ${criteria.date} at ${criteria.time} (e.g., weather, lighting, seasonal vibe).

            Format as JSON: 
            {
              "VendorName": { "practical": "...", "emotional": "...", "dateFactor": "..." }
            }
            Keep each point under 15 words. Use simple, clear, non-salesy language.
            Return ONLY valid JSON.
          `;

          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          });

          const text = result.text || '{}';
          const cleanJson = text.replace(/```json|```/g, '').trim();
          const analysis = JSON.parse(cleanJson);
          setItemAnalysis(prev => ({ ...prev, ...analysis }));
          setQuotaExceeded(false); // Reset if successful
        } catch (error: any) {
          console.error("Analysis Error:", error);
          if (error.message?.includes('quota') || error.status === 429) {
            setQuotaExceeded(true);
          }
        } finally {
          setAnalysisLoading(false);
        }
      }

      analyzeItems();
    }, 1000); // 1 second debounce for heavy analysis

    return () => clearTimeout(timer);
  }, [selectedCategory, viewAll, criteria, language, activeList, itemAnalysis]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-on-background/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-surface-container-lowest w-full max-w-7xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-8 flex justify-between items-center bg-surface-container-low border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            {selectedCategory ? (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-on-surface hover:text-primary transition-all"
              >
                <ArrowLeft className={`h-6 w-6 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <div className="w-12 h-12 rounded-2xl iris-gradient flex items-center justify-center shadow-luminous">
                <Sparkles className="text-white h-6 w-6" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-on-surface font-headline leading-none">
                {selectedCategory ? selectedCategory : (language === 'en' ? 'Concierge Selection' : 'اختيارات الكونسيرج')}
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                {selectedCategory ? (language === 'en' ? `Available ${selectedCategory} for your date` : `${selectedCategory} المتاحة في موعدكم`) : `${criteria.type} • ${criteria.date} • ${criteria.time} • ${criteria.guests} ${t('guests')}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-on-surface hover:bg-error-container hover:text-error transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* AI Suggestion */}
                <div className="mb-16">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">{language === 'en' ? 'Planner Vision' : 'رؤية المخطط'}</span>
                  </div>
                  {quotaExceeded && (
                    <div className="mb-4 p-4 rounded-2xl bg-primary-container/30 border border-primary/10 flex items-center gap-3 text-primary text-xs font-medium">
                      <Sparkles className="h-4 w-4" />
                      {language === 'en' 
                        ? 'Our AI Planner is breathing. Some insights may be temporarily limited but your results are ready.' 
                        : 'المخطط الذكي في استراحة قصيرة. بعض التحليلات قد تكون محدودة ولكن نتائجكم جاهزة.'}
                    </div>
                  )}
                  {loading ? (
                    <div className="flex items-center gap-4 text-primary animate-pulse">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="font-medium">{language === 'en' ? 'Crafting your editorial vision...' : 'نقوم بصياغة رؤيتكم الفنية...'}</span>
                    </div>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-3xl md:text-4xl font-light text-on-surface tracking-tight leading-snug font-headline italic"
                    >
                      &ldquo;{suggestion}&rdquo;
                    </motion.p>
                  )}
                </div>

                {/* Service Results */}
                <div>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">{t('curatedCollections')}</span>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight font-headline">
                        {language === 'en' ? 'Recommended Bookings' : 'الحجوزات المقترحة'}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-2">
                        {language === 'en' ? 'Review selected services or choose new ones' : 'راجع الخدمات المختارة أو اختر خدمات جديدة'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-on-surface-variant">
                        {dbServices.length} {language === 'en' ? 'Options Found' : 'خيارات متاحة'}
                      </div>
                      <button 
                        onClick={() => {
                          setViewAll(!viewAll);
                          if (!viewAll) setSelectedCategory(null);
                        }}
                        className="px-4 py-1.5 rounded-full border border-primary/20 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                      >
                        {viewAll ? (language === 'en' ? 'Group by Type' : 'تجميع حسب النوع') : (language === 'en' ? 'View All' : 'عرض الكل')}
                      </button>
                    </div>
                  </div>

                  {!viewAll ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {categoryList.map((service, index) => (
                        <div key={service.title} className="relative">
                          <ServiceCard
                            index={index}
                            icon={service.icon}
                            title={service.title}
                            description={selections[service.title] ? 
                              (language === 'en' ? `Selected: ${selections[service.title].name}` : `تم اختيار: ${selections[service.title].name}`) : 
                              (language === 'en' ? `${service.count} options available` : `${service.count} خيارات متاحة`)}
                            price={selections[service.title] ? selections[service.title].price : service.avgPrice}
                            onClick={() => setSelectedCategory(service.title)}
                          />
                          {selections[service.title] && (
                            <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full iris-gradient flex items-center justify-center shadow-lg border-2 border-white">
                              <CheckCircle2 className="text-white h-5 w-5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {activeList.map((item, idx) => (
                        <ListItem 
                          key={item.id}
                          item={item}
                          idx={idx}
                          selectedCategory={item.category}
                          selections={selections}
                          toggleSelection={toggleSelection}
                          analysisLoading={analysisLoading}
                          itemAnalysis={itemAnalysis}
                          language={language}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-12 p-8 rounded-[30px] bg-primary-container/10 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-on-surface">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">
                          {selectionCount > 0 ? (language === 'en' ? `${selectionCount} Services Ready` : `${selectionCount} خدمات جاهزة`) : (language === 'en' ? 'Ready to secure' : 'جاهز للتأكيد')}
                        </h4>
                        <p className="text-sm opacity-70">{language === 'en' ? 'All selected services are ready to be secured.' : 'جميع الخدمات المختارة جاهزة للحجز فوراً.'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onComplete?.(selections)}
                      className="iris-gradient text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all w-full md:w-auto flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      {language === 'en' ? 'Complete Selection' : 'إتمام الاختيار'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="category-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeList.length > 0 ? activeList.map((item, idx) => (
                    <ListItem 
                      key={item.id}
                      item={item}
                      idx={idx}
                      selectedCategory={selectedCategory || item.category}
                      selections={selections}
                      toggleSelection={toggleSelection}
                      analysisLoading={analysisLoading}
                      itemAnalysis={itemAnalysis}
                      language={language}
                    />
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 text-on-surface-variant/30">
                        <X className="h-10 w-10" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">{language === 'en' ? 'No specific vendors found' : 'لم يتم العثور على مزودين محددين'}</h4>
                      <p className="text-on-surface-variant max-w-md mx-auto">
                        {language === 'en' ? 'We are currently curating the best vendors for this category. Please check back soon or contact our concierge.' : 'نحن نقوم حالياً بتقييم أفضل المزودين لهذه الفئة. يرجى المحاولة لاحقاً أو التواصل مع الكونسيرج.'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
