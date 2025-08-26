/**
 * === Age Template 9-10 Years ===
 * HTML template for older elementary school children (9-10 years old)
 * Features: Complex interfaces, detailed data, analytics
 */

export const AGE_9_10_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>🎓 Visual Components 9-10 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#1F4E79 0%,#2C5F2D 50%,#97BC62 100%);min-height:100vh;overflow-x:hidden;position:relative}
.s{background:linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95));border-radius:15px;padding:25px;margin:20px 0;box-shadow:0 10px 25px rgba(0,0,0,0.08);position:relative;border:1px solid rgba(255,255,255,0.6)}
.main-heading{font-size:32px;color:#2c3e50;font-weight:700;margin:0 0 15px 0;background:linear-gradient(45deg,#1F4E79,#385723,#833C0C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:center;gap:10px}
.section-heading{font-size:24px;color:#2c3e50;font-weight:600;margin:20px 0 15px 0;display:flex;align-items:center;gap:8px;border-bottom:2px solid rgba(31,78,121,0.2);padding-bottom:8px}
.hero-image{width:400px;height:300px;border-radius:20px;border:4px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s ease;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.image-placeholder{font-size:16px;color:#666;text-align:center;padding:15px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.3;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:2px dashed rgba(255,255,255,0.3);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
.audio-toggle{position:fixed;top:20px;right:20px;width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;transition:all 0.3s;z-index:1000;box-shadow:0 10px 20px rgba(0,0,0,0.3);outline:none}
.audio-toggle:hover{transform:scale(1.1);box-shadow:0 15px 30px rgba(0,0,0,0.4)}
.audio-toggle.muted{background:linear-gradient(135deg,#e74c3c 0%,#c0392b 100%);animation:muted-pulse 2s infinite}
.audio-toggle::before{content:'🔊'}
.audio-toggle.muted::before{content:'🔇'}
.audio-status{position:fixed;top:110px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 15px;border-radius:20px;font-size:16px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;z-index:1000;opacity:0;transform:translateY(-10px);transition:all 0.3s;pointer-events:none}
.audio-status.show{opacity:1;transform:translateY(0)}
@keyframes muted-pulse{0%,100%{opacity:1}50%{opacity:0.7}}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: ON</div>
<div class="s">
<h1 class="main-heading">📚 Math: Fractions and Percentages</h1>
<h2 class="section-heading">🎯 Learning Objectives</h2>
<div class="hero-image" onclick="handleImageClick(this,'hero')" role="button" tabindex="0" aria-label="Hero image - educational scene">
<div class="image-placeholder">🎓 Hero Image<br/>400×300</div>
</div>
</div>
<script>
let audioEnabled=true;
function toggleAudio(){const audioToggle=document.querySelector('.audio-toggle');const audioStatus=document.getElementById('audioStatus');const isMuted=audioToggle.classList.contains('muted');if(isMuted){audioToggle.classList.remove('muted');audioStatus.textContent='Audio: ON';audioStatus.style.color='#4CAF50'}else{audioToggle.classList.add('muted');audioStatus.textContent='Audio: OFF';audioStatus.style.color='#f44336'}audioStatus.classList.add('show');setTimeout(()=>{audioStatus.classList.remove('show')},2000);audioToggle.style.transform='scale(0.9)';setTimeout(()=>audioToggle.style.transform='',100);console.log('Audio',!isMuted?'enabled':'disabled')}
function handleImageClick(element,imageType){const originalTransform=element.style.transform;element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform=originalTransform,150)}
</script>
</body>
</html>`;

/**
 * Template description for 9-10 years age group
 */
export const AGE_9_10_DESCRIPTION = 'Components for older elementary school children 9-10 years: complex interfaces, detailed data, analytics';

/**
 * Configuration for 9-10 years age group
 */
export const AGE_9_10_CONFIG = {
  padding: 20,
  borderRadius: 15,
  fontSize: 32,
  buttonSize: 150,
  colors: ['#1F4E79', '#2C5F2D', '#97BC62']
};
