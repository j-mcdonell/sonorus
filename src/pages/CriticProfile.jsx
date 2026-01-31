import React, { useMemo, useContext } from 'react';
import { supabase } from '@/api/supabaseClient';
import { AuthContext } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Star, FileText, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import ScoreBadge from '@/components/ScoreBadge';
import ReviewCard from '@/components/ReviewCard';
import FollowButton from '@/components/FollowButton';

export default function CriticProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const criticEmail = urlParams.get('email');
  const { user: currentUser } = useContext(AuthContext);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['critic-reviews', criticEmail],
    queryFn: async () => {
      const { data } = await supabase.from('Review').select('*').eq('created_by', criticEmail);
      return data || [];
    },
    enabled: !!criticEmail
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data } = await supabase.from('Album').select('*');
      return data || [];
    }
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.email],
    queryFn: async () => {
      const { data } = await supabase.from('Follow').select('*').eq('follower_email', currentUser?.email);
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const { data: followerCount = [] } = useQuery({
    queryKey: ['follower-count', criticEmail],
    queryFn: async () => {
      const { data } = await supabase.from('Follow').select('*').eq('following_email', criticEmail);
      return data || [];
    },
    enabled: !!criticEmail
  });

  // Create album lookup map
  const albumMap = useMemo(() => {
    return albums.reduce((acc, album) => {
      acc[album.id] = album;
      return acc;
    }, {});
  }, [albums]);

  // Get critic info from their reviews
  const criticInfo = useMemo(() => {
    if (reviews.length === 0) return null;
    
    const firstReview = reviews[0];
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const isCritic = reviews.some(r => r.is_critic);
    
    return {
      email: criticEmail,
      name: firstReview.reviewer_name || 'Anonymous',
      is_critic: isCritic,
      reviewCount: reviews.length,
      avgRating,
      joinDate: reviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]?.created_at
    };
  }, [reviews, criticEmail]);

  // Reviews with album data
  const reviewsWithAlbums = useMemo(() => {
    return reviews
      .map(review => ({
        ...review,
        album: albumMap[review.album_id]
      }))
      .filter(r => r.album)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [reviews, albumMap]);

  // Check if following
  const followInfo = useMemo(() => {
    const follow = follows.find(f => f.following_email === criticEmail);
    return {
      isFollowing: !!follow,
      followId: follow?.id
    };
  }, [follows, criticEmail]);

  if (reviewsLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!criticInfo) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
        <Users className="w-16 h-16 text-zinc-700 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Critic not found</h1>
        <Link to={createPageUrl('Critics')} className="text-violet-400 hover:underline">
          Browse all critics
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-12">
          <Link 
            to={createPageUrl('Critics')} 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All Critics
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-violet-400">
                {criticInfo.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                  {criticInfo.name}
                  {criticInfo.is_critic && (
                    <BadgeCheck className="w-6 h-6 text-violet-400" />
                  )}
                </h1>
                <FollowButton
                  criticEmail={criticEmail}
                  criticName={criticInfo.name}
                  currentUserEmail={currentUser?.email}
                  isFollowing={followInfo.isFollowing}
                  followId={followInfo.followId}
                  size="default"
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-zinc-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> {criticInfo.reviewCount} reviews
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {criticInfo.avgRating.toFixed(0)} avg score
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {followerCount.length} followers
                </span>
                {criticInfo.joinDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Joined {format(new Date(criticInfo.joinDate), 'MMM yyyy')}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="text-center px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <ScoreBadge score={criticInfo.avgRating} size="md" />
                  <p className="text-xs text-zinc-500 mt-1">Average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Reviews by {criticInfo.name}</h2>
        
        {reviewsWithAlbums.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No reviews yet
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsWithAlbums.map((review, index) => (
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
    </div>
  );
}