import React, { useMemo } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingUp, Clock, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReviewCard from '@/components/ReviewCard';

export default function RecentReviews() {
  // FIX 1: Updated queryFn to return only the data array
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // FIX 2: Updated queryFn to return only the data array
  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Album')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create album lookup map
  const albumMap = useMemo(() => {
    // FIX 3: Safety check to ensure albums is an array
    if (!Array.isArray(albums)) return {};

    return albums.reduce((acc, album) => {
      acc[album.id] = album;
      return acc;
    }, {});
  }, [albums]);

  // Get reviews with album data
  const reviewsWithAlbums = useMemo(() => {
    // Safety check
    if (!Array.isArray(reviews)) return [];

    return reviews.map(review => ({
      ...review,
      album: albumMap[review.album_id]
    })).filter(r => r.album);
  }, [reviews, albumMap]);

  // Sort by different criteria
  const recentReviews = reviewsWithAlbums;
  const topReviews = [...reviewsWithAlbums].sort((a, b) => b.rating - a.rating);
  const helpfulReviews = [...reviewsWithAlbums].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-transparent to-violet-900/10" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-6">
            <MessageSquare className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Community Reviews</h1>
          <p className="text-zinc-400">See what people are saying about albums</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 mb-8 w-full sm:w-auto">
            <TabsTrigger 
              value="recent" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-6"
            >
              <Clock className="w-4 h-4 mr-2" /> Recent
            </TabsTrigger>
            <TabsTrigger 
              value="top" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-6"
            >
              <Star className="w-4 h-4 mr-2" /> Top Rated
            </TabsTrigger>
            <TabsTrigger 
              value="helpful" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Most Helpful
            </TabsTrigger>
          </TabsList>

          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-40 bg-zinc-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviewsWithAlbums.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-20 h-20 mx-auto text-zinc-800 mb-4" />
              <h3 className="text-xl font-medium text-zinc-400">No reviews yet</h3>
              <p className="text-zinc-500 mt-2 mb-6">Be the first to review an album!</p>
              <Link 
                to={createPageUrl('Browse')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl text-white font-medium transition-colors"
              >
                Browse Albums
              </Link>
            </div>
          ) : (
            <>
              <TabsContent value="recent" className="mt-0">
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ReviewCard review={review} album={review.album} showAlbum />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="top" className="mt-0">
                <div className="space-y-4">
                  {topReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ReviewCard review={review} album={review.album} showAlbum />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="helpful" className="mt-0">
                <div className="space-y-4">
                  {helpfulReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ReviewCard review={review} album={review.album} showAlbum />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}