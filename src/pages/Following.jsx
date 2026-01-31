import React, { useMemo, useContext } from 'react';
import { supabase } from '@/api/supabaseClient';
import { AuthContext } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, Rss, Clock, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ReviewCard from '@/components/ReviewCard';
import CriticCard from '@/components/CriticCard';

export default function Following() {
  const { user: currentUser, isLoading: authLoading, navigateToLogin } = useContext(AuthContext);

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.email],
    queryFn: async () => {
      const { data } = await supabase.from('Follow').select('*').eq('follower_email', currentUser?.email);
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data } = await supabase.from('Review').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data } = await supabase.from('Album').select('*');
      return data || [];
    }
  });

  // Create album lookup map
  const albumMap = useMemo(() => {
    return albums.reduce((acc, album) => {
      acc[album.id] = album;
      return acc;
    }, {});
  }, [albums]);

  // Get reviews from people you follow
  const followingEmails = useMemo(() => new Set(follows.map(f => f.following_email)), [follows]);
  
  const feedReviews = useMemo(() => {
    return allReviews
      .filter(review => followingEmails.has(review.created_by))
      .map(review => ({
        ...review,
        album: albumMap[review.album_id]
      }))
      .filter(r => r.album)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [allReviews, followingEmails, albumMap]);

  // Build critic profiles for sidebar
  const followedCritics = useMemo(() => {
    const criticMap = {};
    
    allReviews.forEach(review => {
      if (!followingEmails.has(review.created_by)) return;
      
      const email = review.created_by;
      if (!criticMap[email]) {
        criticMap[email] = {
          email,
          name: review.reviewer_name || 'Anonymous',
          is_critic: review.is_critic,
          reviewCount: 0,
          totalRating: 0
        };
      }
      criticMap[email].reviewCount++;
      criticMap[email].totalRating += review.rating;
      if (review.is_critic) criticMap[email].is_critic = true;
    });

    return Object.values(criticMap).map(c => ({
      ...c,
      avgRating: c.totalRating / c.reviewCount
    }));
  }, [allReviews, followingEmails]);

  const getFollowInfo = (criticEmail) => {
    const follow = follows.find(f => f.following_email === criticEmail);
    return { isFollowing: true, followId: follow?.id };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Sign in to see your feed</h1>
          <p className="text-zinc-400 mb-6">
            Follow your favorite critics and see all their reviews in one place
          </p>
          <Button 
            onClick={navigateToLogin}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-fuchsia-900/10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-6">
            <Rss className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
          <p className="text-zinc-400">Latest reviews from critics you follow</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {follows.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-medium text-zinc-400 mb-2">You're not following anyone yet</h3>
            <p className="text-zinc-500 mb-6">Follow critics to see their reviews in your feed</p>
            <Link to={createPageUrl('Critics')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                Discover Critics
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold">Recent Reviews</h2>
              </div>
              
              {feedReviews.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500">No reviews from people you follow yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedReviews.map((review, index) => (
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
              )}
            </div>

            {/* Sidebar - Following List */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    Following ({follows.length})
                  </h3>
                  <Link 
                    to={createPageUrl('Critics')}
                    className="text-sm text-violet-400 hover:text-violet-300"
                  >
                    Find more
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {followedCritics.map(critic => {
                    const { isFollowing, followId } = getFollowInfo(critic.email);
                    return (
                      <CriticCard
                        key={critic.email}
                        critic={critic}
                        currentUserEmail={currentUser?.email}
                        isFollowing={isFollowing}
                        followId={followId}
                        reviewCount={critic.reviewCount}
                        avgRating={critic.avgRating}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}