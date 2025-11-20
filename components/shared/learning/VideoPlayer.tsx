'use client';

import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import '@videojs/http-streaming';
import 'video.js/dist/video-js.css';
import { Button } from '@/components/ui/button';
import { SkipBack, SkipForward, Loader2 } from 'lucide-react';
import type { 
  LectureProgress, 
  UpdateLectureProgressDto,
  VideoPlayerOptions 
} from '@/types/learning';
import { enrollmentsApi } from '@/services/enrollments';
import { getVideoSourceInfo } from '@/utils/videoUrlHelper';

const SAVE_INTERVAL = 15000;

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

    // Check if lecture is already completed
    const checkCompletion = async () => {
      try {
        const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
        const finishedLectures = enrollment.attributes?.finishedLectures || [];
        if (finishedLectures.includes(lectureId)) {
          setIsCompleted(true);
          hasTriggeredCompletionRef.current = true;
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
      console.log('VideoPlayer received seekToTime event:', seconds);
      console.log('Player ref exists:', !!playerRef.current);
      console.log('Player disposed:', playerRef.current?.isDisposed());
      
      if (playerRef.current && !playerRef.current.isDisposed()) {
        try {
          playerRef.current.currentTime(seconds);
          playerRef.current.play();
          console.log('Video seeked to:', seconds, 'and playing');
        } catch (error) {
          console.error('Error seeking video:', error);
        }
      } else {
        console.warn('Player not ready for seeking');
      }
    };

    const handleRequestCurrentTime = () => {
      console.log('VideoPlayer received requestCurrentTime event');
      console.log('Player ref exists:', !!playerRef.current);
      
      if (playerRef.current && !playerRef.current.isDisposed()) {
        const currentTime = playerRef.current.currentTime() || 0;
        console.log('Sending current time:', currentTime);
        const event = new CustomEvent('currentTimeResponse', { 
          detail: { currentTime } 
        });
        window.dispatchEvent(event);
      } else {
        console.warn('Player not ready, sending default time');
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

    // Get video source information
    const videoSource = getVideoSourceInfo(videoUrl);
    console.log('Video source info:', videoSource);

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

      const player = videojs(videoRef.current, options);

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
          
          // Try to reload for network errors
          if (error.code === 2 || error.code === 4) {
            console.log('Network error detected, attempting to reload in 3 seconds...');
            setTimeout(() => {
              if (playerRef.current && !playerRef.current.isDisposed()) {
                setVideoError(null);
                setIsLoading(true);
                player.load();
              }
            }, 3000);
          }
        }
      });

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

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;
        
        if (duration > 0 && !isNaN(duration)) {
          const watchedPercentage = (currentTime / duration) * 100;
          
          if (watchedPercentage >= 90 && !hasTriggeredCompletionRef.current) {
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
            <p className="text-white/80 text-sm font-medium">Initializing player...</p>
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
            crossOrigin="anonymous"
          />
        </div>

        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-white/10 blur-xl animate-pulse" />
              </div>
              <p className="text-white/90 text-sm font-medium">Loading video...</p>
            </div>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4 p-4 max-w-md text-center">
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

      <div className="flex items-center justify-between px-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="gap-2 hover:bg-accent hover:text-accent-foreground"
        >
          <SkipBack className="w-4 h-4" />
          Previous Lecture
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          className="gap-2 hover:bg-accent hover:text-accent-foreground"
        >
          Next Lecture
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
