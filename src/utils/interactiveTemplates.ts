// Library of interactive elements and templates based on existing successful examples

import { AgeGroup } from './ageValidation';

export interface InteractiveTemplate {
  name: string;
  description: string;
  ageGroups: AgeGroup[];
  cssTemplate: string;
  jsTemplate: string;
  htmlStructure: string;
}

export const INTERACTIVE_TEMPLATES: Record<string, InteractiveTemplate> = {
  // Для малюків (3-4 роки)
  bigButtons: {
    name: 'Великі анімовані кнопки',
    description: 'Дуже великі кнопки з простими анімаціями',
    ageGroups: [AgeGroup.TODDLERS],
    cssTemplate: `
      .big-button {
        background: linear-gradient(145deg, #ff6b6b, #4ecdc4);
        border: none;
        border-radius: 25px;
        padding: 30px 50px;
        color: white;
        font-size: 32px;
        font-family: 'Comic Sans MS', cursive;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        margin: 20px;
        min-width: 200px;
        min-height: 120px;
      }
      
      .big-button:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 40px rgba(0,0,0,0.4);
      }
      
      .big-button:active {
        transform: scale(0.95);
        animation: sparkle 0.6s ease;
      }
      
      @keyframes sparkle {
        0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
        70% { box-shadow: 0 0 0 30px rgba(255, 107, 107, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
      }
    `,
    jsTemplate: `
      function addSparkleEffect(button) {
        button.addEventListener('click', function() {
          this.style.animation = 'sparkle 0.6s ease';
          // Play sound
          const audio = new Audio('data:audio/wav;base64,UklGRo4...');
          audio.play().catch(() => {});
          
          setTimeout(() => {
            this.style.animation = '';
          }, 600);
        });
      }
    `,
    htmlStructure: `
      <button class="big-button" onclick="handleBigButtonClick(this)">
        🎈 Натисни мене!
      </button>
    `
  },

  // Для дошкільнят (5-6 років)
  characterInteraction: {
    name: 'Інтерактивні персонажі',
    description: 'Персонажі що реагують на дії дитини',
    ageGroups: [AgeGroup.PRESCHOOL],
    cssTemplate: `
      .character-container {
        position: relative;
        display: inline-block;
        margin: 20px;
      }
      
      .character {
        width: 150px;
        height: 150px;
        background: linear-gradient(135deg, #feca57, #ff9ff3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        cursor: pointer;
        transition: all 0.4s ease;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
      
      .character:hover {
        transform: translateY(-10px) scale(1.1);
        animation: bounce 1s infinite;
      }
      
      .speech-bubble {
        position: absolute;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 15px;
        border-radius: 20px;
        font-size: 16px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      
      .speech-bubble::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 10px solid transparent;
        border-top-color: white;
      }
      
      .character.talking .speech-bubble {
        opacity: 1;
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(-10px) scale(1.1); }
        40% { transform: translateY(-20px) scale(1.15); }
        60% { transform: translateY(-15px) scale(1.12); }
      }
    `,
    jsTemplate: `
      function createCharacterInteraction(character, phrases) {
        character.addEventListener('click', function() {
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          const bubble = this.querySelector('.speech-bubble');
          bubble.textContent = randomPhrase;
          this.classList.add('talking');
          
          setTimeout(() => {
            this.classList.remove('talking');
          }, 3000);
        });
      }
    `,
    htmlStructure: `
      <div class="character-container">
        <div class="character" onclick="characterSpeak(this)">
          🐱
          <div class="speech-bubble">Привіт!</div>
        </div>
      </div>
    `
  },

  // Для молодших школярів (7-8 років)
  progressGame: {
    name: 'Гра з прогресом',
    description: 'Освітня гра з системою балів та прогресу',
    ageGroups: [AgeGroup.EARLY_SCHOOL],
    cssTemplate: `
      .game-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 30px;
        color: white;
        position: relative;
        overflow: hidden;
      }
      
      .progress-bar {
        width: 100%;
        height: 20px;
        background: rgba(255,255,255,0.3);
        border-radius: 10px;
        overflow: hidden;
        margin: 20px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ecdc4, #44a08d);
        border-radius: 10px;
        transition: width 0.5s ease;
        position: relative;
      }
      
      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
      
      .score-display {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        background: rgba(255,255,255,0.2);
        padding: 15px;
        border-radius: 15px;
        margin: 15px 0;
      }
      
      .game-button {
        background: linear-gradient(145deg, #ff6b6b, #ee5a24);
        border: none;
        border-radius: 15px;
        padding: 15px 25px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 10px;
      }
      
      .game-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `,
    jsTemplate: `
      class ProgressGame {
        constructor(container) {
          this.container = container;
          this.score = 0;
          this.maxScore = 100;
          this.progressFill = container.querySelector('.progress-fill');
          this.scoreDisplay = container.querySelector('.score-display');
        }
        
        addScore(points) {
          this.score = Math.min(this.score + points, this.maxScore);
          this.updateProgress();
          
          if (this.score >= this.maxScore) {
            this.celebrate();
          }
        }
        
        updateProgress() {
          const percentage = (this.score / this.maxScore) * 100;
          this.progressFill.style.width = percentage + '%';
          this.scoreDisplay.textContent = \`Бали: \${this.score}/\${this.maxScore}\`;
        }
        
        celebrate() {
          this.container.style.animation = 'celebrate 1s ease';
          // Add celebration effects
        }
      }
    `,
    htmlStructure: `
      <div class="game-container">
        <div class="score-display">Бали: 0/100</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <button class="game-button" onclick="game.addScore(10)">+10 балів</button>
      </div>
    `
  },

  // Для старших школярів (9-10 років)
  interactiveSimulation: {
    name: 'Інтерактивна симуляція',
    description: 'Складна інтерактивна симуляція з експериментами',
    ageGroups: [AgeGroup.MIDDLE_SCHOOL],
    cssTemplate: `
      .simulation-container {
        background: linear-gradient(145deg, #2c3e50, #34495e);
        border-radius: 15px;
        padding: 25px;
        color: white;
        position: relative;
      }
      
      .control-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
      }
      
      .control-group {
        background: rgba(255,255,255,0.1);
        padding: 15px;
        border-radius: 10px;
        backdrop-filter: blur(10px);
      }
      
      .slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: rgba(255,255,255,0.3);
        outline: none;
        appearance: none;
      }
      
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      .result-display {
        background: linear-gradient(135deg, #74b9ff, #0984e3);
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        text-align: center;
        font-size: 18px;
      }
      
      .experiment-area {
        min-height: 200px;
        background: radial-gradient(circle, #2d3436, #636e72);
        border-radius: 10px;
        position: relative;
        overflow: hidden;
        border: 2px solid #74b9ff;
      }
    `,
    jsTemplate: `
      class InteractiveSimulation {
        constructor(container) {
          this.container = container;
          this.values = {};
          this.initializeControls();
        }
        
        initializeControls() {
          const sliders = this.container.querySelectorAll('.slider');
          sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
              this.updateValue(e.target.dataset.param, e.target.value);
              this.runSimulation();
            });
          });
        }
        
        updateValue(param, value) {
          this.values[param] = parseFloat(value);
        }
        
        runSimulation() {
          // Complex simulation logic
          this.updateDisplay();
        }
        
        updateDisplay() {
          const display = this.container.querySelector('.result-display');
          display.innerHTML = \`Результат: \${JSON.stringify(this.values)}\`;
        }
      }
    `,
    htmlStructure: `
      <div class="simulation-container">
        <h3>Інтерактивний експеримент</h3>
        <div class="control-panel">
          <div class="control-group">
            <label>Параметр 1</label>
            <input type="range" class="slider" data-param="param1" min="0" max="100">
          </div>
        </div>
        <div class="result-display">Результат буде тут</div>
        <div class="experiment-area"></div>
      </div>
    `
  }
};

export const FLOATING_ELEMENTS_CSS = `
  .floating-elements {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  }
  
  .floating-element {
    position: absolute;
    font-size: 24px;
    animation: float-around 15s infinite linear;
    opacity: 0.6;
  }
  
  @keyframes float-around {
    0% { transform: translateX(-50px) translateY(100vh); }
    100% { transform: translateX(calc(100vw + 50px)) translateY(-50px); }
  }
`;

export const SOUND_EFFECTS_JS = `
  class SoundEffects {
    static playClick() {
      const audio = new Audio('data:audio/wav;base64,UklGRo4...');
      audio.play().catch(() => {});
    }
    
    static playSuccess() {
      const audio = new Audio('data:audio/wav;base64,UklGRo4...');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    
    static playCorrect() {
      // Web Audio API для генерації звуків
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 523.25; // C5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }
`;

export function getTemplatesForAge(age: number): InteractiveTemplate[] {
  const ageGroup = age <= 4 ? AgeGroup.TODDLERS :
                  age <= 6 ? AgeGroup.PRESCHOOL :
                  age <= 8 ? AgeGroup.EARLY_SCHOOL :
                  AgeGroup.MIDDLE_SCHOOL;
  
  return Object.values(INTERACTIVE_TEMPLATES).filter(template => 
    template.ageGroups.includes(ageGroup)
  );
}

export function generateRandomFloatingElements(theme: string, count: number = 5): string {
  const elements = {
    math: ['🔢', '➕', '➖', '✖️', '➗', '🧮', '📐', '📏'],
    animals: ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'],
    nature: ['🌳', '🌸', '🦋', '🌈', '☀️', '⭐', '🌙', '🌻'],
    space: ['🚀', '🌟', '🪐', '🌍', '👨‍🚀', '🛸', '☄️', '🌌'],
    food: ['🍎', '🍌', '🍓', '🥕', '🧀', '🍪', '🎂', '🍭'],
  };
  
  const themeElements = elements[theme as keyof typeof elements] || elements.animals;
  let html = '<div class="floating-elements">';
  
  for (let i = 0; i < count; i++) {
    const element = themeElements[Math.floor(Math.random() * themeElements.length)];
    const delay = Math.random() * 15;
    const left = Math.random() * 100;
    
    html += `
      <div class="floating-element" style="
        left: ${left}%;
        animation-delay: ${delay}s;
        font-size: ${20 + Math.random() * 20}px;
      ">${element}</div>
    `;
  }
  
  html += '</div>';
  return html;
} 