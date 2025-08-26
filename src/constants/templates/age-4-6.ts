/**
 * === Age Template 4-6 Years ===
 * HTML template for preschoolers (4-6 years old)
 * Features: Interactive games, characters, simple tasks, music
 */

export const AGE_4_6_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎓 AI Template Library for 4-6 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#87CEEB 0%,#98FB98 30%,#FFE4B5 60%,#F0E68C 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 20% 20%,rgba(255,255,255,.3) 2px,transparent 2px),radial-gradient(circle at 80% 80%,rgba(255,255,255,.2) 1px,transparent 1px);background-size:50px 50px,30px 30px;pointer-events:none;z-index:-1}
.slide-title-main{font-size:64px;color:#FFFFFF;text-shadow:4px 4px 8px rgba(0,0,0,0.4);text-align:center;margin:40px 0;font-weight:bold;animation:title-bounce 2s infinite}
.giant-button{width:320px;height:320px;border-radius:50%;border:10px solid rgba(255,255,255,0.8);cursor:pointer;font-size:120px;color:white;font-weight:bold;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);position:relative;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.3);background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%);animation:giant-pulse 3s infinite;display:flex;align-items:center;justify-content:center;outline:none}
.instruction-text{font-size:48px;color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:40px 0;font-weight:bold;animation:text-glow 3s infinite}
.layout-fullscreen{width:100%;max-width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box}
.hero-image{width:400px;height:300px;border-radius:30px;border:8px solid rgba(255,255,255,0.9);box-shadow:0 20px 40px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.image-placeholder{font-size:16px;color:#666;text-align:center;padding:15px;font-family:'Comic Sans MS',cursive;line-height:1.3;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:3px dashed rgba(255,255,255,0.3);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
.audio-toggle{position:fixed;top:20px;right:20px;width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;transition:all 0.3s;z-index:1000;box-shadow:0 10px 20px rgba(0,0,0,0.3);outline:none}
.audio-toggle::before{content:'🔊'}
.audio-toggle.muted::before{content:'🔇'}
.audio-status{position:fixed;top:110px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 15px;border-radius:20px;font-size:16px;font-family:'Comic Sans MS',cursive;z-index:1000;opacity:0;transform:translateY(-10px);transition:all 0.3s;pointer-events:none}
.audio-status.show{opacity:1;transform:translateY(0)}
@keyframes title-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
@keyframes text-glow{0%,100%{text-shadow:3px 3px 6px rgba(0,0,0,0.3)}50%{text-shadow:3px 3px 20px rgba(255,255,255,0.8)}}
@keyframes giant-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: ON</div>
<div class="layout-fullscreen">
<div class="slide-title-main">Learn Together!</div>
<div class="giant-button" onclick="handleGiantButton(this,'success','Great choice!')" role="button" tabindex="0" aria-label="Learning star - click to start">🌟</div>
<div class="instruction-text">Touch the star!</div>
</div>
<script>
let audioEnabled=true;
function toggleAudio(){audioEnabled=!audioEnabled;const toggleButton=document.querySelector('.audio-toggle');const statusIndicator=document.getElementById('audioStatus');if(audioEnabled){toggleButton.classList.remove('muted');statusIndicator.textContent='Audio: ON'}else{toggleButton.classList.add('muted');statusIndicator.textContent='Audio: OFF'}statusIndicator.classList.add('show');setTimeout(()=>{statusIndicator.classList.remove('show')},2000)}
function handleGiantButton(element,soundType,text){element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform='',100)}
</script>
</body>
</html>`;

/**
 * Template description for 4-6 years age group
 */
export const AGE_4_6_DESCRIPTION = 'Components for preschoolers 4-6 years: interactive games, characters, simple tasks, music';

/**
 * Configuration for 4-6 years age group
 */
export const AGE_4_6_CONFIG = {
  padding: 30,
  borderRadius: 25,
  fontSize: 64,
  buttonSize: 320,
  colors: ['#87CEEB', '#98FB98', '#FFE4B5', '#F0E68C']
};
