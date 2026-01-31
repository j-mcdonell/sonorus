import React, { useState, useMemo } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Clock, Disc3, ChevronRight, Music2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlbumCard from '@/components/AlbumCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');

  // Updated: Supabase Query
  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data } = await supabase
        .from('Album')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  // Updated: Supabase Query
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data } = await supabase
        .from('Review')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    }
  });

  // NEW: Dynamically extract genres from the loaded albums
  const availableGenres = useMemo(() => {
    if (!Array.isArray(albums)) return ['All Genres'];
    
    // 1. Get all genres
    // 2. Filter out empty/null ones
    // 3. Create a Set to remove duplicates
    const distinctGenres = new Set(
      albums
        .map(a => a.genre)
        .filter(g => g && g.trim() !== '')
    );

    // Return "All Genres" + sorted list of actual genres
    return ['All Genres', ...Array.from(distinctGenres).sort()];
  }, [albums]);

  // Calculate scores for each album
  const albumsWithScores = useMemo(() => {
    return albums.map(album => {
      const albumReviews = reviews.filter(r => r.album_id === album.id);
      const avgScore = albumReviews.length > 0
        ? albumReviews.reduce((sum, r) => sum + r.rating, 0) / albumReviews.length
        : null;
      return {
        ...album,
        score: avgScore,
        reviewCount: albumReviews.length
      };
    });
  }, [albums, reviews]);

  // Get top rated albums
  const topRated = useMemo(() => {
    return albumsWithScores
      .filter(a => a.score !== null && a.reviewCount >= 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [albumsWithScores]);

  // Get recently added
  const recentlyAdded = useMemo(() => {
    return albumsWithScores.slice(0, 8);
  }, [albumsWithScores]);

  // Filter albums
  const filteredAlbums = useMemo(() => {
    return albumsWithScores.filter(album => {
      const matchesSearch = !searchQuery || 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Updated: Check against "All Genres"
      const matchesGenre = selectedGenre === 'All Genres' || album.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    });
  }, [albumsWithScores, searchQuery, selectedGenre]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
              <Music2 className="w-4 h-4" />
              Community-driven music reviews
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
              Discover Music Through Real Reviews
            </h1>
            <p className="text-lg text-zinc-400 mb-8">
              Read and write reviews for your favorite albums. See what the community thinks and share your own opinions.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search albums or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-zinc-900/50 border-zinc-800 rounded-2xl text-white placeholder:text-zinc-500 focus:border-violet-500 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Top Rated Section */}
        {topRated.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold">Top Rated Albums</h2>
              </div>
              <Link 
                to={createPageUrl('Browse')} 
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topRated.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AlbumCard album={album} score={album.score} reviewCount={album.reviewCount} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Section */}
        {recentlyAdded.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/20">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold">Recently Added</h2>
              </div>
              <Link 
                to={createPageUrl('Browse')} 
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentlyAdded.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AlbumCard album={album} score={album.score} reviewCount={album.reviewCount} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Genre */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Disc3 className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold">Browse Albums</h2>
          </div>

          {/* Genre Filter (UPDATED: Now Dynamic) */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 mb-6">
            <Tabs value={selectedGenre} onValueChange={setSelectedGenre}>
              <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-auto inline-flex">
                {availableGenres.map(genre => (
                  <TabsTrigger
                    key={genre}
                    value={genre}
                    className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400 px-4 py-2 rounded-lg capitalize"
                  >
                    {genre}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Albums Grid */}
          {albumsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-16">
              <Disc3 className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
              <h3 className="text-xl font-medium text-zinc-400">No albums found</h3>
              <p className="text-zinc-500 mt-2">Try adjusting your search or filter</p>
              <Link 
                to={createPageUrl('AddAlbum')}
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl text-white font-medium transition-colors"
              >
                Add an Album
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <AlbumCard album={album} score={album.score} reviewCount={album.reviewCount} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}