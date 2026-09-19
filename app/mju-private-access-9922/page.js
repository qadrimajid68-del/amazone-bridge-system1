"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Plus, Lock, User, LogOut, Package, ExternalLink, 
  Loader2, Sparkles, Star, Zap, Copy, Check, ArrowRight, Link as LinkIcon 
} from 'lucide-react';

export default function SecureAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    image: '', 
    link: '', 
    description: '',
    rating: '4.6', 
    reviews: '500+ ratings' 
  });

  const [amazonUrl, setAmazonUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // 🛠️ ADMIN-ONLY AFFILIATE LINK MAKER TOOL STATES
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [toolCopied, setToolCopied] = useState(false);

  const AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "majuders-20";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("maju_admin_auth");
      if (isAuth === "true") {
        setIsLoggedIn(true);
        fetchProducts();
      }
    }
  }, []);

  const executeLogin = (user, pass) => {
    const cleanUser = user?.trim();
    const cleanPass = pass?.trim();

    if ((cleanUser === "maju_trader" && cleanPass === "maju@2026#") || (cleanUser === "admin" && cleanPass === "admin123")) {
      sessionStorage.setItem("maju_admin_auth", "true");
      setIsLoggedIn(true);
      setLoginError("");
      fetchProducts();
    } else {
      setLoginError("Invalid Credentials!");
    }
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    executeLogin(usernameInput, passwordInput);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("maju_admin_auth");
    setIsLoggedIn(false);
  };

  // ⚡ 1-Click Amazon Auto-Fetch (Supports amzn.to short links)
  const handleAmazonFetch = async () => {
    if (!amazonUrl) return alert("Pehle Amazon link paste karein!");
    setIsFetching(true);

    try {
      const res = await axios.post('/api/amazon', { url: amazonUrl });
      
      if (res.data) {
        setFormData({
          title: res.data.title || '',
          price: res.data.price || '',
          image: res.data.imageUrl || '',
          description: res.data.description || '',
          link: res.data.affiliateUrl || amazonUrl,
          rating: res.data.rating || '4.6',
          reviews: res.data.reviews || '500+ ratings'
        });
      }
    } catch (err) {
      alert(err.response?.data?.error || "Fetch nahi ho saka. Link check karein.");
    } finally {
      setIsFetching(false);
    }
  };

  // 🛠️ ADMIN TOOL: Generate Affiliate Link Instantly
  const handleGenerateToolLink = (e) => {
    e.preventDefault();
    if (!toolInput) return;

    const match = toolInput.match(/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i);
    let finalUrl = '';
    if (match) {
      finalUrl = `https://www.amazon.com/dp/${match[1]}?tag=${AFFILIATE_TAG}`;
    } else {
      const clean = toolInput.split('?')[0];
      finalUrl = `${clean}?tag=${AFFILIATE_TAG}`;
    }

    setToolOutput(finalUrl);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_SHEETY_URL);
      setProducts(res.data.sheet1 || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Pehle product fetch karein!");

    setActionLoading('adding');
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_SHEETY_URL, { sheet1: formData });
      if (response.data.sheet1) {
        setProducts([...products, response.data.sheet1]);
      } else {
        fetchProducts();
      }
      setFormData({ title: '', price: '', image: '', link: '', description: '', rating: '4.6', reviews: '500+ ratings' });
      setAmazonUrl('');
      alert("✅ Product Successfully Live Store Par Add Ho Gaya!");
    } catch (err) {
      alert("Save failed. Sheety check karein.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure?")) return;
    const original = [...products];
    setProducts(products.filter(p => p.id !== id));
    setActionLoading(`deleting-${id}`);

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SHEETY_URL}/${id}`);
    } catch (err) {
      setProducts(original);
      alert("Delete failed!");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm border-t-[6px] border-[#febd69]">
          <div className="text-center mb-6">
            <h1 className="text-xl font-black italic text-slate-900 uppercase">
              MAJU<span className="text-orange-600">TRADER</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin Security Portal</p>
          </div>

          {loginError && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded text-center">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleManualLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-800"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-800"
              required
            />
            <button type="submit" className="w-full bg-[#f0c14b] border border-[#a88734] py-2.5 rounded text-xs font-black shadow hover:bg-[#f7ca00] uppercase tracking-widest transition-all">
              Verify Identity
            </button>
          </form>

          <button
            onClick={() => executeLogin("admin", "admin123")}
            type="button"
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5"
          >
            <Zap size={13} className="text-orange-500 fill-orange-500" />
            1-Click Fast Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20 font-sans">
      <nav className="bg-[#232f3e] h-12 flex items-center shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Package size={18} className="text-[#febd69]" />
            <span className="text-xs font-black uppercase tracking-widest">Inventory Manager</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[10px] font-black text-gray-300 hover:text-white border border-gray-600 px-3 py-1 rounded transition flex items-center gap-1 uppercase"
          >
            <LogOut size={12}/> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">

        {/* 🛠️ 1. PRIVATE AFFILIATE LINK MAKER (Sirf Admin Ke Liye) */}
        <div className="bg-[#131921] p-4 rounded-lg border border-gray-700 shadow-md text-white">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={16} className="text-[#febd69]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#febd69]">
              Private Affiliate Link Maker
            </h3>
          </div>
          <p className="text-[11px] text-gray-300 mb-3">
            Kisi bhi Amazon product ka link dalein aur apna Commission Link bana kar WhatsApp ya clients ko share karein:
          </p>

          <form onSubmit={handleGenerateToolLink} className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Paste any Amazon link (e.g. https://amzn.to/47Y2hVI or amazon.com/dp/...)" 
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              className="flex-1 bg-white text-slate-800 px-3 py-2 rounded text-xs outline-none"
            />
            <button 
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] text-slate-900 px-5 py-2 rounded text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
            >
              Generate Link <ArrowRight size={14} />
            </button>
          </form>

          {toolOutput && (
            <div className="mt-3 bg-emerald-900/90 border border-emerald-500 p-2.5 rounded text-xs flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-mono text-emerald-200">{toolOutput}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(toolOutput);
                  setToolCopied(true);
                  setTimeout(() => setToolCopied(false), 2000);
                }}
                className="bg-white text-emerald-900 px-3 py-1 rounded font-bold text-[10px] uppercase flex items-center gap-1 flex-shrink-0"
              >
                {toolCopied ? <Check size={12} /> : <Copy size={12} />}
                {toolCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>

        {/* ⚡ 2. AUTO-FETCH & ADD TO STORE (Supports amzn.to short links) */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500 animate-bounce" />
            1-Click Amazon Auto-Pilot (Supports Short & Long Links)
          </h2>

          <div className="bg-orange-50/50 border border-orange-200 p-4 rounded mb-5 flex flex-col md:flex-row gap-3 items-end w-full">
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block">
                Paste Amazon Product Link (Short Link https://amzn.to/... bhi chalega):
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded outline-none focus:border-orange-500 bg-white text-slate-800" 
                value={amazonUrl} 
                onChange={(e) => setAmazonUrl(e.target.value)} 
                placeholder="https://amzn.to/47Y2hVI ya https://amazon.com/dp/..." 
              />
            </div>
            <button 
              type="button"
              onClick={handleAmazonFetch}
              disabled={isFetching}
              className="w-full md:w-auto bg-[#232f3e] text-[#febd69] px-6 py-2 h-[38px] rounded text-xs font-black hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isFetching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isFetching ? 'Fetching Data...' : 'Auto Fetch Details'}
            </button>
          </div>

          {/* LIVE IMAGE PREVIEW */}
          {formData.image && (
            <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded flex items-center gap-4">
              <div className="w-20 h-20 bg-white border rounded p-1 flex items-center justify-center flex-shrink-0">
                <img src={formData.image} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-xs">
                <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1">
                  ✓ Real Image Connected
                </span>
                <p className="font-bold text-slate-800 line-clamp-1">{formData.title}</p>
                <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{formData.description}</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase">Product Title</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 font-medium" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Product Title..." />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase">Product Description</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 text-xs" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Key features..." />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">Price ($ USD)</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required placeholder="e.g. 19.99" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase">Rating & Reviews</label>
              <div className="flex gap-2">
                <input className="w-1/2 border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 font-bold" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} placeholder="4.6" />
                <input className="w-1/2 border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800" value={formData.reviews} onChange={(e) => setFormData({...formData, reviews: e.target.value})} placeholder="1,000+ ratings" />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase">Image Link</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 text-xs" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required placeholder="Image link..." />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase">Affiliate Link</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none bg-gray-50 text-slate-800 text-xs" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required placeholder="Affiliate link..." />
            </div>
            
            <button 
              disabled={actionLoading === 'adding' || !formData.title} 
              className="md:col-span-2 bg-[#f0c14b] border border-[#a88734] font-black text-xs py-3 rounded shadow hover:bg-[#f7ca00] transition-all flex justify-center items-center gap-2 disabled:opacity-50 uppercase tracking-widest cursor-pointer"
            >
              {actionLoading === 'adding' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Save to Live Store
            </button>
          </form>
        </div>

        {/* PRODUCTS LIST */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Live Store Products ({products.length})</span>
            {loading && <Loader2 size={14} className="animate-spin text-orange-500" />}
          </div>
          
          <div className="divide-y divide-gray-100">
            {products.length === 0 && !loading && <p className="p-10 text-center text-gray-400 text-xs italic">Store is empty. Add your first product above!</p>}
            
            {products.map(p => (
              <div key={p.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-white rounded border flex-shrink-0 flex items-center justify-center p-1">
                    <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-800 truncate max-w-[150px] sm:max-w-xs leading-none mb-1">{p.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-green-600">${p.price}</span>
                      <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5">
                        <Star size={9} fill="#f59e0b" /> {p.rating || '4.6'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a href={p.link} target="_blank" className="text-blue-400 hover:text-blue-600 p-2"><ExternalLink size={14} /></a>
                  <button 
                    onClick={() => deleteProduct(p.id)} 
                    disabled={actionLoading !== null}
                    className="text-red-300 hover:text-red-600 p-2 transition-colors disabled:opacity-30"
                  >
                    {actionLoading === `deleting-${p.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}