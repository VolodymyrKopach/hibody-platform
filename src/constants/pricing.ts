/**
 * Pricing Constants
 * Централізоване зберігання цінової інформації
 */

export const SUBSCRIPTION_PRICES = {
  free: 0,
  professional: 9,
  premium: 19, // TBD - поки не визначено
} as const;

export type SubscriptionType = keyof typeof SUBSCRIPTION_PRICES;

/**
 * Отримати ціну для типу підписки
 */
export function getSubscriptionPrice(type: string): number {
  return SUBSCRIPTION_PRICES[type as SubscriptionType] || 0;
}

/**
 * Розрахувати MRR для користувача
 */
export function calculateUserMRR(subscriptionType: string): number {
  return getSubscriptionPrice(subscriptionType);
}

/**
 * Розрахувати загальний MRR для масиву користувачів
 */
export function calculateTotalMRR(subscriptions: Array<{ subscription_type: string }>): number {
  return subscriptions.reduce((sum, user) => {
    return sum + getSubscriptionPrice(user.subscription_type);
  }, 0);
}

