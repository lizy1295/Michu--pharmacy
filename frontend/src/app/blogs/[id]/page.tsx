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
        const data = await getArticleById(Number(resolvedParams.id));
        setArticle(data);

        if (data.relatedProductIds && data.relatedProductIds.length > 0) {
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
