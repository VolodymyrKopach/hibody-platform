import { IIntentDetectionService } from './IIntentDetectionService';
import { ClaudeIntentDetectionService } from './ClaudeIntentDetectionService';
import { KeywordIntentDetectionService, NeuralIntentDetectionService } from './KeywordIntentDetectionService';

// Dependency Inversion Principle: Factory для створення ТІЛЬКИ нейронних сервісів
export class IntentDetectionServiceFactory {
  
  static createService(): IIntentDetectionService {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      // Тимчасово використовуємо keyword-based сервіс для розробки
      console.warn('Claude API key not found, using keyword-based intent detection');
      return new KeywordIntentDetectionService();
    }

    // Використовуємо ТІЛЬКИ нейронні мережі
    // Основний сервіс з резервним нейронним сервісом (обидва через AI)
    return new PureNeuralServiceWithDoubleCheck(
      new ClaudeIntentDetectionService(claudeApiKey),
      new NeuralIntentDetectionService()
    );
  }
}

// Decorator Pattern: Подвійна перевірка через дві різні нейронні мережі
class PureNeuralServiceWithDoubleCheck implements IIntentDetectionService {
  constructor(
    private primaryNeuralService: IIntentDetectionService,
    private secondaryNeuralService: IIntentDetectionService
  ) {}

  async detectIntent(message: string) {
    try {
      // Спочатку спробуємо основну нейронну мережу
      const primaryResult = await this.primaryNeuralService.detectIntent(message);
      
      // Якщо confidence низький, перевіримо через другу нейронну мережу
      if (primaryResult.confidence < 0.8) {
        console.log('Primary neural network confidence low, double-checking with secondary neural network...');
        
        try {
          const secondaryResult = await this.secondaryNeuralService.detectIntent(message);
          
          // Повертаємо результат з вищою confidence
          return primaryResult.confidence >= secondaryResult.confidence 
            ? primaryResult 
            : secondaryResult;
        } catch (error) {
          console.warn('Secondary neural network failed, using primary result:', error);
          return primaryResult;
        }
      }
      
      return primaryResult;
    } catch (error) {
      console.error('Primary neural network failed, trying secondary:', error);
      
      // Якщо основна нейронна мережа не працює, використовуємо резервну НЕЙРОННУ мережу
      return await this.secondaryNeuralService.detectIntent(message);
    }
  }
} 