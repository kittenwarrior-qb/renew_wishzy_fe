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
  const isSavingRef = useRef(false);
  const hasTriggeredCompletionRef = useRef(false);

  const saveProgressToAPI = async (progress: UpdateLectureProgressDto) => {
    try {
      // Get current enrollment to preserve existing finishedLectures
      const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
      const currentFinishedLectures = enrollment.attributes?.finishedLectures || [];
      
      // Add current lecture to finishedLectures if completed and not already in the list
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
      console.error('Failed to save progress:', error);
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

    console.log('=== Initializing VideoPlayer ===');
    console.log('Lecture ID:', lectureId);
    console.log('Enrollment ID:', enrollmentId);
    console.log('Video URL:', videoUrl);

    // Reset completion flag and last progress for new lecture
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

      const player = videojs(videoRef.current, options, () => {
        setIsReady(true);
      });

      playerRef.current = player;

      // Load and apply saved progress
      let progressLoaded = false;
      let savedTimeToSeek = 0;
      let retryCount = 0;
      const MAX_RETRIES = 20;

      const loadProgress = async () => {
        if (progressLoaded) return;
        
        try {
          console.log('=== Loading Progress ===');
          console.log('Current lectureId:', lectureId);
          console.log('EnrollmentId:', enrollmentId);
          
          const enrollment = await enrollmentsApi.getEnrollment(enrollmentId);
          const lectureOnlearning = enrollment.attributes?.lectureOnlearning;
          
          console.log('Enrollment attributes:', JSON.stringify(enrollment.attributes, null, 2));
          
          if (lectureOnlearning) {
            console.log('Saved lectureId:', lectureOnlearning.lectureId);
            console.log('Saved currentTime:', lectureOnlearning.currentTime);
            console.log('IDs match:', lectureOnlearning.lectureId === lectureId);
            console.log('ID types:', typeof lectureOnlearning.lectureId, typeof lectureId);
          }
          
          // Only load progress if it's for the current lecture
          if (lectureOnlearning && String(lectureOnlearning.lectureId) === String(lectureId)) {
            savedTimeToSeek = lectureOnlearning.currentTime || 0;
            const volume = (lectureOnlearning.volume || 100) / 100;
            
            player.volume(volume);
            progressLoaded = true;
            
            console.log(`✓ Found saved progress: ${savedTimeToSeek}s for lecture ${lectureId}`);
          } else {
            console.log('✗ No matching saved progress for this lecture');
            if (lectureOnlearning) {
              console.log(`  Saved lecture: ${lectureOnlearning.lectureId}`);
              console.log(`  Current lecture: ${lectureId}`);
            }
            progressLoaded = true;
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
          progressLoaded = true;
        }
      };

      const attemptSeek = () => {
        if (!progressLoaded) {
          console.log('Progress not loaded yet, skipping seek');
          return;
        }
        
        if (savedTimeToSeek <= 0) {
          console.log('No saved time to seek to');
          return;
        }
        
        const duration = player.duration();
        const currentTime = player.currentTime();
        
        console.log(`Attempt seek - Current: ${currentTime}s, Target: ${savedTimeToSeek}s, Duration: ${duration}s`);
        
        if (duration && !isNaN(duration) && duration > 0) {
          // Only seek if saved time is valid and less than duration
          if (savedTimeToSeek < duration - 1) {
            // Check if we're not already at the saved position
            if (Math.abs(currentTime - savedTimeToSeek) > 1) {
              player.currentTime(savedTimeToSeek);
              console.log(`✓ Successfully resumed video at ${savedTimeToSeek}s (duration: ${duration}s)`);
            } else {
              console.log(`Already at saved position ${savedTimeToSeek}s`);
            }
          } else {
            console.log(`Saved time ${savedTimeToSeek}s is too close to duration ${duration}s, starting from beginning`);
          }
        } else if (retryCount < MAX_RETRIES) {
          // Retry if duration not ready yet
          retryCount++;
          console.log(`Duration not ready (${duration}), retry ${retryCount}/${MAX_RETRIES}`);
          setTimeout(attemptSeek, 150);
        } else {
          console.error('Failed to get video duration after max retries');
        }
      };

      // Load progress first
      player.one('loadedmetadata', async () => {
        await loadProgress();
        // Try to seek immediately after loading progress
        attemptSeek();
      });

      // Backup: try again when video can play
      player.one('canplay', () => {
        if (savedTimeToSeek > 0 && player.currentTime() < 1) {
          console.log('Attempting seek on canplay event');
          attemptSeek();
        }
      });

      // Final backup: try when player is fully ready
      player.ready(() => {
        setTimeout(() => {
          if (savedTimeToSeek > 0 && player.currentTime() < 1) {
            console.log('Attempting seek on player ready');
            attemptSeek();
          }
        }, 300);
      });

      const handleTimeUpdate = () => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;
        
        if (duration > 0 && !isNaN(duration)) {
          const watchedPercentage = (currentTime / duration) * 100;
          
          // Trigger completion only once when reaching 90%
          if (watchedPercentage >= 90 && !hasTriggeredCompletionRef.current) {
            hasTriggeredCompletionRef.current = true;
            console.log(`Lecture completed at ${watchedPercentage.toFixed(1)}%`);
            saveProgress(true);
            onComplete?.();
          }
        }
      };

      const handleEnded = () => {
        saveProgress(true);
        if (onComplete) {
          onComplete();
        }
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
