'use client';

import dynamic from 'next/dynamic';

// Динамічний імпорт тільки в development режимі
const AgeTemplatesTest = dynamic(
  () => import('@/components/debug/AgeTemplatesTest').then(mod => ({ default: mod.AgeTemplatesTest })),
  { 
    ssr: false,
    loading: () => <p>Завантаження тестового компоненту...</p> 
  }
);

/**
 * === SOLID: SRP - Тестова сторінка для age-specific шаблонів ===
 */
export default function TestAgeTemplatesPage() {
  // Показуємо тест тільки в development режимі
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Тестова сторінка доступна тільки в development режимі</h2>
      </div>
    );
  }

  return (
    <div>
      <AgeTemplatesTest />
    </div>
  );
} 