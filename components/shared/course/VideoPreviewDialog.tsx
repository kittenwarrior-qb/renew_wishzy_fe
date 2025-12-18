'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { getVideoSourceInfo } from '@/src/utils/videoUrlHelper';
import { Button } from '@/components/ui/button';

interface VideoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
}

export function VideoPreviewDialog({
  open,
  onOpenChange,
  videoUrl,
  title,
}: VideoPreviewDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const disposePlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.dispose();
      } catch (e) {
        console.error('Error disposing player:', e);
      }
      playerRef.current = null;
    }
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      disposePlayer();
      setIsLoading(true);
      setVideoError(null);
    }
  }, [open, disposePlayer]);

  // Initialize player when dialog opens
  useEffect(() => {
    if (!open || !videoUrl) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      // Dispose existing player first
      disposePlayer();

      const videoSource = getVideoSourceInfo(videoUrl);
      console.log('Initializing video player with:', videoSource);

      try {
        const player = videojs(videoRef.current, {
          autoplay: false,
          controls: true,
          responsive: true,
          fluid: true,
          preload: 'auto',
          sources: [{
            src: videoSource.url,
            type: videoSource.mimeType,
          }],
        });

        playerRef.current = player;

        player.on('loadeddata', () => {
          console.log('Video loaded');
          setIsLoading(false);
        });

        player.on('canplay', () => {
          console.log('Video can play');
          setIsLoading(false);
        });

        player.on('error', () => {
          const error = player.error();
          console.error('Video error:', error);
          setIsLoading(false);
          setVideoError(error?.message || 'Không thể tải video');
        });

        // Fallback: hide loading after 3 seconds regardless
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);

      } catch (error) {
        console.error('Error creating player:', error);
        setIsLoading(false);
        setVideoError('Không thể khởi tạo trình phát video');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [open, videoUrl, disposePlayer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[90vw] w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-0 gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black overflow-hidden aspect-video">
          <div data-vjs-player className="w-full h-full">
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered w-full h-full"
              playsInline
            />
          </div>

          {isLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <p className="text-white/90 text-sm font-medium">Đang tải video xem trước...</p>
              </div>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <div className="flex flex-col items-center gap-4 p-4 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Lỗi Video</h3>
                  <p className="text-white/80 text-sm">{videoError}</p>
                </div>
                <Button
                  onClick={() => {
                    setVideoError(null);
                    setIsLoading(true);
                    disposePlayer();
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
