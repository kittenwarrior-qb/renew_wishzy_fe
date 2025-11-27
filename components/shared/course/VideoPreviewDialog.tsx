'use client';

import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import '@videojs/http-streaming';
import 'video.js/dist/video-js.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { getVideoSourceInfo } from '@/src/utils/videoUrlHelper';
import type { VideoPlayerOptions } from '@/types/learning';
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
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setIsLoading(true);
      setVideoError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !isMounted || !videoRef.current) return;

    if (!document.body.contains(videoRef.current)) {
      return;
    }

    if (playerRef.current) {
      return;
    }

    const videoSource = getVideoSourceInfo(videoUrl);
    console.log('Video preview source:', videoSource);

    const initTimeout = setTimeout(() => {
      if (!videoRef.current || !open) return;

      const options: VideoPlayerOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          volumePanel: { inline: false },
          pictureInPictureToggle: true,
        },
        userActions: {
          hotkeys: true,
        },
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            fastQualityChange: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      };

      const player = videojs(videoRef.current, options);
      playerRef.current = player;

      player.src({
        src: videoSource.url,
        type: videoSource.mimeType,
      });

      player.on('error', () => {
        const error = player.error();
        console.error('Video preview error:', error);
        setIsLoading(false);
        
        if (error) {
          let errorMessage = 'Failed to load video';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Video loading aborted';
              break;
            case 2:
              errorMessage = 'Network error - please check your connection';
              break;
            case 3:
              errorMessage = 'Video format not supported';
              break;
            case 4:
              errorMessage = 'Video source not found or CORS blocked';
              break;
            default:
              errorMessage = `Video error (code: ${error.code})`;
          }
          
          setVideoError(errorMessage);
        }
      });

      player.one('loadedmetadata', () => {
        console.log('Video metadata loaded');
      });

      player.one('canplay', () => {
        console.log('Video can play');
        setIsLoading(false);
      });

      player.ready(() => {
        console.log('Player ready');
      });
    }, 150);

    return () => {
      clearTimeout(initTimeout);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (error) {
          console.error('Error disposing player:', error);
        }
      }
    };
  }, [open, videoUrl, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] w-full sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-6xl xl:max-w-7xl p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black overflow-hidden aspect-video">
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered vjs-theme-fantasy"
              playsInline
              crossOrigin="anonymous"
            />
          </div>

          {isLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full bg-white/10 blur-xl animate-pulse" />
                </div>
                <p className="text-white/90 text-sm font-medium">Loading preview...</p>
              </div>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-4 p-4 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Video Error</h3>
                  <p className="text-white/80 text-sm">{videoError}</p>
                </div>
                <Button
                  onClick={() => {
                    setVideoError(null);
                    setIsLoading(true);
                    if (playerRef.current && !playerRef.current.isDisposed()) {
                      playerRef.current.load();
                    }
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
