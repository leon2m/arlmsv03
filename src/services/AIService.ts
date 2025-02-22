import { logService } from './LogService';
import { performanceMonitor } from '../utils/PerformanceMonitor';

interface AIResponse {
  suggestions: string[];
  confidence: number;
  context?: Record<string, any>;
}

interface AIRequestOptions {
  maxRetries?: number;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

class AIService {
  private static instance: AIService;
  private readonly API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT;
  private readonly API_KEY = import.meta.env.VITE_AI_API_KEY;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async getPersonalizedSuggestions(
    userId: string,
    context: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('ai_suggestions', { userId, context });

    try {
      const response = await this.makeRequest('/suggestions', {
        userId,
        context,
        ...options
      });

      performanceMonitor.endMeasure('ai_suggestions');
      return response;
    } catch (error) {
      logService.logError('AI Suggestion Error', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId,
        additionalContext: context
      });
      throw error;
    }
  }

  async analyzeLearningPattern(
    userId: string,
    learningData: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('learning_pattern_analysis', { userId });

    try {
      const response = await this.makeRequest('/analyze-pattern', {
        userId,
        learningData,
        ...options
      });

      performanceMonitor.endMeasure('learning_pattern_analysis');
      return response;
    } catch (error) {
      logService.logError('Learning Pattern Analysis Error', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId,
        additionalContext: learningData
      });
      throw error;
    }
  }

  async generateLearningPath(
    userId: string,
    goals: string[],
    preferences: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    performanceMonitor.startMeasure('generate_learning_path', { userId, goals });

    try {
      const response = await this.makeRequest('/learning-path', {
        userId,
        goals,
        preferences,
        ...options
      });

      performanceMonitor.endMeasure('generate_learning_path');
      return response;
    } catch (error) {
      logService.logError('Learning Path Generation Error', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userId,
        additionalContext: { goals, preferences }
      });
      throw error;
    }
  }

  private async makeRequest(
    endpoint: string,
    data: Record<string, any>,
    options: AIRequestOptions = {}
  ): Promise<any> {
    const {
      maxRetries = 3,
      timeout = 30000,
      priority = 'medium'
    } = options;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.API_ENDPOINT}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`,
            'X-Priority': priority
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

export const aiService = AIService.getInstance();
