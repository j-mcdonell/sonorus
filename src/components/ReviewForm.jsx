import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from 'lucide-react';
import StarRating from './StarRating';
import ScoreBadge from './ScoreBadge';

export default function ReviewForm({ onSubmit, isSubmitting, album }) {
  const [rating, setRating] = useState(70);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      title,
      content,
      reviewer_name: reviewerName
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
        <Label className="text-white mb-4 block">Your Rating</Label>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
          <ScoreBadge score={rating} size="lg" showLabel />
        </div>
        <div className="mt-4 flex justify-center">
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
      </div>

      {/* Review Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="reviewerName" className="text-zinc-300">Your Name (optional)</Label>
          <Input
            id="reviewerName"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Anonymous"
            className="mt-1.5 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500"
          />
        </div>

        <div>
          <Label htmlFor="title" className="text-zinc-300">Review Headline (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your thoughts..."
            className="mt-1.5 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500"
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-zinc-300">Your Review *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this album..."
            required
            rows={6}
            className="mt-1.5 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 resize-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg font-medium rounded-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
}