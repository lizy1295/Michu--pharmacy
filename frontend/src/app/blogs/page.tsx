'use client';

import Link from 'next/link';
import { useState } from 'react';

const ARTICLES = [
  {
    id: '1',
    slug: 'understanding-hypertension',
    title: 'Understanding Hypertension: Causes, Symptoms, and Prevention',
    excerpt: 'High blood pressure affects millions globally. Learn about the warning signs, lifestyle changes, and treatment options available through Michu Pharmacy.',
    category: 'Health Tips',
    date: 'July 12, 2026',
    readTime: '5 min read',
    imageType: 'article-health',
    featured: true,
  },
  {
    id: '2',
    slug: 'importance-of-vitamins',
    title: 'Why Daily Multivitamins Are Essential for Your Family',
    excerpt: 'Explore how the right multivitamin can bridge nutritional gaps and support immune health for every family member.',
    category: 'Nutrition',
    date: 'July 8, 2026',
    readTime: '4 min read',
    imageType: 'article-vitamins',
    featured: true,
  },
  {
    id: '3',
    slug: 'diabetes-management-tips',
    title: 'Smart Diabetes Management: A Practical Guide',
    excerpt: 'From insulin storage to diet planning, here are expert-backed tips for managing diabetes effectively at home.',
    category: 'Chronic Care',
    date: 'July 3, 2026',
    readTime: '6 min read',
    imageType: 'article-diabetes',
    featured: false,
  },
  {
    id: '4',
    slug: 'skincare-routine',
    title: 'Building a Daily Skincare Routine That Actually Works',
    excerpt: 'Dermatologist-approved steps to achieve healthy, glowing skin using affordable and effective products available at Michu Pharmacy.',
    category: 'Beauty',
    date: 'June 28, 2026',
    readTime: '5 min read',
    imageType: 'article-skincare',
    featured: false,
  },
  {
    id: '5',
    slug: 'safe-medication-storage',
    title: 'How to Safely Store Medications at Home',
    excerpt: 'Proper storage extends medication shelf life and ensures effectiveness. Learn where and how to store different types of medicines.',
    category: 'Safety',
    date: 'June 22, 2026',
    readTime: '3 min read',
    imageType: 'article-safety',
    featured: false,
  },
  {
    id: '6',
    slug: 'loyalty-program-benefits',
    title: 'Maximizing Your Yene Card Loyalty Benefits',
    excerpt: 'Get the most out of your Yene Card. From earning points to redeeming vouchers, here is everything you need to know.',
    category: 'Loyalty',
    date: 'June 15, 2026',
    readTime: '4 min read',
    imageType: 'article-loyalty',
    featured: false,
  },
];

const renderArticleImage = (type: string) => {
  switch (type) {
    case 'article-health':
      return <div className="w-full h-full bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>;
    case 'article-vitamins':
      return <div className="w-full h-full bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    case 'article-diabetes':
      return <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" /></svg></div>;
    case 'article-skincare':
      return <div className="w-full h-full bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
    case 'article-safety':
      return <div className="w-full h-full bg-red-50 rounded-2xl flex items-center justify-center text-red-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>;
    case 'article-loyalty':
      return <div className="w-full h-full bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    default:
      return <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1" /></svg></div>;
  }
};

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(ARTICLES.map((a) => a.category)));

  const filtered = ARTICLES.filter((a) => {
    if (selectedCategory && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  const featured = filtered.filter((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Health Insights</span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">Michu Blog & Health Tips</h1>
        <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
          Expert advice, health tips, and pharmaceutical insights to help you make informed decisions about your wellness journey.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${!selectedCategory ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            Featured Articles
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((article) => (
              <Link
                key={article.id}
                href={`/blogs/${article.slug}`}
                className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-xl transition duration-200"
              >
                <div className="aspect-video w-full relative">
                  {renderArticleImage(article.imageType)}
                  <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium mb-2">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand-600 transition line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3">{article.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-brand-600 text-xs font-bold mt-4 group-hover:gap-2 transition-all">
                    Read More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Articles */}
      <div>
        <h2 className="text-xl font-extrabold text-neutral-900 mb-6">All Articles</h2>
        {rest.length === 0 ? (
          <div className="text-center py-12 border rounded-2xl bg-gray-50/50">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-gray-500">No articles match your filters. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/blogs/${article.slug}`}
                className="group bg-white rounded-2xl border border-neutral-100 p-5 flex flex-col justify-between hover:shadow-lg transition duration-200"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative shadow-inner bg-neutral-50">
                  {renderArticleImage(article.imageType)}
                  <span className="absolute top-2 left-2 bg-white/90 text-brand-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-brand-100">
                    {article.category}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mb-2">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{article.excerpt}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-brand-600 text-xs font-bold mt-4 group-hover:gap-2 transition-all">
                  Read More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
