import React, { useState, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, Loader2, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function AvatarUpload({ uid, url, onUpload, size = 96 }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileSizeLimit = 2 * 1024 * 1024; // 2MB
      
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

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateUserError) throw updateUserError;

      toast.success('Avatar updated!');
      if (onUpload) onUpload(); 

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerUpload = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 1. The Avatar Circle */}
      <div 
        className="relative group cursor-pointer" 
        style={{ width: size, height: size }}
        onClick={triggerUpload}
      >
        <Avatar className="w-full h-full shadow-2xl ring-4 ring-zinc-950 group-hover:ring-zinc-800 transition-all">
          <AvatarImage src={url} className="object-cover" />
          <AvatarFallback className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
          </AvatarFallback>
        </Avatar>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Camera Badge (Corner Icon) */}
        {!uploading && (
          <div className="absolute -bottom-1 -right-1 z-50 bg-white text-zinc-900 border-[3px] border-zinc-950 p-2 rounded-full shadow-lg group-hover:bg-zinc-200 transition-colors">
            <Camera className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 2. EXPLICIT Text Button (Fallback) */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={triggerUpload} 
        disabled={uploading}
        className="h-8 text-xs border-zinc-700 hover:bg-zinc-800 hover:text-white"
      >
        <Upload className="w-3 h-3 mr-2" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>
      
      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden" 
      />
    </div>
  );
}