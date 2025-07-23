// Global counter for unique message IDs
let messageIdCounter = 1;

/**
 * Generates a unique ID for a message
 * @returns Unique numerical ID
 */
export const generateMessageId = (): number => {
  return ++messageIdCounter;
};

/**
 * Sets the initial ID counter (useful for initialization)
 * @param startId Initial ID
 */
export const setMessageIdCounter = (startId: number): void => {
  messageIdCounter = startId;
}; 