'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations = {
  en: {
    brandName: 'Bookings Place',
    home: 'Home',
    explore: 'Explore',
    services: 'Services',
    heroTitle: 'Curating Your Most Luminous Moments',
    heroLuminous: 'Luminous',
    heroSubtitle: 'From intimate gatherings to grand celebrations, discover a world of premium services tailored for the discerning host.',
    serviceType: 'Service Type',
    servicePlaceholder: 'What are you planning?',
    date: 'Date',
    datePlaceholder: 'Pick a date',
    guests: 'Guests',
    guestsPlaceholder: 'How many guests?',
    time: 'Time',
    timePlaceholder: 'What time?',
    search: 'Search',
    curatedCollections: 'Curated Collections',
    explorePremium: 'Explore Our Premium Services',
    startingFrom: 'Starting From',
    becomePartner: 'Become a Partner',
    partnerDescription: 'Join the most exclusive network of event service providers. Scale your business and reach a premium clientele who value excellence.',
    joinNow: 'Join Now',
    platform: 'Platform',
    aboutUs: 'About Us',
    helpCenter: 'Help Center',
    validationTitle: 'Information Required',
    validationMessage: 'Please enter all information (event type, date, time, and guest count) before starting the search.',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    connect: 'Connect',
    contact: 'Contact',
    footerText: 'Redefining the art of celebration. The Luminous Concierge Experience brings sophistication to every booking.',
    copyright: '© 2024 Bookings Place. The Luminous Concierge Experience.',
    perPerson: '/person',
    ourStory: 'Our Story',
    aboutHeroTitle: 'Connecting Visionaries with Exceptional Spaces.',
    aboutHeroSubtitle: 'Bookings Place was founded on a singular mission: to bridge the gap between event planners and the world\'s most inspiring venues. We believe every gathering deserves a luminous setting.',
    exploreVenues: 'Explore Venues',
    meetTeam: 'Meet the Team',
    plannersConcierge: 'The Planner\'s Concierge',
    plannersConciergeDesc: 'We don\'t just list venues; we curate experiences. Our platform serves as a high-fidelity bridge, ensuring every detail from acoustics to aesthetics is perfectly aligned with your event\'s DNA.',
    venueCount: '12k+',
    venueCountDesc: 'Premium venues globally curated for excellence.',
    trustedVerification: 'Trusted Verification',
    trustedVerificationDesc: 'Every host undergoes a 50-point inspection to guarantee quality and safety standards.',
    seamlessIntegration: 'Seamless Integration',
    seamlessIntegrationDesc: 'Manage bookings, contracts, and communication in one luminous dashboard designed for clarity.',
    lastUpdated: 'Last Updated: October 2024',
    privacyIntro: 'At Bookings Place, we treat your data with the same concierge-level care we apply to our event services. Our data protection standards are built on the principles of transparency and security.',
    howWeProtectTitle: 'How We Protect You',
    protect1: 'End-to-end encryption for all transactional data and personal communications.',
    protect2: 'GDPR compliant processing for all users within the global ecosystem.',
    protect3: 'We never sell your data to third-party advertisers. Ever.',
    privacyOutro: 'We collect information only necessary to facilitate your bookings, including contact details and payment information processed through secure, PCI-compliant gateways.',
    termsOfUse: 'Terms of Use',
    termsIntro: 'By accessing Bookings Place, you agree to our service guidelines designed to maintain a premium environment for all members of our community.',
    userConduct: 'User Conduct',
    userConductDesc: 'Maintain professional integrity in all venue interactions and reviews.',
    bookingFinality: 'Booking Finality',
    bookingFinalityDesc: 'Specific cancellation policies apply to each venue as listed on their profile.',
    intellectualProperty: 'Intellectual Property',
    intellectualPropertyDesc: 'All platform content, logic, and visual design are protected assets.',
    liability: 'Liability',
    liabilityDesc: 'Bookings Place acts as a facilitator and is not liable for venue-specific incidents.',
    termsOutro: 'Failure to comply with these guidelines may result in immediate suspension of concierge privileges and account termination.'
  },
  ar: {
    brandName: 'بوكينجز بليس',
    home: 'الرئيسية',
    explore: 'استكشف',
    services: 'الخدمات',
    heroTitle: 'نصمم لك لحظات لا تُنسى',
    heroLuminous: 'لحظات',
    heroSubtitle: 'بوابتكم الحصرية لأرقى خدمات الفعاليات والمناسبات الخاصة. رفاهية مطلقة بين يديك.',
    serviceType: 'نوع الخدمة',
    servicePlaceholder: 'ماذا تخطط؟',
    date: 'التاريخ',
    datePlaceholder: 'متى الموعد؟',
    guests: 'الضيوف',
    guestsPlaceholder: 'كم العدد؟',
    time: 'الوقت',
    timePlaceholder: 'ما هو الوقت؟',
    search: 'بحث',
    curatedCollections: 'خدماتنا المختارة',
    explorePremium: 'استكشف تشكيلتنا الواسعة من الخدمات',
    startingFrom: 'يبدأ من',
    becomePartner: 'انضم إلى أكبر شبكة لمزودي الخدمات',
    partnerDescription: 'هل تمتلك موهبة أو خدمة مميزة؟ شاركنا شغفك وابدأ في تنمية أعمالك مع نخبة العملاء في المملكة.',
    joinNow: 'انضم الآن كمزود خدمة',
    platform: 'الشركة',
    aboutUs: 'عن بوكينجز',
    helpCenter: 'مركز المساعدة',
    validationTitle: 'المعلومات المطلوبة',
    validationMessage: 'يرجى إدخال جميع المعلومات (نوع الفعالية والتاريخ والوقت وعدد الضيوف) قبل البدء في البحث.',
    legal: 'الشروط والأحكام',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    connect: 'التواصل',
    contact: 'اتصل بنا',
    footerText: 'تجربة الـ Concierge المضيئة. نسعى لتقديم الكمال في كل تفصيل، لنحول مناسباتكم إلى حكايات تُروى.',
    copyright: '© 2024 بوكينجز بليس. تجربة الـ Concierge المضيئة.',
    perPerson: '/للشخص',
    ourStory: 'قصتنا',
    aboutHeroTitle: 'نحن نعيد تعريف تجربة الحجز الأنيقة',
    aboutHeroSubtitle: 'في Bookings Place، لا نكتفي ببيع التذاكر. نحن نصمم جسوراً تصلك بأروع التجارب العالمية، مع لمسة من الرقي والسهولة التي تليق بنمط حياتك.',
    exploreVenues: 'استكشف القاعات',
    meetTeam: 'تعرف على الفريق',
    plannersConcierge: 'رؤيتنا',
    plannersConciergeDesc: 'نسعى لأن نكون المنصة الرائدة عالمياً في توفير الوصول الحصري للفعاليات الأكثر تميزاً. نؤمن بأن كل حجز هو بداية لذكرى لا تُنسى، لذا نحرص على أن تكون كل خطوة في رحلتك معنا مفعمة بالجمال والوضوح.',
    venueCount: '500+',
    venueCountDesc: 'شريك عالمي يثقون في خدماتنا المتميزة.',
    trustedVerification: 'الجودة أولاً',
    trustedVerificationDesc: 'نحن لا نقبل إلا بالأفضل، من خدمة العملاء وحتى واجهة المستخدم لمساعدتك في الحصول على تجربة مثالية.',
    seamlessIntegration: 'رضا العملاء',
    seamlessIntegrationDesc: 'بفضل تفانينا في العمل وتوفير أفضل الوسائل التقنية، استطعنا الوصول إلى أعلى مستويات رضا العملاء بنسبة تتجاوز 99%.',
    lastUpdated: 'آخر تحديث: أكتوبر 2024',
    privacyIntro: 'في بوكينجز بليس، نتعامل مع بياناتك بنفس العناية التي نقدمها في خدماتنا. معايير حماية البيانات لدينا مبنية على مبادئ الشفافية والأمان.',
    howWeProtectTitle: 'كيف نحميك',
    protect1: 'تشفير شامل لجميع بيانات العمليات والاتصالات الشخصية.',
    protect2: 'معالجة متوافقة مع معايير حماية البيانات العالمية لجميع المستخدمين.',
    protect3: 'لا نقوم أبداً ببيع بياناتك لأطراف ثالثة لأغراض إعلانية.',
    privacyOutro: 'نجمع فقط المعلومات الضرورية لتسهيل حجوزاتك، بما في ذلك تفاصيل الاتصال ومعلومات الدفع المشفرة.',
    termsOfUse: 'شروط الاستخدام',
    termsIntro: 'من خلال استخدام بوكينجز بليس، فإنك توافق على إرشادات الخدمة الخاصة بنا المصممة للحفاظ على بيئة مميزة لجميع أعضاء مجتمعنا.',
    userConduct: 'سلوك المستخدم',
    userConductDesc: 'الحفاظ على الاحترافية في جميع التفاعلات والتقييمات الخاصة بالقاعات.',
    bookingFinality: 'نهائية الحجز',
    bookingFinalityDesc: 'تنطبق سياسات إلغاء محددة على كل قاعة كما هو موضح في ملفها الشخصي.',
    intellectualProperty: 'الملكية الفكرية',
    intellectualPropertyDesc: 'جميع محتويات المنصة والتصاميم المرئية هي أصول محمية للشركة.',
    liability: 'المسؤولية',
    liabilityDesc: 'تعمل بوكينجز بليس كوسيط وليست مسؤولة عن الحوادث الخاصة بالقاعات.',
    termsOutro: 'قد يؤدي عدم الالتزام بهذه الإرشادات إلى تعليق فوري لامتيازات الحجز وإنهاء الحساب.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Priority: localStorage, then system preference (optional)
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(savedLang);
    }
  }, []);

  const isRtl = language === 'ar';

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
