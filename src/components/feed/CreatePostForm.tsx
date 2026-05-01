'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPost } from '@/lib/actions/posts';

export default function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;

    startTransition(async () => {
      let imageUrl: string | null = null;

      if (imageFile) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const ext = imageFile.name.split('.').pop();
        const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
        await supabase.storage.from('post-images').upload(path, imageFile);
        imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;
      }

      await createPost(content.trim() || null, imageUrl || null);

      setContent('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      router.refresh();
    });
  };

  const isDisabled = isPending || (!content.trim() && !imageFile);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
      />

      {imagePreview && (
        <div className="relative mt-2 inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 rounded-xl object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center rounded-full p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Attach image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className="flex-shrink-0 px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}
