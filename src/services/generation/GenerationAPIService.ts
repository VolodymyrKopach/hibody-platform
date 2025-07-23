import { AgeGroupConfig, FormData } from '@/types/generation';
import { logger } from '@/utils/logger';

// === SOLID: SRP - Types for API communication ===
interface GenerateLessonRequest {
  ageGroupConfig: AgeGroupConfig;
  formData: FormData;
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
    slides: any[];
  };
  error?: string;
  code?: string;
}

interface SaveConfigurationRequest {
  ageGroupId: string;
  configuration: Record<string, any>;
  name: string;
  description?: string;
}

interface SaveConfigurationResponse {
  success: boolean;
  configurationId?: string;
  error?: string;
  code?: string;
}

interface GetConfigurationsRequest {
  ageGroupId?: string;
  limit?: number;
  offset?: number;
}

interface GetConfigurationsResponse {
  success: boolean;
  configurations?: Array<{
    id: string;
    name: string;
    description?: string;
    configuration: Record<string, any>;
    ageGroupId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  total?: number;
  error?: string;
  code?: string;
}

interface DeleteConfigurationRequest {
  configurationId: string;
}

interface DeleteConfigurationResponse {
  success: boolean;
  error?: string;
  code?: string;
}

interface GetGenerationCapabilitiesResponse {
  success: boolean;
  capabilities?: {
    maxSlideCount: number;
    supportedAgeGroups: string[];
    supportedLanguages: string[];
    supportedFormats: string[];
    features: string[];
  };
  error?: string;
  code?: string;
}

// === SOLID: SRP - Custom error class ===
export class GenerationAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
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
      logger.generation.info('Starting lesson generation', {
        method: 'generateLesson',
        ageGroup: request.ageGroupConfig.id || 'unknown'
      });
      
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

      logger.generation.info('Lesson generated successfully', {
        method: 'generateLesson',
        lessonId: data.lesson?.id
      });
      return data;
      
    } catch (error) {
      logger.generation.error('Error generating lesson', error as Error, {
        method: 'generateLesson'
      });
      
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
  async saveConfiguration(request: SaveConfigurationRequest): Promise<SaveConfigurationResponse> {
    try {
      logger.generation.debug('Saving configuration', {
        method: 'saveConfiguration',
        ageGroup: request.ageGroupId
      });
      
      const response = await fetch(`${this.baseUrl}/configurations`, {
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

      logger.generation.info('Configuration saved successfully', {
        method: 'saveConfiguration',
        configId: data.configurationId
      });
      return data;
      
    } catch (error) {
      logger.generation.error('Error saving configuration', error as Error, {
        method: 'saveConfiguration'
      });
      
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
  async getConfigurations(request: GetConfigurationsRequest = {}): Promise<GetConfigurationsResponse> {
    try {
      logger.generation.debug('Getting configurations', {
        method: 'getConfigurations',
        ageGroup: request.ageGroupId
      });
      
      const params = new URLSearchParams();
      if (request.ageGroupId) params.append('ageGroupId', request.ageGroupId);
      if (request.limit) params.append('limit', request.limit.toString());
      if (request.offset) params.append('offset', request.offset.toString());

      const url = `${this.baseUrl}/configurations${params.toString() ? `?${params.toString()}` : ''}`;
      
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

      logger.generation.info('Configurations retrieved successfully', {
        method: 'getConfigurations',
        count: data.configurations?.length || 0
      });
      return data;
      
    } catch (error) {
      logger.generation.error('Error getting configurations', error as Error, {
        method: 'getConfigurations'
      });
      
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
  async deleteConfiguration(request: DeleteConfigurationRequest): Promise<DeleteConfigurationResponse> {
    try {
      logger.generation.debug('Deleting configuration', {
        method: 'deleteConfiguration',
        configId: request.configurationId
      });
      
      const response = await fetch(`${this.baseUrl}/configurations/${request.configurationId}`, {
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

      logger.generation.info('Configuration deleted successfully', {
        method: 'deleteConfiguration',
        configId: request.configurationId
      });
      return data;
      
    } catch (error) {
      logger.generation.error('Error deleting configuration', error as Error, {
        method: 'deleteConfiguration',
        configId: request.configurationId
      });
      
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
  async getGenerationCapabilities(): Promise<GetGenerationCapabilitiesResponse> {
    try {
      logger.generation.debug('Getting generation capabilities', {
        method: 'getGenerationCapabilities'
      });
      
      const response = await fetch(`${this.baseUrl}/capabilities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new GenerationAPIError(
          data.error || 'Failed to get generation capabilities',
          response.status,
          data.code
        );
      }

      logger.generation.info('Capabilities retrieved successfully', {
        method: 'getGenerationCapabilities'
      });
      return data;
      
    } catch (error) {
      logger.generation.error('Error getting capabilities', error as Error, {
        method: 'getGenerationCapabilities'
      });
      
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