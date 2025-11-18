'use client';

import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Button } from '@/components/ui/button';
import { SkipBack, SkipForward } from 'lucide-react';
import type { 
  LectureProgress, 
  UpdateLectureProgressDto,
  VideoPlayerOptions 
} from '@/types/learning';
import { enrollmentsApi } from '@/services/enrollments';

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

      await enrollmentsApi.updateAttributes(enrollmentId, {
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
      });
    } catch (error) {
      // Silent fail
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

    const handleBeforeUnload = () => {
      saveProgress();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsMounted(false);
    };
  }, []);

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
      };

      const player = videojs(videoRef.current, options);

      playerRef.current = player;

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
            saveProgress(true);
            onComplete?.();
          }
        }
      };

      const handleEnded = () => {
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
          <div className="text-white">Loading player...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-theme-fantasy"
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>

        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <h3 className="text-white text-lg font-semibold drop-shadow-lg">
            {title}
          </h3>
        </div>
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
