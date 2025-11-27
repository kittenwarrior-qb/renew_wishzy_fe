/**
 * Format duration from seconds to human-readable format
 * @param seconds - Duration in seconds
 * @param format - Output format: 'short' (e.g., "2h 30m"), 'long' (e.g., "2 giờ 30 phút"), 'time' (e.g., "2:30:45")
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, format: 'short' | 'long' | 'time' = 'long'): string {
  if (!seconds || seconds < 0) return format === 'long' ? '0 phút' : '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (format === 'time') {
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  if (format === 'short') {
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${secs}s`;
  }

  // format === 'long'
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${hours} giờ`;
  }
  if (minutes > 0) {
    if (secs > 0) {
      return `${minutes} phút ${secs} giây`;
    }
    return `${minutes} phút`;
  }
  return `${secs} giây`;
}
