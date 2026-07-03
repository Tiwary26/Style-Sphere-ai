import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Send,
  X,
  Users,
  Image,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const Community = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState('');

  // Comment Sheet overlay
  const [activePostComments, setActivePostComments] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchOutfits();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/community/posts');
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (e) {
      toast.error('Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutfits = async () => {
    try {
      const response = await api.get('/outfits');
      if (response.data.success) {
        setOutfits(response.data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!imageUrl || !caption) {
      return toast.warning('Please provide an image URL and caption.');
    }

    try {
      const response = await api.post('/community/posts', {
        caption,
        imageUrl,
        outfitId: selectedOutfit || null
      });

      if (response.data.success) {
        toast.success('Post shared to StyleSphere Feed!');
        setShowAddModal(false);
        setCaption('');
        setImageUrl('');
        setSelectedOutfit('');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const handleLike = async (id) => {
    try {
      const response = await api.post(`/community/posts/${id}/like`);
      if (response.data.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === id) {
            const isLiked = response.data.likes.includes(user.id);
            return {
              ...p,
              likes: response.data.likes,
              isLikedByMe: isLiked
            };
          }
          return p;
        }));
      }
    } catch (e) {
      toast.error('Failed to update post like');
    }
  };

  const openComments = async (post) => {
    setActivePostComments(post);
    setLoadingComments(true);
    try {
      const response = await api.get(`/community/posts/${post._id}/comments`);
      if (response.data.success) {
        setCommentList(response.data.data);
      }
    } catch (e) {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activePostComments) return;

    try {
      const response = await api.post(`/community/posts/${activePostComments._id}/comments`, {
        text: newCommentText.trim()
      });

      if (response.data.success) {
        setCommentList(prev => [...prev, response.data.data]);
        setPosts(prev => prev.map(p => p._id === activePostComments._id ? { ...p, commentsCount: p.commentsCount + 1 } : p));
        setNewCommentText('');
      }
    } catch (e) {
      toast.error('Failed to submit comment');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Top Title Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fashion Inspiration</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Share your favorite outfits and view trends.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Share Look
        </button>
      </div>

      {/* Feed list */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = post.likes.includes(user.id);
            return (
              <div key={post._id} className="glass-card rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                
                {/* Author Info */}
                <div className="flex items-center gap-3 p-6 pb-0">
                  <img
                    src={post.user?.profileImage}
                    alt={post.user?.username}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-sm">{post.user?.username}</h4>
                    <p className="text-[10px] text-slate-400">Shared {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Photo */}
                <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={post.imageUrl}
                    alt="shared look"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Body Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold hover:text-rose-500 transition-colors ${
                        isLiked ? 'text-rose-500' : 'text-slate-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes.length} Likes</span>
                    </button>
                    <button
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-500 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.commentsCount} Comments</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-100 mr-2">{post.user?.username}</span>
                    {post.caption}
                  </p>

                  {/* Tagged Outfit */}
                  {post.outfit && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Tagged Look</span>
                        <span className="font-semibold">{post.outfit.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/20 text-brand-600 text-[10px] font-bold">
                        {post.outfit.clothes?.length || 0} Items
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Users className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-pulse" />
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Feed is empty</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Be the first to share an outfit look with the StyleSphere community!
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/20"
          >
            Share Look
          </button>
        </div>
      )}

      {/* Share Look Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 glass-card rounded-3xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-brand-500" /> Share Look
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Image URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Image className="w-5 h-5" />
                  </span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Friday night styling look. Loving the neutral colors!"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:border-brand-500 outline-none h-20"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Tag Outfit (Optional)</label>
                <select
                  value={selectedOutfit}
                  onChange={(e) => setSelectedOutfit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none"
                >
                  <option value="">No Outfit Tagged</option>
                  {outfits.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
              >
                Share Look
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Comments overlay Sheet */}
      {activePostComments && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass-card rounded-2xl relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setActivePostComments(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm mb-4">Comments</h3>

            {/* Comments Lists */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {loadingComments ? (
                <p className="text-xs text-slate-400 text-center py-6">Loading comments...</p>
              ) : commentList.length > 0 ? (
                commentList.map((c) => (
                  <div key={c._id} className="flex gap-2 text-xs">
                    <img src={c.user?.profileImage} alt={c.user?.username} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                      <span className="font-bold block mb-0.5">{c.user?.username}</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-snug">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No comments yet. Write the first comment!</p>
              )}
            </div>

            {/* Write comment Form */}
            <form onSubmit={submitComment} className="flex gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs outline-none focus:border-brand-500"
                required
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
