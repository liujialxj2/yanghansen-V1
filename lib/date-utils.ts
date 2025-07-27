/**
 * Date formatting utilities for consistent server/client rendering
 * Prevents hydration errors by ensuring identical date formatting
 */

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  format?: 'short' | 'medium' | 'long';
  style?: 'date' | 'datetime' | 'relative';
}

/**
 * Format date consistently between server and client
 * Uses Intl.DateTimeFormat for consistent cross-platform formatting
 */
export function formatDateConsistent(
  date: string | Date, 
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    timeZone = 'UTC',
    format = 'short',
    style = 'date'
  } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDateConsistent:', date);
      return 'Invalid Date';
    }

    if (style === 'relative') {
      return formatRelativeDate(dateObj, locale);
    }

    // Use consistent formatting options
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      ...(format === 'short' && {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      ...(format === 'medium' && {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      ...(format === 'long' && {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      ...(style === 'datetime' && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Error';
  }
}

/**
 * Format relative date (e.g., "2 days ago", "1 week ago")
 */
function formatRelativeDate(date: Date, locale: string = 'en-US'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  // Find the appropriate interval
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      try {
        // Use Intl.RelativeTimeFormat for consistent localization
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(-interval, unit as Intl.RelativeTimeFormatUnit);
      } catch (error) {
        // Fallback for unsupported locales
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
  }

  return 'just now';
}

/**
 * Format date for video cards - optimized for video content
 */
export function formatVideoDate(
  publishedAt: string,
  locale: string = 'en-US'
): string {
  return formatDateConsistent(publishedAt, {
    locale,
    format: 'short',
    style: 'date',
    timeZone: 'UTC'
  });
}

/**
 * Format date for video details - more detailed format
 */
export function formatVideoDateTime(
  publishedAt: string,
  locale: string = 'en-US'
): string {
  return formatDateConsistent(publishedAt, {
    locale,
    format: 'medium',
    style: 'datetime',
    timeZone: 'UTC'
  });
}

/**
 * Get relative time for video publishing (e.g., "2 days ago")
 */
export function formatVideoRelativeTime(
  publishedAt: string,
  locale: string = 'en-US'
): string {
  return formatDateConsistent(publishedAt, {
    locale,
    style: 'relative'
  });
}

/**
 * Validate if a date string is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Convert various date formats to ISO string
 */
export function normalizeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error normalizing date:', error);
    return new Date().toISOString(); // Fallback to current date
  }
}