import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AvatarUpload({ uid, url, onUpload, size = 96 }) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // BEST PRACTICE: Client-side validation (e.g., 2MB limit)
      // 2MB = 2 * 1024 * 1024 bytes
      const fileSizeLimit = 2 * 1024 * 1024; 
      
      if (file.size > fileSizeLimit) {
        throw new Error('Image must be less than 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateUserError) {
        throw updateUserError;
      }

      toast.success('Avatar updated!');
      if (onUpload) onUpload(); 

    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <label 
        htmlFor="avatar-upload" 
        className={`
          relative flex items-center justify-center rounded-full overflow-hidden 
          cursor-pointer shadow-2xl ring-4 ring-zinc-950 transition-all
          group-hover:ring-violet-500/50
        `}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
                <Camera className="w-6 h-6 text-white" />
            )}
        </div>

        <Avatar className="w-full h-full">
          <AvatarImage src={url} className="object-cover" />
          <AvatarFallback className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
             <User className="w-10 h-10 text-white" />
          </AvatarFallback>
        </Avatar>
      </label>
      
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}