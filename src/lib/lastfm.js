// src/lib/lastfm.js

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

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

  // Prefer MBID (MusicBrainz ID) if available for accuracy, otherwise use names
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

  // Extract the largest image available
  const images = album.image || [];
  const coverUrl = images.find(img => img.size === 'mega')?.['#text'] || 
                   images.find(img => img.size === 'extralarge')?.['#text'] || 
                   images.find(img => img.size === 'large')?.['#text'] || '';

  // Format tracks
  let tracklist = [];
  if (album.tracks && album.tracks.track) {
    const tracks = Array.isArray(album.tracks.track) 
      ? album.tracks.track 
      : [album.tracks.track]; // Sometimes it's a single object, not an array
      
    tracklist = tracks.map(t => t.name);
  }

  // Tags as Genre
  let genre = '';
  if (album.tags && album.tags.tag) {
    const tags = Array.isArray(album.tags.tag) ? album.tags.tag : [album.tags.tag];
    // Grab the first tag that isn't just "albums I own" etc
    const firstTag = tags[0]?.name;
    if (firstTag) {
      genre = firstTag.charAt(0).toUpperCase() + firstTag.slice(1);
    }
  }

  // Description (remove HTML links)
  let description = album.wiki?.summary || '';
  description = description.replace(/<a\b[^>]*>(.*?)<\/a>/i, "").replace(/\s*Read more on Last.fm.*/, "");

  return {
    title: album.name,
    artist: album.artist,
    cover_url: coverUrl,
    // Last.fm doesn't always strictly validate year, but it's often in wiki. 
    // We default to current year if missing, or user can edit.
    release_year: new Date().getFullYear(), 
    spotify_url: album.url, // Last.fm URL as fallback
    description: description,
    genre: genre,
    tracklist: tracklist
  };
}