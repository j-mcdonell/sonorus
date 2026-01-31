import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ThumbsUp, BadgeCheck, Quote, User } from 'lucide-react';
import { format, isValid } from 'date-fns'; // FIX: Imported isValid for safety
import ScoreBadge from './ScoreBadge';
import StarRating from './StarRating';

export default function ReviewCard({ review, album, showAlbum = false }) {
  // FIX: Handle both created_at (Supabase) and created_date (Legacy)
  const dateString = review.created_at || review.created_date;
  const dateObj = dateString ? new Date(dateString) : new Date();
  const formattedDate = isValid(dateObj) ? format(dateObj, 'MMM d, yyyy') : 'Unknown Date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 hover:border-zinc-700/50 transition-all"
    >
      {/* Header */}
      <div className="flex gap-4">
        {showAlbum && album && (
          <Link to={createPageUrl(`AlbumDetail?id=${album.id}`)}>
            <img
              src={album.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop'}
              alt={album.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
            />
          </Link>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              {showAlbum && album && (
                <Link 
                  to={createPageUrl(`AlbumDetail?id=${album.id}`)}
                  className="text-sm font-medium text-white hover:text-violet-400 transition-colors line-clamp-1"
                >
                  {album.title}
                </Link>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Link 
                to={createPageUrl(`CriticProfile?email=${encodeURIComponent(review.created_by)}`)}
                className="text-sm font-medium text-zinc-300 hover:text-violet-400 transition-colors"
              >
                  {review.reviewer_name || 'Anonymous'}
                </Link>
                {review.is_critic && (
                  <span className="inline-flex items-center gap-1 text-xs text-violet-400">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Critic
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-xs text-zinc-500">
                  {formattedDate}
                </span>
              </div>
            </div>
            <ScoreBadge score={review.rating} size="sm" />
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="mt-4 relative">
        <Quote className="absolute -left-1 -top-1 w-6 h-6 text-violet-500/20" />
        {review.title && (
          <h4 className="font-medium text-white mb-2 pl-5">{review.title}</h4>
        )}
        <p className="text-sm text-zinc-400 leading-relaxed pl-5 line-clamp-4">
          {review.content}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful ({review.helpful_count || 0})
        </button>
      </div>
    </motion.div>
  );
}