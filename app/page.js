"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Phone, ExternalLink, ShieldCheck, Star, PackageCheck, Share2, Check } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "majuders-20";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_SHEETY_URL);
      setProducts(res.data.sheet1 || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setLoading(false);
    }
  };

  const getNumericRating = (val) => {
    if (!val) return 4.5;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 4.5 : num;
  };

  // 🔗 Clean Affiliate Link Maker
  const getAffiliateLink = (p) => {
    if (p.link && p.link.includes('tag=')) return p.link;
    if (p.link) {
      const clean = p.link.split('?')[0];
      return `${clean}?tag=${AFFILIATE_TAG}`;
    }
    return `https://www.amazon.com/?tag=${AFFILIATE_TAG}`;
  };

  // 📋 1-Click Copy Affiliate Link Handler
  const handleCopyLink = (p) => {
    const link = getAffiliateLink(p);
    navigator.clipboard.writeText(link);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#131921] h-12 flex items-center shadow-lg">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-white text-lg font-bold tracking-tight">
              MAJU<span className="text-[#febd69]">TRADER</span>
            </span>
            <ShoppingCart size={16} className="text-[#febd69] mb-1" />
          </div>

          <a 
            href="tel:+923081049460" 
            className="flex items-center gap-1.5 bg-[#febd69] text-[#131921] px-3 py-1 rounded-sm text-[11px] font-extrabold hover:bg-[#f3a847] transition-all"
          >
            <Phone size={12} />
            <span className="hidden sm:inline">CALL +92 308 1049460</span>
            <span className="sm:hidden uppercase tracking-tighter">CALL NOW</span>
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-white border-b border-gray-200 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Top Amazon Deals <span className="text-orange-600 font-black">🔥</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-lg leading-snug">
              Quality products hand-picked for you. Verified links & best prices guaranteed.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500"/> Verified</span>
            <span className="flex items-center gap-1"><PackageCheck size={14} className="text-blue-500"/> Quality</span>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Store...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const numericRating = getNumericRating(product.rating);
              const affLink = getAffiliateLink(product);

              return (
                <div 
                  key={product.id} 
                  className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-square p-4 bg-white flex items-center justify-center overflow-hidden border-b border-gray-50">
                    <img 
                      src={product.image || 'https://images-na.ssl-images-amazon.com/images/I/41-e5UA3mEL.jpg'} 
                      alt={product.title || 'Product'} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://images-na.ssl-images-amazon.com/images/I/41-e5UA3mEL.jpg";
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm">
                      DEAL
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-slate-900 font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-1.5 group-hover:text-blue-700 transition-colors">
                      {product.title || 'Amazon Deal Product'}
                    </h3>

                    {product.description && (
                      <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed mb-2.5 font-normal">
                        {product.description}
                      </p>
                    )}

                    {/* STARS */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < Math.floor(numericRating) ? "#ffa41c" : "none"} 
                            className="text-[#ffa41c]" 
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-800 font-bold">
                        {numericRating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium hover:underline cursor-pointer">
                        ({product.reviews || '500+'})
                      </span>
                    </div>

                    {/* PRICE & BUTTONS */}
                    <div className="mt-auto pt-2 space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-slate-500">$</span>
                        <span className="text-2xl font-black text-slate-900 leading-none">
                          {product.price ? product.price.replace(/[^0-9.]/g, '') : '19.99'}
                        </span>
                      </div>
                      
                      {/* Button 1: Buy on Amazon */}
                      <a 
                        href={affLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold py-2.5 rounded-full shadow-sm border border-[#fcd200] active:scale-95 transition-all"
                      >
                        Shop on Amazon <ExternalLink size={13} />
                      </a>

                      {/* Button 2: 📲 Share / Copy Affiliate Link */}
                      <button
                        onClick={() => handleCopyLink(product)}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-2 rounded-full border border-gray-200 active:scale-95 transition-all"
                      >
                        {copiedId === product.id ? (
                          <>
                            <Check size={13} className="text-green-600" />
                            <span className="text-green-600 font-bold">Affiliate Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={13} className="text-slate-500" />
                            <span>Share / Copy Affiliate Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold italic">Checking warehouse for new stock...</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#232f3e] text-white pt-10 pb-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 border-b border-gray-700 pb-10 text-center md:text-left">
            <div className="space-y-3">
              <span className="text-lg font-bold tracking-tight">
                MAJU<span className="text-[#febd69]">TRADER</span>
              </span>
              <p className="text-gray-300 text-xs leading-relaxed max-w-xs mx-auto md:mx-0 font-medium italic">
                Your direct bridge to the world's best marketplace. High quality items, sourced specifically for our customers.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[#febd69] text-[10px] font-black uppercase tracking-[3px]">Support</h4>
              <p className="text-xl font-bold">+92 308 1049460</p>
              <div className="flex justify-center md:justify-start gap-3 mt-2">
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded">WHATSAPP</span>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded">24/7 SUPPORT</span>
              </div>
            </div>

            <div className="bg-[#131921] p-4 rounded border border-gray-700">
              <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[2px] mb-2">Tech Partner</h4>
              <p className="text-white font-bold text-[11px]">M. Mubashar Ameen</p>
              <p className="text-[#febd69] text-[10px]">+92 329 7766036</p>
            </div>
          </div>

          <p className="text-gray-400 text-[10px] text-center font-bold tracking-widest uppercase">
            © 2026 MAJU TRADER. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}