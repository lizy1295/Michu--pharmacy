'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const ENGLISH_FAQS = [
  {
    category: 'Orders & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Home delivery for non-prescription items typically takes 2-4 hours within Addis Ababa. Prescription medications must be collected in-person at the branch after pharmacist review.',
      },
      {
        q: 'Do you deliver prescription medications?',
        a: 'No, for safety and regulatory compliance with EFDA, prescription medications cannot be delivered. They must be collected in-person at your selected branch with the original physical prescription.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept CBE Birr, Telebirr, cash on delivery (for OTC items), and in-branch cash/POS payments.',
      },
      {
        q: 'How can I track my order?',
        a: 'Use our order tracking page with your order ID (format: MPH-XXX-XXXX). You can also check order status in your account dashboard.',
      },
    ],
  },
  {
    category: 'Prescriptions & Safety',
    questions: [
      {
        q: 'How do I upload a prescription?',
        a: 'Go to Health Services > Upload Prescription, take a clear photo or scan your prescription, fill in your details, and select your preferred branch. Our pharmacist will review it within 15-30 minutes.',
      },
      {
        q: 'What formats do you accept for prescription uploads?',
        a: 'We accept PNG, JPG, JPEG, and PDF formats up to 5MB. Ensure all dosage details and doctor signatures are clearly visible.',
      },
      {
        q: 'How long does prescription review take?',
        a: 'Standard review takes 15-30 minutes during operating hours. For urgent cases, please call the branch directly.',
      },
    ],
  },
  {
    category: 'Returns & Quality Assurance',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Non-prescription items can be returned within 7 days if unopened and in original packaging. Prescription medications cannot be returned once dispensed for regulatory safety reasons.',
      },
      {
        q: 'How do I request assistance or report an issue?',
        a: 'Contact our customer support team at 0904040364 / 0931325959 or email support@michupharmacy.com with your order reference.',
      },
    ],
  },
];

const AMHARIC_FAQS = [
  {
    category: 'ትዕዛዞች እና ማድረስ (Orders & Delivery)',
    questions: [
      {
        q: 'ትዕዛዝ ለማድረስ ምን ያህል ጊዜ ይወስዳል?',
        a: 'የማዘዣ ወረቀት ለማይፈልጉ መድኃኒቶች በአዲስ አበባ ውስጥ ማድረስ ከ2-4 ሰዓታት ይወስዳል። የሐኪም ማዘዣ የሚጠይቁ መድኃኒቶች በጤና ደንብ መሠረት በቅርንጫፍ በአካል የሚወሰዱ ናቸው።',
      },
      {
        q: 'የሐኪም ማዘዣ መድኃኒቶችን ቤቴ ድረስ ታደርሳላችሁ?',
        a: 'አይ፣ በEFDA የደህንነት እና የጤና ደንቦች መሠረት የሐኪም ማዘዣ መድኃኒቶችን ማድረስ አይፈቀድም። ከመረጡት ቅርንጫፍ ትክክለኛውን ማዘዣ ወረቀት ይዘው በአካል መውሰድ አለብዎት።',
      },
      {
        q: 'ምን ዓይነት የክፍያ አማራጮች አሉ?',
        a: 'በቴሌብር (Telebirr)፣ በሲቢኢ ብር (CBE Birr)፣ በካሽ እና በቅርንጫፍ የPOS ካርድ ክፍያዎችን እንቀበላለን።',
      },
      {
        q: 'ትዕዛዜ የደረሰበትን ደረጃ እንዴት ማወቅ እችላለሁ?',
        a: 'በትዕዛዝ መከታተያ ገጻችን (Track Order) ላይ የትዕዛዝ መለያ ቁጥርዎን በማስገባት ወይም በአካውንት ዳሽቦርድዎ ውስጥ ማየት ይችላሉ።',
      },
    ],
  },
  {
    category: 'የሐኪም ማዘዣ እና ደህንነት (Prescriptions)',
    questions: [
      {
        q: 'የሐኪም ማዘዣ እንዴት እሰቅላለሁ?',
        a: 'ወደ ጤና አገልግሎቶች > ማዘዣ ይስቀሉ (Upload Prescription) በመሄድ፣ የማዘዣ ወረቀትዎን በግልጽ ፎቶ በማንሳት፣ መረጃዎን ሞልተው የሚፈልጉትን ቅርንጫፍ ይምረጡ። ፋርማሲስቶቻችን በ15-30 ደቂቃ ውስጥ ያዘጋጁልዎታል።',
      },
      {
        q: 'ምን ዓይነት የፎቶ ወይም የፋይል አይነቶች ይቀበላሉ?',
        a: 'PNG, JPG, JPEG እና PDF እስከ 5MB መጠን ድረስ እንቀበላለን። የዶክተሩ ፊርማ እና የመድኃኒቱ ስም በግልጽ የሚነበብ መሆኑን ያረጋግጡ።',
      },
      {
        q: 'የማዘዣ ወረቀት ግምገማ ምን ያህል ጊዜ ይወስዳል?',
        a: 'በመደበኛ የስራ ሰዓት ከ15 እስከ 30 ደቂቃዎች ይወስዳል። ለአስቸኳይ ሁኔታዎች እባክዎ በቀጥታ ወደ ቅርንጫፉ ይደውሉ።',
      },
    ],
  },
  {
    category: 'የጥራት ማረጋገጫ እና መመለስ (Returns & Quality)',
    questions: [
      {
        q: 'ምርቶችን የመመለስ ደንባችሁ ምንድን ነው?',
        a: 'የሐኪም ማዘዣ የማይጠይቁ ምርቶች ያልተከፈቱ እና ማሸጊያቸው ያልተበላሸ ከሆነ በ7 ቀናት ውስጥ መመለስ ይችላሉ። የሐኪም ማዘዣ መድኃኒቶች ግን ለደህንነት ሲባል አንዴ ከተሰጡ በኋላ አይመለሱም።',
      },
      {
        q: 'እርዳታ ለማግኘት ወዴት ማነጋገር እችላለሁ?',
        a: 'የደንበኞች አገልግሎት ቡድናችንን በ 0904040364 / 0931325959 በመደወል ወይም በ support@michupharmacy.com ኢሜይል በማድረግ ማነጋገር ይችላሉ።',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{ cat: number; q: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language } = useLanguage();

  const activeFaqs = useMemo(() => {
    return language === 'am' ? AMHARIC_FAQS : ENGLISH_FAQS;
  }, [language]);

  const filtered = useMemo(() => {
    return activeFaqs.map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          !searchQuery ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((cat) => cat.questions.length > 0);
  }, [activeFaqs, searchQuery]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">
          {language === 'am' ? 'የእርዳታ ማዕከል' : 'Help Center'}
        </span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">{t('faq.title')}</h1>
        <p className="text-sm text-neutral-500 mt-3">{t('faq.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <input
          type="text"
          placeholder={language === 'am' ? 'ጥያቄዎችን ይፈልጉ...' : 'Search questions and answers...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="space-y-8">
        {filtered.map((cat, catIdx) => (
          <div key={cat.category}>
            <h2 className="text-lg font-extrabold text-neutral-900 mb-4 pb-2 border-b">{cat.category}</h2>
            <div className="space-y-2">
              {cat.questions.map((item, qIdx) => {
                const isOpen = openIndex?.cat === catIdx && openIndex?.q === qIdx;
                return (
                  <div key={qIdx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : { cat: catIdx, q: qIdx })}
                      className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-sm text-neutral-800 hover:text-brand-600 transition"
                    >
                      <span>{item.q}</span>
                      <svg
                        className={`w-5 h-5 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-brand-600' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center p-8 rounded-3xl bg-brand-50 border border-brand-100 space-y-3">
        <h3 className="font-extrabold text-neutral-900 text-lg">
          {language === 'am' ? 'ተጨማሪ ጥያቄ አለዎት?' : 'Still have questions?'}
        </h3>
        <p className="text-xs text-neutral-600 max-w-md mx-auto">
          {language === 'am'
            ? 'የፋርማሲ ባለሙያዎቻችን ለጥያቄዎችዎ መልስ ለመስጠት እና ትክክለኛ የጤና ምክር ለመስጠት ዝግጁ ናቸው።'
            : 'Our licensed pharmacists are here to help review your medications and answer your health questions.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/health?action=consult"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
          >
            {language === 'am' ? 'የፋርማሲስት ምክክር ጀምር' : 'Talk to a Pharmacist'}
          </Link>
        </div>
      </div>
    </div>
  );
}
