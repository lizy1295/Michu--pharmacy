'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const FAQS = [
  {
    category: 'Orders & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Home delivery for non-prescription items typically takes 2-4 hours within Addis Ababa. Prescription medications must be collected in-person at the branch after pharmacist review.',
      },
      {
        q: 'Do you deliver prescription medications?',
        a: 'No, for safety and regulatory compliance, prescription medications cannot be delivered. They must be collected in-person at your selected branch with the original physical prescription.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept CBE Birr, Telebirr, Awash Birr, HelloCash, cash on delivery (for OTC items), and in-branch cash/card payments.',
      },
      {
        q: 'How can I track my order?',
        a: 'Use our order tracking page with your order ID (format: MPH-XXX-XXXX). You can also check order status in your account dashboard.',
      },
    ],
  },
  {
    category: 'Prescriptions',
    questions: [
      {
        q: 'How do I upload a prescription?',
        a: 'Go to Health Services &gt; Upload Prescription, take a photo or scan your prescription, fill in your details, and select your preferred branch. Our pharmacist will review it within 15-30 minutes during operating hours.',
      },
      {
        q: 'What formats do you accept for prescription uploads?',
        a: 'We accept PNG, JPG, and PDF formats up to 5MB. Make sure the prescription is clearly legible with all details visible.',
      },
      {
        q: 'How long does prescription review take?',
        a: 'Standard review takes 15-30 minutes during business hours. For urgent cases, please call the branch directly.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Non-prescription items can be returned within 7 days if unopened and in original packaging. Prescription medications cannot be returned once dispensed for safety reasons.',
      },
      {
        q: 'How do I request a refund?',
        a: 'Contact our customer support at 0904040364 / 0931325959 or email mkoo7891@gmail.com with your order ID and reason for return.',
      },
    ],
  },
  {
    category: 'Loyalty Program',
    questions: [
      {
        q: 'What is the Yene Card?',
        a: 'The Yene Card is Michu Pharmacy\'s loyalty program. Earn points on every purchase of supplements, cosmetics, and medical devices. Points can be redeemed for discount vouchers and exclusive health packages.',
      },
      {
        q: 'How do I earn and redeem points?',
        a: 'You earn 1 point for every 10 ETB spent on eligible categories. 100 points = 10 ETB discount. Points are automatically credited to your account after order completion.',
      },
      {
        q: 'Are all products eligible for points?',
        a: 'Points are earned on supplements, cosmetics, and medical devices. Prescription medications do not earn points due to regulatory requirements.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{ cat: number; q: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const filtered = FAQS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        !searchQuery ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Help Center</span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">{t('faq.title')}</h1>
        <p className="text-sm text-neutral-500 mt-3">{t('faq.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <input
          type="text"
          placeholder={t('products.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="space-y-8">
        {filtered.map((cat, catIdx) => (
          <div key={cat.category}>
            <h2 className="text-lg font-extrabold text-neutral-900 mb-4 pb-2 border-b">{cat.category}</h2>
            <div className="space-y-2">
              {cat.questions.map((item, qIdx) => {
                const isOpen = openIndex?.cat === catIdx && openIndex?.q === qIdx;
                return (
                  <div key={qIdx} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : { cat: catIdx, q: qIdx })}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-bold text-neutral-800 pr-4">{item.q}</span>
                      <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 animate-in fade-in duration-200">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 bg-brand-50 border border-brand-100 rounded-3xl p-8 text-center">
        <h3 className="text-lg font-bold text-brand-900 mb-2">{t('faq.title')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('faq.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:0904040364" className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-sm transition">
            Call 0904040364 / 0931325959
          </a>
          <Link href="/about" className="rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 text-sm transition">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
