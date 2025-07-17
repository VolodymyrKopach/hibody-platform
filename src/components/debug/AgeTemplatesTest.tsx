import React, { useState, useEffect } from 'react';
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';

/**
 * === SOLID: SRP - Компонент для тестування age-specific шаблонів ===
 */
export const AgeTemplatesTest: React.FC = () => {
  const [templates, setTemplates] = useState<Record<AgeGroup, string>>({} as Record<AgeGroup, string>);
  const [loading, setLoading] = useState(false);
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('2-3');
  const [testResults, setTestResults] = useState<string[]>([]);

  const ageGroups: AgeGroup[] = ['2-3', '4-6', '7-8', '9-10'];

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testTemplates = async () => {
    setLoading(true);
    setTestResults([]);
    addTestResult('🧪 Починаємо тестування age-specific шаблонів...');

    try {
      // Тест 1: Завантаження окремих шаблонів
      for (const ageGroup of ageGroups) {
        addTestResult(`\n📋 Тестування групи: ${ageGroup}`);
        
        try {
          const template = await ageComponentTemplatesService.getTemplateForAge(ageGroup);
          addTestResult(`✅ Шаблон завантажено, розмір: ${template.length} символів`);
          
          const description = ageComponentTemplatesService.getTemplateDescription(ageGroup);
          addTestResult(`📝 Опис: ${description.substring(0, 100)}...`);
          
          // Перевірка структури
          const hasHTML = template.includes('<!DOCTYPE html>');
          const hasCSS = template.includes('<style>');
          const hasJS = template.includes('<script>');
          const hasTitle = template.includes('роки') || template.includes('років');
          
          addTestResult(`🔍 Структура: HTML(${hasHTML ? '✅' : '❌'}) CSS(${hasCSS ? '✅' : '❌'}) JS(${hasJS ? '✅' : '❌'}) Title(${hasTitle ? '✅' : '❌'})`);
          
        } catch (error) {
          addTestResult(`❌ Помилка для групи ${ageGroup}: ${error}`);
        }
      }

      // Тест 2: Завантаження всіх шаблонів
      addTestResult(`\n🔄 Тестування завантаження всіх шаблонів...`);
      const allTemplates = await ageComponentTemplatesService.getAllTemplates();
      setTemplates(allTemplates);
      
      const loadedCount = Object.keys(allTemplates).length;
      addTestResult(`✅ Завантажено ${loadedCount} шаблонів з ${ageGroups.length} очікуваних`);
      
      if (loadedCount === ageGroups.length) {
        addTestResult(`🎉 Всі шаблони завантажено успішно!`);
      } else {
        addTestResult(`⚠️ Деякі шаблони не завантажились`);
      }

    } catch (error) {
      addTestResult(`❌ Критична помилка: ${error}`);
    } finally {
      setLoading(false);
      addTestResult(`\n✨ Тестування завершено!`);
    }
  };

  const viewTemplate = () => {
    const template = templates[selectedAge];
    if (template) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(template);
        newWindow.document.close();
      }
    }
  };

  useEffect(() => {
    // Автоматичний тест при завантаженні компонента
    testTemplates();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Тестування Age-Specific Шаблонів</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testTemplates} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Тестування...' : '🔄 Запустити тест'}
        </button>

        <select 
          value={selectedAge} 
          onChange={(e) => setSelectedAge(e.target.value as AgeGroup)}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          {ageGroups.map(age => (
            <option key={age} value={age}>{age} років</option>
          ))}
        </select>

        <button 
          onClick={viewTemplate} 
          disabled={!templates[selectedAge]}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !templates[selectedAge] ? 'not-allowed' : 'pointer'
          }}
        >
          👁️ Переглянути шаблон
        </button>
      </div>

      {/* Результати тестування */}
      <div style={{ 
        backgroundColor: '#1e1e1e', 
        color: '#00ff00', 
        padding: '15px', 
        borderRadius: '4px',
        height: '400px',
        overflowY: 'auto',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
        lineHeight: '1.4'
      }}>
        {testResults.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
        {loading && <div>⏳ Виконується тестування...</div>}
      </div>

      {/* Статистика завантажених шаблонів */}
      {Object.keys(templates).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📊 Статистика шаблонів:</h3>
          <ul>
            {ageGroups.map(age => (
              <li key={age} style={{ margin: '5px 0' }}>
                <strong>{age} років:</strong> {templates[age] ? `✅ ${templates[age].length} символів` : '❌ Не завантажено'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 