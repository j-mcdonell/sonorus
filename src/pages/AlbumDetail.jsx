import React, { useMemo, useState, useContext } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '@/lib/AuthContext';
import { 
  ArrowLeft, ExternalLink, Music, Calendar, ListMusic, 
  PenLine, Star, Users, BadgeCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScoreBadge from '@/components/ScoreBadge';
import GenreTag from '@/components/GenreTag';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import AuthDialog from '@/components/AuthDialog'; // Import the Dialog
import { toast } from 'sonner';

export default function AlbumDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get('id');
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent');
  const [showAllTracks, setShowAllTracks] = useState(false);
  
  // State for Auth Dialog
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: album, isLoading: albumLoading } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Album')
        .select('*')
        .eq('id', albumId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!albumId
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .eq('album_id', albumId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!albumId
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      if (!user?.email) throw new Error("You must be logged in to review");

      const { data, error } = await supabase
        .from('Review')
        .insert([{ 
          ...reviewData, 
          album_id: albumId,
          created_by: user.email 
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', albumId]);
      setShowReviewForm(false);
      toast.success('Your review has been submitted!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to submit review: ' + error.message);
    }
  });

  const handleWriteReviewClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowReviewForm(!showReviewForm);
    }
  };

  // ... (Keep existing scores and sortedReviews calculation logic) ...
  const scores = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { overall: null, critic: null, user: null };
    }
    const criticReviews = reviews.filter(r => r.is_critic);
    const userReviews = reviews.filter(r => !r.is_critic);
    const calcAvg = (arr) => arr.length > 0 ? arr.reduce((sum, r) => sum + r.rating, 0) / arr.length : null;
    return { overall: calcAvg(reviews), critic: calcAvg(criticReviews), user: calcAvg(userReviews) };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return [...reviews].sort((a, b) => {
      if (reviewSort === 'recent') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (reviewSort === 'highest') return b.rating - a.rating;
      if (reviewSort === 'lowest') return a.rating - b.rating;
      if (reviewSort === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      return 0;
    });
  }, [reviews, reviewSort]);

  if (albumLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
        <Music className="w-16 h-16 text-zinc-700 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Album not found</h1>
        <Link to={createPageUrl('Home')} className="text-violet-400 hover:underline">Go back home</Link>
      </div>
    );
  }

  const tracklistArray = Array.isArray(album.tracklist) ? album.tracklist : []; 
  const visibleTracks = showAllTracks ? tracklistArray : tracklistArray.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        message="Must be logged in to contribute a review"
      />

      {/* Header with Album Cover Background */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={album.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800'}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-12">
          {/* ... (Keep existing Header Content) ... */}
          <Link to={createPageUrl('Browse')} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* ... Image ... */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
              <img src={album.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400'} alt={album.title} className="w-64 h-64 md:w-72 md:h-72 rounded-2xl shadow-2xl shadow-black/50 object-cover mx-auto md:mx-0" />
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-3"><GenreTag genre={album.genre} size="md" /></div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold mb-2">{album.title}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-zinc-400 mb-4">{album.artist}</motion.p>
              
              {/* ... Stats ... */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-500 mb-6">
                {album.release_year && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {album.release_year}</span>}
                {tracklistArray.length > 0 && <span className="flex items-center gap-1.5"><ListMusic className="w-4 h-4" /> {tracklistArray.length} tracks</span>}
                <span className="flex items-center gap-1.5"><PenLine className="w-4 h-4" /> {reviews.length} reviews</span>
              </div>

              {/* ... Scores ... */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
                <div className="text-center"><ScoreBadge score={scores.overall} size="xl" /><p className="text-xs text-zinc-500 mt-2">Overall Score</p></div>
                {scores.critic !== null && <div className="text-center"><div className="flex items-center gap-2 justify-center mb-1"><BadgeCheck className="w-4 h-4 text-violet-400" /><span className="text-sm text-zinc-400">Critics</span></div><ScoreBadge score={scores.critic} size="md" /></div>}
                {scores.user !== null && <div className="text-center"><div className="flex items-center gap-2 justify-center mb-1"><Users className="w-4 h-4 text-zinc-400" /><span className="text-sm text-zinc-400">Users</span></div><ScoreBadge score={scores.user} size="md" /></div>}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {/* UPDATED BUTTON */}
                <Button
                  onClick={handleWriteReviewClick}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
                {album.spotify_url && (
                  <a href={album.spotify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <ExternalLink className="w-4 h-4" /> Listen
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ... (Keep remainder of component: Description, Tracklist, Reviews List) ... */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
             {/* ... Description & Tracklist (Same as original) ... */}
             {album.description && <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50"><h3 className="font-semibold mb-3">About</h3><p className="text-sm text-zinc-400 leading-relaxed">{album.description}</p></div>}
             {tracklistArray.length > 0 && (
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><ListMusic className="w-4 h-4 text-violet-400" /> Tracklist</h3>
                <ul className="space-y-2">
                  {visibleTracks.map((track, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400">{index + 1}</span>
                      <span className="text-zinc-300">{track}</span>
                    </li>
                  ))}
                </ul>
                {tracklistArray.length > 5 && (
                  <button onClick={() => setShowAllTracks(!showAllTracks)} className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-violet-400 hover:text-violet-300">
                    {showAllTracks ? <>Show less <ChevronUp className="w-4 h-4" /></> : <>Show all {tracklistArray.length} tracks <ChevronDown className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
             )}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence>
              {showReviewForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                  <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
                    <h3 className="text-xl font-semibold mb-6">Write Your Review</h3>
                    <ReviewForm album={album} onSubmit={(data) => createReviewMutation.mutate(data)} isSubmitting={createReviewMutation.isPending} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>
                  <Tabs value={reviewSort} onValueChange={setReviewSort}>
                    <TabsList className="bg-zinc-800/50 p-1">
                      <TabsTrigger value="recent" className="text-xs data-[state=active]:bg-zinc-700">Recent</TabsTrigger>
                      <TabsTrigger value="highest" className="text-xs data-[state=active]:bg-zinc-700">Highest</TabsTrigger>
                      <TabsTrigger value="lowest" className="text-xs data-[state=active]:bg-zinc-700">Lowest</TabsTrigger>
                      <TabsTrigger value="helpful" className="text-xs data-[state=active]:bg-zinc-700">Helpful</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <div className="p-6">
                {reviewsLoading ? (
                  <div className="space-y-4"><div className="h-32 bg-zinc-800/30 rounded-xl animate-pulse" /></div>
                ) : sortedReviews.length === 0 ? (
                  <div className="text-center py-12"><Star className="w-12 h-12 mx-auto text-zinc-700 mb-4" /><h4 className="text-lg font-medium text-zinc-400">No reviews yet</h4><p className="text-zinc-500 text-sm mt-2">Be the first to share your thoughts!</p></div>
                ) : (
                  <div className="space-y-4">{sortedReviews.map(review => (<ReviewCard key={review.id} review={review} />))}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}