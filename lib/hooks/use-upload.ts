"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadVideo = async (
    blob: Blob,
    campaignId: string
  ): Promise<string | null> => {
    const supabase = createClient();

    setState({ uploading: true, progress: 0, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Generate unique filename
      const uuid = crypto.randomUUID();
      const path = `${user.id}/${campaignId}/${uuid}.webm`;

      // Upload to Supabase Storage
      // Note: Supabase JS client doesn't support progress tracking directly,
      // but we can simulate progress for UX
      setState((prev) => ({ ...prev, progress: 10 }));

      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(path, blob, {
          contentType: "video/webm",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setState((prev) => ({ ...prev, progress: 100 }));

      return path;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
      setState((prev) => ({ ...prev, error: message }));
      return null;
    } finally {
      setState((prev) => ({ ...prev, uploading: false }));
    }
  };

  const reset = () => {
    setState({ uploading: false, progress: 0, error: null });
  };

  return {
    ...state,
    uploadVideo,
    reset,
  };
}
