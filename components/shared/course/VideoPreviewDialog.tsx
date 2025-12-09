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
import type { VideoPlayerOptions } from '@/src/types/learning';
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
  const initializingRef = useRef(false);

  // Cleanup player when dialog closes
  useEffect(() => {
    if (!open && playerRef.current) {
      try {
        if (!playerRef.current.isDisposed()) {
          playerRef.current.dispose();
        }
      } catch (error) {
        console.error('Error disposing player:', error);
      } finally {
        playerRef.current = null;
        initializingRef.current = false;
      }
    }
  }, [open]);

  // Initialize player when dialog opens
  useEffect(() => {
    if (!open || !videoRef.current || initializingRef.current || playerRef.current) {
      return;
    }

    // Reset states
    setIsLoading(true);
    setVideoError(null);
    initializingRef.current = true;

    const videoSource = getVideoSourceInfo(videoUrl);
    console.log('Video preview - Original URL:', videoUrl);
    console.log('Video preview - Processed source:', videoSource);

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading && !videoError && playerRef.current) {
        console.warn('Video loading timeout - taking too long');
        setIsLoading(false);
        setVideoError('Video đang tải quá lâu. Vui lòng thử lại.');
      }
    }, 20000); // 20 seconds timeout

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!videoRef.current || !open) {
        initializingRef.current = false;
        return;
      }

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

      try {
        const player = videojs(videoRef.current, options);
        playerRef.current = player;

        console.log('Setting video source:', {
          src: videoSource.url,
          type: videoSource.mimeType,
        });

        player.src({
          src: videoSource.url,
          type: videoSource.mimeType,
        });

        player.on('error', () => {
          const error = player.error();
          console.error('Video preview error:', error);
          setIsLoading(false);
          
          if (error) {
            let errorMessage = 'Không thể tải video';
            
            switch (error.code) {
              case 1:
                errorMessage = 'Tải video bị hủy';
                break;
              case 2:
                errorMessage = 'Lỗi mạng - vui lòng kiểm tra kết nối';
                break;
              case 3:
                errorMessage = 'Định dạng video không được hỗ trợ';
                break;
              case 4:
                errorMessage = 'Không tìm thấy video hoặc bị chặn CORS';
                break;
              default:
                errorMessage = `Lỗi video (mã: ${error.code})`;
            }
            
            setVideoError(errorMessage);
          }
        });

        player.one('loadedmetadata', () => {
          console.log('Video metadata loaded successfully');
          setIsLoading(false);
        });

        player.one('canplay', () => {
          console.log('Video can play');
          setIsLoading(false);
        });

        player.one('loadstart', () => {
          console.log('Video load started');
        });

        player.ready(() => {
          console.log('Player ready');
        });
      } catch (error) {
        console.error('Error initializing video player:', error);
        setIsLoading(false);
        setVideoError('Không thể khởi tạo trình phát video');
        initializingRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(safetyTimeout);
    };
  }, [open, videoUrl]);

  const handleRetry = () => {
    setVideoError(null);
    setIsLoading(true);
    initializingRef.current = false;
    
    // Dispose current player if exists
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        playerRef.current.dispose();
      } catch (error) {
        console.error('Error disposing player on retry:', error);
      }
      playerRef.current = null;
    }
    
    // Force re-render to trigger useEffect
    setTimeout(() => {
      if (videoRef.current) {
        const videoSource = getVideoSourceInfo(videoUrl);
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

        try {
          const player = videojs(videoRef.current, options);
          playerRef.current = player;
          initializingRef.current = true;

          player.src({
            src: videoSource.url,
            type: videoSource.mimeType,
          });

          player.on('error', () => {
            const error = player.error();
            setIsLoading(false);
            if (error) {
              let errorMessage = 'Không thể tải video';
              switch (error.code) {
                case 1: errorMessage = 'Tải video bị hủy'; break;
                case 2: errorMessage = 'Lỗi mạng - vui lòng kiểm tra kết nối'; break;
                case 3: errorMessage = 'Định dạng video không được hỗ trợ'; break;
                case 4: errorMessage = 'Không tìm thấy video hoặc bị chặn CORS'; break;
                default: errorMessage = `Lỗi video (mã: ${error.code})`;
              }
              setVideoError(errorMessage);
            }
          });

          player.one('loadedmetadata', () => setIsLoading(false));
          player.one('canplay', () => setIsLoading(false));
        } catch (error) {
          console.error('Error on retry:', error);
          setIsLoading(false);
          setVideoError('Không thể khởi tạo trình phát video');
        }
      }
    }, 100);
  };

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
                <p className="text-white/90 text-sm font-medium">Đang tải video xem trước...</p>
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
                  <h3 className="text-white text-lg font-semibold mb-2">Lỗi Video</h3>
                  <p className="text-white/80 text-sm mb-2">{videoError}</p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-left mt-2">
                      <summary className="text-white/60 text-xs cursor-pointer hover:text-white/80">
                        Thông tin debug
                      </summary>
                      <div className="mt-2 p-2 bg-black/40 rounded text-white/70 text-xs break-all">
                        <div><strong>URL gốc:</strong></div>
                        <div className="mb-2">{videoUrl}</div>
                        <div><strong>URL đã xử lý:</strong></div>
                        <div>{getVideoSourceInfo(videoUrl).url}</div>
                        <div className="mt-1"><strong>Loại:</strong> {getVideoSourceInfo(videoUrl).type}</div>
                      </div>
                    </details>
                  )}
                </div>
                <Button
                  onClick={handleRetry}
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
