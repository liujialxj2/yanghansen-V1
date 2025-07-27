# Video Page Fixes Design Document

## Overview

This design addresses critical issues in the video page including hydration errors, image loading failures, mixed language content, and video playback problems. The solution focuses on fixing date formatting inconsistencies, improving error handling, and ensuring proper internationalization.

## Architecture

### Current Issues Analysis

1. **Hydration Error**: Server renders dates as "7/20/2025" while client renders as "2025/7/20"
2. **Image Loading**: Video thumbnails fail to load due to CORS/domain issues
3. **Mixed Language**: Chinese characters appear in English mode
4. **Video Playback**: Click handlers may not be properly configured

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Video Page Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Date Utils    │  │  Image Handler  │  │ Language Filter │ │
│  │   - Consistent  │  │  - Fallbacks    │  │  - Text Clean   │ │
│  │   - SSR/Client  │  │  - CORS Fix     │  │  - i18n Check   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Component Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   VideoList     │  │  VideoPlayer    │  │  ErrorBoundary  │ │
│  │   - Grid Layout │  │  - Play Handler │  │  - User Friendly│ │
│  │   - Responsive  │  │  - Embed Fix    │  │  - Fallbacks    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Video Data    │  │   Safe Image    │  │   Date Format   │ │
│  │   - Validation  │  │   - Domain Fix  │  │   - Locale Fix  │ │
│  │   - Filtering   │  │   - Fallbacks   │  │   - SSR Match   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Date Formatting Utility

```typescript
// lib/date-utils.ts
interface DateFormatOptions {
  locale: string;
  timeZone?: string;
  format?: 'short' | 'medium' | 'long';
}

export function formatDateConsistent(
  date: string | Date, 
  options: DateFormatOptions
): string {
  // Ensure consistent formatting between server and client
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use Intl.DateTimeFormat for consistency
  return new Intl.DateTimeFormat(options.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: options.timeZone || 'UTC'
  }).format(dateObj);
}
```

### 2. Enhanced SafeImage Component

```typescript
// components/SafeImage.tsx
interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = '/images/video-placeholder.jpg',
  className,
  onError 
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  }, [hasError, fallbackSrc, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
```

### 3. Video Data Sanitizer

```typescript
// lib/video-data-sanitizer.ts
interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  // ... other fields
}

export function sanitizeVideoData(
  videos: VideoData[], 
  locale: string
): VideoData[] {
  return videos.map(video => ({
    ...video,
    title: sanitizeText(video.title, locale),
    description: sanitizeText(video.description, locale),
    thumbnail: sanitizeThumbnailUrl(video.thumbnail),
    publishedAt: video.publishedAt // Will be formatted in component
  }));
}

function sanitizeText(text: string, locale: string): string {
  if (locale === 'en') {
    // Remove Chinese characters in English mode
    return text.replace(/[\u4e00-\u9fff]/g, '').trim();
  }
  return text;
}

function sanitizeThumbnailUrl(url: string): string {
  // Ensure thumbnail URLs are accessible
  if (url.includes('youtube.com') || url.includes('ytimg.com')) {
    return url;
  }
  // Return fallback for invalid URLs
  return '/images/video-placeholder.jpg';
}
```

### 4. Enhanced VideoList Component

```typescript
// components/VideoList.tsx
interface VideoListProps {
  videos: VideoData[];
  locale: string;
}

export function VideoList({ videos, locale }: VideoListProps) {
  const sanitizedVideos = useMemo(
    () => sanitizeVideoData(videos, locale),
    [videos, locale]
  );

  const formatDate = useCallback((dateString: string) => {
    return formatDateConsistent(dateString, { 
      locale,
      format: 'short'
    });
  }, [locale]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sanitizedVideos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          formatDate={formatDate}
          locale={locale}
        />
      ))}
    </div>
  );
}
```

### 5. Error Boundary Component

```typescript
// components/VideoErrorBoundary.tsx
interface VideoErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class VideoErrorBoundary extends Component<
  PropsWithChildren<{}>,
  VideoErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VideoErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Video page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-500 mb-4">
            We're having trouble loading the videos. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-blazers-red text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Data Models

### Video Data Structure

```typescript
interface VideoData {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  formattedViewCount: string;
  likeCount: number;
  channelTitle: string;
  publishedAt: string; // ISO string
  embedUrl: string;
  watchUrl: string;
  category: string;
  tags: string[];
}

interface VideoPageData {
  videos: VideoData[];
  totalCount: number;
  lastUpdated: string;
  categories: string[];
}
```

### Sanitized Video Data

```typescript
interface SanitizedVideoData extends Omit<VideoData, 'title' | 'description'> {
  title: string; // Cleaned for locale
  description: string; // Cleaned for locale
  thumbnail: string; // Validated URL
  formattedDate: string; // Consistently formatted
}
```

## Error Handling

### Error Types and Responses

1. **Hydration Errors**
   - Cause: Date formatting inconsistency
   - Solution: Use consistent date formatting utility
   - Fallback: Display relative time ("2 days ago")

2. **Image Loading Errors**
   - Cause: CORS, invalid URLs, network issues
   - Solution: Enhanced SafeImage with fallbacks
   - Fallback: Placeholder image with retry option

3. **Video Playback Errors**
   - Cause: Invalid YouTube URLs, embedding restrictions
   - Solution: URL validation and error boundaries
   - Fallback: Link to YouTube directly

4. **Data Loading Errors**
   - Cause: Invalid video data, network failures
   - Solution: Data validation and sanitization
   - Fallback: Empty state with retry option

### Error Boundary Strategy

```typescript
// Error handling hierarchy
VideoPage
├── VideoErrorBoundary (Page-level errors)
│   ├── VideoList
│   │   ├── VideoCard (Individual video errors)
│   │   └── SafeImage (Image-specific errors)
│   └── VideoPlayer (Playback errors)
└── LoadingState / ErrorState
```

## Testing Strategy

### Unit Tests

1. **Date Formatting**
   - Test server/client consistency
   - Test different locales
   - Test edge cases (invalid dates)

2. **Image Loading**
   - Test successful loading
   - Test error handling
   - Test fallback behavior

3. **Data Sanitization**
   - Test Chinese character removal
   - Test URL validation
   - Test data structure integrity

### Integration Tests

1. **Page Rendering**
   - Test hydration without errors
   - Test responsive layout
   - Test error boundaries

2. **Video Playback**
   - Test click handlers
   - Test YouTube embedding
   - Test error states

### Performance Tests

1. **Loading Performance**
   - Measure initial page load
   - Test image loading optimization
   - Monitor memory usage

2. **Runtime Performance**
   - Test scroll performance
   - Monitor re-render frequency
   - Check for memory leaks

## Implementation Plan

### Phase 1: Critical Fixes
1. Fix date formatting hydration error
2. Implement enhanced SafeImage component
3. Add error boundaries
4. Clean mixed language content

### Phase 2: Enhanced Features
1. Improve video playback handling
2. Add loading states
3. Implement responsive optimizations
4. Add performance monitoring

### Phase 3: Polish and Testing
1. Comprehensive testing
2. Performance optimization
3. Accessibility improvements
4. Documentation updates

## Migration Strategy

1. **Backward Compatibility**: Maintain existing video data structure
2. **Gradual Rollout**: Implement fixes incrementally
3. **Fallback Support**: Ensure graceful degradation
4. **Monitoring**: Track error rates and performance metrics

This design ensures a robust, internationalized, and performant video page that handles errors gracefully while providing an excellent user experience.