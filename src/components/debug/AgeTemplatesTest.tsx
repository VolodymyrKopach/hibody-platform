import React, { useState, useEffect } from 'react';
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';

/**
 * === SOLID: SRP - Component for testing age-specific templates ===
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
    addTestResult('🧪 Starting age-specific template testing...');

    try {
      // Test 1: Loading individual templates
      for (const ageGroup of ageGroups) {
        addTestResult(`\n📋 Testing group: ${ageGroup}`);
        
        try {
          const template = await ageComponentTemplatesService.getTemplateForAge(ageGroup);
          addTestResult(`✅ Template loaded, size: ${template.length} characters`);
          
          const description = ageComponentTemplatesService.getTemplateDescription(ageGroup);
          addTestResult(`📝 Description: ${description.substring(0, 100)}...`);
          
          // Structure check
          const hasHTML = template.includes('<!DOCTYPE html>');
          const hasCSS = template.includes('<style>');
          const hasJS = template.includes('<script>');
          const hasTitle = template.includes('years') || template.includes('years old'); // Adjusted for English
          
          addTestResult(`🔍 Structure: HTML(${hasHTML ? '✅' : '❌'}) CSS(${hasCSS ? '✅' : '❌'}) JS(${hasJS ? '✅' : '❌'}) Title(${hasTitle ? '✅' : '❌'})`);
          
        } catch (error) {
          addTestResult(`❌ Error for group ${ageGroup}: ${error}`);
        }
      }

      // Test 2: Loading all templates
      addTestResult(`\n🔄 Testing loading all templates...`);
      const allTemplates = await ageComponentTemplatesService.getAllTemplates();
      setTemplates(allTemplates);
      
      const loadedCount = Object.keys(allTemplates).length;
      addTestResult(`✅ Loaded ${loadedCount} templates out of ${ageGroups.length} expected`);
      
      if (loadedCount === ageGroups.length) {
        addTestResult(`🎉 All templates loaded successfully!`);
      } else {
        addTestResult(`⚠️ Some templates failed to load`);
      }

    } catch (error) {
      addTestResult(`❌ Critical error: ${error}`);
    } finally {
      setLoading(false);
      addTestResult(`\n✨ Testing completed!`);
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
    // Automatic test on component load
    testTemplates();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Age-Specific Template Testing</h1>
      
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
          {loading ? '⏳ Testing...' : '🔄 Run Test'}
        </button>

        <select 
          value={selectedAge} 
          onChange={(e) => setSelectedAge(e.target.value as AgeGroup)}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          {ageGroups.map(age => (
            <option key={age} value={age}>{age} years</option>
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
          👁️ View Template
        </button>
      </div>

      {/* Test Results */}
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
        {loading && <div>⏳ Executing test...</div>}
      </div>

      {/* Loaded Template Statistics */}
      {Object.keys(templates).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📊 Template Statistics:</h3>
          <ul>
            {ageGroups.map(age => (
              <li key={age} style={{ margin: '5px 0' }}>
                <strong>{age} years:</strong> {templates[age] ? `✅ ${templates[age].length} characters` : '❌ Not loaded'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 