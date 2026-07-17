import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Shirt,
  Heart,
  WashingMachine,
  DollarSign,
  Flame,
  CloudSun,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClothes: 0,
    favoriteClothes: 0,
    dirtyClothes: 0,
    wardrobeValue: 0,
    streak: { count: 0 },
    badgesCount: 0,
  });
  const [weather, setWeather] = useState(null);
  const [todayOutfit, setTodayOutfit] = useState(null);
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchWeather(null, null);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
        setTodayOutfit(response.data.todayOutfit);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = (lat = null, lon = null) => {
    // If no coordinates passed, request browser coordinates
    if (!lat && !lon && navigator.geolocation) {
      setRefreshingWeather(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          try {
            const res = await api.post('/outfits/roulette', { lat: latitude, lon: longitude });
            if (res.data.success) {
              setWeather(res.data.weather);
            }
          } catch (e) {
            console.error('Weather request failed');
          } finally {
            setRefreshingWeather(false);
          }
        },
        async (error) => {
          // Fallback to default city request
          try {
            const res = await api.post('/outfits/roulette', { city: 'Mumbai' });
            if (res.data.success) {
              setWeather(res.data.weather);
            }
          } catch (e) {
            console.error('Weather fallback request failed');
          } finally {
            setRefreshingWeather(false);
          }
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Stylist Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyze wardrobe value, weather guidelines, and schedule your day.
          </p>
        </div>
        <Link
          to="/ai-stylist"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 text-sm w-fit"
        >
          <Sparkles className="w-4 h-4" />
          Consult AI Stylist
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Clothes</span>
            <h3 className="text-2xl font-bold">{stats.totalClothes}</h3>
          </div>
          <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 rounded-xl">
            <Shirt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Favorites</span>
            <h3 className="text-2xl font-bold">{stats.favoriteClothes}</h3>
          </div>
          <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Laundry Load</span>
            <h3 className="text-2xl font-bold text-amber-500">{stats.dirtyClothes}</h3>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl">
            <WashingMachine className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Wardrobe Value</span>
            <h3 className="text-2xl font-bold">${stats.wardrobeValue}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Outfit Suggestion Card */}
        <div className="lg:col-span-2 p-8 glass-card rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h2 className="text-xl font-bold">Today's Outfit recommendation</h2>
            </div>
            <Link to="/outfit-planner" className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:underline">
              Plan Outfits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {todayOutfit ? (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={todayOutfit.imageUrl || todayOutfit.clothes[0]?.imageUrls[0]}
                  alt={todayOutfit.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-sm truncate">{todayOutfit.name}</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-lg font-bold">{todayOutfit.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold">{todayOutfit.occasion}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold capitalize">{todayOutfit.season}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {todayOutfit.clothes.slice(0, 3).map((item) => (
                    <div key={item._id} className="text-center">
                      <img
                        src={item.imageUrls[0]}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover mx-auto border border-slate-200 dark:border-slate-800"
                      />
                      <p className="text-[10px] text-slate-500 truncate mt-1">{item.name}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Worn {todayOutfit.timesWorn} times. Recompute combinations to rotate outfits.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Shirt className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">No outfit prepared for today</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  Run the Outfit Roulette or select your clothes to build a custom look.
                </p>
              </div>
              <Link
                to="/outfit-planner"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Create Outfit
              </Link>
            </div>
          )}
        </div>

        {/* Live Weather Widget */}
        <div className="p-8 glass-card rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-brand-500" /> Weather Check
            </h2>
            <button
              onClick={() => fetchWeather(null, null)}
              disabled={refreshingWeather}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingWeather ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {weather ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extrabold tracking-tight">{weather.temp}°C</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{weather.condition}</h4>
                  <p className="text-xs text-slate-400">{weather.city}</p>
                </div>
              </div>

              <div className="p-4 bg-brand-50 dark:bg-brand-950/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide block mb-1">Stylist Recommendation</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {weather.recommendations.reasons[0]}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Wind speed: {weather.windSpeed} km/h</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">Loading weather forecasting...</p>
            </div>
          )}

          {/* Gamified Achievements Summary */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
              <Flame className="w-4 h-4 fill-current" />
              <span>{stats.streak?.count || 0} Login Streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>{stats.badgesCount} Badges Earned</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
