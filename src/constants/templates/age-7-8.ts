/**
 * === Age Template 7-8 Years ===
 * HTML template for elementary school children (7-8 years old)
 * Features: Educational games, tests, progress bars, achievements
 */

export const AGE_7_8_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>🎓 Visual Components 7-8 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);min-height:100vh;overflow-x:hidden;position:relative}
.slide-container{background:rgba(255,255,255,0.95);border-radius:20px;padding:30px;margin:20px 0;box-shadow:0 15px 35px rgba(0,0,0,0.1);border:2px solid rgba(255,255,255,0.5);min-height:100vh;max-height:100vh;display:flex;flex-direction:column;overflow:hidden}
.slide-main-title{font-size:36px;color:#2c3e50;margin:0 0 10px 0;font-weight:700;background:linear-gradient(45deg,#3498db,#2ecc71);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.main-heading{font-size:32px;color:#2c3e50;font-weight:700;margin:0 0 15px 0;background:linear-gradient(45deg,#3498db,#2ecc71,#e74c3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:center;gap:10px}
.section-heading{font-size:24px;color:#2c3e50;font-weight:600;margin:20px 0 15px 0;display:flex;align-items:center;gap:8px;border-bottom:2px solid rgba(52,152,219,0.2);padding-bottom:8px}
.hero-image{width:400px;height:300px;border-radius:20px;border:4px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s ease;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.image-placeholder{font-size:16px;color:#666;text-align:center;padding:15px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.3;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:2px dashed rgba(255,255,255,0.3);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
.audio-toggle{position:fixed;top:20px;right:20px;width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;transition:all 0.3s;z-index:1000;box-shadow:0 10px 20px rgba(0,0,0,0.3);outline:none}
.audio-toggle::before{content:'🔊'}
.audio-toggle.muted::before{content:'🔇'}
.audio-status{position:fixed;top:110px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 15px;border-radius:20px;font-size:16px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;z-index:1000;opacity:0;transform:translateY(-10px);transition:all 0.3s;pointer-events:none}
.audio-status.show{opacity:1;transform:translateY(0)}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: ON</div>
<div class="slide-container">
<h1 class="slide-main-title">Math: Addition and Subtraction</h1>
<h2 class="section-heading">📚 What You'll Learn</h2>
<div class="hero-image" onclick="handleImageClick(this,'hero')" role="button" tabindex="0" aria-label="Hero image - educational scene">
<div class="image-placeholder">🎓 Hero Image<br/>400×300</div>
</div>
</div>
<script>
let audioEnabled=true;
function toggleAudio(){audioEnabled=!audioEnabled;const toggleButton=document.querySelector('.audio-toggle');const statusIndicator=document.getElementById('audioStatus');if(audioEnabled){toggleButton.classList.remove('muted');statusIndicator.textContent='Audio: ON'}else{toggleButton.classList.add('muted');statusIndicator.textContent='Audio: OFF'}statusIndicator.classList.add('show');setTimeout(()=>{statusIndicator.classList.remove('show')},2000)}
function handleImageClick(element,imageType){const originalTransform=element.style.transform;element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform=originalTransform,150)}
</script>
</body>
</html>`;

/**
 * Template description for 7-8 years age group
 */
export const AGE_7_8_DESCRIPTION = 'Elements for elementary school children 7-8 years: educational games, tests, progress bars, achievements';

/**
 * Configuration for 7-8 years age group
 */
export const AGE_7_8_CONFIG = {
  padding: 25,
  borderRadius: 20,
  fontSize: 36,
  buttonSize: 200,
  colors: ['#667eea', '#764ba2', '#f093fb']
};
