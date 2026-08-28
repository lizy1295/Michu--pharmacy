'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const SERVICES = [
  {
    icon: '📦',
    title: 'Prescription Medications',
    description: 'Wide range of prescription drugs available for in-branch collection after pharmacist verification.',
  },
  {
    icon: '💊',
    title: 'Over-the-Counter Products',
    description: 'From pain relief to cold & flu, vitamins to first aid — shop without a prescription.',
  },
  {
    icon: '🩺',
    title: 'Clinical Consultations',
    description: 'Book video consultations with certified pharmacists for medication reviews and health advice.',
  },
  {
    icon: '🧾',
    title: 'Prescription Upload',
    description: 'Upload your prescription online and our pharmacists will prepare it for fast collection.',
  },
  {
    icon: '🚚',
    title: 'Home Delivery',
    description: 'Free delivery on OTC products. Prescription items must be collected in-branch for safety.',
  },
  {
    icon: '⭐',
    title: 'Yene Loyalty Program',
    description: 'Earn points on every purchase and redeem for exclusive discounts and health packages.',
  },
];

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast('Thank you for your message! Our team will get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-brand-900 via-brand-800 to-emerald-950 text-white py-16 px-8 mb-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="relative max-w-3xl">
          <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            {t('about.title')}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            {t('about.subtitle')}
          </h1>
          <p className="mt-4 text-brand-100 leading-relaxed max-w-2xl">
            Founded with a mission to make quality healthcare accessible, Michu Pharmacy combines traditional pharmacy care with modern technology. We serve customers across Ethiopia through our 7 branches and growing digital platform.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { value: '7+', label: 'Branches Nationwide', icon: '🏥' },
          { value: '10K+', label: 'Happy Customers', icon: '😊' },
          { value: '500+', label: 'Products Available', icon: '📦' },
          { value: '24/7', label: 'Ayat Branch Open', icon: '🕐' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-black text-brand-700">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Founder & Clinical Leadership Spotlight */}
      <div className="mb-12 rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 border border-neutral-800 shadow-xl overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl">
              <Image
                src="/dr-million-negasa.png"
                alt="Dr. Million Negasa - Founder & Owner"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="bg-emerald-500/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Founder & Managing Director
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Leadership & Vision</span>
            <h2 className="text-3xl font-extrabold text-white">Dr. Million Negasa</h2>
            <p className="text-sm font-medium text-emerald-300">Founder, Owner & Clinical Director of Michu Pharmacy</p>
            <blockquote className="text-neutral-300 text-sm sm:text-base leading-relaxed italic border-l-2 border-emerald-400 pl-4 py-1 bg-white/5 rounded-r-xl">
              "We founded Michu Pharmacy with a deep passion to make certified pharmaceutical care, authentic medications, and transparent guidance accessible to every Ethiopian household through both our community branches and digital health technology."
            </blockquote>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">✓ EFDA Certified</span>
              <span className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">✓ 8 Regional & Addis Branches</span>
              <span className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">✓ 24/7 Digital Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-8 text-center">What We Offer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, idx) => (
            <div key={idx} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-200 group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{service.icon}</div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">Contact Us</h2>
          <p className="text-sm text-gray-500 mb-6">Have a question or need assistance? Reach out to our support team.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
              <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
              <textarea rows={4} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-sm active:scale-95 transition shadow-sm">
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-50 border border-brand-100 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-brand-900 mb-4">Our Branches</h3>
            <div className="space-y-4">
              {[
                { name: 'Ayat Branch', address: 'Ayat Zone 2, Main Road', phone: '+251 116 889 900', hours: '24 Hours' },
                { name: 'Adama Branch', address: 'Bole Road, Near Adama Stadium', phone: '+251 221 112 233', hours: '8:00 AM - 10:00 PM' },
                { name: 'Bethel Branch', address: 'Bethel Hospital Street', phone: '+251 113 445 566', hours: '8:00 AM - 9:00 PM' },
                { name: 'Hawassa Branch', address: 'Piazza, Near Hawassa University', phone: '+251 462 223 344', hours: '8:00 AM - 10:00 PM' },
              ].map((branch, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 border-brand-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                    {branch.name.split(' ')[0][0]}{branch.name.split(' ')[1]?.[0] || ''}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-900">{branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.address}</p>
                    <p className="text-xs text-gray-500">{branch.phone} | {branch.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-2">Customer Support</h3>
            <p className="text-sm text-neutral-400 mb-4">Available 24/7 for emergency inquiries and order assistance.</p>
            <a href="tel:0904040364" className="block text-2xl font-black text-brand-500 hover:text-brand-400 transition font-mono">
              0904040364 / 0931325959
            </a>
            <a href="mailto:mkoo7891@gmail.com" className="inline-block text-sm text-neutral-300 hover:text-emerald-400 mt-1 font-mono transition">
              mkoo7891@gmail.com
            </a>
            <div className="flex gap-3 mt-6">
              <a
                href="https://facebook.com/millaphar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition"
                aria-label="Facebook (@milla phar)"
                title="Facebook: @milla phar"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a
                href="https://t.me/+251904040364"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition"
                aria-label="Telegram (0904040364)"
                title="Telegram: +251 904 040 364"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.34 3.53-.51.35-.97.52-1.37.51-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.24.36-.48.99-.74 3.86-1.68 6.43-2.78 7.72-3.3 3.67-1.48 4.43-1.74 4.93-1.75.11 0 .36.03.52.16.14.11.18.26.2.37.02.09.02.26 0 .4z"/></svg>
              </a>
              <a
                href="https://www.linkedin.com/in/million-negasa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition"
                aria-label="LinkedIn (Million Negasa)"
                title="LinkedIn: Million Negasa"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-3">Ready to Take Control of Your Health?</h2>
        <p className="text-brand-100 mb-6 max-w-2xl mx-auto">Join thousands of Ethiopians who trust Michu Pharmacy for their medication, supplements, and health services needs.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/products" className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-700 hover:bg-brand-50 transition shadow-lg">
            {t('cart.shop_products')}
          </Link>
          <Link href="/health" className="rounded-full border border-white bg-white/10 hover:bg-white/20 px-8 py-3.5 text-sm font-bold text-white transition backdrop-blur-sm">
            {t('health.title')}
          </Link>
        </div>
      </div>
    </div>
  );
}
