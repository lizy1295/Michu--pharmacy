'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getArticles, Article } from '@/lib/api/articles';

const AMHARIC_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'ስለ የደም ግፊት (Hypertension) መንስኤዎች፣ ምልክቶች እና መከላከያ መንገዶች',
    slug: 'understanding-hypertension-amharic',
    excerpt: 'የደም ግፊት በኢትዮጵያ ውስጥ በስፋት ከሚታዩ የጤና እክሎች አንዱ ነው። የደም ግፊት ምልክቶች፣ የአመጋገብ ስርዓት እና የሚቹ ፋርማሲ የሚያቀርባቸውን ተገቢ መድኃኒቶች ይወቁ።',
    content: `
      <h2>የደም ግፊት ምንድን ነው?</h2>
      <p>የደም ግፊት ማለት ደም በደም ሥሮቻችን ግድግዳ ላይ የሚያሳድረው ግፊት ከመደበኛው መጠን በላይ ሲጨምር የሚከሰት የጤና እክል ነው። ያልታከመ የደም ግፊት ለልብ ድካም፣ ለስትሮክ እና ለኩላሊት ህመም ሊያጋልጥ ይችላል።</p>
      
      <h3>ዋና ዋና ምልክቶች</h3>
      <ul>
        <li>ከፍተኛ የራስ ምታት (በተለይ በማለዳ ሰዓት)</li>
        <li>የእይታ መደብዘዝ ወይም የማዞር ስሜት</li>
        <li>የልብ ምት መጨመር እና የትንፋሽ መቆራረጥ</li>
        <li>የድካም እና የድብታ ስሜት መሰማት</li>
      </ul>

      <h3>በቤት ውስጥ የሚደረጉ ጥንቃቄዎች</h3>
      <p>የጨው አጠቃቀምን መቀነስ፣ አትክልት እና ፍራፍሬዎችን አዘውትሮ መመገብ፣ የአካል ብቃት እንቅስቃሴ ማድረግ እና የደም ግፊት መለኪያ መሳሪያ በቤት ውስጥ በመያዝ በየጊዜው መለካት ይመከራል።</p>
    `,
    featuredImage: 'article-health',
    category: 'የጤና ምክሮች (Health Tips)',
    tags: ['የደም ግፊት', 'hypertension', 'የልብ ጤና', 'cardiovascular'],
    status: 'published',
    author: 'ዶ/ር ሰሎሞን በቀለ (ፋርማሲስት)',
    relatedProductIds: [8, 14, 1, 2],
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 2,
    title: 'የቫይታሚን እና የንጥረ-ምግብ ማሟያዎች ለቤተሰብ ጤና ያለው ወሳኝ ጠቀሜታ',
    slug: 'importance-of-vitamins-amharic',
    excerpt: 'ለሰውነታችን በሽታ የመከላከል አቅም፣ ለአጥንት ጥንካሬ እና ለልጆች ጤናማ እድገት የሚያስፈልጉ ወሳኝ መልቲ-ቫይታሚኖች እና ትክክለኛ አጠቃቀማቸው።',
    content: `
      <h2>የቫይታሚን ጠቀሜታ</h2>
      <p>ዕለታዊ የምግብ ስርዓታችን ሁሉንም አስፈላጊ ንጥረ-ነገሮች ላያሟላ ይችላል። ጥራት ያላቸው የቫይታሚን እና ሚነራል ማሟያዎች የሰውነታችንን የበሽታ መከላከያ አቅም ያጠናክራሉ።</p>
      
      <h3>ለቤተሰብ አስፈላጊ የሆኑ ቫይታሚኖች</h3>
      <ul>
        <li><strong>ቫይታሚን ዲ እና ካልሲየም፡</strong> ለአጥንት እና ለጥርስ ጥንካሬ</li>
        <li><strong>ቫይታሚን ሲ እና ዚንክ፡</strong> ጉንፋን እና የመተንፈሻ አካል ኢንፌክሽኖችን ለመከላከል</li>
        <li><strong>ኦሜጋ-3 እና የዓሳ ዘይት፡</strong> ለአእምሮ ንቃት እና ለልብ ጤንነት</li>
      </ul>
    `,
    featuredImage: 'article-vitamins',
    category: 'ስነ-ምግብ (Nutrition)',
    tags: ['ቫይታሚን', 'vitamins', 'የበሽታ መከላከያ', 'supplements'],
    status: 'published',
    author: 'ቤተልሔም ታደሰ (ክሊኒካል ፋርማሲስት)',
    relatedProductIds: [16, 17, 19, 27],
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 3,
    title: 'የስኳር በሽታ (Diabetes) አያያዝ እና በቤት ውስጥ የሚደረጉ ጥንቃቄዎች',
    slug: 'diabetes-management-amharic',
    excerpt: 'የኢንሱሊን አያያዝ፣ የደም ስኳር መለኪያ ግሉኮሜትር አጠቃቀም እና የስኳር መጠንን በቁጥጥር ስር ለማዋል የሚረዱ የፋርማሲ ባለሙያ ምክሮች።',
    content: `
      <h2>የስኳር በሽታን በዘመናዊ መንገድ መቆጣጠር</h2>
      <p>የስኳር ህመም ያለባቸው ወገኖች የታዘዘላቸውን መድኃኒት በሰዓቱ በመውሰድ፣ ተገቢውን የአመጋገብ ስርዓት በመከተል እና ስኳራቸውን በመለካት ጤናማ ህይወት መምራት ይችላሉ።</p>
      
      <h3>የኢንሱሊን ማከማቻ ደንብ</h3>
      <p>ኢንሱሊን ከ 2°C እስከ 8°C ባለው ቅዝቃዜ ውስጥ መቀመጥ አለበት። የሚቹ ፋርማሲ በማቀዝቀዣ የተጠበቁ መድኃኒቶችን በጥንቃቄ ያቀርባል።</p>
    `,
    featuredImage: 'article-diabetes',
    category: 'ስር የሰደዱ ህመሞች (Chronic Care)',
    tags: ['የስኳር በሽታ', 'diabetes', 'ኢንሱሊን', 'metformin'],
    status: 'published',
    author: 'ዶ/ር ሰሎሞን በቀለ (ፋርማሲስት)',
    relatedProductIds: [6, 9],
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 4,
    title: 'ለቆዳ ጤንነት፣ ውበት እና ጥበቃ የሚመከሩ የፋርማሲ ምርቶች አጠቃቀም',
    slug: 'skincare-routine-amharic',
    excerpt: 'በፀሐይ እና በአቧራ ምክንያት ለሚደርስ የቆዳ መጎዳት የሚረዱ የፀሐይ መከላከያ (Sunscreen) ክሬሞች፣ የፊት ማፅጃዎች እና የቆዳ እርጥበት መጠበቂያዎች።',
    content: `
      <h2>የቆዳ እንክብካቤ መሰረታዊ ደረጃዎች</h2>
      <p>የጠራ እና ጤናማ ቆዳ እንዲኖረን የቆዳችንን አይነት (ደረቅ፣ ቅባት ወይም ድብልቅ) ማወቅ እና ተስማሚ ምርቶችን መምረጥ ያስፈልጋል።</p>
      
      <h3>3ቱ ወሳኝ ደረጃዎች</h3>
      <ol>
        <li><strong>ማፅዳት (Cleanse)፡</strong> የፊትን ቆዳ በቀስታ የሚያፀዱ ጄሎች</li>
        <li><strong>እርጥበት መስጠት (Moisturize)፡</strong> ሴራሚድ እና ሃያሉሮኒክ አሲድ ያላቸው ክሬሞች</li>
        <li><strong>መከላከል (Protect)፡</strong> በየቀኑ SPF 50+ የፀሐይ መከላከያ መቀባት</li>
      </ol>
    `,
    featuredImage: 'article-skincare',
    category: 'የቆዳ እና ውበት (Skincare)',
    tags: ['የቆዳ ውበት', 'skincare', 'ፀሐይ መከላከያ', 'sunscreen'],
    status: 'published',
    author: 'ሄሊና ወርቁ (የውበት እና የቆዳ አማካሪ)',
    relatedProductIds: [29, 31, 34, 40],
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 5,
    title: 'መድኃኒቶችን በቤት ውስጥ በአግባቡ ስለመያዝ እና የማስቀመጫ ደንቦች',
    slug: 'safe-medication-storage-amharic',
    excerpt: 'መድኃኒቶች ጥራታቸውን እና ፈዋሽነታቸውን እንዳያጡ የት መቀመጥ አለባቸው? ከልጆች እይታ ርቆ ስለማስቀመጥ እና የቀን ገደብን ስለመቆጣጠር።',
    content: `
      <h2>የመድኃኒት አያያዝ እና ደህንነት</h2>
      <p>መድኃኒቶችን በቀጥታ የፀሐይ ብርሃን፣ እርጥበት ወይም ሙቀት ባለበት ቦታ (ለምሳሌ በመታጠቢያ ቤት ውስጥ) ማስቀመጥ ፈዋሽነታቸውን ሊያሳጣው ይችላል።</p>
      
      <h3>አስፈላጊ ደንቦች</h3>
      <ul>
        <li>መድኃኒቶችን ከህፃናት እጅ በማይደርስበት ከፍ ያለ ቦታ ወይም መቆለፊያ ባለው ሳጥን ውስጥ ያስቀምጡ።</li>
        <li>የማብቂያ ቀናቸውን (Expiry Date) በየጊዜው ያረጋግጡ።</li>
        <li>በፈሳሽ መልክ ያሉትን መድኃኒቶች ከመውሰድዎ በፊት በደንብ ያናውጡ።</li>
      </ul>
    `,
    featuredImage: 'article-safety',
    category: 'የመድኃኒት ደህንነት (Safety)',
    tags: ['የመድኃኒት አያያዝ', 'safety', 'የፋርማሲ ህግ'],
    status: 'published',
    author: 'የሚቹ ፋርማሲ የህክምና ቡድን',
    relatedProductIds: [1, 2, 3],
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 6,
    title: 'የ"የኔ ካርድ" (Yene Card) የፋርማሲ የታማኝነት ነጥቦች እና የቅናሽ ኩፖኖች',
    slug: 'yene-card-loyalty-amharic',
    excerpt: 'በሚቹ ፋርማሲ በገዙ ቁጥር ነጥብ በመሰብሰብ ለቀጣይ ግዢዎችዎ የ 15% ቅናሽ ኩፖን እና ልዩ ሽልማቶችን የሚያገኙበት የ loyalty ፕሮግራም መመሪያ።',
    content: `
      <h2>የየኔ ካርድ የታማኝነት ፕሮግራም</h2>
      <p>የሚቹ ፋርማሲ ቋሚ ደንበኞቹን ለማመስገን ያዘጋጀው የሽልማት ካርድ ነው። በቴሌብር፣ በሲቢኢ ወይም በጥሬ ገንዘብ ሲገዙ ነጥብ ይቆጠርልዎታል።</p>
      
      <h3>ጥቅሞቹ</h3>
      <ul>
        <li>በየግዢዎ 5% የሚመለስ የነጥብ ቁጠባ</li>
        <li>ነጻ የደም ግፊት እና የክብደት መለኪያ አገልግሎት በሁሉም ቅርንጫፎቻችን</li>
        <li>በልደትዎ እና በበዓላት ወቅት የሚሰጡ ልዩ የዋጋ ቅናሾች</li>
      </ul>
    `,
    featuredImage: 'article-loyalty',
    category: 'የሚቹ ታማኝነት (Loyalty)',
    tags: ['የኔ ካርድ', 'yene card', 'ቅናሽ', 'discounts'],
    status: 'published',
    author: 'የሚቹ ፋርማሲ የደንበኞች አገልግሎት',
    relatedProductIds: [25, 26],
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
  },
];

const renderArticleImage = (type: string) => {
  switch (type) {
    case 'article-health':
      return <div className="w-full h-full bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>;
    case 'article-vitamins':
      return <div className="w-full h-full bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    case 'article-diabetes':
      return <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" /></svg></div>;
    case 'article-skincare':
      return <div className="w-full h-full bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
    case 'article-safety':
      return <div className="w-full h-full bg-red-50 rounded-2xl flex items-center justify-center text-red-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>;
    case 'article-loyalty':
      return <div className="w-full h-full bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    default:
      return <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1" /></svg></div>;
  }
};

export default function BlogsPage() {
  const [articles, setArticles] = useState<Article[]>(AMHARIC_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  const filtered = articles.filter((a) => {
    if (selectedCategory && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-sans">
      {/* Header section in Amharic */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 shadow-xs">
          <span>🇪🇹</span>
          <span>የሚቹ ፋርማሲ የጤና እና የመድኃኒት መረጃዎች • Health Blog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          የጤና እና የህክምና መረጃ ጦማር
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          በሚቹ ፋርማሲ ክሊኒካል ባለሙያዎች የተዘጋጁ የጤና፣ የመድኃኒት አጠቃቀም እና የስነ-ምግብ ምክሮች
        </p>
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="የጤና ጽሑፎችን በስም ወይም በርዕስ ይፈልጉ... (Search articles)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 pl-10 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              !selectedCategory ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ሁሉም ዘርፎች (All)
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Articles Grid */}
      {featured.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-xl font-extrabold text-slate-900">ተለይተው የቀረቡ የጤና ጽሑፎች (Featured Articles)</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((article) => (
              <Link
                key={article.id}
                href={`/blogs/${article.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col justify-between shadow-xs"
              >
                <div className="aspect-video w-full relative">
                  {renderArticleImage(article.featuredImage)}
                  <span className="absolute top-4 left-4 bg-emerald-700 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full shadow-md">
                    {article.category}
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                      <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{article.author}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>ሙሉውን ያንብቡ (Read Full Article)</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More Articles */}
      {rest.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <h2 className="text-xl font-extrabold text-slate-900">ተጨማሪ የጤና ጽሑፎች (Recent Articles)</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/blogs/${article.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between shadow-xs"
              >
                <div className="aspect-video w-full relative">
                  {renderArticleImage(article.featuredImage)}
                  <span className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium mb-1.5">
                      {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                    <span>ሙሉ ጽሑፍ</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
