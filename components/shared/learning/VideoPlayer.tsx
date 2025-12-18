'use client';

import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import '@videojs/http-streaming';
import 'video.js/dist/video-js.css';
import '@/styles/video-player.css';
import { Button } from '@/components/ui/button';
import { SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { 
  LectureProgress, 
  UpdateLectureProgressDto,
  VideoPlayerOptions 
} from '@/src/types/learning';
import { enrollmentsApi } from '@/src/services/enrollments';
import { getVideoSourceInfo } from '@/src/utils/videoUrlHelper';

const SAVE_INTERVAL = 15000;
const ALLOW_SEEKING = process.env.NEXT_PUBLIC_ALLOW_VIDEO_SEEKING === 'true';

interface VideoPlayerProps {
  enrollmentId: string;
  lectureId: string;
  videoUrl: string;
  title: string;
  initialProgress?: LectureProgress;
  onProgressUpdate?: (progress: UpdateLectureProgressDto) => void;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function VideoPlayer({ 
  enrollmentId,
  lectureId,
  videoUrl, 
  title,
  onProgressUpdate,
  onComplete,
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef<UpdateLectureProgressDto | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const isSavingRef = useRef(false);
  const hasTriggeredCompletionRef = useRef(false);
  const maxWatchedTimeRef = useRef<number>(0); // Track furthest point watched
  const lastKnownTimeRef = useRef<number>(0); // Track last known position before seeking
  const isSeekingRef = useRef(false); // Track if currently seeking

  const saveProgressToAPI = async (progress: UpdateLectureProgressDto) => {
    try {
      const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
      const currentFinishedLectures = enrollment.attributes?.finishedLectures || [];
      
      let updatedFinishedLectures = currentFinishedLectures;
      if (progress.isCompleted && !currentFinishedLectures.includes(progress.lectureId)) {
        updatedFinishedLectures = [...currentFinishedLectures, progress.lectureId];
      }

      await Promise.all([
        enrollmentsApi.updateAttributes(enrollmentId, {
          attributes: {
            lectureOnlearning: {
              lectureId: progress.lectureId,
              duration: progress.duration,
              currentTime: progress.currentTime,
              lastWatchedAt: new Date().toISOString(),
              quality: {},
              volume: Math.round((progress.volume || 1) * 100),
            },
            finishedLectures: updatedFinishedLectures,
          },
        }),
        enrollmentsApi.updateStatus(enrollmentId, {
          status: 'ongoing',
        }),
      ]);
    } catch (error) {
    }
  };

  const hasProgressChanged = (newProgress: UpdateLectureProgressDto): boolean => {
    if (!lastProgressRef.current) return true;
    const last = lastProgressRef.current;
    return (
      Math.abs(newProgress.currentTime - last.currentTime) > 1 ||
      newProgress.isCompleted !== last.isCompleted ||
      newProgress.playbackRate !== last.playbackRate ||
      newProgress.volume !== last.volume
    );
  };

  const saveProgress = async (isCompleted = false) => {
    const player = playerRef.current;
    if (!player || isSavingRef.current) return;

    const currentTime = player.currentTime() || 0;
    const duration = player.duration() || 0;

    const progressData: UpdateLectureProgressDto = {
      lectureId,
      currentTime,
      duration,
      isCompleted: isCompleted || (duration > 0 && (currentTime / duration) * 100 >= 90),
      playbackRate: player.playbackRate(),
      volume: player.volume(),
    };

    if (hasProgressChanged(progressData)) {
      isSavingRef.current = true;
      lastProgressRef.current = progressData;
      
      await saveProgressToAPI(progressData);
      onProgressUpdate?.(progressData);
      
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Check if lecture is already completed and load max watched time
    const checkCompletion = async () => {
      try {
        const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
        const finishedLectures = enrollment.attributes?.finishedLectures || [];
        if (finishedLectures.includes(lectureId)) {
          setIsCompleted(true);
          hasTriggeredCompletionRef.current = true;
        }
        
        // Load max watched time from saved progress
        const lectureOnlearning = enrollment.attributes?.lectureOnlearning;
        if (lectureOnlearning && String(lectureOnlearning.lectureId) === String(lectureId)) {
          maxWatchedTimeRef.current = lectureOnlearning.currentTime ?? 0;
        }
      } catch (error) {
        // Ignore error
      }
    };
    
    checkCompletion();

    const handleBeforeUnload = () => {
      saveProgress();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveProgress();
      }
    };

    const handleSeekToTime = (event: CustomEvent) => {
      const { seconds } = event.detail;
      
      if (playerRef.current && !playerRef.current.isDisposed()) {
        try {
          playerRef.current.currentTime(seconds);
          playerRef.current.play();
        } catch (error) {
          console.error('Error seeking video:', error);
        }
      }
    };

    const handleRequestCurrentTime = () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        const currentTime = playerRef.current.currentTime() || 0;
        const event = new CustomEvent('currentTimeResponse', { 
          detail: { currentTime } 
        });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent('currentTimeResponse', { 
          detail: { currentTime: 0 } 
        });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('seekToTime', handleSeekToTime as EventListener);
    window.addEventListener('requestCurrentTime', handleRequestCurrentTime);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('seekToTime', handleSeekToTime as EventListener);
      window.removeEventListener('requestCurrentTime', handleRequestCurrentTime);
      setIsMounted(false);
    };
  }, [enrollmentId, lectureId]);

  useEffect(() => {
    if (!isMounted || !videoRef.current) return;

    if (!document.body.contains(videoRef.current)) {
      return;
    }

    if (playerRef.current) {
      return;
    }

    hasTriggeredCompletionRef.current = false;
    lastProgressRef.current = null;
    setIsCompleted(false);

    // Validate video URL first
    if (!videoUrl || videoUrl.trim() === '') {
      // This is expected for lectures without video - show friendly message
      setVideoError('Bài giảng này chưa có video. Vui lòng liên hệ giảng viên để được hỗ trợ.');
      setIsLoading(false);
      return;
    }

    // Get video source information
    const videoSource = getVideoSourceInfo(videoUrl);

    // Validate video source
    if (!videoSource.url || videoSource.type === 'unknown') {
      console.error('Invalid video URL format:', videoUrl);
      setVideoError('Định dạng URL video không hợp lệ. Vui lòng kiểm tra lại.');
      setIsLoading(false);
      return;
    }

    // Add small delay to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      if (!videoRef.current) return;

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

      let player: any;
      try {
        player = videojs(videoRef.current, options);
        playerRef.current = player;

        // Set source with proper type
        player.src({
          src: videoSource.url,
          type: videoSource.mimeType,
        });

        // Error handling for streaming issues
        player.on('error', () => {
        const error = player.error();
        console.error('Video.js error:', error);
        console.error('Video URL:', videoUrl);
        console.error('Processed source:', videoSource);
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
              errorMessage = 'Không tìm thấy video hoặc bị chặn CORS. Vui lòng kiểm tra URL video.';
              break;
            default:
              errorMessage = `Lỗi video (mã: ${error.code})`;
          }
          
          setVideoError(errorMessage);
          
          // Try to reload for network errors
          if (error.code === 2) {
            setTimeout(() => {
              if (playerRef.current && !playerRef.current.isDisposed()) {
                setVideoError(null);
                setIsLoading(true);
                playerRef.current.load();
              }
            }, 3000);
          }
        }
        });
      } catch (error) {
        console.error('Error initializing video player:', error);
        setVideoError('Không thể khởi tạo trình phát video');
        setIsLoading(false);
        return;
      }

      // Load and apply saved progress
      let progressLoaded = false;
      let savedTimeToSeek = 0;
      let retryCount = 0;
      const MAX_RETRIES = 20;

      const loadProgress = async () => {
        if (progressLoaded) return;
        
        try {
          const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
          const lectureOnlearning = enrollment.attributes?.lectureOnlearning;
          if (lectureOnlearning && String(lectureOnlearning.lectureId) === String(lectureId)) {
            savedTimeToSeek = lectureOnlearning.currentTime ?? 0;
            maxWatchedTimeRef.current = savedTimeToSeek; // Set initial max watched time
            const volume = (lectureOnlearning.volume ?? 100) / 100;
            
            player.volume(volume);
            progressLoaded = true;
          } else {
            progressLoaded = true;
          }
        } catch (error) {
          progressLoaded = true;
        }
      };

      const attemptSeek = () => {
        if (!progressLoaded || savedTimeToSeek <= 0) {
          return;
        }
        
        const duration = player.duration();
        const currentTime = player.currentTime() ?? 0;
        
        if (duration && !isNaN(duration) && duration > 0) {
          if (savedTimeToSeek < duration - 1 && Math.abs(currentTime - savedTimeToSeek) > 1) {
            player.currentTime(savedTimeToSeek);
          }
        } else if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(attemptSeek, 150);
        }
      };

      player.one('loadedmetadata', async () => {
        await loadProgress();
        attemptSeek();
      });

      player.one('canplay', () => {
        setIsLoading(false);
        const currentTime = player.currentTime() ?? 0;
        if (savedTimeToSeek > 0 && currentTime < 1) {
          attemptSeek();
        }
      });

      player.ready(() => {
        setTimeout(() => {
          const currentTime = player.currentTime() ?? 0;
          if (savedTimeToSeek > 0 && currentTime < 1) {
            attemptSeek();
          }
        }, 300);
      });

      const handleSeeking = () => {
        // Skip seeking control if:
        // 1. ALLOW_SEEKING is true (env variable)
        // 2. Lecture is already completed
        if (ALLOW_SEEKING || isCompleted) {
          return;
        }

        const targetTime = player.currentTime() || 0;
        const maxWatched = maxWatchedTimeRef.current;

        // Check if user is trying to seek forward beyond watched content
        if (targetTime > maxWatched + 2) {
          isSeekingRef.current = true; // Prevent maxWatched update during forced seek
          player.currentTime(maxWatched);
          player.pause(); // Pause video when blocking seek
          toast.warning('Bạn cần xem hết video mới có thể tua tới', {
            duration: 2000,
          });
        }
      };

      const handleSeeked = () => {
        // Reset seeking flag after a short delay to allow position to settle
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 100);
      };

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;
        
        // Only update max watched time if:
        // 1. Not currently seeking (to prevent updates during forced seek back)
        // 2. Current time is greater than max watched
        // 3. Video is playing (not paused)
        if (!isSeekingRef.current && currentTime > maxWatchedTimeRef.current && !player.paused()) {
          maxWatchedTimeRef.current = currentTime;
        }
        
        // Check completion based on MAX WATCHED time, not current time
        // This prevents completion when user seeks to 90%+ but hasn't actually watched it
        if (duration > 0 && !isNaN(duration)) {
          const maxWatchedPercentage = (maxWatchedTimeRef.current / duration) * 100;
          
          if (maxWatchedPercentage >= 90 && !hasTriggeredCompletionRef.current) {
            hasTriggeredCompletionRef.current = true;
            setIsCompleted(true);
            saveProgress(true).then(() => {
              onComplete?.();
            });
          }
        }
      };

      const handleEnded = () => {
        setIsCompleted(true);
        saveProgress(true);
        onComplete?.();
      };

      player.on('pause', () => {
        saveProgress();
      });
      player.on('ended', handleEnded);
      player.on('seeking', handleSeeking);
      player.on('seeked', handleSeeked);
      player.on('timeupdate', handleTimeUpdate);

      saveIntervalRef.current = setInterval(() => {
        if (player && !player.paused()) {
          saveProgress();
        }
      }, SAVE_INTERVAL);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      setIsLoading(true);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      if (playerRef.current && !playerRef.current.isDisposed()) {
        try {
          saveProgress();
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (error) {
          // Silent cleanup
        }
      }
    };
  }, [videoUrl, isMounted]);

  const handlePrevious = () => {
    saveProgress();
    onPrevious?.();
  };

  const handleNext = () => {
    saveProgress();
    onNext?.();
  };

  if (!isMounted) {
    return (
      <div className="w-full space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white/80 text-sm font-medium">Đang khởi tạo trình phát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">
        {title}
      </h3>
      
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-fantasy"
            playsInline
          />
        </div>

        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-white/10 blur-xl animate-pulse" />
              </div>
              <p className="text-white/90 text-sm font-medium">Đang tải video...</p>
            </div>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4 p-6 max-w-lg text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="w-full">
                <h3 className="text-white text-lg font-semibold mb-2">Lỗi Video</h3>
                <p className="text-white/80 text-sm mb-3">{videoError}</p>
                {videoUrl && videoUrl.trim() !== '' && (
                  <p className="text-white/60 text-xs mb-2">
                    Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ giảng viên hoặc hỗ trợ kỹ thuật.
                  </p>
                )}
                {process.env.NODE_ENV === 'development' && videoUrl && (
                  <details className="text-left mt-3">
                    <summary className="text-white/60 text-xs cursor-pointer hover:text-white/80">
                      Thông tin debug
                    </summary>
                    <div className="mt-2 p-3 bg-black/40 rounded text-white/70 text-xs break-all">
                      <div className="mb-2">
                        <strong>URL gốc:</strong>
                        <div className="mt-1 font-mono">{videoUrl || '(empty)'}</div>
                      </div>
                      {videoUrl && videoUrl.trim() !== '' && (
                        <>
                          <div className="mb-2">
                            <strong>URL đã xử lý:</strong>
                            <div className="mt-1 font-mono">{getVideoSourceInfo(videoUrl).url || '(empty)'}</div>
                          </div>
                          <div className="mb-2">
                            <strong>Loại:</strong> <span className="font-mono">{getVideoSourceInfo(videoUrl).type}</span>
                          </div>
                          <div>
                            <strong>MIME Type:</strong> <span className="font-mono">{getVideoSourceInfo(videoUrl).mimeType}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </div>
              {videoUrl && videoUrl.trim() !== '' && (
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
                  Thử lại
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="gap-2 hover:bg-accent hover:text-accent-foreground"
        >
          <SkipBack className="w-4 h-4" />
          Bài trước
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          className="gap-2 hover:bg-accent hover:text-accent-foreground"
        >
          Bài tiếp theo
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
