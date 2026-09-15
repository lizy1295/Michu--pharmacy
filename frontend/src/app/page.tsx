'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, Product, getImageUrl } from '@/lib/api/products';
import {
  getDoctors,
  Doctor,
  getAdvertisements,
  Advertisement,
  getPartners,
  Partner,
  getMediaUrl,
} from '@/lib/api/admin';
import BranchGoogleMap from '@/components/branches/BranchGoogleMap';
import { BranchLocation, BRANCH_LOCATIONS } from '@/lib/data/branchesData';

/* ΓöÇΓöÇ Fallback Seed Data if Backend API is initializing ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: 1,
    firstName: 'Helen',
    lastName: 'Tadesse',
    specialization: 'Internal Medicine & Clinical Pharmacology',
    experienceYears: 12,
    contactEmail: 'dr.helen@michupharmacy.com',
    contactPhone: '+251 91 123 4567',
    bio: 'Senior consultant specializing in complex medication management, chronic illness pharmacotherapy, and adverse drug interaction prevention.',
    languages: ['Amharic', 'English'],
    certifications: [
      'EFDA Licensed Medical Doctor',
      'MD - Addis Ababa University School of Medicine',
      'Board Certified Pharmacotherapy Specialist (BCPS)',
    ],
    status: 'active',
    availableForConsultation: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    firstName: 'Dawit',
    lastName: 'Abebe',
    specialization: 'Chief Clinical Pharmacist & Drug Safety',
    experienceYears: 10,
    contactEmail: 'dr.dawit@michupharmacy.com',
    contactPhone: '+251 92 234 5678',
    bio: 'Experienced clinical pharmacist overseeing hospital-grade prescription verification, dosage optimization, and patient drug counseling.',
    languages: ['Amharic', 'English', 'Oromiffa'],
    certifications: [
      'Doctor of Pharmacy (PharmD)',
      'MSc in Clinical Pharmacy & Toxicology',
      'Fellow of the Ethiopian Pharmaceutical Association',
    ],
    status: 'active',
    availableForConsultation: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    firstName: 'Selamawit',
    lastName: 'Girma',
    specialization: 'Consultant Pediatrician & Family Health',
    experienceYears: 9,
    contactEmail: 'dr.selamawit@michupharmacy.com',
    contactPhone: '+251 93 345 6789',
    bio: 'Dedicated pediatrician guiding infant medication safety, childhood nutritional supplementation, and respiratory infection management.',
    languages: ['Amharic', 'English', 'Tigrigna'],
    certifications: [
      'MD Pediatric Medicine',
      'EFDA Certified Clinical Care Specialist',
      'International Pediatric Association Certified',
    ],
    status: 'active',
    availableForConsultation: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 4,
    firstName: 'Yonas',
    lastName: 'Kassa',
    specialization: 'Senior Pharmacist & Chronic Care Consultant',
    experienceYears: 14,
    contactEmail: 'dr.yonas@michupharmacy.com',
    contactPhone: '+251 94 456 7890',
    bio: 'Specialist in diabetes care, hypertension regimens, and elderly cardiovascular pharmacotherapy with over a decade of community practice.',
    languages: ['Amharic', 'English'],
    certifications: [
      'Registered Clinical Pharmacist (RPh)',
      'Certified Diabetes Care & Education Specialist',
      'EFDA Good Pharmacy Practice (GPP) Auditor',
    ],
    status: 'active',
    availableForConsultation: true,
    createdAt: '',
    updatedAt: '',
  },
];

function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

const FALLBACK_ADS: Advertisement[] = [
  {
    id: 1,
    title: 'Clinical Video Guide: Modern Respiratory & Asthma Management Protocol',
    description: 'Watch our clinical pharmacist team explain the 3-step preventive therapy for bronchial asthma, spacer usage, and when to seek instant nebulization at Michu branches.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/health?action=consult',
    targetPage: 'homepage',
    position: 'disease_solution',
    displayOrder: 1,
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    status: 'published',
    createdBy: 'Dr. Helen Tadesse (MD, BCPS)',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 2,
    title: 'Seasonal Alert: Modern Pediatric Respiratory & Asthma Relief Solutions',
    description: 'Comprehensive protocols for seasonal bronchial allergies and asthma: portable nebulizer units, allergen-safe spacers, and pediatrician-verified syrups in stock.',
    mediaType: 'image',
    mediaUrl: '',
    targetUrl: '/products?category=Medicine',
    targetPage: 'homepage',
    position: 'disease_solution',
    displayOrder: 2,
    startDate: '2026-08-10',
    endDate: '2026-12-31',
    status: 'published',
    createdBy: 'Admin / Health Team',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    id: 3,
    title: 'Product Innovation: Smart Continuous Blood Glucose Monitoring Kits',
    description: 'Accurate instant readings with painless micro-sensors. Manage Type 1 and Type 2 diabetes with confidence. Free battery and test strip starter pack included.',
    mediaType: 'image',
    mediaUrl: '',
    targetUrl: '/products?category=Medical Devices',
    targetPage: 'homepage',
    position: 'product_news',
    displayOrder: 3,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    status: 'published',
    createdBy: 'Admin / Pharmacy Lead',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15',
  },
];

const FALLBACK_PARTNERS: Partner[] = [
  {
    id: 1,
    name: 'EFDA',
    category: 'regulatory',
    badge: 'Federal Regulatory Authority',
    description: 'Ethiopian Food and Drug Authority ΓÇö National medicine standards, safety verification, and regulatory compliance.',
    websiteUrl: 'https://efda.gov.et',
    displayOrder: 1,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    name: 'EPSA',
    category: 'regulatory',
    badge: 'National Supply Partner',
    description: 'Ethiopian Pharmaceuticals Supply Agency ΓÇö Ensuring continuous access to critical public health medicines.',
    websiteUrl: 'https://epsa.gov.et',
    displayOrder: 2,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    name: 'EPHARM',
    category: 'manufacturer',
    badge: 'National Leader',
    description: 'Ethiopian Pharmaceuticals Manufacturing S.C. ΓÇö Decades of domestic medicine manufacturing excellence.',
    websiteUrl: 'https://epharm.com.et',
    displayOrder: 3,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 4,
    name: 'Cadila Pharmaceuticals',
    category: 'manufacturer',
    badge: 'Certified WHO-GMP',
    description: 'Cadila Pharmaceuticals Ethiopia ΓÇö Quality assured critical care therapeutics and antibiotics.',
    websiteUrl: 'https://cadilapharma.com',
    displayOrder: 4,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 5,
    name: 'Julphar Pharmaceuticals',
    category: 'manufacturer',
    badge: 'Global Standard',
    description: 'Julphar Ethiopia ΓÇö International grade pharmaceutical manufacturing and advanced oral dosages.',
    websiteUrl: 'https://julphar.net',
    displayOrder: 5,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 6,
    name: 'Addis Pharmaceuticals (APF)',
    category: 'manufacturer',
    badge: 'Trusted Generic',
    description: 'APF ΓÇö High-potency generic medications for cardiovascular, gastrointestinal, and chronic care.',
    websiteUrl: 'https://apf.com.et',
    displayOrder: 6,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 7,
    name: 'Telebirr',
    category: 'fintech',
    badge: 'Official Payment',
    description: 'Ethio Telecom SuperApp ΓÇö Instant digital checkout, USSD, and zero-fee prescription payment.',
    websiteUrl: 'https://telebirr.et',
    displayOrder: 7,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 8,
    name: 'Commercial Bank of Ethiopia',
    category: 'fintech',
    badge: 'Banking Gateway',
    description: 'CBE Birr & CBE direct gateway for secure in-branch and digital medicine payment processing.',
    websiteUrl: 'https://combanketh.et',
    displayOrder: 8,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(FALLBACK_ADS);
  const [partners, setPartners] = useState<Partner[]>(FALLBACK_PARTNERS);
  const [homeSelectedBranch, setHomeSelectedBranch] = useState<BranchLocation>(BRANCH_LOCATIONS[0]);
  const [activeVideoModal, setActiveVideoModal] = useState<Advertisement | null>(null);

  const FEATURED_BRANDS = [
    { name: 'Pfizer',           country: 'USA',         color: '#0093C8', bg: '#E8F6FD', badge: '💊' },
    { name: 'Bayer',            country: 'Germany',     color: '#10384F', bg: '#E8F2F7', badge: '🌿' },
    { name: 'Johnson & Johnson',country: 'USA',         color: '#CC0000', bg: '#FFF0F0', badge: '❤️' },
    { name: 'Roche',            country: 'Switzerland', color: '#009FE3', bg: '#E5F5FC', badge: '🔬' },
    { name: 'Novartis',         country: 'Switzerland', color: '#E40026', bg: '#FFF0F2', badge: '⚕️' },
    { name: 'AstraZeneca',      country: 'UK / Sweden', color: '#830051', bg: '#F5EAF2', badge: '🫁' },
    { name: 'Abbott',           country: 'USA',         color: '#008DB9', bg: '#E5F4FA', badge: '🩺' },
    { name: 'Sanofi',           country: 'France',      color: '#7A1FA2', bg: '#F3EAF8', badge: '🧬' },
    { name: 'GSK',              country: 'UK',          color: '#F36633', bg: '#FEF3ED', badge: '🧪' },
    { name: 'Merck',            country: 'Germany / USA',color:'#009F6B', bg: '#E5F5F0', badge: '🔭' },
    { name: 'Cipla',            country: 'India',       color: '#E2001A', bg: '#FFF0F2', badge: '💉' },
    { name: 'Sun Pharma',       country: 'India',       color: '#F7941D', bg: '#FEF5E8', badge: '☀️' },
    { name: 'Sandoz',           country: 'Switzerland', color: '#0078BE', bg: '#E5EFF8', badge: '🏥' },
    { name: 'Boehringer',       country: 'Germany',     color: '#1C3F94', bg: '#EAF0FB', badge: '🌊' },
    { name: 'Eli Lilly',        country: 'USA',         color: '#D52B1E', bg: '#FFF0EF', badge: '🧫' },
    { name: 'Novo Nordisk',     country: 'Denmark',     color: '#001965', bg: '#E5E8F5', badge: '⚡' },
  ];
  // Duplicate for seamless infinite scroll
  const BRANDS_LOOP = [...FEATURED_BRANDS, ...FEATURED_BRANDS];
  // Load products, doctors, advertisements, and partners
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const prods = await getProducts();
        if (isMounted && prods && prods.length > 0) {
          setLiveProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }

      try {
        const docs = await getDoctors();
        if (isMounted && docs && docs.length > 0) {
          setDoctors(docs);
        }
      } catch {
        // Fallback used
      }

      try {
        const ads = await getAdvertisements();
        if (isMounted && ads && ads.length > 0) {
          const activeAds = ads.filter(a => a.status === 'published' || a.status === ('active' as any));
          if (activeAds.length > 0) setAdvertisements(activeAds);
        }
      } catch {
        // Fallback used
      }

      try {
        const pts = await getPartners();
        if (isMounted && pts && pts.length > 0) {
          const activePts = pts.filter(p => p.status === 'active');
          if (activePts.length > 0) setPartners(activePts);
        }
      } catch {
        // Fallback used
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Promotional service cards (Using Herb, Pearl, Gleam, Radiate, Moss palette)
  const features = useMemo(() => [
    {
      title: t('home.service_rx_title'),
      description: t('home.service_rx_desc'),
      link: '/health?action=upload',
      buttonText: t('home.service_rx_btn'),
      color: 'border-herb-200/90 hover:border-herb-400 bg-herb-50/70 shadow-xs',
      btnColor: 'bg-herb hover:bg-herb-600 text-white shadow-herb/30'
    },
    {
      title: t('home.service_consult_title'),
      description: t('home.service_consult_desc'),
      link: '/health?action=consult',
      buttonText: t('home.service_consult_btn'),
      color: 'border-gleam-400/80 hover:border-gleam bg-pearl-100/80 shadow-xs',
      btnColor: 'bg-moss-900 hover:bg-moss-800 text-gleam shadow-moss/30'
    },
    {
      title: language === 'am' ? 'ቅርንጫፍ መውሰድ እና ፈጣን ማድረስ' : 'Branch Pickup & Fast Delivery',
      description: language === 'am'
        ? 'በአዲስ አበባ እና በክልሎች ባሉ 7 ቅርንጫፎቻችን በደህንነት የተረጋገጡ መድሃኒቶችን በግንባር ይውሰዱ ወይም በቀዝቃዛ ሰንሰለት እንዲደርስዎ ያድርጉ።'
        : 'Pick up verified medications at any of our 7 physical branches or request safe cold-chain delivery.',
      link: '/branches',
      buttonText: language === 'am' ? 'ቅርንጫፎችን ይመልከቱ' : 'Explore Branches',
      color: 'border-radiate-200 hover:border-radiate-300 bg-radiate-50/70 shadow-xs',
      btnColor: 'bg-radiate hover:bg-radiate-600 text-white shadow-radiate/30'
    }
  ], [t, language]);

  // Curated Most Trusted Products list
  const mostTrustedProducts = useMemo(() => {
    const list = [
      {
        id: 'trusted-1',
        name: 'Actrapid 100iu/ml 10ml Soluble Insulin',
        brand: 'Novo Nordisk',
        price: 1155,
        prescriptionRequired: true,
        indication: 'Essential Diabetes Blood Sugar Control',
        badge: 'EFDA Certified Insulin',
        imageType: 'tablet' as const,
        imageUrl: null as string | null,
      },
      {
        id: 'trusted-2',
        name: '(Nicardia Retard 20) Nifedipine 20mg of 100',
        brand: 'Nicardia',
        price: 320,
        prescriptionRequired: true,
        indication: 'Cardiovascular & Hypertension Management',
        badge: 'WHO-GMP Certified',
        imageType: 'tablet' as const,
        imageUrl: null as string | null,
      },
      {
        id: 'trusted-3',
        name: '(Exedexe) Dextromethorphan syrup 120ml',
        brand: 'EPHARM',
        price: 240,
        prescriptionRequired: false,
        indication: 'Dry Cough Suppressant & Bronchial Relief',
        badge: 'Trusted National Brand',
        imageType: 'syrup' as const,
        imageUrl: null as string | null,
      },
      {
        id: 'trusted-4',
        name: 'Acyclovir Denk 200mg (25 Tablets)',
        brand: 'Denk Pharma Germany',
        price: 460,
        prescriptionRequired: true,
        indication: 'Antiviral Therapy for Herpes & Viral Infections',
        badge: 'German Quality Standard',
        imageType: 'tablet' as const,
        imageUrl: null as string | null,
      },
    ];

    if (liveProducts.length > 0) {
      // Enhance with real live product data if matching
      return list.map((item) => {
        const found = liveProducts.find(p => p.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
        if (found) {
          return {
            ...item,
            id: String(found.id),
            price: typeof found.price === 'string' ? parseFloat(found.price) : found.price,
            imageUrl: found.imageUrl,
          };
        }
        return item;
      });
    }

    return list;
  }, [liveProducts]);

  const featuredProducts = useMemo(() => [
    {
      id: 'prod-exedexe',
      name: '(Exedexe) Dextromethorphan syrup 120ml',
      price: 240,
      prescriptionRequired: false,
      imageType: 'syrup' as const,
      desc: 'Cough suppressant syrup for dry cough relief and throat comfort'
    },
    {
      id: 'prod-actrapid',
      name: 'Actrapid 100iu/ml 10ml/vial soluble insulin',
      price: 1155,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Soluble human insulin injection for blood glucose regulation'
    },
    {
      id: 'prod-acyclovir',
      name: 'Acyclovir Denk 200mg of 5*10 tabletten',
      price: 460,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Antiviral formulation for herpes simplex and viral infections'
    },
    {
      id: 'prod-crest',
      name: '3D white charcoal whitening Tp of 204g',
      price: 500,
      prescriptionRequired: false,
      imageType: 'cosmetic' as const,
      desc: 'Enamel-safe whitening toothpaste for deep stain removal'
    }
  ], []);

  const renderProductIllustration = useCallback((type: string) => {
    switch (type) {
      case 'syrup':
        return (
          <div className="w-full h-full bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" />
            </svg>
          </div>
        );
      case 'tablet':
        return (
          <div className="w-full h-full bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" />
            </svg>
          </div>
        );
      case 'cosmetic':
        return (
          <div className="w-full h-full bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
    }
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* 1. Hero Landing Section */}
      <section className="relative w-full overflow-hidden text-white min-h-[520px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/pharmacy-hero.png"
            alt="Michu Pharmacy — Quality Medicines & Health Products"
            fill
            priority
            className="object-cover object-center w-full h-full scale-105 blur-sm"
            sizes="100vw"
            quality={95}
          />
          {/* Overlay — keeps text crisp over the blurred image */}
          <div className="absolute inset-0 bg-gradient-to-r from-moss-950/70 via-moss-900/50 to-moss-950/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 flex flex-col items-center text-center z-10 w-full">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-400/50 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-black/30 transition">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('home.hero_badge1').replace(/[🇪🇹✅]/g, '').trim()}</span>
            </span>
            <span className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-md shadow-lg shadow-black/30 transition">
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>{t('home.hero_badge2').replace(/[✅]/g, '').trim()}</span>
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl leading-tight drop-shadow-lg text-white">
            {t('home.hero_title1')}<br />
            <span className="text-white">
              {t('home.hero_title2')}
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-pearl-100/90 max-w-2xl leading-relaxed drop-shadow">
            {t('home.hero_desc')}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-radiate hover:bg-radiate-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-radiate-950/40 transition-all hover:scale-105 active:scale-95 duration-150"
            >
              {t('home.hero_btn_shop')}
            </Link>
            <Link
              href="/health?action=upload"
              className="rounded-full border border-gleam/40 bg-moss-900/70 hover:bg-moss-800 px-8 py-3.5 text-sm font-bold text-gleam hover:text-white transition-all hover:scale-105 active:scale-95 duration-150 backdrop-blur-md shadow-lg"
            >
              {t('home.hero_btn_rx')}
            </Link>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-pearl-200/90 font-medium">
            <span className="flex items-center gap-1.5">{t('home.hero_trust1')}</span>
            <span className="hidden sm:inline">ΓÇó</span>
            <span className="flex items-center gap-1.5">{t('home.hero_trust2')}</span>
            <span className="hidden sm:inline">ΓÇó</span>
            <span className="flex items-center gap-1.5">{t('home.hero_trust3')}</span>
          </div>
        </div>
      </section>

      {/* 2. Promotions Banner */}
      <section className="bg-moss-900 text-pearl py-5 px-4 border-b border-moss-800 shadow-inner">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-gleam text-moss-900 font-black text-xs uppercase animate-pulse shadow-sm">
              {t('home.promo_badge')}
            </span>
            <p className="text-sm font-bold text-pearl-100">
              {t('home.promo_text')}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl bg-radiate text-white text-xs font-black hover:bg-radiate-600 transition shadow-sm"
            >
              {t('home.promo_cta')}
            </Link>
            <Link
              href="/blogs"
              className="px-4 py-2 rounded-xl bg-moss-800 hover:bg-moss-700 text-pearl-200 text-xs font-bold transition border border-moss-700"
            >
              {t('home.promo_blogs')}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. NEW SECTION: Advertisements, Health Bulletins & Disease Solutions (Fed from Admin Dashboard) */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>≡ƒôó</span>
                <span>{language === 'am' ? 'ßï¿ßëàßê¡ßëÑ ßîèßï£ ßï¿ßîñßèô ßï£ßèô ßèÑßèô ßêÿßììßë╡ßêäßïÄßë╜' : 'Health Breakthroughs & Disease Solutions'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {language === 'am' ? 'ßï¿ßêàßè¡ßê¥ßèô ßîìßè¥ßë╢ßë╜ßìú ßèáßï│ßï▓ßê╡ ßï¿ßëáßê╜ßë│ ßêÿßììßë╡ßêäßïÄßë╜ßèô ßï¿ßê¥ßê¡ßë╡ ßêÿßê¿ßîâßïÄßë╜' : 'Latest Disease Solutions & Verified Product News'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {language === 'am'
                  ? 'ßëáßêÜßë╣ ßìïßê¡ßê¢ßê▓ ßè¡ßêèßèÆßè½ßêì ßëúßêêßêÖßï½ßïÄßë╜ßèô ßèáßê╡ßë░ßï│ßï░ßê¡ ßï¿ßë░ßê¿ßîïßîêßîí ßïêßëàßë│ßïè ßï¿ßîñßèô ßêÿßê¿ßîâßïÄßë╜'
                  : 'Published and reviewed by certified clinical pharmacists and medical consultants at Michu Pharmacy.'}
              </p>
            </div>
            <Link
              href="/blogs"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1 shrink-0"
            >
              {language === 'am' ? 'ßêüßêëßèòßê¥ ßï¿ßîñßèô ßìàßêüßìÄßë╜ ßï¡ßêÿßêìßè¿ßë▒ ΓåÆ' : 'View All Clinical Updates ΓåÆ'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advertisements.slice(0, 3).map((ad) => {
              const isDisease =
                ad.position === 'disease_solution' ||
                ad.title.toLowerCase().includes('solution') ||
                ad.title.toLowerCase().includes('alert');
              const isVideo =
                ad.mediaType === 'video' ||
                (ad.mediaUrl &&
                  (ad.mediaUrl.endsWith('.mp4') ||
                    ad.mediaUrl.endsWith('.webm') ||
                    ad.mediaUrl.endsWith('.mov') ||
                    ad.mediaUrl.includes('youtube') ||
                    ad.mediaUrl.includes('vimeo') ||
                    ad.mediaUrl.includes('/uploads/advertisements/')));
              const fullMediaUrl = getMediaUrl(ad.mediaUrl);
              const embedUrl = getEmbedVideoUrl(ad.mediaUrl);

              return (
                <div
                  key={ad.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:h-2 transition-all z-20" />

                  {/* Media Viewport */}
                  {fullMediaUrl && (
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      {isVideo ? (
                        embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={ad.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="relative w-full h-full group/vpreview flex items-center justify-center bg-black">
                            <video
                              src={fullMediaUrl}
                              poster={ad.thumbnailUrl ? (getMediaUrl(ad.thumbnailUrl) as string) : undefined}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setActiveVideoModal(ad)}
                              title={language === 'am' ? 'ßêÖßêë ßë¬ßï▓ßï« ßï¡ßêÿßêìßè¿ßë▒' : 'Watch in Cinema Modal'}
                              className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 hover:bg-emerald-600 text-white text-[10px] font-bold backdrop-blur-md transition flex items-center gap-1 z-10 border border-white/20"
                            >
                              <span>Γ¢╢</span>
                              <span>{language === 'am' ? 'ßèáßê╡ßìï' : 'Expand'}</span>
                            </button>
                          </div>
                        )
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={fullMediaUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}

                      {/* Video or Image tag */}
                      <span
                        className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md z-10 ${
                          isVideo
                            ? 'bg-purple-900/90 text-purple-200 border border-purple-400/30'
                            : 'bg-black/70 text-white'
                        }`}
                      >
                        {isVideo ? (language === 'am' ? '≡ƒÄÑ ßë¬ßï▓ßï« ßêÿßê¿ßîâ' : '≡ƒÄÑ Clinical Video') : '≡ƒû╝∩╕Å Notice'}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isDisease
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {isDisease ? 'Disease Solution' : 'Product Innovation'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ad.startDate || 'Current Notice'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                        {ad.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                        {ad.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <span>Γ£ô</span> {ad.createdBy || 'Clinical Team'}
                      </span>
                      <div className="flex items-center gap-2">
                        {isVideo && fullMediaUrl && (
                          <button
                            type="button"
                            onClick={() => setActiveVideoModal(ad)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 transition"
                          >
                            <span>Γû╢</span>
                            <span>{language === 'am' ? 'ßë¬ßï▓ßï« ßè¡ßìêßë╡' : 'Watch Video'}</span>
                          </button>
                        )}
                        <Link
                          href={ad.targetUrl || '/health?action=consult'}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-800 transition ml-1"
                        >
                          <span>{language === 'am' ? 'ßï¥ßê¡ßï¥ßê¡ ßï¡ßêÿßêìßè¿ßë▒' : 'Learn More'}</span>
                          <span>&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NEW SECTION: Most Trusted Products Showcase */}
      <section className="py-16 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>≡ƒ¢í∩╕Å</span>
                <span>{language === 'am' ? 'ßëáßîúßê¥ ßï¿ßë│ßêÿßèæ ßêÿßï╡ßèâßèÆßë╢ßë╜' : 'Quality Guaranteed by EFDA'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {language === 'am' ? 'ßëáßîúßê¥ ßï¿ßë│ßêÿßèæßèô ßï¿ßë░ßê¿ßîïßîêßîí ßï¿ßìïßê¡ßê¢ßê▓ ßê¥ßê¡ßë╢ßë╜' : 'Most Trusted Healthcare & Prescription Products'}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {language === 'am'
                  ? 'ßè¿ßèáßêêßê¥ ßèáßëÇßììßèô ßêÇßîêßê¡ ßëáßëÇßêì ßèáßê¥ßê½ßë╛ßë╜ ßëáßëÇßîÑßë│ ßï¿ßëÇßê¿ßëíßìú ßîÑßê½ßë│ßë╕ßïì ßï¿ßë░ßê¿ßîïßîêßîá ßê¥ßê¡ßë╢ßë╜'
                  : 'Highest compliance medications certified for quality, purity, and clinical efficacy.'}
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 shrink-0"
            >
              {language === 'am' ? 'ßêüßêëßèòßê¥ ßê¥ßê¡ßë╢ßë╜ ßï¡ßêÿßêìßè¿ßë▒ ΓåÆ' : 'View Complete Catalog ΓåÆ'}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mostTrustedProducts.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              >
                {/* Trusted Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span>Γ£ô</span> {item.badge}
                  </span>
                </div>

                <div>
                  {/* Illustration/Image */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl) || ''}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderProductIllustration(item.imageType)
                    )}
                    {item.prescriptionRequired && (
                      <span className="absolute bottom-2 left-2 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-rose-200">
                        {t('home.rx_required')}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {item.brand}
                  </p>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition mt-0.5 line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                    {item.indication}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">Standard Price</span>
                    <span className="text-base font-extrabold text-neutral-900">
                      {item.price} <span className="text-xs font-normal">ETB</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        prescriptionRequired: item.prescriptionRequired,
                        imageType: item.imageType,
                      });
                      triggerToast(`${item.name.split(' ')[0]} ΓÇö ${t('home.toast_added')}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-emerald-700/20"
                    aria-label="Add to cart"
                  >
                    <span>+</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW SECTION: Well-Known Doctors with their Certifications */}
      <section className="py-20 bg-gradient-to-b from-moss-950 via-moss-900 to-moss-950 text-white relative overflow-hidden border-t border-b border-herb-600/40">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-herb-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gleam-400/15 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gleam/20 text-gleam-300 border border-gleam/30 text-xs font-black uppercase tracking-wider mb-2.5 backdrop-blur-md">
                <span>≡ƒæ¿ΓÇìΓÜò∩╕Å</span>
                <span>{language === 'am' ? 'ßï¿ßë░ßêÿßê░ßè¿ßê¿ßêïßë╕ßïì ßêÇßè¬ßê₧ßë╜ßèô ßìïßê¡ßê¢ßê▓ßê╡ßë╢ßë╜' : 'Certified Clinical Specialists'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-pearl-50 leading-tight">
                {language === 'am' ? 'ßï¿ßêÜßë╣ ßìïßê¡ßê¢ßê▓ ßë│ßïïßëé ßï╢ßè¡ßë░ßê«ßë╜ ßèÑßèô ßï¿ßêÖßï½ ßê¢ßê¿ßîïßîêßî½ßïÄßë╗ßë╕ßïì' : 'Our Well-Known Doctors & Specialists with Verified Certifications'}
              </h2>
              <p className="text-sm text-pearl-200/80 mt-2 max-w-2xl leading-relaxed">
                {language === 'am'
                  ? 'ßï¿ßë│ßè½ßêÜßïÄßë╗ßë╜ßèòßèò ßîñßèòßèÉßë╡ ßêêßê¢ßê¿ßîïßîêßîÑ ßëáßèóßë╡ßï«ßî╡ßï½ ßê¥ßîìßëÑßèô ßêÿßï╡ßèâßèÆßë╡ ßëúßêêßê╡ßêìßîúßèò (EFDA) ßììßëâßï╡ ßï½ßêïßë╕ßïìßèô ßëáßè¡ßêèßèÆßè½ßêì ßêÿßê╡ßè¡ ßï¿ßê░ßêêßîáßèæ ßêÇßè¬ßê₧ßë╜ßìó'
                  : 'Consult directly with experienced medical doctors and clinical pharmacotherapists holding verified board certifications.'}
              </p>
            </div>
            <Link
              href="/health?action=consult"
              className="inline-flex items-center gap-2 rounded-full bg-radiate hover:bg-radiate-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-radiate-950/40 transition hover:scale-105 active:scale-95 shrink-0"
            >
              <span>≡ƒôà</span>
              <span>{language === 'am' ? 'ßï¿ßêàßè¡ßê¥ßèô ßê¥ßè¡ßè¡ßê¡ ßëÇßîáßê« ßï¡ßï½ßïÖ' : 'Book Clinical Consultation'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="bg-gradient-to-b from-moss-900/90 to-moss-950/95 border border-herb-400/30 hover:border-gleam-400/60 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md transition-all duration-300 shadow-xl group hover:-translate-y-1.5"
              >
                <div>
                  {/* Doctor Avatar / Image & Status Badge */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-moss-950 mb-4 border border-herb-400/30 flex items-center justify-center">
                    {doc.imageUrl ? (
                      <img
                        src={getImageUrl(doc.imageUrl) as string}
                        alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-herb-500/20 text-gleam font-black text-2xl flex items-center justify-center border border-herb-400/40 shadow-inner">
                        {doc.firstName[0]}{doc.lastName[0]}
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 bg-moss-950/90 backdrop-blur-md text-gleam text-[10px] font-bold px-2.5 py-1 rounded-full border border-gleam-400/30 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-gleam animate-pulse" />
                      Available
                    </span>
                  </div>

                  <h3 className="font-extrabold text-pearl text-base group-hover:text-gleam-300 transition leading-snug">
                    Dr. {doc.firstName} {doc.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-herb-300 mt-0.5">
                    {doc.specialization}
                  </p>
                  <p className="text-[11px] text-pearl-200/70 mt-1 font-mono">
                    Experience: {doc.experienceYears}+ Years
                  </p>

                  {/* Certifications Badges */}
                  <div className="mt-3.5 pt-3.5 border-t border-herb-500/30">
                    <p className="text-[10px] font-bold text-pearl-200/60 uppercase tracking-wider mb-2">
                      Verified Certifications:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {(doc.certifications && doc.certifications.length > 0
                        ? doc.certifications
                        : ['EFDA Licensed Practitioner', 'Board Certified Clinical Pharmacist']
                      ).map((cert, cIdx) => (
                        <div
                          key={cIdx}
                          className="px-2.5 py-1 rounded-xl bg-moss-950/80 border border-herb-500/40 text-pearl-100 text-[10px] font-semibold flex items-center gap-1.5"
                        >
                          <span className="text-gleam-300 text-xs font-bold">Γ£ô</span>
                          <span className="truncate">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-herb-500/30">
                  <Link
                    href={`/health?action=consult&doctor=${encodeURIComponent(`Dr. ${doc.firstName} ${doc.lastName}`)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-herb-600 hover:bg-herb-500 text-white font-bold text-xs transition shadow-md shadow-herb-950/50 hover:scale-[1.02] active:scale-95"
                  >
                    <span>Connect with Dr. {doc.firstName}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Promotional Health Services Cards (Yene Card removed) */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('home.services_title')}
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              {t('home.services_subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition hover:shadow-lg ${feat.color}`}
              >
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{feat.title}</h3>
                  <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <Link
                  href={feat.link}
                  className={`mt-6 inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-xs font-bold transition duration-150 active:scale-95 shadow-sm ${feat.btnColor}`}
                >
                  {feat.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6B. Interactive Branch Google Map & Physical Network Showcase */}
      <section className="py-14 bg-gradient-to-b from-pearl-50 via-white to-pearl-100/40 border-t border-b border-herb-200/80">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-herb-100 text-moss-900 border border-herb-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                <span>≡ƒôì</span>
                <span>{language === 'am' ? 'ßï¿ßëàßê¡ßèòßî½ßìì ßèáßïìßë│ßê¿ ßêÿßê¿ßëÑ' : 'Nationwide Physical Network'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-moss-900 tracking-tight">
                {language === 'am' ? 'ßëáßèáßëàßê½ßëóßï½ßïÄ ßï¿ßêÜßîêßèÿßïìßèò ßï¿ßêÜßë╣ ßìïßê¡ßê¢ßê▓ ßëàßê¡ßèòßî½ßìì ßï½ßîìßèÖ' : 'Find Your Nearest Michu Pharmacy Branch'}
              </h2>
              <p className="text-sm text-stone-600 mt-1 max-w-2xl">
                {language === 'am'
                  ? 'ßëáßèáßï▓ßê╡ ßèáßëáßëú ßèÑßèô ßëáßïïßèô ßïïßèô ßï¿ßè¡ßêìßêì ßè¿ßë░ßê₧ßë╜ ßï¿ßêÜßîêßèÖ 7 ßïÿßêÿßèôßïè ßëàßê¡ßèòßî½ßìÄßë╜ ΓÇö 24/7 ßè¡ßììßë╡ ßèáßîêßêìßîìßêÄßë╡ßìú ßï¿ßêÿßï╡ßèâßèÆßë╡ ßê¢ßïÿßïú ßê¡ßè¡ßè¡ßëÑ ßèÑßèô ßèÉßìâ ßï¿ßê¥ßè¡ßê¡ ßèáßîêßêìßîìßêÄßë╡ßìó'
                  : '7 modern branches across Addis Ababa & regional hubs ΓÇö offering 24/7 service, cold-chain medication pickup, and licensed pharmacist consultations.'}
              </p>
            </div>
            <Link
              href="/branches"
              className="inline-flex items-center gap-2 rounded-xl bg-moss-900 hover:bg-moss-800 text-pearl px-5 py-2.5 text-xs font-bold transition shadow-sm hover:scale-105 active:scale-95 shrink-0 border border-moss-950"
            >
              <span>{language === 'am' ? 'ßêüßêëßèòßê¥ ßëàßê¡ßèòßî½ßìÄßë╜ ßï¡ßêÿßêìßè¿ßë▒' : 'View All 7 Branches'}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Quick Branch Directory Card on Desktop (4 cols) */}
            <div className="lg:col-span-4 bg-pearl-50/90 rounded-3xl border border-herb-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-herb-200/60 mb-3">
                  <span className="text-xs font-bold text-moss-900 uppercase tracking-wider">
                    {language === 'am' ? 'ßï¿ßëàßê¡ßèòßî½ßìÄßë╜ ßï¥ßê¡ßï¥ßê¡' : 'Select Branch Location'}
                  </span>
                  <span className="text-[10px] bg-herb-100 text-moss-900 border border-herb-300 font-bold px-2 py-0.5 rounded-full">
                    {BRANCH_LOCATIONS.length} {language === 'am' ? 'ßëªßë│ßïÄßë╜' : 'Locations'}
                  </span>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {BRANCH_LOCATIONS.map((b) => {
                    const isSelected = homeSelectedBranch.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setHomeSelectedBranch(b)}
                        className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-pearl-100 border-herb-400 shadow-xs ring-2 ring-radiate/50 text-moss-900'
                            : 'bg-white hover:bg-pearl-100/50 border-herb-100/80 text-stone-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-moss-900 truncate">
                              {language === 'am' && b.nameAm ? b.nameAm : b.name}
                            </span>
                            {b.is24Hours && (
                              <span className="bg-moss-900 text-gleam text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">
                                24/7
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {language === 'am' && b.addressAm ? b.addressAm : b.address}
                          </p>
                        </div>
                        <span className={`text-xs ${isSelected ? 'text-radiate font-bold' : 'text-stone-400'}`}>
                          &rsaquo;
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Branch Fast Contact Card */}
              <div className="mt-4 pt-3 border-t border-herb-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium">Selected Branch Phone:</span>
                  <p className="font-bold text-herb-700">{homeSelectedBranch.phone}</p>
                </div>
                <a
                  href={`tel:${homeSelectedBranch.phone}`}
                  className="px-3.5 py-1.5 bg-radiate hover:bg-radiate-600 text-white rounded-lg font-bold text-xs shadow-sm shadow-radiate/30 transition"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Interactive Map Component (8 cols) */}
            <div className="lg:col-span-8 flex">
              <BranchGoogleMap
                branches={BRANCH_LOCATIONS}
                selectedBranch={homeSelectedBranch}
                onSelectBranch={setHomeSelectedBranch}
                height="440px"
                className="w-full shadow-lg border-herb-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pharma Brands Marquee Slider */}
      <section className="py-14 bg-white border-t border-b border-slate-100 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-herb-600 text-xs font-bold uppercase tracking-wider">Trusted Partners</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                {t('home.brands_title') || 'World-Class Pharma Brands'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Authentic, EFDA-verified medications from globally trusted manufacturers.</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-herb-600 hover:text-herb-700 transition flex items-center gap-1 shrink-0"
            >
              Browse All Products →
            </Link>
          </div>
        </div>

        {/* Marquee track — pure CSS, no JS, no layout shift */}
        <div className="relative">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-white to-transparent" />

          <style>{`
            @keyframes mph-marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .mph-marquee-track {
              display: flex;
              width: max-content;
              animation: mph-marquee 32s linear infinite;
            }
            .mph-marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="mph-marquee-track gap-4 px-4">
            {BRANDS_LOOP.map((brand, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/products?brand=${encodeURIComponent(brand.name)}`)}
                style={{ backgroundColor: brand.bg, borderColor: brand.color + '33' }}
                className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition hover:scale-105 hover:shadow-lg group mx-1"
              >
                <span className="text-2xl">{brand.badge}</span>
                <div className="text-left">
                  <p style={{ color: brand.color }} className="font-extrabold text-sm leading-none whitespace-nowrap">{brand.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">{brand.country}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. NEW SECTION: Official Partners Showcase (Manageable from Admin Dashboard) */}
      <section className="py-16 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span>≡ƒñ¥</span>
              <span>{language === 'am' ? 'ßèáßîïßê«ßë╗ßë╜ßèò ßèÑßèô ßèáßê¥ßê½ßë╛ßë╜' : 'Institutional & Manufacturing Partners'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'am' ? 'ßèáßê╡ßë░ßê¢ßê¢ßè¥ ßï¿ßîñßèôßèô ßï¿ßìïßê¡ßê¢ßê▓ ßèáßîïßê«ßë╗ßë╜ßèò' : 'Our Strategic & Regulated Partners'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {language === 'am'
                ? 'ßè¿ßêÿßèòßîìßê╡ßë│ßïè ßë░ßëåßîúßîúßê¬ßïÄßë╜ßìú ßèáßêêßê¥ ßèáßëÇßìì ßèáßê¥ßê½ßë╛ßë╜ ßèÑßèô ßï¿ßï▓ßîéßë│ßêì ßè¡ßììßï½ ßèáßïìßë│ßê«ßë╜ ßîïßê¡ ßëáßîïßê½ ßèÑßèòßê░ßê½ßêêßèòßìó'
                : 'Working alongside national health authorities, certified WHO-GMP manufacturers, and trusted digital banking partners.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {partners.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-600 uppercase">
                      {p.category}
                    </span>
                    <span className="text-emerald-600 text-xs font-bold">Γ£ô Verified</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1">{p.name}</h3>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{p.badge}</p>
                  {p.description && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                {p.websiteUrl && (
                  <div className="mt-4 pt-2 border-t border-slate-200/50">
                    <a
                      href={p.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition flex items-center gap-1"
                    >
                      <span>Official Website</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Payment Options Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 border-t border-b border-slate-200/80 relative overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-2xs">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('home.payment_badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('home.payment_title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed max-w-2xl mx-auto">
              {t('home.payment_subtitle')}
            </p>
          </div>

          {/* 3 Payment Method Cards: Telebirr, CBE Birr, Cash on Pickup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* 1. Telebirr */}
            <div className="bg-white rounded-3xl border-2 border-sky-200 hover:border-sky-500 p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[11px] font-extrabold tracking-wide uppercase border border-sky-200 shadow-2xs">
                    1-Click USSD
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition">
                  {t('home.payment_telebirr_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {t('home.payment_telebirr_desc')}
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant checkout via Telebirr SuperApp & Web</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Official Ethio Telecom verified payment route</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-sky-100 flex items-center justify-between bg-sky-50/80 text-sky-950 font-mono text-xs font-bold px-4 py-3 rounded-2xl border border-sky-200/80">
                <span className="text-slate-500 font-sans font-medium text-xs">USSD Code:</span>
                <span className="text-sky-700 font-black tracking-wide text-sm bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">{t('home.payment_telebirr_code')}</span>
              </div>
            </div>

            {/* 2. CBE Birr */}
            <div className="bg-white rounded-3xl border-2 border-purple-200 hover:border-purple-600 p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 text-white flex items-center justify-center shadow-md shadow-purple-700/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold tracking-wide uppercase border border-purple-200 shadow-2xs">
                    CBE Gateway
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-700 transition">
                  {t('home.payment_cbe_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {t('home.payment_cbe_desc')}
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Direct CBE Mobile Banking & *847# USSD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant automated receipt & payment confirmation</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-purple-100 flex items-center justify-between bg-purple-50/80 text-purple-950 font-mono text-xs font-bold px-4 py-3 rounded-2xl border border-purple-200/80">
                <span className="text-slate-500 font-sans font-medium text-xs">Direct Dial:</span>
                <span className="text-purple-800 font-black tracking-wide text-sm bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">{t('home.payment_cbe_code')}</span>
              </div>
            </div>

            {/* 3. Cash on Pickup / In-Branch */}
            <div className="bg-white rounded-3xl border-2 border-emerald-200 hover:border-emerald-500 p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase border border-emerald-200 shadow-2xs">
                    In-Branch POS
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition">
                  {t('home.payment_cash_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {t('home.payment_cash_desc')}
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pharmacist consultation and medication review on collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pay with Cash, debit card POS, or mobile transfer</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between bg-emerald-50/80 text-emerald-950 font-mono text-xs font-bold px-4 py-3 rounded-2xl border border-emerald-200/80">
                <span className="text-slate-500 font-sans font-medium text-xs">Branch Pickup:</span>
                <span className="text-emerald-700 font-black tracking-wide text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">{t('home.payment_cash_branches')}</span>
              </div>
            </div>
          </div>

          {/* Security & Assurance Strip */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Bank-Grade 256-bit SSL Encryption & EFDA Regulatory Compliance
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  All transactions are encrypted and processed through certified National Bank of Ethiopia authorized channels.
                </p>
              </div>
            </div>
            <Link
              href="/faq"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 shrink-0 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-100"
            >
              <span>Payment FAQ & Support</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Featured Best Sellers Grid */}
      <section className="py-16 bg-neutral-50 border-t">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">{t('home.featured_subtitle')}</span>
              <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                {t('home.featured_title')}
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 shrink-0"
            >
              {t('home.featured_view_all')}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(liveProducts.length > 0
              ? liveProducts.slice(0, 4).map((p) => ({
                  id: String(p.id),
                  name: p.name,
                  price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                  prescriptionRequired: p.prescriptionRequired ?? false,
                  imageUrl: p.imageUrl,
                  imageType: (p.name.toLowerCase().includes('syrup') ? 'syrup' : p.name.toLowerCase().includes('cream') || p.name.toLowerCase().includes('gloss') ? 'cosmetic' : p.name.toLowerCase().includes('spray') ? 'spray' : p.name.toLowerCase().includes('drop') ? 'drops' : 'tablet') as any,
                  desc: p.description || p.brand || 'Quality pharmacy approved medication',
                }))
              : featuredProducts
            ).map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col justify-between hover:shadow-xl transition duration-200"
              >
                <div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative bg-neutral-50">
                    {'imageUrl' in prod && prod.imageUrl ? (
                      <img
                        src={getImageUrl(prod.imageUrl) as string}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderProductIllustration(prod.imageType)
                    )}
                    {prod.prescriptionRequired && (
                      <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-red-200">
                        {t('home.rx_required')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition truncate">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {prod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">{t('home.featured_price')}</span>
                    <span className="text-base font-extrabold text-neutral-900">{prod.price} <span className="text-xs font-normal">ETB</span></span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        prescriptionRequired: prod.prescriptionRequired,
                        imageType: prod.imageType,
                      });
                      triggerToast(`${prod.name.split('...')[0]} ΓÇö ${t('home.toast_added')}`);
                    }}
                    className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 active:scale-95 transition shadow-sm"
                    aria-label="Add to cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Interactive Video Advertisement Cinema Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                  Γû╢
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white truncate max-w-lg">
                    {activeVideoModal.title}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {activeVideoModal.createdBy || 'Michu Pharmacy Clinical Team'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Close modal"
              >
                Γ£ò
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {getEmbedVideoUrl(activeVideoModal.mediaUrl) ? (
                <iframe
                  src={getEmbedVideoUrl(activeVideoModal.mediaUrl) as string}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getMediaUrl(activeVideoModal.mediaUrl) as string}
                  poster={
                    activeVideoModal.thumbnailUrl
                      ? (getMediaUrl(activeVideoModal.thumbnailUrl) as string)
                      : undefined
                  }
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer / Description */}
            <div className="p-6 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeVideoModal.description}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={activeVideoModal.targetUrl || '/health?action=consult'}
                  onClick={() => setActiveVideoModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5"
                >
                  <span>
                    {language === 'am' ? 'ßê¥ßè¡ßè¡ßê¡ ßïêßï¡ßê¥ ßê¥ßê¡ßë╡ ßï¡ßêÿßêìßè¿ßë▒' : 'Consult Pharmacist / Products'}
                  </span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
