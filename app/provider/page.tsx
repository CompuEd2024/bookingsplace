'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  ChevronDown, 
  Plus, 
  Mic, 
  Send, 
  Home, 
  ClipboardList, 
  Layers, 
  User, 
  ChevronLeft, 
  ChevronRight,
  GripHorizontal,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, X, Youtube, Copy, CalendarDays, Clock, Check } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import CloudinaryImageUploader from '@/components/CloudinaryImageUploader';
import { useEffect, Suspense } from 'react';

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#F1ECF8] animate-pulse flex items-center justify-center text-primary font-bold">Loading Maps...</div>
});

import { AuthGate } from '@/components/AuthGate';

export default function ProviderPanel() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-lowest flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <ProviderPanelGate />
    </Suspense>
  );
}

function ProviderPanelGate() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <AuthGate initialMode={mode as any}>
      <ProviderPanelContent />
    </AuthGate>
  );
}

function ProviderPanelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [serviceName, setServiceName] = useState('');
  const [serviceType, setServiceType] = useState('Resorts');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('0.00');
  const [pricingModel, setPricingModel] = useState('Per Event');
  const [pricingStrategy, setPricingStrategy] = useState('');
  
  // New Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState<any[]>([
    { name: 'Standard Product', min_qty: 1, max_qty: 1, price: 0, tier_type: 'standard', metadata: { tier_label: 'Basic Tier', description: 'Standard service offering' } }
  ]);
  const [pendingPricing, setPendingPricing] = useState<any[] | null>(null);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: 'United Arab Emirates',
    district: '',
    postalCode: ''
  });

  const [showMapModal, setShowMapModal] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Sunday', dayIndex: 0, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Monday', dayIndex: 1, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Tuesday', dayIndex: 2, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Wednesday', dayIndex: 3, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Thursday', dayIndex: 4, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Friday', dayIndex: 5, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
    { day: 'Saturday', dayIndex: 6, isOpen: true, start: '09:00', end: '18:00', price_override: 0 },
  ]);
  
  // Media State
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // Specifics & Limitations
  const [specifics, setSpecifics] = useState([{ name: 'Amenity', value: 'High Speed WiFi' }]);
  const [limitations, setLimitations] = useState([{ name: 'Policy', value: 'No Outside Catering' }]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleUploadSuccess = (url: string) => {
    setMediaUrls(prev => [...prev, url]);
  };

  // Edit Mode Loader
  useEffect(() => {
    if (editId && isSupabaseConfigured) {
      const fetchService = async () => {
        setLoading(true);
        try {
          const { data: service, error: sErr } = await supabase.from('services').select('*').eq('id', editId).single();
          if (sErr) throw sErr;

          setServiceName(service.name);
          setServiceType(service.service_category);
          setDescription(service.description);
          setBasePrice(service.base_price.toString());
          setPricingModel(service.pricing_model);
          setYoutubeUrl(service.video_url || '');
          setAddress({
            street: service.street_address || '',
            city: service.city || '',
            state: service.state_province || '',
            country: service.country || 'United Arab Emirates',
            district: service.district || '',
            postalCode: service.postal_code || ''
          });
          if (service.latitude && service.longitude) {
            setPinnedLocation({ lat: service.latitude, lng: service.longitude });
          }

          // Fetch Media
          const { data: media } = await supabase.from('service_media').select('url').eq('service_id', editId);
          if (media) setMediaUrls(media.map(m => m.url));

          // Fetch Pricing
          const { data: pricing } = await supabase.from('service_pricing_tiers').select('*').eq('service_id', editId);
          if (pricing && pricing.length > 0) {
            setPricingTiers(pricing.map(p => ({
              name: p.name,
              min_qty: p.min_qty,
              max_qty: p.max_qty,
              price: p.price_per_unit
            })));
          }

          // Fetch Specifics
          const { data: meta } = await supabase.from('service_metadata').select('*').eq('service_id', editId);
          if (meta) {
            setSpecifics(meta.filter(m => m.metadata_type === 'feature').map(m => ({ name: m.attribute_name, value: m.attribute_value })));
            setLimitations(meta.filter(m => m.metadata_type === 'limitation').map(m => ({ name: m.attribute_name, value: m.attribute_value })));
          }

          // Fetch Schedule
          const { data: sched } = await supabase.from('availability_slots').select('*').eq('service_id', editId).eq('is_recurring', true);
          if (sched) {
            setWeeklySchedule(prev => {
              const newSched = prev.map(d => ({ ...d, isOpen: false }));
              sched.forEach(s => {
                const day = newSched.find(d => d.dayIndex === s.day_of_week);
                if (day) {
                  day.isOpen = true;
                  day.start = s.start_time;
                  day.end = s.end_time;
                  day.price_override = s.price_override || 0;
                }
              });
              return newSched;
            });
          }
        } catch (err) {
          console.error('Error loading service for edit:', err);
          setError('Failed to load service data.');
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [editId]);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const categories = [
    'Resorts',
    'Camp and Tents',
    'Wedding Halls',
    'Flower Arrangements',
    'Wedding Dress',
    'Henna',
    'Hair and Makeup',
    'Cultural Bands',
    'Photography',
    'Playgrounds (Soccer for adults)',
    'Tea and Coffee (Hospitality)',
    'Catering'
  ];

  const pricingOptions = [
    { id: 'Per Event', en: 'Per Event', ar: 'لكل فعالية' },
    { id: 'Per Hour', en: 'Per Hour', ar: 'بالساعة' },
    { id: 'Per Person', en: 'Per Person', ar: 'للشخص' },
    { id: 'Per Day', en: 'Per Day', ar: 'باليوم' },
    { id: 'Per Item', en: 'Per Item', ar: 'للقطعة' },
    { id: 'Per Head', en: 'Per Head', ar: 'لكل رأس' }
  ];

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in to save your service');
      router.push('/login');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add keys in settings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Insert/Update Service (Main Row)
      const firstTier = pricingTiers[0];
      const servicePayload = {
        provider_id: user.id,
        name: serviceName,
        service_category: serviceType,
        description: description,
        base_price: firstTier ? firstTier.price : 0,
        pricing_model: firstTier ? (firstTier.unit || 'Per Event') : 'Per Event',
        street_address: address.street,
        district: address.district,
        city: address.city,
        state_province: address.state,
        country: address.country,
        postal_code: address.postalCode,
        latitude: pinnedLocation?.lat,
        longitude: pinnedLocation?.lng,
        video_url: youtubeUrl,
        status: 'active'
      };

      console.log('Final Category Payload Verification:', serviceType);

      let currentServiceId = editId;

      if (editId) {
        const { error: serviceError } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', editId);
        if (serviceError) throw serviceError;
      } else {
        const { data: newService, error: serviceError } = await supabase
          .from('services')
          .insert([servicePayload])
          .select()
          .single();
        if (serviceError) {
          console.error('Error inserting service:', serviceError);
          throw serviceError;
        }
        currentServiceId = newService.id;
      }
      
      const serviceId = currentServiceId as string;

      // Clean up existing relations if editing
      if (editId) {
        await supabase.from('service_media').delete().eq('service_id', editId);
        await supabase.from('availability_slots').delete().eq('service_id', editId);
        await supabase.from('service_metadata').delete().eq('service_id', editId);
      }

      // 2. Insert Media (Columns: url, media_type, service_id)
      const mediaInserts = [
        ...mediaUrls.map((url) => ({
          service_id: serviceId,
          url: url,
          media_type: 'image'
        })),
        ...(youtubeUrl ? [{
          service_id: serviceId,
          url: youtubeUrl,
          media_type: 'video'
        }] : [])
      ];

      if (mediaInserts.length > 0) {
        const { error: mediaError } = await supabase.from('service_media').insert(mediaInserts);
        if (mediaError) {
          console.error('Error inserting media:', mediaError);
          throw mediaError;
        }
      }

      // 3. Handle Pricing Tiers or Inventory
      if (serviceType === 'Wedding Dress') {
        const inventoryInserts = pricingTiers.map(tier => ({
          service_id: serviceId,
          item_name: tier.item_name || tier.name || serviceName,
          rent_price: (tier.tier_type === 'rental' || tier.name?.toLowerCase().includes('rent')) ? tier.price : null,
          sale_price: (tier.tier_type === 'sale' || tier.name?.toLowerCase().includes('sale')) ? tier.price : null,
          size: tier.size || 'Standard',
          status: 'available'
        }));

        const { error: invError } = await supabase.from('inventory').insert(inventoryInserts);
        if (invError) throw invError;
      } else {
        const pricingInserts = pricingTiers.map(tier => ({
          service_id: serviceId,
          name: tier.name || 'Standard Product', // Maps to Product Name
          min_qty: tier.min_qty,
          max_qty: tier.max_qty,
          unit: tier.unit || 'Per Event',
          price_per_unit: tier.price,
          tier_type: tier.tier_type || 'standard',
          metadata: {
            tier_label: tier.metadata?.tier_label || 'Default Tier',
            description: tier.metadata?.description || ''
          }
        }));

        const { error: pricingError } = await supabase
          .from('service_pricing_tiers')
          .insert(pricingInserts);

        if (pricingError) {
          console.error('Error inserting pricing tiers:', pricingError.message);
          throw new Error(`Pricing Save Error: ${pricingError.message}`);
        }
      }

      // 4. Insert Availability (Weekly Recurring Schedule)
      const availabilityInserts = weeklySchedule
        .filter(d => d.isOpen)
        .map(d => ({
          service_id: serviceId,
          day_of_week: d.dayIndex,
          start_time: d.start,
          end_time: d.end,
          status: 'available',
          is_recurring: true,
          date: null,
          price_override: d.price_override > 0 ? d.price_override : null
        }));

      const { error: availabilityError } = await supabase.from('availability_slots').insert(availabilityInserts);
      if (availabilityError) {
        console.error('Error inserting availability slots:', availabilityError);
        throw availabilityError;
      }

      // 5. Insert Metadata (Specifics & Limitations)
      const metadataInserts = [
        ...specifics.map(s => ({
          service_id: serviceId,
          attribute_name: s.name,
          attribute_value: s.value,
          metadata_type: 'feature'
        })),
        ...limitations.map(l => ({
          service_id: serviceId,
          attribute_name: l.name,
          attribute_value: l.value,
          metadata_type: 'limitation'
        }))
      ];

      if (metadataInserts.length > 0) {
        const { error: metaError } = await supabase.from('service_metadata').insert(metadataInserts);
        if (metaError) {
          console.error('Error inserting metadata:', metaError);
          throw metaError;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/provider/my-services');
      }, 3000);

    } catch (err: any) {
      console.error('Submission Error:', err);
      setError(err.message || 'An error occurred during listing submission.');
    } finally {
      setLoading(false);
    }
  };


  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.start();
    
    setLoading(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPricingStrategy(prev => prev ? prev + " " + transcript : transcript);
      setLoading(false);
    };
    
    recognition.onerror = (event: any) => {
      setLoading(false);
      let msg = "Voice capture failed. Please try again.";
      if (event.error === 'not-allowed') {
        msg = "Microphone access denied. Please check your browser permissions.";
      } else if (event.error === 'no-speech') {
        msg = "No speech was detected. Please try again.";
      } else if (event.error === 'network') {
        msg = "Network error. Please check your connection.";
      }
      setError(msg);
    };
    
    recognition.onend = () => setLoading(false);
  };

  const analyzePricingText = async () => {
    if (!pricingStrategy.trim()) {
      setError("Please provide some instructions first.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const mod = await import("@google/genai");
      const GGenAI = (mod as any).GoogleGenAI || (mod as any).default?.GoogleGenAI || (mod as any).default;
      const ai = new GGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `You are an expert event pricing and inventory assistant. Analyze the text and identify EVERY separate pricing tier, service, or inventory item mentioned. Return an ARRAY of JSON objects.
      
      If the user mentions different prices for different conditions (times, quality levels, group sizes) or different transaction types (rent vs. buy), return them as separate objects.
      
      SPECIAL RULES FOR SHEEP:
      - If 'Whole Sheep', 'Mandi Sheep', or any sheep related term is mentioned, use 'Per Head' as the primary unit.
      - Identify the breed (e.g., Naimi, Sawakni, Harri) and include it in the 'tier_name' (e.g., "Whole Sheep - Naimi").
      
      Each object must have: 
      name (string, e.g., "Catering Buffet" - the specific product),
      price_per_unit (number), 
      unit (string, mapped to enum: "Per Event", "Per Person", "Per Item", "Per Day", "Per Head"), 
      min_qty (number), 
      max_qty (number),
      tier_type (string, e.g., "standard", "weekend", "rental", "sale", "package"),
      metadata (object: { tier_label: string, description: string })
      
      Instructions: ${pricingStrategy}`;
      
      // Match the SDK Pattern and Model Name as requested for Gemini 3 Preview
      const res = await (ai as any).models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      // Response Parsing: Using the structured access as requested for Gemini 3
      const result = res.text || res.response?.text?.() || (res.value?.content?.parts?.[0]?.text) || "";
      
      const sanitized = result.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(sanitized);
      
      setPendingPricing(Array.isArray(parsedData) ? parsedData : [parsedData]);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("Failed to convert instructions. Please check your text and try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <main 
      className={`min-h-screen bg-[#F8F6FF] pb-32 selection:bg-primary-container/20 ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 20, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#1C1A23] font-cairo">Submission Successful</h3>
                <p className="text-[#605693] text-sm">Your service has been created and saved to the Atelier network.</p>
              </div>
              <div className="h-1 w-full bg-green-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-green-600"
                />
              </div>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Redirecting to Dashboard...</p>
            </motion.div>
          </motion.div>
        )}

        {error && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-red-500/10 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-8 rounded-[32px] shadow-2xl max-w-md w-full border border-red-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-grow space-y-1">
                  <h4 className="text-lg font-bold text-red-600">Error Occurred</h4>
                  <p className="text-sm text-[#605693] leading-relaxed">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showMapModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[70vh]"
            >
              <div className="p-6 border-b border-[#F0E6FF] flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">Pin Your Exact Location</h3>
                <button 
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-[#F1ECF8] rounded-full transition-colors text-[#605693]"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <div className="flex-grow relative">
                <InteractiveMap onLocationSelect={(lat, lng) => setPinnedLocation({lat, lng})} />
              </div>
              <div className="p-6 bg-[#F8F6FF] flex justify-between items-center">
                <div className="text-sm text-[#605693]">
                  {pinnedLocation 
                    ? `Pinned: ${pinnedLocation.lat.toFixed(4)}, ${pinnedLocation.lng.toFixed(4)}`
                    : "Click/tap the map to pin your location"
                  }
                </div>
                <button 
                  onClick={() => setShowMapModal(false)}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Confirm Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Provider Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-[#F0E6FF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-primary/20">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2NupYj2jsmpoajoRMHLO3A72nP2NsFjPlkmR-mh0B-SDyW2qQTD2pAqjEwv25aV_Ub1qrXxVICo6k-E4NPMiytXq2eJT3Ac0leQ2CSJhfJ1w7KMw0Xws73rGvTkmR9VJY3Pth3BMlTkAcNEvCggxnTNnZLMvrR9giwgPfYJHO0ecDd59wvrKZ6qUTltF2azuSunUES41f_n0RzMU858veaUb77ewm8vf4aFSLvH9gSF9Ax4MKznqf12d5jwEqDgNMqzssdxX_YOrZ"
              alt="Provider"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-primary text-sm hidden sm:block">Provider Panel</span>
        </div>
        <h1 className="text-primary font-bold text-lg absolute left-1/2 -translate-x-1/2">Provider Panel</h1>
        <button className="p-2 bg-[#F1E8FF] rounded-full text-primary relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <div className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Title Section with Step Indicator */}
        <section className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase font-inter">Step {step} of 3</span>
            <h2 className="text-4xl font-black text-[#1C1A23] tracking-tight mt-1 font-cairo">
              {step === 1 && 'Basic Info & Pricing'}
              {step === 2 && 'Location & Media'}
              {step === 3 && 'Details & Availability'}
            </h2>
            <p className="text-[#605693] mt-2 text-sm font-inter">
              {step === 1 && 'Start with the essentials of your service.'}
              {step === 2 && 'Show exactly where you are and what you offer.'}
              {step === 3 && 'Finalize with specifics and your calendar.'}
            </p>
          </div>
          <div className="flex gap-1.5 mb-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-[#E0D5F5]'}`} />
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {step === 1 && (
              <>
                {/* Basic Information */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F0E6FF] space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C1A23] font-cairo">Service Basics</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Service Type</label>
                      <div className="relative group">
                        <select 
                          className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 appearance-none font-medium text-[#1C1A23] outline-none pr-12 focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Service Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Grand Iris Ballroom"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40 font-inter"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Description</label>
                      <textarea 
                        placeholder="Describe what makes your service unique..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#F1ECF8] border-none rounded-3xl p-6 min-h-[160px] font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 shadow-inner resize-none placeholder:text-[#605693]/30 font-inter"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-[#F1ECF8]/50 rounded-[32px] p-8 border border-[#E0D5F5] space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                          <Layers className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1C1A23] font-cairo">Tiered Pricing</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {loading && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100"
                            >
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                              <span className="text-[8px] font-bold text-red-600 uppercase tracking-tighter">Recording...</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button 
                          onClick={startVoiceCapture}
                          disabled={loading}
                          className="p-3 bg-white border border-primary/20 rounded-2xl text-primary hover:bg-primary/5 transition-all shadow-sm flex items-center gap-2 group relative overflow-hidden"
                        >
                          <div className={`absolute inset-0 bg-primary/5 transition-transform duration-1000 ${loading ? 'translate-y-0' : 'translate-y-full'}`} />
                          <Mic className={`h-4 w-4 relative z-10 ${loading ? 'animate-pulse text-red-500' : ''}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block relative z-10">Smart Voice</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Pricing Strategy / Voice Instructions</label>
                        <div className="space-y-3">
                          <textarea 
                            placeholder="Describe how your pricing changes (e.g. 'I want it to be $50 per person for small groups, but $40 for more than 10 people')..."
                            value={pricingStrategy}
                            onChange={(e) => setPricingStrategy(e.target.value)}
                            className="w-full bg-white border-2 border-white focus:border-primary/20 rounded-2xl p-4 text-xs font-semibold text-[#1C1A23] outline-none transition-all placeholder:text-[#605693]/30 min-h-[100px] resize-none shadow-sm"
                          ></textarea>
                          
                          <button 
                            onClick={analyzePricingText}
                            disabled={loading || !pricingStrategy.trim()}
                            className="w-full py-3 bg-white border border-primary/20 rounded-2xl text-primary font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                          >
                            <CheckCircle2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'group-hover:scale-110'}`} />
                            <span>Sync with Instructions</span>
                          </button>
                        </div>
                      </div>



                    <div className="pt-4 space-y-3">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Volume Tiers</label>
                       
                       <AnimatePresence>
                         {pendingPricing && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className="bg-primary/5 border-2 border-primary/20 p-5 rounded-3xl space-y-4 mb-4"
                           >
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                   <Check className="h-4 w-4 text-white" />
                                 </div>
                                 <h4 className="text-sm font-black text-primary uppercase tracking-tight">Review Your Pricing Tiers</h4>
                               </div>
                               <button onClick={() => setPendingPricing(null)} className="text-[#605693] hover:text-red-500 transition-colors">
                                 <X className="h-4 w-4" />
                               </button>
                             </div>
                             
                             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {pendingPricing.map((item: any, idx: number) => (
                                 <div key={idx} className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm space-y-4">
                                   <div className="flex justify-between items-start gap-4">
                                     <div className="flex-grow space-y-2">
                                       <label className="text-[8px] font-black text-primary uppercase tracking-widest block">Tier/Item Name</label>
                                       <input 
                                         type="text" 
                                         value={item.tier_name || ''} 
                                         onChange={(e) => {
                                           const newPending = [...pendingPricing];
                                           newPending[idx].tier_name = e.target.value;
                                           setPendingPricing(newPending);
                                         }}
                                         className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs font-bold font-inter border-none outline-none focus:ring-1 focus:ring-primary/20"
                                       />
                                     </div>
                                     <div className="w-24 space-y-2">
                                       <label className="text-[8px] font-black text-primary uppercase tracking-widest block">Price</label>
                                       <input 
                                         type="number" 
                                         value={item.price_per_unit} 
                                         onChange={(e) => {
                                           const newPending = [...pendingPricing];
                                           newPending[idx].price_per_unit = parseFloat(e.target.value);
                                           setPendingPricing(newPending);
                                         }}
                                         className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs font-black font-inter border-none outline-none focus:ring-1 focus:ring-primary/20 text-right"
                                       />
                                     </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-3 gap-3">
                                     <div className="space-y-2">
                                       <label className="text-[8px] font-black text-[#605693] uppercase block">Type</label>
                                       <input 
                                         type="text" 
                                         value={item.tier_type || ''} 
                                         onChange={(e) => {
                                           const newPending = [...pendingPricing];
                                           newPending[idx].tier_type = e.target.value;
                                           setPendingPricing(newPending);
                                         }}
                                         placeholder="e.g. rental"
                                         className="w-full bg-surface-container-low/50 px-2 py-1.5 rounded-lg text-[10px] font-bold border-none outline-none"
                                       />
                                     </div>
                                     <div className="space-y-2">
                                       <label className="text-[8px] font-black text-[#605693] uppercase block">Unit</label>
                                       <input 
                                         type="text" 
                                         value={item.unit || ''} 
                                         onChange={(e) => {
                                           const newPending = [...pendingPricing];
                                           newPending[idx].unit = e.target.value;
                                           setPendingPricing(newPending);
                                         }}
                                         className="w-full bg-surface-container-low/50 px-2 py-1.5 rounded-lg text-[10px] font-bold border-none outline-none"
                                       />
                                     </div>
                                     <div className="space-y-2">
                                       <label className="text-[8px] font-black text-[#605693] uppercase block">Size</label>
                                       <input 
                                         type="text" 
                                         value={item.size || ''} 
                                         onChange={(e) => {
                                           const newPending = [...pendingPricing];
                                           newPending[idx].size = e.target.value;
                                           setPendingPricing(newPending);
                                         }}
                                         placeholder="e.g. XL"
                                         className="w-full bg-surface-container-low/50 px-2 py-1.5 rounded-lg text-[10px] font-bold border-none outline-none"
                                       />
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                             
                             <button 
                               onClick={() => {
                                 if (pendingPricing && pendingPricing.length > 0) {
                                   setPricingModel(pendingPricing[0].unit || pricingModel);
                                   setBasePrice(pendingPricing[0].price_per_unit.toString());
                                   setPricingTiers(pendingPricing.map(item => ({
                                     name: item.name || 'Service Component',
                                     min_qty: item.min_qty || 1,
                                     max_qty: item.max_qty || 1,
                                     price: item.price_per_unit,
                                     tier_type: item.tier_type || 'standard',
                                     unit: item.unit,
                                     metadata: item.metadata || { tier_label: item.tier_name || 'Standard', description: '' }
                                   })));
                                 }
                                 setPendingPricing(null);
                               }}
                               className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                             >
                               <CheckCircle2 className="h-5 w-5" />
                               <span>Confirm & Apply {pendingPricing.length} Tiers/Items</span>
                             </button>
                           </motion.div>
                         )}
                       </AnimatePresence>

                       {pricingTiers.map((tier, idx) => {
                         const specifics = (() => {
                           switch(serviceType) {
                             case 'Catering': return { tier: "e.g., Off-Peak Discount", name: "Service Name", nameHint: "e.g., Lebanese Buffet", namePlace: "Open Buffet", descPlace: "Includes 3 salads, 4 mains, and soft drinks" };
                             case 'Wedding Dress': return { tier: "e.g., 3-Day Rental", name: "Dress Model/Name", nameHint: "e.g., Vera Wang Gown", namePlace: "Lace Mermaid Gown", descPlace: "3-day rental with dry cleaning included" };
                             case 'Resorts': 
                             case 'Wedding Halls':
                             case 'Camp and Tents': return { tier: "e.g., High Season Rate", name: "Hall/Room Name", nameHint: "e.g., Main Ballroom", namePlace: "Main Ballroom", descPlace: "Includes sound system, tables, and stage" };
                             case 'Photography': return { tier: "e.g., Package Tiers", name: "Service Name", nameHint: "e.g., Full Day Coverage", namePlace: "Full Day Coverage", descPlace: "8 hours, 2 photographers, and 100 edited photos" };
                             case 'Henna': return { tier: "e.g., Design Complexity", name: "Service Name", nameHint: "e.g., Bridal Package", namePlace: "Bridal Package", descPlace: "Full arm and feet patterns with organic henna" };
                             case 'Hair and Makeup': return { tier: "e.g., Occasion Type", name: "Service Name", nameHint: "e.g., Bridal Glam", namePlace: "Bridal Glam", descPlace: "Includes contouring, lashes, and hair styling" };
                             case 'Playgrounds (Soccer for adults)': return { tier: "e.g., Time Slot Tiers", name: "Service Name", nameHint: "e.g., Evening Slot", namePlace: "Evening Slot", descPlace: "1.5 hours of field time under floodlights" };
                             case 'Cultural Bands': return { tier: "e.g., Performance Length", name: "Service Name", nameHint: "e.g., Zaffeh Performance", namePlace: "Zaffeh Performance", descPlace: "30-minute entrance with 5 drummers" };
                             case 'Tea and Coffee (Hospitality)': return { tier: "e.g., Hospitality Levels", name: "Service Name", nameHint: "e.g., Coffee & Dates", namePlace: "Coffee & Dates", descPlace: "Dallah service with premium Saudi dates" };
                             default: return { tier: "Groups items (e.g., 'Bronze Package')", name: "Product Name", nameHint: "The item/service name", namePlace: "Enter service name...", descPlace: "What is included?" };
                           }
                         })();

                         return (
                           <div key={idx} className="bg-white/40 p-4 rounded-2xl border border-white flex flex-col gap-3">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <div className="flex flex-col ml-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Tier Label</label>
                                    <span className="text-[8px] text-primary/40 leading-tight">{specifics.tier}</span>
                                  </div>
                                <input 
                                  type="text" 
                                  placeholder="e.g. VIP Tier"
                                  className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold outline-none border border-[#F0E6FF] focus:ring-2 focus:ring-primary/10 transition-all font-inter"
                                  value={tier.metadata?.tier_label || ''}
                                  onChange={(e) => {
                                    const newTiers = [...pricingTiers];
                                    if (!newTiers[idx].metadata) newTiers[idx].metadata = {};
                                    newTiers[idx].metadata.tier_label = e.target.value;
                                    setPricingTiers(newTiers);
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                 <div className="space-y-1">
                                  <div className="flex flex-col ml-1">
                                    <label className="text-[8px] font-bold uppercase text-[#605693]">{specifics.name}</label>
                                    <span className="text-[7px] text-[#605693]/50">{specifics.nameHint}</span>
                                  </div>
                                  <input 
                                    type="text" 
                                    placeholder={specifics.namePlace}
                                    className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold outline-none border border-[#F0E6FF] font-inter"
                                    value={tier.name}
                                    onChange={(e) => {
                                      const newTiers = [...pricingTiers];
                                      newTiers[idx].name = e.target.value;
                                      setPricingTiers(newTiers);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-col ml-1">
                                    <label className="text-[8px] font-bold uppercase text-[#605693]">Description</label>
                                    <span className="text-[7px] text-[#605693]/50">Show customers what&apos;s included</span>
                                  </div>
                                  <input 
                                    type="text" 
                                    placeholder={specifics.descPlace}
                                    className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold outline-none border border-[#F0E6FF] font-inter"
                                    value={tier.metadata?.description || ''}
                                    onChange={(e) => {
                                      const newTiers = [...pricingTiers];
                                      if (!newTiers[idx].metadata) newTiers[idx].metadata = {};
                                      newTiers[idx].metadata.description = e.target.value;
                                      setPricingTiers(newTiers);
                                    }}
                                  />
                                </div>
                                {serviceType === 'Wedding Dress' && (
                                  <div className="col-span-full space-y-1 mt-1">
                                    <div className="flex flex-col ml-1">
                                      <label className="text-[8px] font-bold uppercase text-[#605693]">Size</label>
                                      <span className="text-[7px] text-[#605693]/50">e.g., EU 38, Large</span>
                                    </div>
                                    <input 
                                      type="text" 
                                      placeholder="Enter size..."
                                      className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold outline-none border border-[#F0E6FF] font-inter"
                                      value={tier.size || ''}
                                      onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[idx].size = e.target.value;
                                        setPricingTiers(newTiers);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                  <div className="flex flex-col ml-1">
                                    <label className="text-[8px] font-bold uppercase text-[#605693]">Quantity Range</label>
                                    <span className="text-[7px] text-[#605693]/50">Volume for this price</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-2 border border-[#F0E6FF]">
                                    <span className="text-[10px] text-[#605693] font-bold">Min:</span>
                                    <input 
                                      type="number" 
                                      className="w-10 text-xs font-bold outline-none bg-transparent"
                                      value={tier.min_qty}
                                      onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[idx].min_qty = parseInt(e.target.value) || 0;
                                        setPricingTiers(newTiers);
                                      }}
                                    />
                                    <span className="text-[10px] text-[#605693] font-bold ml-2">Max:</span>
                                    <input 
                                      type="number" 
                                      className="w-10 text-xs font-bold outline-none bg-transparent"
                                      value={tier.max_qty}
                                      onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[idx].max_qty = parseInt(e.target.value) || 0;
                                        setPricingTiers(newTiers);
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex-grow space-y-1">
                                   <div className="flex flex-col ml-1">
                                     <label className="text-[8px] font-bold uppercase text-[#605693]">Price</label>
                                     <span className="text-[7px] text-[#605693]/50">Cost per unit</span>
                                   </div>
                                   <div className="bg-white rounded-xl px-3 py-2 border border-[#F0E6FF] flex items-center gap-2">
                                     <select 
                                        className="text-[10px] text-primary font-bold bg-transparent outline-none border-none cursor-pointer"
                                        value={tier.unit || 'Per Event'}
                                        onChange={(e) => {
                                          const newTiers = [...pricingTiers];
                                          newTiers[idx].unit = e.target.value;
                                          setPricingTiers(newTiers);
                                        }}
                                      >
                                        {pricingOptions.map(opt => (
                                          <option key={opt.id} value={opt.id}>
                                            {language === 'ar' ? opt.ar : opt.en}
                                          </option>
                                        ))}
                                      </select>
                                     <input 
                                       type="number" 
                                       placeholder="0.00"
                                       className="flex-grow text-xs font-bold outline-none text-right placeholder:opacity-20"
                                       value={isNaN(tier.price) ? '' : tier.price}
                                       onChange={(e) => {
                                         const newTiers = [...pricingTiers];
                                         const val = parseFloat(e.target.value);
                                         newTiers[idx].price = isNaN(val) ? 0 : val;
                                         setPricingTiers(newTiers);
                                       }}
                                     />
                                   </div>
                                </div>

                                <button 
                                  onClick={() => setPricingTiers(pricingTiers.filter((_, i) => i !== idx))}
                                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                         </div>
                        );
                      })}
                       <button 
                        onClick={() => setPricingTiers([...pricingTiers, { 
                           name: '', 
                           min_qty: 1, 
                           max_qty: 1, 
                           price: 0, 
                           unit: 'Per Event', 
                           tier_type: 'standard',
                           metadata: { tier_label: '', description: '' }
                         }])}
                        className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                       >
                         <Plus className="h-3 w-3" /> Add Volume Tier
                       </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Location */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F0E6FF] space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C1A23] font-cairo">Atelier Location</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter">
                    <div className="space-y-2 col-span-full">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Street</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 123 Iris Street"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">District</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Downtown"
                        value={address.district}
                        onChange={(e) => setAddress({...address, district: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dubai"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">State</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dubai"
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Country</label>
                      <input 
                        type="text" 
                        placeholder="e.g. United Arab Emirates"
                        value={address.country}
                        onChange={(e) => setAddress({...address, country: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Postal Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 00000"
                        value={address.postalCode}
                        onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                        className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40"
                      />
                    </div>
                  </div>

                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mt-4 shadow-inner border border-[#F0E6FF]">
                    <Image 
                      src="https://picsum.photos/seed/map/800/400" 
                      alt="Map Component"
                      fill
                      className="object-cover opacity-50 grayscale contrast-125"
                    />
                    <div className="absolute inset-0 bg-[#D8CCFF]/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <button 
                        onClick={() => setShowMapModal(true)}
                        className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#F0E6FF] active:scale-95 transition-transform group"
                       >
                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                           <MapPin className="h-4 w-4" />
                         </div>
                         <span className="font-bold text-primary text-sm font-inter">
                           {pinnedLocation ? "Location Pinned" : "Pin Location"}
                         </span>
                       </button>
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F0E6FF] space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C1A23] font-cairo text-primary">Media Portfolio</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Images (Cloudinary)</label>
                      <CloudinaryImageUploader onUploadSuccess={handleUploadSuccess} />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-2">
                       {mediaUrls.map((url, i) => (
                         <div key={i} className="relative h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#5D3FD3]/20 group">
                           <img 
                            src={url} 
                            alt={`Gallery ${i}`} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                           />
                           {i === 0 && <div className="absolute top-0 right-0 bg-[#5D3FD3] text-white text-[6px] font-black uppercase px-2 py-0.5 rounded-bl-lg font-inter">Primary</div>}
                           <button 
                            onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                           >
                              <X className="h-5 w-5 text-white" />
                           </button>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#F0E6FF]">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1 flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-600" />
                          YouTube Video URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="w-full bg-[#F1ECF8] border-none rounded-2xl px-5 py-4 font-medium text-[#1C1A23] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#605693]/40 font-inter"
                        />
                      </div>

                      {youtubeUrl && getYouTubeId(youtubeUrl) && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 uppercase">Video Preview</label>
                          <div className="relative w-full pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-lg bg-black">
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${getYouTubeId(youtubeUrl)}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Specifics & Limitations */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F0E6FF] space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1C1A23] font-cairo">Features & Rules</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#605693] ml-1">Key Specifics (Features)</label>
                        <button onClick={() => setSpecifics([...specifics, { name: '', value: '' }])} className="text-primary text-[9px] font-black uppercase tracking-widest">+ Add Feature</button>
                      </div>
                      {specifics.map((s, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3">
                          <input 
                            placeholder="Name (e.g. WiFi)" 
                            className="bg-[#F1ECF8] rounded-xl px-4 py-3 text-xs font-bold outline-none" 
                            value={s.name}
                            onChange={(e) => {
                              const news = [...specifics];
                              news[i].name = e.target.value;
                              setSpecifics(news);
                            }}
                          />
                          <input 
                            placeholder="Value (e.g. 100 Mbps)" 
                            className="bg-[#F1ECF8] rounded-xl px-4 py-3 text-xs font-bold outline-none"
                            value={s.value}
                            onChange={(e) => {
                              const news = [...specifics];
                              news[i].value = e.target.value;
                              setSpecifics(news);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 border-t border-[#F0E6FF] pt-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#A35D00] ml-1">Limitations (Rules)</label>
                        <button onClick={() => setLimitations([...limitations, { name: '', value: '' }])} className="text-[#A35D00] text-[9px] font-black uppercase tracking-widest">+ Add Rule</button>
                      </div>
                      {limitations.map((l, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3">
                          <input 
                            placeholder="Type (e.g. Policy)" 
                            className="bg-[#F8F6FF] border border-amber-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                            value={l.name}
                            onChange={(e) => {
                              const newl = [...limitations];
                              newl[i].name = e.target.value;
                              setLimitations(newl);
                            }}
                          />
                          <input 
                            placeholder="Rule (e.g. No Smoking)" 
                            className="bg-[#F8F6FF] border border-amber-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                            value={l.value}
                            onChange={(e) => {
                              const newl = [...limitations];
                              newl[i].value = e.target.value;
                              setLimitations(newl);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F0E6FF] space-y-6">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1C1A23] font-cairo">Weekly Schedule</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const first = weeklySchedule[0];
                        setWeeklySchedule(weeklySchedule.map(d => ({ ...d, start: first.start, end: first.end, isOpen: first.isOpen })));
                      }}
                      className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                    >
                      <Copy className="h-3 w-3" /> Copy to All Days
                    </button>
                  </div>

                  <div className="space-y-3">
                    {weeklySchedule.map((day, idx) => (
                      <div key={day.day} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${day.isOpen ? 'bg-white border-primary/20' : 'bg-gray-50/50 border-transparent opacity-60'}`}>
                        <button 
                          onClick={() => {
                            const newSchedule = [...weeklySchedule];
                            newSchedule[idx].isOpen = !newSchedule[idx].isOpen;
                            setWeeklySchedule(newSchedule);
                          }}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${day.isOpen ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
                        >
                          {day.isOpen ? <Check className="h-6 w-6" /> : <X className="h-5 w-5" />}
                        </button>
                        
                        <div className="flex-grow">
                          <h4 className="font-bold text-[#1C1A23]">{language === 'ar' ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][idx] : day.day}</h4>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-[#605693]">{day.isOpen ? (language === 'ar' ? 'مفتوح' : 'Open') : (language === 'ar' ? 'مغلق' : 'Closed')}</p>
                        </div>

                        {day.isOpen && (
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-[#605693] uppercase">In</span>
                              <input 
                                type="time"
                                value={day.start}
                                onChange={(e) => {
                                  const newSchedule = [...weeklySchedule];
                                  newSchedule[idx].start = e.target.value;
                                  setWeeklySchedule(newSchedule);
                                }}
                                className="bg-[#F8F6FF] border border-[#F0E6FF] rounded-xl pl-8 pr-3 py-2 text-xs font-bold outline-none focus:border-primary transition-all w-28"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-[#605693] uppercase">Out</span>
                              <input 
                                type="time"
                                value={day.end}
                                onChange={(e) => {
                                  const newSchedule = [...weeklySchedule];
                                  newSchedule[idx].end = e.target.value;
                                  setWeeklySchedule(newSchedule);
                                }}
                                className="bg-[#F8F6FF] border border-[#F0E6FF] rounded-xl pl-8 pr-3 py-2 text-xs font-bold outline-none focus:border-primary transition-all w-28"
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-primary uppercase">Price</span>
                              <input 
                                type="number"
                                placeholder="+Override"
                                value={day.price_override || ''}
                                onChange={(e) => {
                                  const newSchedule = [...weeklySchedule];
                                  newSchedule[idx].price_override = parseFloat(e.target.value) || 0;
                                  setWeeklySchedule(newSchedule);
                                }}
                                className="bg-[#F1ECF8] border border-primary/10 rounded-xl pl-12 pr-3 py-2 text-xs font-bold outline-none focus:border-primary transition-all w-32"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Stepped Navigation Buttons */}
            <div className="pt-8 flex gap-4">
              {step > 1 && (
                <button 
                  onClick={prevStep}
                  className="flex-1 bg-white text-primary border-2 border-primary/20 py-5 rounded-[32px] font-black text-lg hover:bg-primary/5 transition-all active:scale-[0.98] font-cairo"
                >
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  className="flex-[2] bg-primary text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-3 font-cairo"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] bg-primary text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-70 font-cairo"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <span>Store Listing</span>
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistence Feedback Layers */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#1C1A23]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 border-2 border-primary rounded-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1A23] font-cairo">Listing Published!</h3>
                <p className="text-[#605693] mt-2 text-sm font-inter">Your premium atelier is now live. Redirecting to your dashboard...</p>
              </div>
              <div className="h-1.5 w-full bg-[#F1ECF8] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#1C1A23]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full space-y-6"
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1A23] font-cairo">Submission Failed</h3>
                <p className="text-xs text-red-600/70 mt-2 font-inter leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="w-full bg-[#1C1A23] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 font-cairo"
              >
                <X className="h-4 w-4" />
                <span>Dismiss</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl rounded-full px-4 py-3 flex justify-between items-center shadow-2xl border border-white/50 z-50">
        <button className="flex flex-col items-center gap-1 flex-1 text-[#D8CCFF] hover:text-primary transition-colors">
          <ClipboardList className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 flex-1 text-[#D8CCFF] hover:text-primary transition-colors">
          <Layers className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Services</span>
        </button>
        <button className="flex flex-col items-center gap-1 flex-1 text-[#D8CCFF] hover:text-primary transition-colors">
          <User className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Profile</span>
        </button>
      </nav>
    </main>
  );
}
