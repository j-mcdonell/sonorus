import React, { useState, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2, Camera, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AvatarUpload Component
 * * Implements a "Proxy Click" pattern where a visible, styled container
 * triggers a hidden file input.
 * * STYLE NOTE: We use explicit 'bg-white' and 'text-black' to prevent 
 * global theme variables from making this button invisible in dark mode.
 */
export default function AvatarUpload({ uid, url, onUpload, size = 96 }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Handling the File Selection
  const handleFileSelect = async (event) => {
    try {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      // Validate File Size (Strict 2MB limit for performance)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be smaller than 2MB.');
      }

      setUploading(true);

      // Generate a clean file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase Storage ('avatars' bucket)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Retrieve the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update the Auth User's Metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateUserError) throw updateUserError;

      // Success Sequence
      toast.success('Profile image updated successfully');
      if (onUpload) onUpload(); // Trigger parent refresh

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. The "Proxy" Trigger
  // This allows us to use any custom UI to trigger the native file picker
  const triggerFilePicker = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 group">
      {/* Visual Avatar Container */}
      <div 
        className="relative cursor-pointer transition-transform active:scale-95"
        style={{ width: size, height: size }}
        onClick={triggerFilePicker}
      >
        <Avatar className="w-full h-full shadow-2xl ring-4 ring-zinc-900 group-hover:ring-zinc-700 transition-all">
          <AvatarImage src={url} className="object-cover" />
          <AvatarFallback className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <User className="w-10 h-10 text-zinc-500" />
          </AvatarFallback>
        </Avatar>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Edit Icon Badge (Always Visible) */}
        {!uploading && (
          <div className="absolute bottom-0 right-0 z-10 bg-white text-black border-4 border-zinc-950 p-2 rounded-full shadow-lg transform translate-x-1 translate-y-1 group-hover:scale-110 transition-all">
            <Camera className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Explicit 'High Contrast' Button 
        We use a standard HTML button with Tailwind classes to bypass 
        potential shadcn/ui variable conflicts.
      */}
      <button 
        type="button"
        onClick={triggerFilePicker}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-full transition-colors border border-zinc-700"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>

      {/* Hidden Native Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden" 
        aria-hidden="true"
      />
    </div>
  );
}