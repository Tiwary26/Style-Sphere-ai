import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, Flame, Bell, Lightbulb } from 'lucide-react';
import api from '../services/api';

const fashionTips = [
  "Layering is key: add a light jacket or cardigan to elevate a simple T-shirt & jeans look.",
  "Complementary colors like blue and orange, or navy and tan, always create a balanced outfit.",
  "Make sure your wardrobe has at least 30% neutrals (black, white, grey, beige) for easy mixing.",
  "Check the fabric composition: organic cotton and linen are ideal for hot summer days.",
  "Cost-Per-Wear rule: divide the price of an item by the times worn. Quality basics are worth it!",
  "A classic metal watch or minimalist leather bag instantly completes any casual outfit.",
  "Hang knits or heavy sweaters instead of folding to maintain their fit and shape."
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [tip, setTip] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Select tip of the day
    const day = new Date().getDate();
    setTip(fashionTips[day % fashionTips.length]);

    // Retrieve notifications count
    const fetchNotifications = async () => {
      if (user) {
        try {
          const response = await api.get('/laundry'); // Simple route check or dashboard check
          // In dynamic app, we can retrieve notification lists
          setUnreadNotifications(Math.floor(Math.random() * 3)); // Mock notifications count for demo
        } catch (e) {
          // ignore
        }
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <header className="fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8 h-16 glass border-b border-slate-200/50 dark:border-slate-800/50">
      {/* Daily Fashion Tip Widget */}
      <div className="flex items-center gap-2 max-w-lg text-slate-600 dark:text-slate-300">
        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
        <span className="text-xs font-medium italic truncate leading-snug">
          Tip: {tip}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Streak Tracker */}
        {user?.streak?.count > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-semibold text-sm animate-bounce">
            <Flame className="w-4 h-4 fill-current" />
            <span>{user.streak.count} Day Streak</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
