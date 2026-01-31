import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ScoreBadge from './ScoreBadge';
import GenreTag from './GenreTag';

export default function AlbumCard({ album, score, reviewCount }) {
  return (
    <Link to={createPageUrl(`AlbumDetail?id=${album.id}`)}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-violet-500/30 transition-all duration-300"
      >
        {/* Cover Art */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={album.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Score Badge */}
          <div className="absolute top-3 right-3">
            <ScoreBadge score={score} size="sm" />
          </div>
          
          {/* Genre Tag */}
          {album.genre && (
            <div className="absolute top-3 left-3">
              <GenreTag genre={album.genre} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
            {album.title}
          </h3>
          <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-500">{album.release_year}</span>
            {reviewCount !== undefined && (
              <span className="text-xs text-zinc-500">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-violet-500/5" />
        </div>
      </motion.div>
    </Link>
  );
}