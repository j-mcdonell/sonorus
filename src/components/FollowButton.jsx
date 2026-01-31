import React from 'react';
import { supabase } from '@/api/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function FollowButton({ 
  criticEmail, 
  criticName, 
  currentUserEmail, 
  isFollowing, 
  followId,
  size = "sm" 
}) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing && followId) {
        // Delete the follow record
        const { error } = await supabase
          .from('Follow')
          .delete()
          .eq('id', followId);
        if (error) throw error;
      } else {
        // Create a new follow record
        const { error } = await supabase
          .from('Follow')
          .insert([{
            follower_email: currentUserEmail,
            following_email: criticEmail,
            following_name: criticName
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Refresh the 'follows' list so the UI updates immediately
      queryClient.invalidateQueries(['follows']);
      toast.success(isFollowing ? `Unfollowed ${criticName}` : `Now following ${criticName}`);
    },
    onError: (error) => {
      console.error('Follow action failed:', error);
      toast.error('Failed to update follow status');
    }
  });

  // Don't show the button if not logged in or if looking at own profile
  if (!currentUserEmail || currentUserEmail === criticEmail) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        followMutation.mutate();
      }}
      disabled={followMutation.isPending}
      className={cn(
        "transition-all",
        isFollowing 
          ? "border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400" 
          : "bg-violet-600 hover:bg-violet-700 text-white"
      )}
    >
      {followMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-1.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Follow
        </>
      )}
    </Button>
  );
}