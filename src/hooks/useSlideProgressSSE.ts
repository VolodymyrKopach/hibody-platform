import { useState, useEffect, useCallback, useRef } from 'react';
import { SlideGenerationProgress, SimpleLesson, SimpleSlide } from '@/types/chat';

interface SSEProgressData {
  progress: SlideGenerationProgress[];
  lesson: SimpleLesson;
  currentSlide?: SlideGenerationProgress;
  totalSlides: number;
  completedSlides: number;
  newSlide?: SimpleSlide;  // Новий слайд, якщо був доданий в цьому оновленні
}

interface SSECompletionData {
  lesson: SimpleLesson;
  statistics: {
    totalSlides: number;
    completedSlides: number;
    failedSlides: number;
    generationTime: number;
  };
  finalProgress: SlideGenerationProgress[];
}

interface UseSlideProgressSSEProps {
  onProgressUpdate?: (data: SSEProgressData) => void;
  onCompletion?: (data: SSECompletionData) => void;
  onError?: (error: string) => void;
}

export const useSlideProgressSSE = ({
  onProgressUpdate,
  onCompletion,
  onError
}: UseSlideProgressSSEProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<SlideGenerationProgress[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Connect to SSE stream
  const connect = useCallback((sessionId?: string) => {
    const id = sessionId || generateSessionId();
    sessionIdRef.current = id;
    
    console.log(`📡 SSE Hook: Connecting to progress stream with session ${id}`);
    
    try {
      const eventSource = new EventSource(`/api/generation/slides/progress?sessionId=${id}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('📡 SSE Hook: Connected to progress stream');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 SSE Hook: Received message:', data.type);

          switch (data.type) {
            case 'connected':
              console.log('✅ SSE Hook: Connection confirmed');
              break;

            case 'progress':
              console.log('📊 SSE Hook: Progress update received');
              setCurrentProgress(data.data.progress);
              setIsGenerating(true);
              if (onProgressUpdate) {
                onProgressUpdate(data.data);
              }
              break;

            case 'completed':
              console.log('🎉 SSE Hook: Generation completed');
              setCurrentProgress(data.data.finalProgress);
              setIsGenerating(false);
              if (onCompletion) {
                onCompletion(data.data);
              }
              // Auto-disconnect after completion
              disconnect();
              break;

            default:
              console.log('📨 SSE Hook: Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('❌ SSE Hook: Error parsing message:', error);
          if (onError) {
            onError('Failed to parse progress message');
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE Hook: Connection error:', error);
        setIsConnected(false);
        setIsGenerating(false);
        if (onError) {
          onError('Connection to progress stream lost');
        }
      };

      return id;
    } catch (error) {
      console.error('❌ SSE Hook: Failed to create EventSource:', error);
      if (onError) {
        onError('Failed to connect to progress stream');
      }
      return null;
    }
  }, [generateSessionId, onProgressUpdate, onCompletion, onError]);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 SSE Hook: Disconnecting from progress stream');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setIsGenerating(false);
      sessionIdRef.current = null;
    }
  }, []);

  // Start slide generation with progress tracking
  const startGenerationWithProgress = useCallback(async (
    slideDescriptions: any[],
    lesson: SimpleLesson,
    topic: string,
    age: string
  ) => {
    // First connect to SSE
    const sessionId = connect();
    if (!sessionId) {
      throw new Error('Failed to establish progress connection');
    }

    try {
      // Start the sequential generation with SSE session ID
      console.log('🚀 SSE Hook: Starting generation with progress tracking');
      const response = await fetch('/api/generation/slides/sequential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideDescriptions,
          lesson,
          topic,
          age,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ SSE Hook: Generation API call completed');
      return result;

    } catch (error) {
      console.error('❌ SSE Hook: Generation failed:', error);
      disconnect();
      throw error;
    }
  }, [connect, disconnect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isGenerating,
    currentProgress,
    sessionId: sessionIdRef.current,
    connect,
    disconnect,
    startGenerationWithProgress
  };
}; 