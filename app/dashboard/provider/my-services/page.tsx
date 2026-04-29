'use client';

import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Loader2, 
  Plus, 
  MapPin, 
  Clock, 
  CalendarDays, 
  ChevronRight,
  LayoutDashboard,
  Store,
  ExternalLink,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/components/LanguageContext';

interface Service {
  id: string;
  name: string;
  service_category: string;
  base_price: number;
  city: string;
  status: string;
}

interface AvailabilitySlot {
  service_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}

export default function MyServicesDashboard() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [user, setUser] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) return;

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch Services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);

        // Fetch Availability for these services
        if (servicesData && servicesData.length > 0) {
          const serviceIds = servicesData.map(s => s.id);
          const { data: availData, error: availError } = await supabase
            .from('availability_slots')
            .select('*')
            .in('service_id', serviceIds)
            .eq('is_recurring', true);

          if (!availError && availData) {
            const grouped = availData.reduce((acc: any, curr: any) => {
              if (!acc[curr.service_id]) acc[curr.service_id] = [];
              acc[curr.service_id].push(curr);
              return acc;
            }, {});
            setAvailability(grouped);
          }
        }
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleDelete = async (serviceId: string) => {
    setDeleteLoading(serviceId);
    try {
      // Manual cleanup of relations to handle potential FK issues
      await supabase.from('service_media').delete().eq('service_id', serviceId);
      await supabase.from('service_pricing_tiers').delete().eq('service_id', serviceId);
      await supabase.from('availability_slots').delete().eq('service_id', serviceId);
      await supabase.from('service_metadata').delete().eq('service_id', serviceId);

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.filter(s => s.id !== serviceId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      // alert or custom toast should go here. Using alert as fallback but custom modal is better.
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatSchedule = (slots: AvailabilitySlot[]) => {
    if (!slots || slots.length === 0) return 'No recurring hours set';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const arDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    // Sort by day index
    const sorted = [...slots].sort((a, b) => a.day_of_week - b.day_of_week);
    
    // Group adjacent days with same hours
    const ranges: string[] = [];
    let currentRange: AvailabilitySlot[] = [];

    sorted.forEach((slot, idx) => {
      if (idx === 0) {
        currentRange = [slot];
      } else {
        const prev = sorted[idx - 1];
        if (slot.day_of_week === prev.day_of_week + 1 && slot.start_time === prev.start_time && slot.end_time === prev.end_time) {
          currentRange.push(slot);
        } else {
          ranges.push(formatRange(currentRange));
          currentRange = [slot];
        }
      }
    });
    ranges.push(formatRange(currentRange));

    return ranges.join(', ');

    function formatRange(range: AvailabilitySlot[]) {
      const first = range[0];
      const last = range[range.length - 1];
      const timeStr = `${first.start_time.slice(0, 5)} - ${first.end_time.slice(0, 5)}`;
      
      const dayNames = language === 'ar' ? arDays : days;
      
      if (range.length === 1) {
        return `${dayNames[first.day_of_week]}: ${timeStr}`;
      } else {
        return `${dayNames[first.day_of_week]}-${dayNames[last.day_of_week]}: ${timeStr}`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest font-inter">
      <Header />
      
      <main className="flex-grow pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#605693] text-sm font-bold uppercase tracking-widest">
              <LayoutDashboard className="h-4 w-4" />
              <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary">{language === 'ar' ? 'خدماتي' : 'My Services'}</span>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter font-headline">
              {language === 'ar' ? 'إدارة الأتيلييه الخاص بك' : 'Manage Your Atelier'}
            </h1>
            <p className="text-on-surface-variant max-w-2xl mt-4 font-medium leading-relaxed">
              {language === 'ar' ? 
                'قم بمراجعة خدماتك، وتحديث مواعيد عملك، والوصول إلى إحصائيات الأداء في مكان واحد مصمم للأناقة والدقة.' : 
                'Review your services, update your recurring hours, and access performance insights in one place designed for elegance and precision.'}
            </p>
          </div>

          <Link 
            href="/provider"
            className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span>{language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}</span>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 border border-outline-variant/10 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8">
              <Store className="h-12 w-12 text-primary/30" />
            </div>
            <h2 className="text-2xl font-black text-on-surface mb-4">
              {language === 'ar' ? 'لا توجد خدمات متاحة بعد' : 'No services live yet'}
            </h2>
            <p className="text-[#605693] max-w-md mx-auto mb-10 leading-relaxed">
              {language === 'ar' ? 
                'ابدأ ببناء تواجدك في Iris Reserve اليوم من خلال إدراج خدمتك الأولى.' : 
                'Start building your presence in Iris Reserve today by listing your first premium service.'}
            </p>
            <Link 
              href="/provider" 
              className="bg-on-surface text-white px-10 py-5 rounded-full font-black hover:bg-black transition-all"
            >
              {language === 'ar' ? 'أنشئ خدمتك الأولى' : 'Create Your First Service'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {services.map((service, idx) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[32px] p-8 border border-outline-variant/10 flex flex-col lg:flex-row gap-8 hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                {/* Service Info */}
                <div className="flex-grow space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {service.service_category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {service.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight leading-none">
                        {service.name}
                      </h3>
                    </div>
                    <Link 
                      href={`/services/${service.id}`}
                      className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-[#605693] hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8F6FF] flex items-center justify-center text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#605693] font-black uppercase tracking-widest leading-none mb-1.5">
                          {language === 'ar' ? 'ساعات العمل العامة' : 'General Hours'}
                        </p>
                        <p className="text-sm font-bold text-on-surface tracking-tight leading-snug">
                          {formatSchedule(availability[service.id] || [])}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8F6FF] flex items-center justify-center text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#605693] font-black uppercase tracking-widest leading-none mb-1.5">
                          {language === 'ar' ? 'الموقع' : 'Location'}
                        </p>
                        <p className="text-sm font-bold text-on-surface tracking-tight leading-snug">
                          {service.city || (language === 'ar' ? 'غير محدد' : 'Not set')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats or Actions */}
                <div className="lg:w-72 bg-[#F1ECF8]/30 rounded-3xl p-6 border border-white flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-[#605693] font-black uppercase tracking-widest mb-1">{language === 'ar' ? 'السعر الأساسي' : 'Base Price'}</p>
                      <p className="text-3xl font-black text-primary tracking-tighter">
                        ${service.base_price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                      <CalendarDays className="h-4 w-4" />
                      <span>{availability[service.id]?.length || 0} {language === 'ar' ? 'أيام عمل أسبوعية' : 'weekly active days'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-6">
                    <Link 
                      href={`/provider?id=${service.id}`}
                      className="w-full bg-white border border-[#F0E6FF] py-3 rounded-2xl text-xs font-black text-on-surface hover:border-primary transition-all active:scale-[0.98] text-center"
                    >
                      {language === 'ar' ? 'تعديل الخدمة' : 'Edit Service'}
                    </Link>
                    <button 
                      onClick={() => setDeleteId(service.id)}
                      disabled={deleteLoading === service.id}
                      className="w-full bg-red-50 border border-red-100 py-3 rounded-2xl text-xs font-black text-red-600 hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deleteLoading === service.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          {language === 'ar' ? 'حذف الخدمة' : 'Delete Service'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1C1A23]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
              <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mb-6">
                <Trash2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-[#1C1A23] mb-4 font-headline tracking-tight">
                {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
              </h2>
              <p className="text-[#605693] font-medium leading-relaxed mb-8">
                {language === 'ar' ? 
                  'سيتم حذف هذه الخدمة وجميع البيانات المرتبطة بها نهائياً. لا يمكن التراجع عن هذا الإجراء.' : 
                  'This service and all associated data will be permanently deleted. This action cannot be undone.'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-surface-container py-4 rounded-3xl font-black text-[#605693] hover:bg-gray-100 transition-all"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={() => handleDelete(deleteId)}
                  disabled={!!deleteLoading}
                  className="flex-1 bg-red-600 text-white py-4 rounded-3xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  {deleteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
