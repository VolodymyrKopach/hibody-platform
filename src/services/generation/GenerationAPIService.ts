import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Types for API communication ===
interface GenerateLessonRequest {
  ageGroupConfig: AgeGroupConfig;
  formValues: FormValues;
  metadata?: {
    title?: string;
    description?: string;
    generateSlides?: boolean;
    slideCount?: number;
  };
}

interface GenerateLessonResponse {
  success: boolean;
  lesson?: {
    id: string;
    title: string;
    description: string;
    slides: Array<{
      id: string;
      title: string;
      content: string;
      htmlContent?: string;
      type: 'welcome' | 'content' | 'activity' | 'summary';
      status: 'ready' | 'generating' | 'error';
    }>;
  };
  error?: string;
  message?: string;
}

interface SaveConfigRequest {
  name: string;
  ageGroupId: string;
  formValues: FormValues;
  description?: string;
  isTemplate?: boolean;
}

interface SaveConfigResponse {
  success: boolean;
  config?: {
    id: string;
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate: boolean;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
}

interface GetConfigsResponse {
  success: boolean;
  configs?: Array<{
    id: string;
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

// === SOLID: SRP - API error handling ===
export class GenerationAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'GenerationAPIError';
  }
}

// === SOLID: SRP - Main API service ===
export class GenerationAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/generation') {
    this.baseUrl = baseUrl;
  }

  // === SOLID: SRP - Generate lesson ===
  async generateLesson(request: GenerateLessonRequest): Promise<GenerateLessonResponse> {
    try {
      console.log('🚀 API SERVICE: Generating lesson');
      
      const response = await fetch(`${this.baseUrl}/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to generate lesson',
          response.status,
          data.code
        );
      }

      console.log('✅ API SERVICE: Lesson generated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ API SERVICE: Error generating lesson:', error);
      
      if (error instanceof GenerationAPIError) {
        throw error;
      }
      
      throw new GenerationAPIError(
        'Network error while generating lesson',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  // === SOLID: SRP - Save configuration ===
  async saveConfiguration(request: SaveConfigRequest): Promise<SaveConfigResponse> {
    try {
      console.log('💾 API SERVICE: Saving configuration');
      
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to save configuration',
          response.status,
          data.code
        );
      }

      console.log('✅ API SERVICE: Configuration saved successfully');
      return data;
      
    } catch (error) {
      console.error('❌ API SERVICE: Error saving configuration:', error);
      
      if (error instanceof GenerationAPIError) {
        throw error;
      }
      
      throw new GenerationAPIError(
        'Network error while saving configuration',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  // === SOLID: SRP - Get configurations ===
  async getConfigurations(params?: {
    ageGroupId?: string;
    templatesOnly?: boolean;
  }): Promise<GetConfigsResponse> {
    try {
      console.log('📋 API SERVICE: Getting configurations');
      
      const searchParams = new URLSearchParams();
      
      if (params?.ageGroupId) {
        searchParams.append('ageGroupId', params.ageGroupId);
      }
      
      if (params?.templatesOnly) {
        searchParams.append('templatesOnly', 'true');
      }
      
      const url = `${this.baseUrl}/config${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to get configurations',
          response.status,
          data.code
        );
      }

      console.log('✅ API SERVICE: Configurations retrieved successfully');
      return data;
      
    } catch (error) {
      console.error('❌ API SERVICE: Error getting configurations:', error);
      
      if (error instanceof GenerationAPIError) {
        throw error;
      }
      
      throw new GenerationAPIError(
        'Network error while getting configurations',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  // === SOLID: SRP - Delete configuration ===
  async deleteConfiguration(configId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🗑️ API SERVICE: Deleting configuration');
      
      const response = await fetch(`${this.baseUrl}/config?id=${configId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to delete configuration',
          response.status,
          data.code
        );
      }

      console.log('✅ API SERVICE: Configuration deleted successfully');
      return data;
      
    } catch (error) {
      console.error('❌ API SERVICE: Error deleting configuration:', error);
      
      if (error instanceof GenerationAPIError) {
        throw error;
      }
      
      throw new GenerationAPIError(
        'Network error while deleting configuration',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  // === SOLID: SRP - Get generation capabilities ===
  async getCapabilities(): Promise<{
    success: boolean;
    capabilities?: {
      supportedAgeGroups: string[];
      maxSlides: number;
      supportedFormats: string[];
      features: {
        aiGeneration: boolean;
        formPersistence: boolean;
        preview: boolean;
        validation: boolean;
      };
    };
    user?: {
      id: string;
      email: string;
    };
    error?: string;
  }> {
    try {
      console.log('🔍 API SERVICE: Getting generation capabilities');
      
      const response = await fetch(`${this.baseUrl}/lesson`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to get capabilities',
          response.status,
          data.code
        );
      }

      console.log('✅ API SERVICE: Capabilities retrieved successfully');
      return data;
      
    } catch (error) {
      console.error('❌ API SERVICE: Error getting capabilities:', error);
      
      if (error instanceof GenerationAPIError) {
        throw error;
      }
      
      throw new GenerationAPIError(
        'Network error while getting capabilities',
        500,
        'NETWORK_ERROR'
      );
    }
  }
}

// === SOLID: SRP - Singleton instance ===
export const generationAPIService = new GenerationAPIService(); 