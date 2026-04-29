'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, AlertCircle, Loader2, X, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthGateProps {
  children: React.ReactNode;
  initialMode?: 'login' | 'signup';
}

export function AuthGate({ children, initialMode = 'login' }: AuthGateProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(language === 'en' ? 'Supabase is not configured.' : 'لم يتم تكوين Supabase.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage(language === 'en' ? 'Check your email for the confirmation link.' : 'تحقق من بريدك الإلكتروني للحصول على رابط التأكيد.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setActionLoading(true);
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-luminous border border-outline-variant/20 p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-primary tracking-tight mb-3">
            {isLogin 
              ? (language === 'en' ? 'Sign In' : 'تسجيل الدخول') 
              : (language === 'en' ? 'Sign Up' : 'إنشاء حساب')
            }
          </h1>
          <p className="text-on-surface-variant text-sm">
            {isLogin 
              ? (language === 'en' ? 'Manage your event listings' : 'إدارة قوائم فعالياتك') 
              : (language === 'en' ? 'Join our partner community' : 'انضم إلى مجتمع شركائنا')
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-green-100">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 px-1">
                {language === 'en' ? 'Full Name' : 'الاسم الكامل'}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  required
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'John Doe' : 'جون دو'}
                  className="w-full px-12 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-on-surface"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 focus-within:text-primary transition-colors">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 px-1">
              {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-12 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-on-surface"
              />
            </div>
          </div>

          <div className="space-y-1.5 focus-within:text-primary transition-colors">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 px-1">
              {language === 'en' ? 'Password' : 'كلمة المرور'}
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-12 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-on-surface"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button 
            disabled={actionLoading}
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? (language === 'en' ? 'Sign In' : 'تسجيل الدخول') : (language === 'en' ? 'Create Account' : 'إنشاء حساب')}</span>
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-outline-variant/30"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-on-surface-variant/50 font-bold tracking-widest">
              {language === 'en' ? 'Or continue with' : 'أو البدء بواسطة'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleGoogleSignIn}
            disabled={actionLoading}
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl border border-outline-variant/40 hover:bg-surface-container transition-all font-bold text-on-surface-variant disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {isLogin 
              ? (language === 'en' ? "Don't have an account? Sign Up" : "ليس لديك حساب؟ اشترك الآن") 
              : (language === 'en' ? "Already have an account? Sign In" : "لديك حساب بالفعل؟ سجل دخولك")
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}
