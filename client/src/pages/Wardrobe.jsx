import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Search,
  Plus,
  Filter,
  Heart,
  Archive,
  QrCode,
  FileDown,
  Trash2,
  X,
  Upload,
  Tags,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

const categories = [
  'Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Dresses', 
  'Kurti', 'Saree', 'Hoodies', 'Jackets', 'Shoes', 
  'Watches', 'Bags', 'Accessories'
];

const seasons = ['Summer', 'Winter', 'Spring', 'Autumn', 'All-Season'];
const occasions = ['Casual', 'Formal', 'Party', 'Sports', 'College', 'Wedding', 'Interview'];

const Wardrobe = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [sort, setSort] = useState('-createdAt');
  
  // Modals / Drawer toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQrModal, setShowQrModal] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('M');
  const [fabric, setFabric] = useState('Cotton');
  const [material, setMaterial] = useState('Standard');
  const [season, setSeason] = useState('All-Season');
  const [occasion, setOccasion] = useState('Casual');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef();
  const pdfRef = useRef();

  useEffect(() => {
    fetchClothes();
  }, [selectedCategory, selectedSeason, selectedOccasion, sort]);

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSeason) params.season = selectedSeason;
      if (selectedOccasion) params.occasion = selectedOccasion;
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const response = await api.get('/clothes', { params });
      if (response.data.success) {
        setClothes(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load wardrobe clothes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClothes();
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !color) {
      return toast.warning('Please enter a clothing item name and color');
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('color', color);
    formData.append('brand', brand);
    formData.append('size', size);
    formData.append('fabric', fabric);
    formData.append('material', material);
    formData.append('season', season);
    formData.append('occasion', occasion);
    if (price) formData.append('price', price);
    formData.append('notes', notes);
    
    if (images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await api.post('/clothes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Clothe item added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchClothes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add clothing item');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Shirts');
    setColor('');
    setBrand('');
    setSize('M');
    setFabric('Cotton');
    setMaterial('Standard');
    setSeason('All-Season');
    setOccasion('Casual');
    setPrice('');
    setNotes('');
    setImages([]);
  };

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/clothes/${id}/toggle-favorite`);
      if (response.data.success) {
        setClothes(prev => prev.map(c => c._id === id ? { ...c, isFavorite: !c.isFavorite } : c));
        toast.success(response.data.data.isFavorite ? 'Marked as favorite!' : 'Removed from favorites');
      }
    } catch (e) {
      toast.error('Failed to update favorite status');
    }
  };

  const toggleArchive = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/clothes/${id}/toggle-archive`);
      if (response.data.success) {
        setClothes(prev => prev.filter(c => c._id !== id));
        toast.success('Item archived successfully');
      }
    } catch (e) {
      toast.error('Failed to archive item');
    }
  };

  const deleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await api.delete(`/clothes/${id}`);
      if (response.data.success) {
        setClothes(prev => prev.filter(c => c._id !== id));
        setSelectedItem(null);
        toast.success('Clothing item deleted');
      }
    } catch (e) {
      toast.error('Failed to delete item');
    }
  };

  const exportWardrobePDF = async () => {
    const input = pdfRef.current;
    if (!input) return;
    toast.info('Generating PDF Catalog, please wait...');

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('StyleSphere_Wardrobe_Catalog.pdf');
      toast.success('Wardrobe Catalog PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Wardrobe</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and organize all your digital clothes.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportWardrobePDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-sm transition-colors"
          >
            <FileDown className="w-4 h-4" />
            PDF Catalog
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Clothes
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 glass-card rounded-2xl items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clothes by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
          />
          <button type="submit" className="absolute left-3 top-2.5 text-slate-400">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Season Filter */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none"
          >
            <option value="">All Seasons</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Occasion Filter */}
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none"
          >
            <option value="">All Occasions</option>
            {occasions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          {/* Sort selection */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none ml-auto"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Wardrobe Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : clothes.length > 0 ? (
        <div ref={pdfRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-2 bg-transparent">
          {clothes.map((clothe) => (
            <div
              key={clothe._id}
              onClick={() => setSelectedItem(clothe)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer hover-scale shadow-sm relative group"
            >
              {/* Clothing Thumbnail */}
              <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                <img
                  src={clothe.imageUrls[0]}
                  alt={clothe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Favorite badge toggling */}
                <button
                  onClick={(e) => toggleFavorite(clothe._id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                    clothe.isFavorite 
                      ? 'bg-rose-50 text-rose-500' 
                      : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${clothe.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Body Summary */}
              <div className="p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {clothe.category}
                </span>
                <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                  {clothe.name}
                </h4>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    ${clothe.price}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                    {clothe.laundryStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Shirt className="w-20 h-20 text-slate-300 dark:text-slate-700" />
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Your wardrobe is empty</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Get started by uploading and cataloging your clothes.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20"
          >
            Add Clothes
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-8 glass-card rounded-3xl relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thumbnail */}
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 md:h-auto">
              <img
                src={selectedItem.imageUrls[0]}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Specifications Details */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400">{selectedItem.category}</span>
                <h3 className="text-2xl font-bold">{selectedItem.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                <div><span className="text-slate-400">Brand:</span> <span className="font-semibold">{selectedItem.brand}</span></div>
                <div><span className="text-slate-400">Color:</span> <span className="font-semibold capitalize">{selectedItem.color}</span></div>
                <div><span className="text-slate-400">Size:</span> <span className="font-semibold">{selectedItem.size}</span></div>
                <div><span className="text-slate-400">Fabric:</span> <span className="font-semibold">{selectedItem.fabric}</span></div>
                <div><span className="text-slate-400">Price:</span> <span className="font-semibold">${selectedItem.price}</span></div>
                <div><span className="text-slate-400">Worn:</span> <span className="font-semibold">{selectedItem.timesWorn} times</span></div>
                <div><span className="text-slate-400">Season:</span> <span className="font-semibold">{selectedItem.season}</span></div>
                <div><span className="text-slate-400">Occasion:</span> <span className="font-semibold">{selectedItem.occasion}</span></div>
              </div>

              {selectedItem.notes && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Notes:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    {selectedItem.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => setShowQrModal(selectedItem)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold"
                >
                  <QrCode className="w-4 h-4" /> QR Code
                </button>
                <button
                  onClick={(e) => toggleArchive(selectedItem._id, e)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Archive className="w-4 h-4" /> Archive
                </button>
                <button
                  onClick={(e) => deleteItem(selectedItem._id, e)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 text-xs font-semibold ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {showQrModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 glass-card rounded-3xl relative text-center space-y-4">
            <button
              onClick={() => setShowQrModal(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-lg">Clothing Tag QR Code</h4>
            <p className="text-xs text-slate-500">Scan this QR Code in the wardrobe manager to view or update garment status.</p>
            <div className="p-4 bg-white rounded-2xl w-fit mx-auto border border-slate-100">
              <QRCodeSVG value={showQrModal.qrCode} size={180} />
            </div>
            <p className="text-xs font-semibold text-brand-600">{showQrModal.name}</p>
          </div>
        </div>
      )}

      {/* Add Clothe Drawer / Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 glass-card rounded-3xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">Digitize Garment</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Garment Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Classic Oxford Shirt"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Navy Blue"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Levi's"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="M / 32"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Fabric</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="Cotton"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none"
                  >
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none"
                  >
                    {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45"
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Images</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Click to upload pictures ({images.length} selected)</span>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Stylist Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Perfect for summer outings, pairs well with neutral chinos..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none h-20 focus:border-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing & Cataloging...' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
