import React, { useMemo, useContext, useState } from 'react'; // FIX 1: Added useState
import { AuthContext } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, BadgeCheck, Users, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CriticCard from '@/components/CriticCard';

export default function Critics() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useContext(AuthContext);

  // FIX 2: Updated to safe async/await pattern
  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Review').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // FIX 3: Updated to safe async/await pattern
  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Follow')
        .select('*')
        .eq('follower_email', currentUser?.email);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  // Build critic profiles from reviews
  const critics = useMemo(() => {
    // FIX 4: Safety check to ensure reviews is an array
    if (!Array.isArray(reviews)) return [];

    const criticMap = {};
    
    reviews.forEach(review => {
      // Note: created_by is required in your new table, so this is safe
      const email = review.created_by;
      const name = review.reviewer_name || 'Anonymous';
      
      if (!criticMap[email]) {
        criticMap[email] = {
          email,
          name,
          is_critic: review.is_critic,
          reviews: [],
          totalRating: 0
        };
      }
      
      criticMap[email].reviews.push(review);
      criticMap[email].totalRating += review.rating;
      if (review.is_critic) criticMap[email].is_critic = true;
    });

    return Object.values(criticMap).map(c => ({
      ...c,
      reviewCount: c.reviews.length,
      avgRating: c.totalRating / c.reviews.length
    }));
  }, [reviews]);

  // Filter and sort critics
  const filteredCritics = useMemo(() => {
    return critics.filter(c => 
      !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [critics, searchQuery]);

  const verifiedCritics = filteredCritics.filter(c => c.is_critic);
  const topCritics = [...filteredCritics].sort((a, b) => b.reviewCount - a.reviewCount);
  
  const followingList = useMemo(() => {
    // Safety check for follows array
    if (!Array.isArray(follows)) return [];
    
    const followingEmails = new Set(follows.map(f => f.following_email));
    return filteredCritics.filter(c => followingEmails.has(c.email));
  }, [filteredCritics, follows]);

  const getFollowInfo = (criticEmail) => {
    // Safety check
    if (!Array.isArray(follows)) return { isFollowing: false, followId: null };
    
    const follow = follows.find(f => f.following_email === criticEmail);
    return {
      isFollowing: !!follow,
      followId: follow?.id
    };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-fuchsia-900/10" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-6">
            <Users className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Critics & Reviewers</h1>
          <p className="text-zinc-400">Follow your favorite critics to see their latest reviews</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search critics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-zinc-900/50 border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:border-violet-500"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 mb-8 w-full sm:w-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-4"
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Top Critics
            </TabsTrigger>
            <TabsTrigger 
              value="verified" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-4"
            >
              <BadgeCheck className="w-4 h-4 mr-2" /> Verified
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-4"
            >
              <Users className="w-4 h-4 mr-2" /> Following ({followingList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="space-y-4">
              {topCritics.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No critics found
                </div>
              ) : (
                topCritics.map((critic, index) => {
                  const { isFollowing, followId } = getFollowInfo(critic.email);
                  return (
                    <motion.div
                      key={critic.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CriticCard
                        critic={critic}
                        currentUserEmail={currentUser?.email}
                        isFollowing={isFollowing}
                        followId={followId}
                        reviewCount={critic.reviewCount}
                        avgRating={critic.avgRating}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="mt-0">
            <div className="space-y-4">
              {verifiedCritics.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No verified critics found
                </div>
              ) : (
                verifiedCritics.map((critic, index) => {
                  const { isFollowing, followId } = getFollowInfo(critic.email);
                  return (
                    <motion.div
                      key={critic.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CriticCard
                        critic={critic}
                        currentUserEmail={currentUser?.email}
                        isFollowing={isFollowing}
                        followId={followId}
                        reviewCount={critic.reviewCount}
                        avgRating={critic.avgRating}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            <div className="space-y-4">
              {!currentUser ? (
                <div className="text-center py-12 text-zinc-500">
                  Log in to see who you're following
                </div>
              ) : followingList.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  You're not following anyone yet
                </div>
              ) : (
                followingList.map((critic, index) => {
                  const { isFollowing, followId } = getFollowInfo(critic.email);
                  return (
                    <motion.div
                      key={critic.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CriticCard
                        critic={critic}
                        currentUserEmail={currentUser?.email}
                        isFollowing={isFollowing}
                        followId={followId}
                        reviewCount={critic.reviewCount}
                        avgRating={critic.avgRating}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}