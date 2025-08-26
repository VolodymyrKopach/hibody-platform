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
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth}
.slide-container{background:rgba(255,255,255,0.95);border-radius:20px;padding:30px;margin:20px 0;box-shadow:0 15px 35px rgba(0,0,0,0.1);border:2px solid rgba(255,255,255,0.5);min-height:100vh;max-height:none;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}
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
.layout-fullscreen{width:100%;max-width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;box-sizing:border-box;overflow-y:auto;overflow-x:hidden}
.layout-top-bottom{display:flex;flex-direction:column;min-height:100vh;padding:30px;box-sizing:border-box;overflow-y:auto;overflow-x:hidden}
.layout-top-bottom .top-section{flex:1;display:flex;align-items:center;justify-content:center}
.layout-top-bottom .bottom-section{flex:1;display:flex;align-items:center;justify-content:center}
.template-section{margin:30px 0;padding:30px;background:rgba(255,255,255,0.1);border-radius:20px;border:2px dashed rgba(255,255,255,0.5);overflow-y:auto;overflow-x:hidden;max-height:85vh}
.template-title{font-size:28px;color:#2c3e50;text-align:center;margin-bottom:20px;font-weight:600;background:rgba(255,255,255,0.2);padding:10px;border-radius:10px}
.content-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:30px;width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden;overflow-y:auto}
.s{background:rgba(255,255,255,0.95);border-radius:15px;padding:25px;margin:20px 0;box-shadow:0 10px 25px rgba(0,0,0,0.08);position:relative;border:1px solid rgba(255,255,255,0.6);overflow-y:auto;overflow-x:hidden;max-height:90vh}
.two-column{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;gap:40px;padding:30px;width:100%;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;max-height:85vh}
.two-column .left-side,.two-column .right-side{flex:1;text-align:center;max-width:50%;box-sizing:border-box}
.button-row{display:flex;justify-content:center;align-items:center;gap:25px;margin:25px 0;flex-wrap:wrap}
.simple-text{font-size:20px;color:#2c3e50;text-align:center;margin:15px 0;line-height:1.5}
.slide-title-secondary{font-size:28px;color:#2c3e50;text-align:center;margin:20px 0;font-weight:600}
.instruction-text{font-size:24px;color:#2c3e50;text-align:center;margin:20px 0;font-weight:500;background:rgba(52,152,219,0.1);padding:15px;border-radius:10px}
.progress-bar{width:100%;height:20px;background:rgba(0,0,0,0.1);border-radius:10px;overflow:hidden;margin:20px 0}
.progress-fill{height:100%;background:linear-gradient(90deg,#3498db 0%,#2ecc71 100%);border-radius:10px;transition:width 0.3s ease}
.achievement-badge{width:80px;height:80px;background:linear-gradient(135deg,#f1c40f 0%,#f39c12 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:10px;box-shadow:0 5px 15px rgba(241,196,15,0.3);cursor:pointer;transition:all 0.3s ease}
.achievement-badge:hover{transform:scale(1.1)}
::-webkit-scrollbar{width:12px;height:12px}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.2);border-radius:10px}
::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:10px;border:2px solid rgba(255,255,255,0.3)}
::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#5a6fd8 0%,#6a4190 100%)}
::-webkit-scrollbar-corner{background:rgba(255,255,255,0.2)}
*{scrollbar-width:thin;scrollbar-color:rgba(102,126,234,0.8) rgba(255,255,255,0.2)}
@media (max-width:768px){.slide-main-title{font-size:30px}.main-heading{font-size:26px}.section-heading{font-size:20px}.slide-title-secondary{font-size:24px}.instruction-text{font-size:20px}.simple-text{font-size:18px}.hero-image{width:320px;height:240px}.slide-container{padding:20px;margin:10px 0}.template-section{padding:20px;margin:20px 0;max-height:none;overflow-y:visible}.two-column{flex-direction:column;gap:25px;max-height:none;overflow-y:visible}.s{padding:20px;max-height:none;overflow-y:visible}.audio-toggle{width:70px;height:70px;font-size:35px}.audio-status{font-size:14px}.achievement-badge{width:60px;height:60px;font-size:30px}}
@media (max-width:480px){.slide-main-title{font-size:24px}.main-heading{font-size:22px}.section-heading{font-size:18px}.slide-title-secondary{font-size:20px}.instruction-text{font-size:18px}.simple-text{font-size:16px}.hero-image{width:280px;height:210px}.slide-container{padding:15px;margin:5px 0}.template-section{padding:15px;margin:15px 0;max-height:none;overflow-y:visible}.button-row{gap:15px}.audio-toggle{width:60px;height:60px;font-size:30px;top:15px;right:15px}.audio-status{font-size:12px;top:85px;right:15px}.achievement-badge{width:50px;height:50px;font-size:24px}.two-column{max-height:none;overflow-y:visible}.s{max-height:none;overflow-y:visible}}
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
