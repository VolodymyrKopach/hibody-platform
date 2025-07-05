// Глобальний лічильник для унікальних ID повідомлень
let messageIdCounter = 1;

/**
 * Генерує унікальний ID для повідомлення
 * @returns Унікальний числовий ID
 */
export const generateMessageId = (): number => {
  return ++messageIdCounter;
};

/**
 * Встановлює початковий лічильник ID (корисно при ініціалізації)
 * @param startId Початковий ID
 */
export const setMessageIdCounter = (startId: number): void => {
  messageIdCounter = startId;
}; 