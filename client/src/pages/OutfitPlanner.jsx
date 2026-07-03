import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layers,
  CheckCircle,
  X,
  Dices,
  RefreshCw,
  Sun,
  Flame,
  Volume2
} from 'lucide-react';
import { toast } from 'react-toastify';

const seasons = ['Summer', 'Winter', 'Spring', 'Autumn', 'All-Season'];
const occasions = ['Casual', 'Formal', 'Party', 'Sports', 'College', 'Wedding', 'Interview'];

const OutfitPlanner = () => {
  const [outfits, setOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Outfit form toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState('Casual');
  const [selectedSeason, setSelectedSeason] = useState('All-Season');
  const [selectedMood, setSelectedMood] = useState('Happy');

  // Outfit Roulette toggles
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [rouletteOccasion, setRouletteOccasion] = useState('Casual');
  const [rouletteMood, setRouletteMood] = useState('Excited');
  const [generating, setGenerating] = useState(false);
  const [rouletteResult, setRouletteResult] = useState(null);

  useEffect(() => {
    fetchOutfitsAndClothes();
  }, []);

  const fetchOutfitsAndClothes = async () => {
    setLoading(true);
    try {
      const outfitsRes = await api.get('/outfits');
      const clothesRes = await api.get('/clothes');
      
      if (outfitsRes.data.success) setOutfits(outfitsRes.data.data);
      if (clothesRes.data.success) setClothes(clothesRes.data.data.filter(c => c.laundryStatus === 'Clean'));
    } catch (e) {
      toast.error('Failed to load outfits or clothes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!outfitName || selectedClothes.length === 0) {
      return toast.warning('Please enter an outfit name and pick at least one clothing item.');
    }

    try {
      const response = await api.post('/outfits', {
        name: outfitName,
        clothes: selectedClothes,
        season: selectedSeason,
        occasion: selectedOccasion,
        mood: selectedMood
      });

      if (response.data.success) {
        toast.success('New outfit added to planner!');
        setShowCreateModal(false);
        setOutfitName('');
        setSelectedClothes([]);
        fetchOutfitsAndClothes();
      }
    } catch (error) {
      toast.error('Failed to save outfit');
    }
  };

  const triggerRoulette = async () => {
    setGenerating(true);
    setRouletteResult(null);

    // Fetch geolocation coordinates if possible
    let geo = { lat: null, lon: null };
    if (navigator.geolocation) {
      const getPos = () => new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve({ lat: null, lon: null })
        );
      });
      geo = await getPos();
    }

    try {
      const response = await api.post('/outfits/roulette', {
        lat: geo.lat,
        lon: geo.lon,
        occasion: rouletteOccasion,
        mood: rouletteMood
      });

      if (response.data.success) {
        setRouletteResult(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to roll roulette');
    } finally {
      setGenerating(false);
    }
  };

  const saveRouletteOutfit = async () => {
    if (!rouletteResult) return;
    const clotheIds = rouletteResult.recommendation.clothes.map(c => c._id);
    
    try {
      const response = await api.post('/outfits', {
        name: `Roulette Look - ${rouletteResult.weather.condition}`,
        clothes: clotheIds,
        season: rouletteResult.weather.recommendations.recommendedSeason,
        occasion: rouletteOccasion,
        mood: rouletteMood
      });

      if (response.data.success) {
        toast.success('Outfit saved from Roulette recommendation!');
        setShowRouletteModal(false);
        fetchOutfitsAndClothes();
      }
    } catch (e) {
      toast.error('Failed to save roulette outfit');
    }
  };

  const logWear = async (outfitId) => {
    try {
      const response = await api.post(`/outfits/${outfitId}/wear`);
      if (response.data.success) {
        toast.success('Outfit wear logged! Closet Analytics updated.');
        setOutfits(prev => prev.map(o => o._id === outfitId ? { ...o, timesWorn: response.data.timesWorn } : o));
      }
    } catch (e) {
      toast.error('Failed to log outfit wear');
    }
  };

  const deleteOutfit = async (id) => {
    if (!window.confirm('Remove this outfit configuration?')) return;
    try {
      const response = await api.delete(`/outfits/${id}`);
      if (response.data.success) {
        setOutfits(prev => prev.filter(o => o._id !== id));
        toast.success('Outfit removed from planner');
      }
    } catch (e) {
      toast.error('Failed to delete outfit');
    }
  };

  const handleClotheSelect = (id) => {
    setSelectedClothes(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Outfit Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build custom styling combinations or roll the AI Roulette.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRouletteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            <Dices className="w-4 h-4" />
            Outfit Roulette
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Outfit
          </button>
        </div>
      </div>

      {/* Outfits Catalog */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : outfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map((outfit) => (
            <div key={outfit._id} className="glass-card rounded-2xl overflow-hidden shadow-sm relative group p-6 space-y-4">
              
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{outfit.name}</h3>
                  <div className="flex gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">{outfit.occasion}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 capitalize">{outfit.season}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteOutfit(outfit._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Clothes in Outfit */}
              <div className="grid grid-cols-3 gap-2 py-2">
                {outfit.clothes.slice(0, 3).map((item) => (
                  <div key={item._id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 h-20">
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[8px] text-white truncate text-center">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Wear Controls */}
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Worn: {outfit.timesWorn} times</span>
                <button
                  onClick={() => logWear(outfit._id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold rounded-lg transition-colors"
                >
                  Log Wear
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Layers className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-pulse" />
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">No outfits configured</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Use custom creators or the AI Roulette to save combinations.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20"
          >
            Create Outfit
          </button>
        </div>
      )}

      {/* Outfit Roulette Modal */}
      {showRouletteModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl p-8 glass-card rounded-3xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => {
                setShowRouletteModal(false);
                setRouletteResult(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" /> Outfit Roulette
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generates a color-matched combination based on live weather and location.
              </p>
            </div>

            {/* Roulette Form Controls */}
            {!rouletteResult && !generating && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Occasion</label>
                    <select
                      value={rouletteOccasion}
                      onChange={(e) => setRouletteOccasion(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                    >
                      {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Mood</label>
                    <input
                      type="text"
                      value={rouletteMood}
                      onChange={(e) => setRouletteMood(e.target.value)}
                      placeholder="Confident"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={triggerRoulette}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25"
                >
                  <Dices className="w-4 h-4" /> Roll Outfit
                </button>
              </div>
            )}

            {/* Loading / Rolling State */}
            {generating && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-500 animate-pulse">Scanning wardrobe & matching colors...</p>
              </div>
            )}

            {/* Result display */}
            {rouletteResult && (
              <div className="space-y-6">
                {/* Weather segment */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Sun className="w-6 h-6 text-amber-500" />
                    <div>
                      <h4 className="font-bold text-sm">Weather: {rouletteResult.weather.temp}°C</h4>
                      <p className="text-[10px] text-slate-500">{rouletteResult.weather.city} - {rouletteResult.weather.condition}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/20 text-brand-600 text-[10px] font-bold uppercase">
                    {rouletteResult.weather.recommendations.recommendedSeason}
                  </span>
                </div>

                {/* Wardrobe Items matched */}
                <div className="grid grid-cols-3 gap-3">
                  {rouletteResult.recommendation.clothes.map((clothe) => (
                    <div key={clothe._id} className="text-center space-y-1">
                      <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={clothe.imageUrls[0]}
                          alt={clothe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] font-bold truncate">{clothe.name}</p>
                      <p className="text-[8px] text-slate-400 capitalize">{clothe.color}</p>
                    </div>
                  ))}
                </div>

                {/* Styling reasoning analysis */}
                <div className="space-y-3">
                  <div className="bg-brand-50 dark:bg-brand-950/20 p-4 rounded-xl border border-brand-100 dark:border-brand-900/20 text-xs">
                    <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1">Why this fits:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {rouletteResult.recommendation.reasoning}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 text-xs">
                    <span className="font-bold text-orange-600 dark:text-orange-400 block mb-1">Color & Accessories styling tip:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {rouletteResult.recommendation.colorAccessories}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={triggerRoulette}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-roll
                  </button>
                  <button
                    onClick={saveRouletteOutfit}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20"
                  >
                    Accept Look & Save Outfit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Create Outfit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-8 glass-card rounded-3xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setSelectedClothes([]);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold">Construct Custom Outfit</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Outfit Label</label>
                  <input
                    type="text"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="Friday Casual Hangout"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Occasion</label>
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none"
                  >
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Selection grid from wardrobe */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Pick clothes ({selectedClothes.length} selected)
                </span>
                
                {clothes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    {clothes.map((clothe) => {
                      const selected = selectedClothes.includes(clothe._id);
                      return (
                        <div
                          key={clothe._id}
                          onClick={() => handleClotheSelect(clothe._id)}
                          className={`relative rounded-xl overflow-hidden cursor-pointer border h-24 transition-all duration-200 ${
                            selected 
                              ? 'border-brand-500 ring-2 ring-brand-500/25' 
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <img
                            src={clothe.imageUrls[0]}
                            alt={clothe.name}
                            className="w-full h-full object-cover"
                          />
                          {selected && (
                            <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-white fill-brand-500" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[8px] text-white truncate text-center">
                            {clothe.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">All your clothes are in the laundry queue! Clean them to plan outfits.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                  >
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Mood setting</label>
                  <input
                    type="text"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    placeholder="Chill"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
              >
                Save Outfit configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitPlanner;
