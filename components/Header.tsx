'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Globe, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-nav shadow-luminous h-20 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Menu className="text-primary cursor-pointer h-6 w-6" />
        <Link href="/" className="text-xl font-black text-primary tracking-[-0.02em] font-headline">
          {t('brandName')}
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-on-surface-variant hover:text-primary transition-all duration-300" href="/">{t('home')}</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-all duration-300" href="#">{t('explore')}</Link>
          <Link className="text-primary font-semibold transition-all duration-300" href="/about">{t('aboutUs')}</Link>
          
          {!loading && !user && (
            <Link 
              href="/provider?mode=signup" 
              className="px-5 py-2 border border-[#5D3FD3] text-[#5D3FD3] rounded-full hover:bg-[#5D3FD3] hover:text-white transition-all duration-300 text-sm font-medium font-sans whitespace-nowrap"
            >
              {t('joinNow')}
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-6 h-8 ml-2">
              <span className="text-xs font-bold text-on-surface-variant hidden lg:block">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="p-3 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title={language === 'en' ? 'Logout' : 'تسجيل الخروج'}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-colors text-sm font-medium"
          >
            <Globe className="h-4 w-4 text-primary" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container relative bg-surface-container flex items-center justify-center">
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              <Image
                fill
                src={user.user_metadata.avatar_url || user.user_metadata.picture}
                alt="Profile"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-primary font-bold text-xs">
                {user ? (user.email?.[0].toUpperCase()) : <Loader2 className="h-4 w-4 animate-spin text-primary/30" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
