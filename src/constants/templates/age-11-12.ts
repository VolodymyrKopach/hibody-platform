/**
 * === Age Template 11-12 Years ===
 * HTML template for pre-teens (11-12 years old)
 * Features: Structured content, analytical tasks, minimal decoration, information-dense
 */

export const AGE_11_12_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>📚 Learning Template for 11-12 Years</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 30px;
  color: #333;
}
.slide-title-main {
  font-size: 42px;
  color: #1a1a1a;
  text-align: center;
  margin: 30px 0;
  font-weight: 700;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.content-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.instruction-text {
  font-size: 20px;
  color: #555;
  margin: 20px 0;
  line-height: 1.6;
  text-align: center;
}
.button-primary {
  padding: 14px 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}
.image-placeholder {
  width: 100%;
  max-width: 600px;
  height: 350px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  border: 2px solid #e0e0e0;
}
.layout-fullscreen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
}
.section-card {
  background: #f9f9f9;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}
.simple-text {
  font-size: 18px;
  color: #333;
  line-height: 1.7;
  margin: 16px 0;
}
.highlight {
  background: #fff3cd;
  padding: 16px;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  margin: 20px 0;
}
ul, ol {
  margin: 16px 0;
  padding-left: 30px;
}
li {
  margin: 8px 0;
  line-height: 1.6;
}
</style>
</head>
<body>
  <div class="content-container">
    <h1 class="slide-title-main">Lesson Title</h1>
    <p class="instruction-text">This is a structured learning template for pre-teens</p>
    <div class="image-placeholder">Image placeholder</div>
    <p class="simple-text">Content goes here with proper structure and clear information.</p>
  </div>
</body>
</html>`;

export const AGE_11_12_DESCRIPTION = `Pre-teen template (11-12 years) with structured content, analytical approach, and minimal decorative elements. Focuses on information density and logical organization.`;

export const AGE_11_12_CONFIG = {
  padding: 16,
  borderRadius: 12,
  fontSize: 18,
  buttonSize: 48,
  colors: ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#2196F3'],
  animations: {
    enabled: true,
    speed: 'normal',
    complexity: 'medium',
  },
  complexity: {
    textDensity: 'high',
    interactionLevel: 'moderate',
    visualDecoration: 'minimal',
  },
};

