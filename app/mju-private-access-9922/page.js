"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Lock, User, LogOut, Package, ExternalLink, Loader2 } from 'lucide-react';

export default function SecureAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Initial Fetch Loading
  const [actionLoading, setActionLoading] = useState(null); // specific action (Add/Delete) loading
  const [formData, setFormData] = useState({ title: '', price: '', image: '', link: '' });

  // --- LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Security: Variables .env se match honi chahiye
    const envUser = process.env.NEXT_PUBLIC_ADMIN_USER || "maju_trader";
    const envPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "maju@2026#";

    if (credentials.user === envUser && credentials.pass === envPass) {
      setIsLoggedIn(true);
      fetchProducts();
    } else {
      alert("Invalid Security Credentials! Access Denied.");
    }
  };

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_SHEETY_URL);
      setProducts(res.data.sheet1 || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FAST ADD PRODUCT ---
  const addProduct = async (e) => {
    e.preventDefault();
    setActionLoading('adding');
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_SHEETY_URL, { sheet1: formData });
      // UI update without full refresh
      if (response.data.sheet1) {
        setProducts([...products, response.data.sheet1]);
      } else {
        fetchProducts();
      }
      setFormData({ title: '', price: '', image: '', link: '' });
      alert("Product added successfully!");
    } catch (err) {
      alert("Failed to add product. Check Sheety connection.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- ULTRA-FAST OPTIMISTIC DELETE ---
  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to remove this product?")) return;

    // 1. Optimistic Update: Fauran UI se hata do
    const originalProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    setActionLoading(`deleting-${id}`);

    try {
      // 2. Background mein API call
      await axios.delete(`${process.env.NEXT_PUBLIC_SHEETY_URL}/${id}`);
      console.log("Deleted from DB");
    } catch (err) {
      // 3. Agar fail ho jaye toh wapis le aao
      setProducts(originalProducts);
      alert("Delete failed! Server might be slow. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-2xl w-full max-w-sm border-t-[6px] border-[#febd69]">
          <div className="text-center mb-8">
            <h1 className="text-xl font-black tracking-tighter italic text-slate-900 uppercase">
              MAJU<span className="text-orange-600">TRADER</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin Security Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 outline-none text-sm font-medium"
                onChange={(e) => setCredentials({...credentials, user: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="password" 
                placeholder="Security Key" 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 outline-none text-sm font-medium"
                onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
                required
              />
            </div>
            <button className="w-full bg-[#f0c14b] border border-[#a88734] py-2 rounded text-xs font-black shadow-sm hover:bg-[#f7ca00] transition-all uppercase tracking-widest">
              Verify Identity
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-20">
      {/* Mini Admin Navbar */}
      <nav className="bg-[#232f3e] h-12 flex items-center shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Package size={18} className="text-[#febd69]" />
            <span className="text-xs font-black uppercase tracking-widest">Inventory Manager</span>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)} 
            className="text-[10px] font-black text-gray-300 hover:text-white border border-gray-600 px-3 py-1 rounded transition flex items-center gap-1 uppercase"
          >
            <LogOut size={12}/> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* ADD PRODUCT SECTION */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Add New Amazon Deal
          </h2>
          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Product Name</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none focus:border-orange-500 bg-gray-50" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Wireless Mouse" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Price ($)</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none focus:border-orange-500 bg-gray-50" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required placeholder="e.g. 29.99" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Amazon Image URL</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none focus:border-orange-500 bg-gray-50" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required placeholder="Paste .jpg or .png link" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Amazon Affiliate Link</label>
              <input className="w-full border px-3 py-2 text-sm rounded outline-none focus:border-orange-500 bg-gray-50" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required placeholder="Paste full amazon link" />
            </div>
            <button 
              disabled={actionLoading === 'adding'} 
              className="md:col-span-2 bg-[#f0c14b] border border-[#a88734] font-black text-xs py-3 rounded shadow hover:bg-[#f7ca00] transition-all flex justify-center items-center gap-2 disabled:opacity-50 uppercase tracking-widest"
            >
              {actionLoading === 'adding' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Save to Live Store
            </button>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Live Products ({products.length})</span>
            {loading && <Loader2 size={14} className="animate-spin text-orange-500" />}
          </div>
          
          <div className="divide-y divide-gray-100">
            {products.length === 0 && !loading && <p className="p-10 text-center text-gray-400 text-xs italic">Store is empty. Add your first product above!</p>}
            
            {products.map(p => (
              <div key={p.id} className={`p-3 flex justify-between items-center transition-all ${actionLoading === `deleting-${p.id}` ? 'opacity-30' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-gray-50 rounded border flex-shrink-0 flex items-center justify-center p-1">
                    <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-800 truncate max-w-[150px] sm:max-w-xs leading-none mb-1">{p.title}</p>
                    <p className="text-[10px] font-black text-green-600">${p.price}</p>
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