import type { CourseLevel } from '@/types/course';

/**
 * 格式化时长（分钟）为可读格式
 * @param minutes - 分钟数
 * @returns 格式化后的字符串，如 "2h 30m" 或 "45m"
 */
export function formatDuration(minutes: number | undefined | null): string {
  if (!Number.isFinite(minutes)) {
    return '0h';
  }

  const numMinutes = Number(minutes);
  if (numMinutes <= 0) {
    return '0h';
  }

  const hours = Math.floor(numMinutes / 60);
  const mins = numMinutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * 映射课程级别为中文
 * @param level - 课程级别
 * @returns 中文级别名称
 */
export function mapLevel(level: CourseLevel | undefined | null): string {
  if (!level) {
    return 'Chưa xác định';
  }

  const levelMap: Record<CourseLevel, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
  };

  return levelMap[level] || level;
}
