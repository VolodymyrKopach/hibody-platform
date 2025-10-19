/**
 * === Age Template 16-18 Years ===
 * HTML template for high school students (16-18 years old)
 * Features: Modern minimal design, professional, concept-focused, dark theme support
 */

export const AGE_16_18_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎓 Modern Template for 16-18 Years</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #1a1a1a;
  min-height: 100vh;
  padding: 40px 20px;
  color: #e0e0e0;
  line-height: 1.75;
}
.slide-title-main {
  font-size: 42px;
  color: #ffffff;
  text-align: left;
  margin: 40px 0 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.content-container {
  max-width: 1100px;
  margin: 0 auto;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 60px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid #3a3a3a;
}
.instruction-text {
  font-size: 18px;
  color: #b0b0b0;
  margin: 20px 0;
  line-height: 1.75;
  font-weight: 400;
}
.button-primary {
  padding: 14px 32px;
  border-radius: 6px;
  border: none;
  background: #0066ff;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.button-primary:hover {
  background: #0052cc;
  transform: translateY(-1px);
}
.image-placeholder {
  width: 100%;
  max-width: 800px;
  height: 450px;
  border-radius: 8px;
  background: #1f1f1f;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  border: 1px solid #3a3a3a;
}
.layout-fullscreen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
}
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  margin: 40px 0;
}
.section-card {
  background: #1f1f1f;
  padding: 32px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
}
.simple-text {
  font-size: 17px;
  color: #d0d0d0;
  line-height: 1.85;
  margin: 24px 0;
}
.highlight {
  background: rgba(0, 102, 255, 0.1);
  padding: 24px;
  border-left: 3px solid #0066ff;
  border-radius: 4px;
  margin: 30px 0;
}
.code-block {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 6px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  color: #00ff88;
  border: 1px solid #2a2a2a;
  margin: 25px 0;
  overflow-x: auto;
}
h2 {
  font-size: 32px;
  color: #ffffff;
  margin: 40px 0 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
h3 {
  font-size: 24px;
  color: #e0e0e0;
  margin: 30px 0 15px;
  font-weight: 600;
}
ul, ol {
  margin: 24px 0;
  padding-left: 30px;
}
li {
  margin: 12px 0;
  line-height: 1.75;
}
a {
  color: #0066ff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
a:hover {
  border-bottom-color: #0066ff;
}
.accent {
  color: #0066ff;
  font-weight: 600;
}
</style>
</head>
<body>
  <div class="content-container">
    <h1 class="slide-title-main">Lesson Title</h1>
    <p class="instruction-text">Modern, minimalist template for high school students with professional design</p>
    <div class="image-placeholder">Image placeholder</div>
    <p class="simple-text">Content with conceptual depth, analytical approach, and professional presentation.</p>
  </div>
</body>
</html>`;

export const AGE_16_18_DESCRIPTION = `Modern minimal template for high school students (16-18 years) with dark theme, professional design, and focus on conceptual understanding. Suitable for advanced topics.`;

export const AGE_16_18_CONFIG = {
  padding: 8,
  borderRadius: 8,
  fontSize: 16,
  buttonSize: 40,
  colors: ['#0066ff', '#00ff88', '#ff0066', '#ffaa00', '#aa00ff'],
  animations: {
    enabled: false,
    speed: 'instant',
    complexity: 'none',
  },
  complexity: {
    textDensity: 'very-high',
    interactionLevel: 'minimal',
    visualDecoration: 'none',
  },
};

