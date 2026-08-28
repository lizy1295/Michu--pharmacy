'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticleById, Article } from '@/lib/api/articles';
import { getProductById, Product } from '@/lib/api/products';
import { useCart } from '@/context/CartContext';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticlePageProps) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const loadArticleAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Article | null = null;
        try {
          data = await getArticleById(Number(resolvedParams.id));
        } catch {
          // Fallback to local Amharic article list
          data = null;
        }

        if (!data) {
          const localMatch = [
            {
              id: 1,
              title: 'ስለ የደም ግፊት (Hypertension) መንስኤዎች፣ ምልክቶች እና መከላከያ መንገዶች',
              slug: 'understanding-hypertension-amharic',
              excerpt: 'የደም ግፊት በኢትዮጵያ ውስጥ በስፋት ከሚታዩ የጤና እክሎች አንዱ ነው። የደም ግፊት ምልክቶች፣ የአመጋገብ ስርዓት እና የሚቹ ፋርማሲ የሚያቀርባቸውን ተገቢ መድኃኒቶች ይወቁ።',
              content: `
                <p>የደም ግፊት ማለት ደም በደም ሥሮቻችን ግድግዳ ላይ የሚያሳድረው ግፊት ከመደበኛው መጠን በላይ ሲጨምር የሚከሰት የጤና እክል ነው። ያልታከመ የደም ግፊት ለልብ ድካም፣ ለስትሮክ እና ለኩላሊት ህመም ሊያጋልጥ ይችላል።</p>
                <h3 class="font-bold text-lg text-slate-900 mt-4 mb-2">ዋና ዋና ምልክቶች</h3>
                <ul class="list-disc list-inside space-y-1">
                  <li>ከፍተኛ የራስ ምታት (በተለይ በማለዳ ሰዓት)</li>
                  <li>የእይታ መደብዘዝ ወይም የማዞር ስሜት</li>
                  <li>የልብ ምት መጨመር እና የትንፋሽ መቆራረጥ</li>
                  <li>የድካም እና የድብታ ስሜት መሰማት</li>
                </ul>
                <h3 class="font-bold text-lg text-slate-900 mt-4 mb-2">በቤት ውስጥ የሚደረጉ ጥንቃቄዎች</h3>
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
                <p>ዕለታዊ የምግብ ስርዓታችን ሁሉንም አስፈላጊ ንጥረ-ነገሮች ላያሟላ ይችላል። ጥራት ያላቸው የቫይታሚን እና ሚነራል ማሟያዎች የሰውነታችንን የበሽታ መከላከያ አቅም ያጠናክራሉ።</p>
                <h3 class="font-bold text-lg text-slate-900 mt-4 mb-2">ለቤተሰብ አስፈላጊ የሆኑ ቫይታሚኖች</h3>
                <ul class="list-disc list-inside space-y-1">
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
                <p>የስኳር ህመም ያለባቸው ወገኖች የታዘዘላቸውን መድኃኒት በሰዓቱ በመውሰድ፣ ተገቢውን የአመጋገብ ስርዓት በመከተል እና ስኳራቸውን በመለካት ጤናማ ህይወት መምራት ይችላሉ።</p>
                <h3 class="font-bold text-lg text-slate-900 mt-4 mb-2">የኢንሱሊን ማከማቻ ደንብ</h3>
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
          ].find((a) => a.id === Number(resolvedParams.id));

          if (localMatch) {
            data = localMatch as any;
          }
        }

        setArticle(data);

        if (data && data.relatedProductIds && data.relatedProductIds.length > 0) {
          const prods = await Promise.all(
            data.relatedProductIds.map((pid) =>
              getProductById(pid).catch(() => null)
            )
          );
          setRelatedProducts(prods.filter(Boolean) as Product[]);
        }
      } catch (err: any) {
        console.error('Failed to load article:', err);
        setError(err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    loadArticleAndProducts();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500 mt-4 animate-pulse">Loading health article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Article Not Found</h1>
        <p className="text-sm text-gray-500 mt-2">{error || "The article you're looking for does not exist."}</p>
        <Link href="/blogs" className="mt-6 inline-block rounded-full bg-brand-600 text-white font-bold px-6 py-2.5 text-sm hover:bg-brand-700 transition">
          Back to Health Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-slate-800 animate-in fade-in">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/blogs" className="hover:text-brand-600">Health Blog</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-xs">{article.title}</span>
        </nav>

        {/* Article Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-extrabold uppercase tracking-wider border border-brand-100">
              {article.category}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Published on {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{article.author}</p>
              <p className="text-[11px] font-medium text-slate-400">Verified Pharmacist & Health Contributor</p>
            </div>
          </div>

          {/* Article Excerpt Banner */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-slate-700 text-sm font-medium italic leading-relaxed">
            &ldquo;{article.excerpt}&rdquo;
          </div>

          {/* Article Body HTML Content */}
          <div
            className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-sm sm:text-base pt-4 space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Topic Tags:</span>
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Recommended Healthcare Products</h2>
                <p className="text-xs text-slate-500 mt-0.5">Products related to this medical article available in our inventory</p>
              </div>
              <Link href="/products" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                Browse Catalog &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="w-full h-32 rounded-xl bg-white flex items-center justify-center text-brand-600 mb-3 border border-slate-100 shadow-inner">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{prod.category || 'Medicine'}</span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">{prod.name}</h4>
                    <p className="text-xs font-extrabold text-emerald-600 mt-2">{Number(prod.price).toFixed(2)} ETB</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <Link href={`/products/${prod.id}`} className="text-xs font-bold text-slate-600 hover:text-brand-600">
                      Details
                    </Link>
                    <button
                      onClick={() => {
                        addToCart({
                          id: String(prod.id),
                          name: prod.name,
                          price: Number(prod.price),
                          prescriptionRequired: prod.prescriptionRequired,
                        });
                        triggerToast(`Added ${prod.name} to cart`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
