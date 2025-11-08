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

const STORAGE_KEY = 'video_progress_queue';
const SAVE_INTERVAL = 15000;

interface VideoPlayerProps {
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
  lectureId,
  videoUrl, 
  title,
  initialProgress,
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
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const addToQueue = (progress: UpdateLectureProgressDto) => {
    try {
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const existingIndex = queue.findIndex((item: any) => item.lectureId === progress.lectureId);
      
      const updatedProgress = { ...progress, timestamp: new Date().toISOString() };
      
      if (existingIndex !== -1) {
        queue[existingIndex] = updatedProgress;
      } else {
        queue.push(updatedProgress);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      //
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

  const saveProgress = (isCompleted = false) => {
    const player = playerRef.current;
    if (!player) return;

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
      addToQueue(progressData);
      lastProgressRef.current = progressData;
      onProgressUpdate?.(progressData);
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

      const player = videojs(videoRef.current, options, () => {
        setIsReady(true);

        if (initialProgress && initialProgress.currentTime > 0) {
          player.currentTime(initialProgress.currentTime);
          
          if (initialProgress.playbackRate) {
            player.playbackRate(initialProgress.playbackRate);
          }
          if (initialProgress.volume !== undefined) {
            player.volume(initialProgress.volume);
          }
        }
      });

      playerRef.current = player;

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;
        
        if (duration > 0) {
          const watchedPercentage = (currentTime / duration) * 100;
          
          if (watchedPercentage >= 90 && onComplete) {
            onComplete();
          }
        }
      };

      const handleEnded = () => {
        saveProgress(true);
        if (onComplete) {
          onComplete();
        }
      };

      player.on('pause', () => saveProgress());
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
          //
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
      <div className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-white">Loading player...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
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

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="gap-2"
        >
          <SkipBack className="w-4 h-4" />
          Previous Lecture
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          className="gap-2"
        >
          Next Lecture
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
