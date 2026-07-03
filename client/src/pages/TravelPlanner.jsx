import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Luggage,
  Calendar,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  Compass,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const TravelPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weather, setWeather] = useState('Moderate');
  const [occasion, setOccasion] = useState('Vacation');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/travel');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (e) {
      toast.error('Failed to load travel plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      return toast.warning('Please enter destination, start date, and end date.');
    }

    setGenerating(true);
    try {
      const response = await api.post('/travel', {
        destination,
        startDate,
        endDate,
        weather,
        occasion
      });

      if (response.data.success) {
        toast.success('Travel packing list generated successfully!');
        setShowAddForm(false);
        resetForm();
        fetchPlans();
      }
    } catch (error) {
      toast.error('Failed to generate travel packing list');
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setDestination('');
    setStartDate('');
    setEndDate('');
    setWeather('Moderate');
    setOccasion('Vacation');
  };

  const toggleItemPack = async (planId, itemId) => {
    try {
      const response = await api.put(`/travel/${planId}/item/${itemId}/toggle-pack`);
      if (response.data.success) {
        setPlans(prev => prev.map(p => p._id === planId ? response.data.data : p));
      }
    } catch (e) {
      toast.error('Failed to update packed status');
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this travel checklist plan?')) return;
    try {
      const response = await api.delete(`/travel/${id}`);
      if (response.data.success) {
        setPlans(prev => prev.filter(p => p._id !== id));
        toast.success('Travel plan deleted');
      }
    } catch (e) {
      toast.error('Failed to remove travel plan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Travel Packing Assistant</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Input travel details to generate an itemized clothing packing checklist from your wardrobe.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* active plans lists */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      ) : plans.length > 0 ? (
        <div className="space-y-8">
          {plans.map((plan) => {
            const packedCount = plan.items.filter(i => i.packed).length;
            const totalCount = plan.items.length;
            const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

            return (
              <div key={plan._id} className="p-8 glass-card rounded-3xl space-y-6 relative overflow-hidden">
                {/* Header detail */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-bold text-brand-500">Active Packing List</span>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-500" /> {plan.destination}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()} ({plan.days} Days) • {plan.occasion} trip
                    </p>
                  </div>

                  {/* Packing Progress */}
                  <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Packing Progress</span>
                      <span>{packedCount}/{totalCount} packed ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => deletePlan(plan._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors md:absolute md:top-6 md:right-6"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Packing Checklist items list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  {plan.items.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => toggleItemPack(plan._id, item._id)}
                      className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:shadow-sm cursor-pointer select-none transition-shadow ${
                        item.packed ? 'opacity-60 line-through' : ''
                      }`}
                    >
                      <button className="text-brand-500">
                        {item.packed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>

                      {item.clothe ? (
                        <div className="flex gap-2 min-w-0 flex-1">
                          <img src={item.clothe.imageUrls[0]} alt={item.clothe.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 dark:border-slate-850" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold truncate leading-tight">{item.clothe.name}</h4>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.category}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{item.customItemName}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.category}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Luggage className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-bounce" />
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">No trips planned</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Create a travel packing planner to automatically prepare a vacation checklist.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20"
          >
            Plan New Trip
          </button>
        </div>
      )}

      {/* Plan New Trip Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 glass-card rounded-3xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-500" /> Plan New Trip
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Paris, France"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Trip Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none"
                  >
                    <option value="Vacation">Vacation</option>
                    <option value="Business">Business Trip</option>
                    <option value="Wedding">Wedding Event</option>
                    <option value="Adventure">Adventure/Trek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Weather Forecast</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none"
                  >
                    <option value="Hot">Sunny & Hot</option>
                    <option value="Cold">Chilly & Cold</option>
                    <option value="Rainy">Wet & Rainy</option>
                    <option value="Moderate">Moderate / Mild</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4" />
                {generating ? 'Compiling Checklist...' : 'Generate Packing Checklist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPlanner;
