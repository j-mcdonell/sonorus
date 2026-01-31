// src/lib/lastfm.js

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
// FIX: Changed http to https to prevent "Mixed Content" errors on Vercel
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Search for albums on Last.fm
 */
export async function searchLastFmAlbums(query) {
  if (!query) return [];
  
  const params = new URLSearchParams({
    method: 'album.search',
    album: query,
    api_key: API_KEY,
    format: 'json',
    limit: 5
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  
  // Last.fm returns matches in 'results.albummatches.album'
  return data.results?.albummatches?.album || [];
}

/**
 * Get detailed album info
 */
export async function getLastFmAlbumDetails(artist, albumName, mbid) {
  const params = new URLSearchParams({
    method: 'album.getinfo',
    api_key: API_KEY,
    format: 'json',
    autocorrect: 1
  });

  if (mbid) {
    params.append('mbid', mbid);
  } else {
    params.append('artist', artist);
    params.append('album', albumName);
  }

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();
  
  if (data.error || !data.album) {
    throw new Error(data.message || 'Album details not found');
  }

  const album = data.album;

  const images = album.image || [];
  const coverUrl = images.find(img => img.size === 'mega')?.['#text'] || 
                   images.find(img => img.size === 'extralarge')?.['#text'] || 
                   images.find(img => img.size === 'large')?.['#text'] || '';

  let tracklist = [];
  if (album.tracks && album.tracks.track) {
    const tracks = Array.isArray(album.tracks.track) 
      ? album.tracks.track 
      : [album.tracks.track]; 
      
    tracklist = tracks.map(t => t.name);
  }

  let genre = '';
  if (album.tags && album.tags.tag) {
    const tags = Array.isArray(album.tags.tag) ? album.tags.tag : [album.tags.tag];
    const firstTag = tags[0]?.name;
    if (firstTag) {
      genre = firstTag.charAt(0).toUpperCase() + firstTag.slice(1);
    }
  }

  let description = album.wiki?.summary || '';
  description = description.replace(/<a\b[^>]*>(.*?)<\/a>/i, "").replace(/\s*Read more on Last.fm.*/, "");

  return {
    title: album.name,
    artist: album.artist,
    cover_url: coverUrl,
    release_year: new Date().getFullYear(), 
    spotify_url: album.url, 
    description: description,
    genre: genre,
    tracklist: tracklist
  };
}