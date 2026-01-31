import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc, Search, Loader2, Music, Download, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
// FIX: Changed import to lastfm
import { searchLastFmAlbums, getLastFmAlbumDetails } from '@/lib/lastfm';

export default function AddAlbum() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    release_year: new Date().getFullYear(),
    genre: '',
    cover_url: '',
    description: '',
    spotify_url: '',
    tracklist: '' 
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchLastFmAlbums(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      toast.error("Failed to search. Check your API key.");
    } finally {
      setSearching(false);
    }
  };

  const selectAlbum = async (album) => {
    setSearching(true);
    try {
      // Last.fm needs artist + album name to get details
      const details = await getLastFmAlbumDetails(album.artist, album.name, album.mbid);
      
      setFormData({
        title: details.title,
        artist: details.artist,
        release_year: details.release_year,
        genre: details.genre,
        cover_url: details.cover_url,
        description: details.description,
        spotify_url: details.spotify_url,
        tracklist: details.tracklist.join('\n') 
      });
      
      setSearchResults([]); 
      setSearchQuery('');   
      toast.success("Album data imported!");
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch album details.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('Album')
        .insert([{
          ...formData,
          tracklist: formData.tracklist.split('\n').filter(t => t.trim() !== '')
        }]);

      if (error) throw error;

      toast.success('Album added successfully!');
      navigate('/Browse');
    } catch (error) {
      toast.error('Error adding album: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Album</h1>
          <p className="text-zinc-400">Search Last.fm to auto-fill or enter details manually.</p>
        </div>

        {/* --- SEARCH SECTION --- */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                        placeholder="Search album name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800 text-white focus:border-red-500"
                    />
                </div>
                <Button type="submit" disabled={searching} className="bg-red-600 hover:bg-red-700 text-white">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
            </form>

            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2 overflow-hidden"
                    >
                        <p className="text-sm text-zinc-500 mb-2">Select an album to import:</p>
                        {searchResults.map((album) => (
                            <button
                                key={album.url} // Last.fm IDs are weird, URL is unique enough
                                onClick={() => selectAlbum(album)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left group"
                            >
                                {/* Last.fm thumbnails */}
                                {album.image && album.image[1]?.['#text'] ? (
                                   <img src={album.image[1]['#text']} alt={album.name} className="w-10 h-10 rounded shadow-sm" />
                                ) : (
                                   <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
                                     <Music className="w-5 h-5 text-zinc-500" />
                                   </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-zinc-200 group-hover:text-red-400 transition-colors">
                                        {album.name}
                                    </div>
                                    <div className="text-xs text-zinc-500 truncate">
                                        {album.artist}
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* --- FORM (Same as before) --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Album Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-violet-500 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-violet-500 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Release Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-violet-500 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-violet-500 text-white"
              placeholder="e.g. Rock, Pop, Jazz"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image URL</Label>
            <div className="flex gap-4">
                <Input
                id="cover"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="bg-zinc-900 border-zinc-800 focus:border-violet-500 text-white flex-1"
                placeholder="https://..."
                />
                {formData.cover_url && (
                    <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-zinc-800">
                        <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-violet-500 min-h-[100px] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracklist">Tracklist (One per line)</Label>
            <Textarea
              id="tracklist"
              value={formData.tracklist}
              onChange={(e) => setFormData({ ...formData, tracklist: e.target.value })}
              className="bg-zinc-900 border-zinc-800 focus:border-violet-500 min-h-[150px] font-mono text-sm text-white"
              placeholder="Track 1
Track 2
Track 3"
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Album to Library'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}