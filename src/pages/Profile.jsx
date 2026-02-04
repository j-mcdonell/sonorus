import React, { useContext, useMemo } from 'react';
import { AuthContext } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { User, Star, Music, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ReviewCard from '@/components/ReviewCard';
import AlbumCard from '@/components/AlbumCard';
import AvatarUpload from '@/components/AvatarUpload'; // Import the new component

export default function Profile() {
  const { user, checkUserAuth } = useContext(AuthContext); // Get checkUserAuth to refresh profile

  // ... (Existing Review and Album queries remain unchanged) ...
  // 1. Fetch User's Reviews...
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
        if (!user?.email) return [];
        const { data, error } = await supabase
            .from('Review')
            .select('*')
            .eq('created_by', user.email)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    enabled: !!user?.email
  });

  const albumIds = useMemo(() => [...new Set(reviews.map(r => r.album_id))], [reviews]);
  
  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['my-reviewed-albums', albumIds],
    queryFn: async () => {
        if (albumIds.length === 0) return [];
        const { data, error } = await supabase
            .from('Album')
            .select('*')
            .in('id', albumIds);
        if (error) throw error;
        return data || [];
    },
    enabled: albumIds.length > 0
  });

  const albumMap = useMemo(() => {
    return albums.reduce((acc, album) => {
        acc[album.id] = album;
        return acc;
    }, {});
  }, [albums]);

  const reviewsWithAlbums = useMemo(() => {
    return reviews.map(r => ({ ...r, album: albumMap[r.album_id] })).filter(r => r.album);
  }, [reviews, albumMap]);

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
    return { totalReviews, avgRating };
  }, [reviews]);

  const favoriteReviews = useMemo(() => {
    return [...reviewsWithAlbums]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4); 
  }, [reviewsWithAlbums]);

  // ... (Existing Auth check and Loading states remain unchanged) ...
  if (!user) {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
            <h2 className="text-xl font-bold mb-4">Please Sign In</h2>
            <p className="text-zinc-400 mb-6">You need to be logged in to view your profile.</p>
            <Link to={createPageUrl('Login')}><Button className="bg-violet-600">Sign In</Button></Link>
        </div>
    );
  }

  if (reviewsLoading || albumsLoading) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header Profile Card */}
      <div className="relative border-b border-zinc-800/50 bg-zinc-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
                
                {/* REPLACED: Static div with AvatarUpload component */}
                <AvatarUpload 
                    uid={user.id}
                    url={user.user_metadata?.avatar_url}
                    onUpload={checkUserAuth}
                    size={96} // 24 * 4px = 96px
                />
                
                {/* User Info */}
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold mb-1 text-white">
                        {/* Use display name if available, fallback to email prefix */}
                        {user.user_metadata?.full_name || user.email.split('@')[0]}
                    </h1>
                    <p className="text-zinc-400 text-sm mb-6">{user.email}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-8 justify-center md:justify-start">
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Reviews</div>
                        </div>
                        <div className="w-px h-8 bg-zinc-800" />
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                {stats.avgRating.toFixed(1)} <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Avg Score</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        {/* ... (Rest of the component remains exactly the same) ... */}
        {favoriteReviews.length > 0 && (
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    Your Top Picks
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {favoriteReviews.map((review, i) => (
                         <motion.div 
                            key={review.id}
                            transition={{ delay: i * 0.1 }}
                         >
                            <AlbumCard 
                                album={review.album} 
                                score={review.rating} 
                                reviewCount={null}
                            />
                         </motion.div>
                    ))}
                </div>
            </motion.section>
        )}

        {/* Section: Recent Activity */}
        <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Recent Activity
            </h2>
            <div className="space-y-4">
                {reviewsWithAlbums.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                        <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-400">You haven't reviewed any albums yet.</p>
                        <Link to={createPageUrl('Browse')} className="mt-4 inline-block">
                            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">Start Reviewing</Button>
                        </Link>
                    </div>
                ) : (
                    reviewsWithAlbums.map((review, i) => (
                        <motion.div 
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <ReviewCard review={review} album={review.album} showAlbum />
                        </motion.div>
                    ))
                )}
            </div>
        </section>
      </div>
    </div>
  );
}