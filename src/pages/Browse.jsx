import React, { useState, useMemo } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Disc3, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import AlbumCard from '@/components/AlbumCard';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('recent');
  const [minYear, setMinYear] = useState(1950);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Album')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*');
      
      if (error) throw error;
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
    if (!Array.isArray(albums)) return [];

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

  // Filter and sort albums
  const filteredAlbums = useMemo(() => {
    let result = albumsWithScores.filter(album => {
      const matchesSearch = !searchQuery || 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Updated to match exactly against the dynamic list
      const matchesGenre = selectedGenre === 'All Genres' || album.genre === selectedGenre;
      
      const matchesYear = (!album.release_year) || 
        (album.release_year >= minYear && album.release_year <= maxYear);
        
      return matchesSearch && matchesGenre && matchesYear;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'year-desc':
          return (b.release_year || 0) - (a.release_year || 0);
        case 'year-asc':
          return (a.release_year || 0) - (b.release_year || 0);
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return result;
  }, [albumsWithScores, searchQuery, selectedGenre, sortBy, minYear, maxYear]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-fuchsia-900/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Browse Albums</h1>
              <p className="text-zinc-400 text-sm">{filteredAlbums.length} albums found</p>
            </div>
            <Link to={createPageUrl('AddAlbum')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                Add Album
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search albums or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>

          {/* Genre Select (UPDATED) */}
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-44 bg-zinc-900/50 border-zinc-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[300px]">
              {availableGenres.map(genre => (
                <SelectItem 
                  key={genre} 
                  value={genre}
                  className="text-white hover:bg-zinc-800 focus:bg-zinc-800"
                >
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 bg-zinc-900/50 border-zinc-800 text-white">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="recent" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Recently Added</SelectItem>
              <SelectItem value="title" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Title A-Z</SelectItem>
              <SelectItem value="artist" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Artist A-Z</SelectItem>
              <SelectItem value="year-desc" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Newest First</SelectItem>
              <SelectItem value="year-asc" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Oldest First</SelectItem>
              <SelectItem value="score" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Highest Rated</SelectItem>
              <SelectItem value="reviews" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">Most Reviews</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-900 border-zinc-800 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Filter Albums</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <Label className="text-zinc-300">Release Year Range</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={[minYear, maxYear]}
                      onValueChange={([min, max]) => {
                        setMinYear(min);
                        setMaxYear(max);
                      }}
                      min={1950}
                      max={new Date().getFullYear()}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>{minYear}</span>
                      <span>{maxYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Albums Grid */}
        {albumsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-900/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-20">
            <Disc3 className="w-20 h-20 mx-auto text-zinc-800 mb-4" />
            <h3 className="text-xl font-medium text-zinc-400">No albums found</h3>
            <p className="text-zinc-500 mt-2 mb-6">Try adjusting your search or filters</p>
            <Link to={createPageUrl('AddAlbum')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                Add the First Album
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredAlbums.map((album, index) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <AlbumCard 
                  album={album} 
                  score={album.score} 
                  reviewCount={album.reviewCount} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}