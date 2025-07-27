'use client'

import React, { Component, ErrorInfo, PropsWithChildren } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface VideoErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

interface VideoErrorBoundaryProps {
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  showErrorDetails?: boolean
}

/**
 * Error boundary component specifically designed for video page errors
 * Provides user-friendly error messages and retry functionality
 */
export class VideoErrorBoundary extends Component<
  PropsWithChildren<VideoErrorBoundaryProps>,
  VideoErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: PropsWithChildren<VideoErrorBoundaryProps>) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<VideoErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VideoErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log error details for debugging
    this.logError(error, errorInfo)
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    // In production, you might want to send this to an error reporting service
    console.error('Video page error details:', errorDetails)
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }))

    // Add a small delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      // Force a re-render by updating state
      this.forceUpdate()
    }, 1000)
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  private getErrorMessage = (error?: Error): string => {
    if (!error) return 'An unexpected error occurred'

    // Categorize common errors
    if (error.message.includes('hydration')) {
      return 'There was a problem loading the page content. Please refresh to try again.'
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.'
    }

    if (error.message.includes('video') || error.message.includes('YouTube')) {
      return 'There was a problem loading the videos. Please try again.'
    }

    if (error.message.includes('image') || error.message.includes('thumbnail')) {
      return 'Some images failed to load, but the page should still work.'
    }

    return 'Something went wrong while loading the video page.'
  }

  private renderErrorUI = () => {
    const { error, retryCount } = this.state
    const { maxRetries = 3, showErrorDetails = false } = this.props
    const canRetry = retryCount < maxRetries

    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {this.getErrorMessage(error)}
            </p>
          </div>

          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="w-full bg-blazers-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}

            <button
              onClick={this.handleGoHome}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </button>
          </div>

          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Retry attempts: {retryCount}/{maxRetries}
            </p>
          )}

          {showErrorDetails && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    )
  }

  render() {
    const { hasError } = this.state
    const { fallback: CustomFallback, children } = this.props

    if (hasError) {
      if (CustomFallback) {
        return <CustomFallback error={this.state.error} retry={this.handleRetry} />
      }
      return this.renderErrorUI()
    }

    return children
  }
}

// Convenience wrapper for video-specific errors
export function VideoPageErrorBoundary({ children }: PropsWithChildren) {
  return (
    <VideoErrorBoundary
      maxRetries={2}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: sendErrorToService(error, errorInfo)
        }
      }}
    >
      {children}
    </VideoErrorBoundary>
  )
}

// Simple error fallback component
export function SimpleErrorFallback({ 
  error, 
  retry 
}: { 
  error?: Error
  retry: () => void 
}) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-500 mb-4">
        We're having trouble loading the videos.
      </p>
      <button
        onClick={retry}
        className="bg-blazers-red text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

export default VideoErrorBoundary