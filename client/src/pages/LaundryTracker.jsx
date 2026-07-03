import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  WashingMachine,
  Flame,
  ArrowRight,
  Clock,
  Plus,
  Trash2,
  X,
  AlertCircle,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { toast } from 'react-toastify';

const columns = [
  { id: 'Dirty', label: 'Dirty Load', color: 'bg-red-500/10 border-red-500/20 text-red-500' },
  { id: 'Washing', label: 'Washing Machine', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
  { id: 'Drying', label: 'Drying Line', color: 'bg-sky-500/10 border-sky-500/20 text-sky-500' },
  { id: 'Ironing', label: 'Ironing Board', color: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
];

const LaundryTracker = () => {
  const [laundryList, setLaundryList] = useState([]);
  const [dirtyWardrobeItems, setDirtyWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reminders / Details Modals
  const [showReminderModal, setShowReminderModal] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [showAddDirtyModal, setShowAddDirtyModal] = useState(false);

  useEffect(() => {
    fetchLaundryData();
  }, []);

  const fetchLaundryData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/laundry');
      const clothesRes = await api.get('/clothes');

      if (response.data.success) {
        setLaundryList(response.data.data);
      }
      
      // Filter clothes that are not marked clean or are marked dirty but not in active laundry log
      if (clothesRes.data.success) {
        const activeIds = response.data.data.map(l => l.clothe?._id);
        const dirtyItems = clothesRes.data.data.filter(c => 
          (c.laundryStatus !== 'Clean' && c.laundryStatus !== 'Ready To Wear') && 
          !activeIds.includes(c._id)
        );
        setDirtyWardrobeItems(dirtyItems);
      }
    } catch (e) {
      toast.error('Failed to retrieve laundry status queue');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (clotheId, newStatus) => {
    try {
      const response = await api.post('/laundry/update-status', {
        clotheId,
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Moved item to ${newStatus}`);
        setShowMoveModal(null);
        fetchLaundryData();
      }
    } catch (error) {
      toast.error('Failed to transition laundry stage');
    }
  };

  const scheduleReminder = async (e) => {
    e.preventDefault();
    if (!showReminderModal || !reminderDate) return;

    try {
      const response = await api.post('/laundry/add-reminder', {
        clotheId: showReminderModal.clothe._id,
        reminderDate,
        notes: reminderNotes
      });

      if (response.data.success) {
        toast.success('Laundry reminder alert scheduled!');
        setShowReminderModal(null);
        setReminderDate('');
        setReminderNotes('');
        fetchLaundryData();
      }
    } catch (error) {
      toast.error('Failed to set reminder timer');
    }
  };

  const addToDirtyQueue = async (clotheId) => {
    try {
      const response = await api.post('/laundry/update-status', {
        clotheId,
        status: 'Dirty'
      });

      if (response.data.success) {
        toast.success('Item added to active dirty queue');
        setShowAddDirtyModal(false);
        fetchLaundryData();
      }
    } catch (e) {
      toast.error('Failed to add laundry log');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Laundry Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track washing progress and receive alerts when clothes are ready-to-wear.
          </p>
        </div>
        <button
          onClick={() => setShowAddDirtyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Mark Item Dirty
        </button>
      </div>

      {/* Visual columns board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => {
            const items = laundryList.filter(item => item.status === col.id);
            return (
              <div key={col.id} className="flex flex-col glass-card border border-slate-200/50 dark:border-slate-800/50 rounded-2xl h-[30rem] overflow-hidden">
                {/* Column header */}
                <div className={`px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between ${col.color}`}>
                  <span className="font-bold text-sm tracking-wide">{col.label}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/30">
                    {items.length}
                  </span>
                </div>

                {/* Column lists */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setShowMoveModal(item)}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:shadow-sm cursor-pointer transition-shadow space-y-3"
                      >
                        <div className="flex gap-2">
                          <img
                            src={item.clothe?.imageUrls[0]}
                            alt={item.clothe?.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold truncate">{item.clothe?.name}</h4>
                            <p className="text-[10px] text-slate-400 capitalize">{item.clothe?.color} - {item.clothe?.category}</p>
                          </div>
                        </div>

                        {/* Reminders summary */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowReminderModal(item);
                            }}
                            className="flex items-center gap-1 hover:text-brand-500 font-semibold"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {item.reminderDate ? new Date(item.reminderDate).toLocaleDateString() : 'Set Alert'}
                          </button>
                          <span className="capitalize text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                            {item.clothe?.size}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                      <Bookmark className="w-8 h-8 stroke-1 mb-1 text-slate-300 dark:text-slate-700" />
                      <span className="text-[10px] font-medium">Stage Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Dirty Modal overlay */}
      {showAddDirtyModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass-card rounded-2xl relative max-h-[80vh] overflow-y-auto space-y-4">
            <button onClick={() => setShowAddDirtyModal(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg">Mark Wardrobe Item Dirty</h3>
            <p className="text-xs text-slate-400">Select any clean item to add to the active cleaning pipeline.</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dirtyWardrobeItems.length > 0 ? (
                dirtyWardrobeItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => addToDirtyQueue(item._id)}
                    className="flex items-center justify-between p-2 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
                  >
                    <div className="flex gap-2">
                      <img src={item.imageUrls[0]} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <h4 className="text-xs font-bold">{item.name}</h4>
                        <p className="text-[9px] text-slate-400 capitalize">{item.color} - {item.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">All clothes are already clean or in the queue.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Set reminder alert modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 glass-card rounded-2xl relative space-y-4">
            <button onClick={() => setShowReminderModal(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg">Schedule Laundry Reminder</h3>
            <p className="text-xs text-slate-400">Receive a system and websocket notification alert when cleaning is due.</p>

            <form onSubmit={scheduleReminder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Notes</label>
                <input
                  type="text"
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  placeholder="Need to use soft wash settings..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
              >
                Schedule Alert
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Move status modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs p-6 glass-card rounded-2xl relative text-center space-y-4">
            <button onClick={() => setShowMoveModal(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm">Update Cleaning Stage</h3>
            <p className="text-xs text-slate-400 font-medium">Select target laundry step for "{showMoveModal.clothe?.name}"</p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {columns.map(col => (
                <button
                  key={col.id}
                  onClick={() => changeStatus(showMoveModal.clothe?._id, col.id)}
                  className={`py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/80 ${
                    showMoveModal.status === col.id ? 'bg-brand-500 hover:bg-brand-500 text-white' : ''
                  }`}
                >
                  {col.label}
                </button>
              ))}
              <button
                onClick={() => changeStatus(showMoveModal.clothe?._id, 'Clean')}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors mt-2"
              >
                Clean & Ready to Wear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaundryTracker;
