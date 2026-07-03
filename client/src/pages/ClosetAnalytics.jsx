import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ClosetAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      if (response.data.success) {
        setData(response.data);
      }
    } catch (e) {
      toast.error('Failed to load closet analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Compile datasets for Chart.js
  const categoriesLabels = data.distributions.categories.map(c => c._id);
  const categoriesCounts = data.distributions.categories.map(c => c.count);

  const seasonsLabels = data.distributions.seasons.map(s => s._id);
  const seasonsCounts = data.distributions.seasons.map(s => s.count);

  const colorsLabels = data.distributions.colors.map(c => c._id);
  const colorsCounts = data.distributions.colors.map(c => c.count);

  const categoryChartData = {
    labels: categoriesLabels,
    datasets: [{
      label: 'Clothes Count',
      data: categoriesCounts,
      backgroundColor: [
        'rgba(139, 92, 246, 0.65)',
        'rgba(244, 63, 94, 0.65)',
        'rgba(14, 165, 233, 0.65)',
        'rgba(234, 179, 8, 0.65)',
        'rgba(16, 185, 129, 0.65)',
        'rgba(217, 70, 239, 0.65)'
      ],
      borderColor: 'transparent',
    }],
  };

  const seasonChartData = {
    labels: seasonsLabels,
    datasets: [{
      label: 'Items Count',
      data: seasonsCounts,
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderRadius: 8,
    }],
  };

  const colorChartData = {
    labels: colorsLabels,
    datasets: [{
      label: 'Color Spread',
      data: colorsCounts,
      backgroundColor: 'rgba(244, 63, 94, 0.2)',
      borderColor: 'rgba(244, 63, 94, 0.8)',
      pointBackgroundColor: 'rgba(244, 63, 94, 1)',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Outfit', size: 11 },
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Title info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Closet Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review garment distributions, color frequencies, and wardrobe valuations.
        </p>
      </div>

      {/* Valuation block */}
      <div className="p-6 bg-brand-500 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-brand-500/20">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-brand-100 uppercase tracking-widest block">Valuation Total</span>
          <h2 className="text-4xl font-extrabold flex items-center gap-1">
            <DollarSign className="w-8 h-8 flex-shrink-0" />
            {data.stats.wardrobeValue}
          </h2>
          <p className="text-xs text-brand-100/70 pt-1 leading-snug">
            Calculated across all digitized active clothing items in your wardrobe list.
          </p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs max-w-sm">
          <span className="font-bold flex items-center gap-1.5 mb-1 text-brand-100">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Stylist insight
          </span>
          Keeping a high-mix ratio of neutrals (black, white, gray) lowers your Cost-Per-Wear (CPW) average.
        </div>
      </div>

      {/* Chart Layout Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category distribution */}
        <div className="p-6 glass-card rounded-2xl flex flex-col h-96">
          <h3 className="font-bold text-sm mb-4">Category Distribution</h3>
          <div className="flex-1 relative">
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Seasonal usage */}
        <div className="p-6 glass-card rounded-2xl flex flex-col h-96">
          <h3 className="font-bold text-sm mb-4">Seasonal Distributions</h3>
          <div className="flex-1 relative">
            <Bar data={seasonChartData} options={chartOptions} />
          </div>
        </div>

        {/* Color Radar */}
        <div className="p-6 glass-card rounded-2xl flex flex-col h-96">
          <h3 className="font-bold text-sm mb-4">Color Analysis</h3>
          <div className="flex-1 relative">
            <Radar data={colorChartData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Cost per wear lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Most Worn items */}
        <div className="p-6 glass-card rounded-2xl space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Most Cost-Efficient Clothes (CPW)
          </h3>
          <div className="space-y-3">
            {data.costPerWear.mostUsed.length > 0 ? (
              data.costPerWear.mostUsed.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{item.name}</h4>
                    <p className="text-[9px] text-slate-400">Worn {item.timesWorn} times</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600">${item.costPerWear}</span>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">CPW</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Log outfit wear to compute cost per wear.</p>
            )}
          </div>
        </div>

        {/* Least worn/High price items */}
        <div className="p-6 glass-card rounded-2xl space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-amber-500" /> Underutilized Items (Highest Price)
          </h3>
          <div className="space-y-3">
            {data.costPerWear.leastUsed.length > 0 ? (
              data.costPerWear.leastUsed.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{item.name}</h4>
                    <p className="text-[9px] text-slate-400">Never worn yet</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-500">${item.price}</span>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Price</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Excellent! No high-value items are sitting unworn.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClosetAnalytics;
