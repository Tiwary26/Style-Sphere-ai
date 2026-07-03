import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Heart,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Circle,
  X,
  PiggyBank,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

const categories = [
  'Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Dresses', 
  'Kurti', 'Saree', 'Hoodies', 'Jackets', 'Shoes', 
  'Watches', 'Bags', 'Accessories'
];

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      if (response.data.success) {
        setWishlist(response.data.data);
      }
    } catch (e) {
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category) {
      return toast.warning('Please enter an item name and category.');
    }

    setSubmitting(true);
    try {
      const response = await api.post('/wishlist', {
        name,
        category,
        price,
        imageUrl,
        websiteUrl
      });

      if (response.data.success) {
        toast.success('Added to wishlist!');
        setShowAddForm(false);
        resetForm();
        fetchWishlist();
      }
    } catch (error) {
      toast.error('Failed to add wishlist item');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Shirts');
    setPrice('');
    setImageUrl('');
    setWebsiteUrl('');
  };

  const togglePurchased = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Planned' ? 'Purchased' : 'Planned';
    try {
      const response = await api.put(`/wishlist/${id}`, {
        budgetStatus: nextStatus
      });

      if (response.data.success) {
        setWishlist(prev => prev.map(w => w._id === id ? response.data.data : w));
        toast.success(nextStatus === 'Purchased' ? 'Item marked as purchased!' : 'Returned to planned list');
      }
    } catch (e) {
      toast.error('Failed to update purchased status');
    }
  };

  const removeWish = async (id) => {
    if (!window.confirm('Remove this item from your wishlist?')) return;
    try {
      const response = await api.delete(`/wishlist/${id}`);
      if (response.data.success) {
        setWishlist(prev => prev.filter(w => w._id !== id));
        toast.success('Wishlist item removed');
      }
    } catch (e) {
      toast.error('Failed to remove item');
    }
  };

  // Calculations
  const totalBudget = wishlist.reduce((acc, curr) => acc + curr.price, 0);
  const purchasedBudget = wishlist.filter(w => w.budgetStatus === 'Purchased').reduce((acc, curr) => acc + curr.price, 0);
  const plannedBudget = totalBudget - purchasedBudget;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shopping Planner & Wishlist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track garments you plan to buy, set budgets, and map online links.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Wish Item
        </button>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Wishlist Budget</span>
            <h3 className="text-2xl font-bold">${totalBudget}</h3>
          </div>
          <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Purchased Items Total</span>
            <h3 className="text-2xl font-bold text-emerald-500">${purchasedBudget}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Remaining Planned Budget</span>
            <h3 className="text-2xl font-bold text-amber-500">${plannedBudget}</h3>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Wishlist Items List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const purchased = item.budgetStatus === 'Purchased';
            return (
              <div
                key={item._id}
                className={`glass-card rounded-2xl overflow-hidden shadow-sm p-5 space-y-4 relative transition-opacity duration-200 ${
                  purchased ? 'opacity-70' : ''
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.category}</span>
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 block">${item.price}</span>
                  </div>
                  <button
                    onClick={() => removeWish(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors h-fit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs font-semibold">
                  <button
                    onClick={() => togglePurchased(item._id, item.budgetStatus)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      purchased 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    {purchased ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    <span>{purchased ? 'Purchased' : 'Mark Purchased'}</span>
                  </button>

                  {item.websiteUrl && (
                    <a
                      href={item.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-500 hover:underline"
                    >
                      Buy Online <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Heart className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-pulse" />
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Wishlist is empty</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Keep track of clothes you want to purchase and plan your fashion budget.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20"
          >
            Add Wish Item
          </button>
        </div>
      )}

      {/* Add Wishlist Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 glass-card rounded-3xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Add Wish Item
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Designer Leather Boot"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Estimated Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99"
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Image Link (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Website Shopping URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://store.brand.com/item..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                Add Wish Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
