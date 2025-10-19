/**
 * === Age Template 13-15 Years ===
 * HTML template for teenagers (13-15 years old)
 * Features: Academic style, text-heavy, minimal colors, focus on content
 */

export const AGE_13_15_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>📖 Academic Template for 13-15 Years</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Georgia', 'Times New Roman', serif;
  background: #f5f5f5;
  min-height: 100vh;
  padding: 40px 20px;
  color: #2c3e50;
  line-height: 1.8;
}
.slide-title-main {
  font-size: 36px;
  color: #2c3e50;
  text-align: center;
  margin: 30px 0;
  font-weight: 600;
  border-bottom: 3px solid #3498db;
  padding-bottom: 15px;
}
.content-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.instruction-text {
  font-size: 18px;
  color: #34495e;
  margin: 20px 0;
  line-height: 1.8;
}
.button-primary {
  padding: 12px 28px;
  border-radius: 4px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.button-primary:hover {
  background: #3498db;
  color: white;
}
.image-placeholder {
  width: 100%;
  max-width: 700px;
  height: 400px;
  border-radius: 4px;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  border: 1px solid #bdc3c7;
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
  gap: 40px;
  margin: 30px 0;
}
.section-card {
  background: #fafafa;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
.simple-text {
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.9;
  margin: 20px 0;
  text-align: justify;
}
.highlight {
  background: #e8f4f8;
  padding: 20px;
  border-left: 4px solid #3498db;
  margin: 25px 0;
  font-style: italic;
}
.quote {
  border-left: 4px solid #95a5a6;
  padding-left: 20px;
  margin: 25px 0;
  font-style: italic;
  color: #7f8c8d;
}
h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 30px 0 15px;
  font-weight: 600;
}
h3 {
  font-size: 22px;
  color: #34495e;
  margin: 25px 0 12px;
  font-weight: 600;
}
ul, ol {
  margin: 20px 0;
  padding-left: 40px;
}
li {
  margin: 10px 0;
  line-height: 1.8;
}
</style>
</head>
<body>
  <div class="content-container">
    <h1 class="slide-title-main">Lesson Title</h1>
    <p class="instruction-text">This is an academic template for teenagers with focus on content and readability</p>
    <div class="image-placeholder">Image placeholder</div>
    <p class="simple-text">Detailed content with proper structure, citations, and academic approach.</p>
  </div>
</body>
</html>`;

export const AGE_13_15_DESCRIPTION = `Academic template for teenagers (13-15 years) with text-heavy content, minimal decoration, and focus on information. Uses serif fonts and traditional educational design.`;

export const AGE_13_15_CONFIG = {
  padding: 12,
  borderRadius: 8,
  fontSize: 16,
  buttonSize: 44,
  colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'],
  animations: {
    enabled: false,
    speed: 'fast',
    complexity: 'low',
  },
  complexity: {
    textDensity: 'very-high',
    interactionLevel: 'low',
    visualDecoration: 'minimal',
  },
};

