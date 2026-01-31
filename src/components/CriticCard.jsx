import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BadgeCheck, Star, FileText } from 'lucide-react';
import FollowButton from './FollowButton';

export default function CriticCard({ 
  critic, 
  currentUserEmail, 
  isFollowing, 
  followId,
  reviewCount,
  avgRating 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5 hover:border-violet-500/30 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <Link 
          to={createPageUrl(`CriticProfile?email=${encodeURIComponent(critic.email)}`)}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-violet-400">
              {critic.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate hover:text-violet-400 transition-colors">
                {critic.name}
              </h3>
              {critic.is_critic && (
                <BadgeCheck className="w-4 h-4 text-violet-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {reviewCount} reviews
              </span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(0)} avg
                </span>
              )}
            </div>
          </div>
        </Link>
        
        <FollowButton
          criticEmail={critic.email}
          criticName={critic.name}
          currentUserEmail={currentUserEmail}
          isFollowing={isFollowing}
          followId={followId}
        />
      </div>
    </motion.div>
  );
}