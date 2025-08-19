import { AgeGroup } from '@/types/generation';

/**
 * === Age Component Templates Constants ===
 * Contains all HTML templates for different age groups
 * These templates are used for slide generation and are embedded for production reliability
 */

export const AGE_COMPONENT_TEMPLATES: Record<AgeGroup, string> = {
  '2-3': `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎈 AI Template Library for 2-3 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#FFE66D 0%,#4ECDC4 50%,#FF6B6B 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative}
.template-section{margin:40px 0;padding:40px;background:rgba(255,255,255,0.1);border-radius:30px;border:3px dashed rgba(255,255,255,0.5)}
.template-title{font-size:36px;color:#FFFFFF;text-align:center;margin-bottom:30px;text-shadow:3px 3px 6px rgba(0,0,0,0.3);background:rgba(0,0,0,0.2);padding:15px;border-radius:15px}
.layout-fullscreen{width:100%;max-width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box}
.layout-top-bottom{display:flex;flex-direction:column;min-height:100vh;padding:40px;box-sizing:border-box}
.layout-top-bottom .top-section{flex:1;display:flex;align-items:center;justify-content:center}
.layout-top-bottom .bottom-section{flex:1;display:flex;align-items:center;justify-content:center}
.slide-title-main{font-size:72px;color:#FFFFFF;text-shadow:4px 4px 8px rgba(0,0,0,0.4);text-align:center;margin:40px 0;font-weight:bold;animation:title-bounce 2s infinite}
.slide-title-secondary{font-size:48px;color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:30px 0;font-weight:bold}
.instruction-text{font-size:52px;color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:40px 0;font-weight:bold;animation:text-glow 3s infinite}
.simple-text{font-size:40px;color:#FFFFFF;text-shadow:2px 2px 4px rgba(0,0,0,0.3);text-align:center;margin:20px 0}
.giant-button{width:350px;height:350px;border-radius:50%;border:10px solid rgba(255,255,255,0.8);cursor:pointer;font-size:140px;color:white;font-weight:bold;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);position:relative;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.3);background:linear-gradient(135deg,#FF6B6B 0%,#FA709A 100%);animation:giant-pulse 3s infinite;display:flex;align-items:center;justify-content:center;outline:none}
.giant-button:hover{transform:scale(1.2) rotate(8deg);box-shadow:0 35px 70px rgba(0,0,0,0.4)}
.large-button{width:220px;height:220px;border-radius:50%;border:8px solid rgba(255,255,255,0.8);cursor:pointer;font-size:100px;color:white;font-weight:bold;transition:all 0.3s;position:relative;box-shadow:0 20px 40px rgba(0,0,0,0.3);margin:20px;display:flex;align-items:center;justify-content:center;outline:none}
.large-button.play{background:linear-gradient(135deg,#4ECDC4 0%,#44A08D 100%);animation:button-float 2.5s infinite}
.large-button.music{background:linear-gradient(135deg,#FFE66D 0%,#FFA500 100%);animation:button-float 2.5s infinite 0.5s}
.large-button.paint{background:linear-gradient(135deg,#9B59B6 0%,#8E44AD 100%);animation:button-float 2.5s infinite 1s}
.large-button:hover{transform:scale(1.15) rotate(10deg);box-shadow:0 30px 60px rgba(0,0,0,0.4)}
.touch-shape{width:200px;height:200px;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;font-size:80px;margin:25px;box-shadow:0 15px 30px rgba(0,0,0,0.2);border:6px solid rgba(255,255,255,0.9)}
.touch-shape.circle{border-radius:50%;background:linear-gradient(135deg,#FF9A9E 0%,#FECFEF 100%)}
.touch-shape.square{border-radius:30px;background:linear-gradient(135deg,#A8EDEA 0%,#FED6E3 100%)}
.touch-shape.triangle{border-radius:30px;background:linear-gradient(135deg,#FFE66D 0%,#FF9A9E 100%);clip-path:polygon(50% 10%,10% 90%,90% 90%);-webkit-clip-path:polygon(50% 10%,10% 90%,90% 90%)}
.touch-shape:hover{transform:scale(1.3) rotate(15deg)}
.animal-friend{width:180px;height:180px;border-radius:50%;cursor:pointer;transition:all 0.4s;display:flex;align-items:center;justify-content:center;font-size:90px;margin:20px;position:relative;box-shadow:0 15px 30px rgba(0,0,0,0.2);border:6px solid rgba(255,255,255,0.9);animation:animal-bounce 3s infinite}
.animal-friend.cat{background:linear-gradient(135deg,#FA709A 0%,#FEE140 100%)}
.animal-friend.dog{background:linear-gradient(135deg,#4FACFE 0%,#00F2FE 100%);animation-delay:0.5s}
.animal-friend.bear{background:linear-gradient(135deg,#8B4513 0%,#D2691E 100%);animation-delay:1s}
.animal-friend:hover{transform:scale(1.4) rotate(20deg)}
.main-visual-circle{width:320px;height:320px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:150px;cursor:pointer;transition:all 0.4s;box-shadow:0 25px 50px rgba(0,0,0,0.3);border:12px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);animation:visual-rotate 8s linear infinite}
.main-visual-circle:hover{transform:scale(1.15)}
.progress-visual{width:400px;height:60px;background:rgba(255,255,255,0.3);border-radius:30px;margin:40px auto;overflow:hidden;position:relative;border:4px solid rgba(255,255,255,0.8)}
.progress-fill{height:100%;background:linear-gradient(90deg,#FF6B6B 0%,#4ECDC4 50%,#FFE66D 100%);border-radius:30px;width:75%;position:relative;animation:progress-grow 3s infinite}
.progress-fill::after{content:'⭐';position:absolute;right:-20px;top:50%;transform:translateY(-50%);font-size:50px;animation:star-sparkle 1s infinite}
.reward-star{width:120px;height:120px;background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);cursor:pointer;transition:all 0.3s;margin:15px;animation:star-twinkle 2s infinite;box-shadow:0 10px 20px rgba(255,215,0,0.4)}
.reward-star:hover{transform:scale(1.5) rotate(72deg)}
.celebration-burst{position:relative;width:150px;height:150px;background:linear-gradient(135deg,#FF6B6B 0%,#4ECDC4 100%);border-radius:50%;cursor:pointer;animation:celebration-spin 2s linear infinite;display:flex;align-items:center;justify-content:center;font-size:70px;box-shadow:0 15px 30px rgba(0,0,0,0.3);border:6px solid rgba(255,255,255,0.9)}
.sound-button{width:180px;height:180px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:6px solid rgba(255,255,255,0.9);border-radius:50%;cursor:pointer;position:relative;animation:sound-pulse 2s infinite;box-shadow:0 15px 30px rgba(102,126,234,0.3);font-size:80px;color:white;display:flex;align-items:center;justify-content:center;outline:none}
.sound-button::before{content:'🔊';font-size:80px}
.sound-wave{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:220px;height:220px;border:4px solid rgba(102,126,234,0.3);border-radius:50%;animation:wave-expand 2s infinite}
.hero-image{width:400px;height:300px;border-radius:30px;border:8px solid rgba(255,255,255,0.9);box-shadow:0 20px 40px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.hero-image:hover{transform:scale(1.05);box-shadow:0 25px 50px rgba(0,0,0,0.3)}
.hero-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.story-image{width:280px;height:210px;border-radius:25px;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px;overflow:hidden;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 30px);box-sizing:border-box}
.story-image:hover{transform:scale(1.08) rotate(2deg)}
.story-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.activity-image{width:200px;height:200px;border-radius:50%;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px;overflow:hidden;background:linear-gradient(135deg,#f3e8ff 0%,#ddd6fe 100%);display:flex;align-items:center;justify-content:center;position:relative;animation:image-float 3s infinite;max-width:calc(100% - 30px);box-sizing:border-box}
.activity-image:hover{transform:scale(1.15) rotate(10deg)}
.activity-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.mini-image{width:120px;height:120px;border-radius:20px;border:4px solid rgba(255,255,255,0.9);box-shadow:0 10px 20px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:10px;overflow:hidden;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 20px);box-sizing:border-box}
.mini-image:hover{transform:scale(1.2)}
.mini-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.image-placeholder{font-size:14px;color:#666;text-align:center;padding:10px;font-family:'Comic Sans MS',cursive;line-height:1.2;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:3px dashed rgba(255,255,255,0.3);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
img{max-width:100%;height:auto;display:block}
.image-container{max-width:100%;margin:15px auto;display:flex;justify-content:center;align-items:center;box-sizing:border-box}
.s{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden}
.h-img{width:380px;height:280px;border-radius:30px;border:8px solid rgba(255,255,255,0.9);box-shadow:0 20px 40px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.h-img img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
@keyframes image-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.audio-toggle{position:fixed;top:20px;right:20px;width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;transition:all 0.3s;z-index:1000;box-shadow:0 10px 20px rgba(0,0,0,0.3);outline:none}
.audio-toggle:hover{transform:scale(1.1);box-shadow:0 15px 30px rgba(0,0,0,0.4)}
.audio-toggle.muted{background:linear-gradient(135deg,#e74c3c 0%,#c0392b 100%);animation:muted-pulse 2s infinite}
.audio-toggle::before{content:'🔊'}
.audio-toggle.muted::before{content:'🔇'}
@keyframes muted-pulse{0%,100%{opacity:1}50%{opacity:0.7}}
.audio-status{position:fixed;top:110px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 15px;border-radius:20px;font-size:16px;font-family:'Comic Sans MS',cursive;z-index:1000;opacity:0;transform:translateY(-10px);transition:all 0.3s;pointer-events:none}
.audio-status.show{opacity:1;transform:translateY(0)}
.floating-decoration{position:fixed;font-size:50px;animation:decoration-float 6s infinite;pointer-events:none;text-shadow:2px 2px 4px rgba(0,0,0,0.2);z-index:-1;user-select:none}
.floating-decoration:nth-child(1){top:5%;left:5%;animation-delay:0s}
.floating-decoration:nth-child(2){top:10%;right:5%;animation-delay:2s}
.floating-decoration:nth-child(3){bottom:10%;left:8%;animation-delay:4s}
.floating-decoration:nth-child(4){bottom:5%;right:8%;animation-delay:1s}
.floating-decoration:nth-child(5){top:50%;left:2%;animation-delay:3s}
.floating-decoration:nth-child(6){top:50%;right:2%;animation-delay:5s}
.button-row{display:flex;justify-content:center;align-items:center;gap:40px;margin:40px 0;flex-wrap:wrap}
.content-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden}
.two-column{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;gap:60px;padding:40px;width:100%;box-sizing:border-box}
.two-column .left-side,.two-column .right-side{flex:1;text-align:center;max-width:50%;box-sizing:border-box}
@keyframes title-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes text-glow{0%,100%{text-shadow:3px 3px 6px rgba(0,0,0,0.3)}50%{text-shadow:3px 3px 20px rgba(255,255,255,0.8)}}
@keyframes giant-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes button-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
@keyframes animal-bounce{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(3deg)}}
@keyframes visual-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes progress-grow{0%{width:0%}100%{width:75%}}
@keyframes star-sparkle{0%,100%{transform:translateY(-50%) scale(1)}50%{transform:translateY(-50%) scale(1.3)}}
@keyframes star-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.2)}}
@keyframes celebration-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes sound-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes wave-expand{0%{transform:translate(-50%,-50%) scale(0.8);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
@keyframes decoration-float{0%,100%{transform:translateY(0px) rotate(0deg)}33%{transform:translateY(-20px) rotate(8deg)}66%{transform:translateY(-10px) rotate(-5deg)}}
@keyframes ripple-effect{to{transform:scale(4);opacity:0}}
@media (max-width:768px){.slide-title-main{font-size:56px}.slide-title-secondary{font-size:40px}.instruction-text{font-size:44px}.giant-button{width:280px;height:280px;font-size:120px}.large-button{width:180px;height:180px;font-size:80px}.main-visual-circle{width:260px;height:260px;font-size:120px}.touch-shape{width:160px;height:160px;font-size:60px}.animal-friend{width:140px;height:140px;font-size:70px}.button-row{gap:25px}.two-column{flex-direction:column;gap:40px}.hero-image{width:320px;height:240px}.story-image{width:240px;height:180px}.activity-image{width:160px;height:160px}.mini-image{width:100px;height:100px}.audio-toggle{width:70px;height:70px;font-size:35px}.audio-status{font-size:14px}}
@media (max-width:480px){.slide-title-main{font-size:44px}.slide-title-secondary{font-size:36px}.instruction-text{font-size:36px}.simple-text{font-size:32px}.giant-button{width:220px;height:220px;font-size:100px}.large-button{width:140px;height:140px;font-size:60px}.main-visual-circle{width:200px;height:200px;font-size:100px}.progress-visual{width:300px}.template-section{padding:20px;margin:20px 0}.floating-decoration{font-size:40px}.hero-image{width:280px;height:210px}.story-image{width:200px;height:150px}.activity-image{width:140px;height:140px}.mini-image{width:80px;height:80px}.audio-toggle{width:60px;height:60px;font-size:30px;top:15px;right:15px}.audio-status{font-size:12px;top:85px;right:15px}}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: ON</div>
<div class="layout-fullscreen">
<div class="slide-title-main">HELLO!</div>
<div class="giant-button" onclick="handleGiantButton(this,'success','Hello there!')" role="button" tabindex="0" aria-label="Hello star - click to greet">🌟</div>
<div class="instruction-text">Touch the star!</div>
</div>
<script>
let audioContext,speechSynthesis=window.speechSynthesis;let audioEnabled=true;function initAudio(){if(!audioContext){try{audioContext=new(window.AudioContext||window.webkitAudioContext)()}catch(e){console.warn('Web Audio API not supported')}}return audioContext}function playTone(frequency,duration,volume=0.1){if(!audioEnabled)return;const ctx=initAudio();if(!ctx)return;const oscillator=ctx.createOscillator();const gainNode=ctx.createGain();oscillator.connect(gainNode);gainNode.connect(ctx.destination);oscillator.frequency.value=frequency;oscillator.type='sine';gainNode.gain.setValueAtTime(0,ctx.currentTime);gainNode.gain.linearRampToValueAtTime(volume,ctx.currentTime+0.01);gainNode.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+duration);oscillator.start(ctx.currentTime);oscillator.stop(ctx.currentTime+duration)}function speak(text,options={}){if(!audioEnabled)return;if(!speechSynthesis){console.warn('Speech synthesis not supported');return}try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=0.7;utterance.pitch=1.3;utterance.volume=0.8;utterance.lang='en-US';Object.assign(utterance,options);utterance.onerror=function(event){console.warn('Speech synthesis error:',event.error)};speechSynthesis.speak(utterance)}catch(error){console.warn('Speech synthesis failed:',error)}}const soundEffects={button:()=>{playTone(440,0.2,0.15);setTimeout(()=>speak("Button pressed!"),200)},success:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Great job!"),500)},animal:(type)=>{const sounds={cat:()=>{playTone(800,0.2);setTimeout(()=>speak("Meow!"),300)},dog:()=>{playTone(300,0.3);setTimeout(()=>speak("Woof!"),400)},bear:()=>{playTone(220,0.5);setTimeout(()=>speak("Roar!"),500)}};if(sounds[type])sounds[type]()},play:()=>{playTone(440,0.2);setTimeout(()=>playTone(554,0.2),200);setTimeout(()=>speak("Let's play!"),400)},music:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Music time!"),500)}};function toggleAudio(){audioEnabled=!audioEnabled;const toggleButton=document.querySelector('.audio-toggle');const statusIndicator=document.getElementById('audioStatus');if(audioEnabled){toggleButton.classList.remove('muted');statusIndicator.textContent='Audio: ON';statusIndicator.style.color='#4CAF50'}else{toggleButton.classList.add('muted');statusIndicator.textContent='Audio: OFF';statusIndicator.style.color='#f44336';if(speechSynthesis){speechSynthesis.cancel()}}statusIndicator.classList.add('show');setTimeout(()=>{statusIndicator.classList.remove('show')},2000);toggleButton.style.transform='scale(0.9)';setTimeout(()=>toggleButton.style.transform='',100);console.log('Audio',audioEnabled?'enabled':'disabled')}function handleGiantButton(element,soundType,text){element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform='',100);if(soundEffects[soundType]){soundEffects[soundType]()}setTimeout(()=>speak(text),300);createRippleEffect(element)}function handleShape(element,shapeType){element.style.transform='scale(0.9) rotate(15deg)';setTimeout(()=>element.style.transform='',200);playTone(600+(shapeType==='circle'?100:shapeType==='square'?200:300),0.3);setTimeout(()=>speak(\`\${shapeType.charAt(0).toUpperCase()+shapeType.slice(1)}!\`),300);createRippleEffect(element)}function handleImageClick(element,imageType){const originalTransform=element.style.transform;element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform=originalTransform,150);const sounds={hero:()=>{playTone(523,0.4);setTimeout(()=>speak("Beautiful picture!"),400)},story:()=>{playTone(659,0.3);setTimeout(()=>speak("What a nice story!"),300)},activity:()=>{playTone(784,0.2);setTimeout(()=>speak("Let's learn!"),250)},mini:()=>{playTone(880,0.2);setTimeout(()=>speak("So pretty!"),200)}};if(sounds[imageType]){sounds[imageType]()}createRippleEffect(element)}function createRippleEffect(element){const ripple=document.createElement('div');ripple.style.cssText=\`position:absolute;border-radius:50%;background:rgba(255,255,255,0.7);transform:scale(0);animation:ripple-effect 0.6s linear;pointer-events:none;\`;const rect=element.getBoundingClientRect();const size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=size+'px';ripple.style.left='50%';ripple.style.top='50%';ripple.style.marginLeft=-(size/2)+'px';ripple.style.marginTop=-(size/2)+'px';element.style.position='relative';element.appendChild(ripple);setTimeout(()=>ripple.remove(),600)}document.addEventListener('DOMContentLoaded',function(){const statusIndicator=document.getElementById('audioStatus');if(statusIndicator){statusIndicator.style.color='#4CAF50'}setTimeout(()=>{speak("Welcome! Touch the colorful buttons! Press M to toggle audio.",{rate:0.8,pitch:1.2})},1000);console.log('🎈 AI Template Library for 2-3 years loaded!');console.log('🔊 Press M key to toggle audio on/off')});document.addEventListener('touchstart',function(e){if(audioContext&&audioContext.state==='suspended'){audioContext.resume()}});document.addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M'){e.preventDefault();toggleAudio();return}if(e.target.getAttribute('role')==='button'){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}}});document.addEventListener('focusin',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='4px solid #FFD700';e.target.style.outlineOffset='4px'}});document.addEventListener('focusout',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='none'}});
</script>
</body>
</html>`,

  '4-6': `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎓 AI Template Library for 4-6 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#87CEEB 0%,#98FB98 30%,#FFE4B5 60%,#F0E68C 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative}
body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background-image:radial-gradient(circle at 20% 20%,rgba(255,255,255,.3) 2px,transparent 2px),radial-gradient(circle at 80% 80%,rgba(255,255,255,.2) 1px,transparent 1px);background-size:50px 50px,30px 30px;pointer-events:none;z-index:-1}
.template-section{margin:40px 0;padding:40px;background:rgba(255,255,255,0.1);border-radius:30px;border:3px dashed rgba(255,255,255,0.5)}
.template-title{font-size:36px;color:#FFFFFF;text-align:center;margin-bottom:30px;text-shadow:3px 3px 6px rgba(0,0,0,0.3);background:rgba(0,0,0,0.2);padding:15px;border-radius:15px}
.layout-fullscreen{width:100%;max-width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box}
.layout-top-bottom{display:flex;flex-direction:column;min-height:100vh;padding:40px;box-sizing:border-box}
.layout-top-bottom .top-section{flex:1;display:flex;align-items:center;justify-content:center}
.layout-top-bottom .bottom-section{flex:1;display:flex;align-items:center;justify-content:center}
.slide-title-main{font-size:64px;color:#FFFFFF;text-shadow:4px 4px 8px rgba(0,0,0,0.4);text-align:center;margin:40px 0;font-weight:bold;animation:title-bounce 2s infinite}
.slide-title-secondary{font-size:44px;color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:30px 0;font-weight:bold}
.instruction-text{font-size:48px;color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:40px 0;font-weight:bold;animation:text-glow 3s infinite}
.simple-text{font-size:36px;color:#FFFFFF;text-shadow:2px 2px 4px rgba(0,0,0,0.3);text-align:center;margin:20px 0}
.giant-button{width:320px;height:320px;border-radius:50%;border:10px solid rgba(255,255,255,0.8);cursor:pointer;font-size:120px;color:white;font-weight:bold;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);position:relative;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.3);background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%);animation:giant-pulse 3s infinite;display:flex;align-items:center;justify-content:center;outline:none}
.giant-button:hover{transform:scale(1.15) rotate(5deg);box-shadow:0 35px 70px rgba(0,0,0,0.4)}
.large-button{width:200px;height:200px;border-radius:50%;border:8px solid rgba(255,255,255,0.8);cursor:pointer;font-size:80px;color:white;font-weight:bold;transition:all 0.3s;position:relative;box-shadow:0 20px 40px rgba(0,0,0,0.3);margin:20px;display:flex;align-items:center;justify-content:center;outline:none}
.large-button.learning{background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%);animation:button-float 2.5s infinite}
.large-button.game{background:linear-gradient(135deg,#70AD47 0%,#5A8F3A 100%);animation:button-float 2.5s infinite 0.5s}
.large-button.achievement{background:linear-gradient(135deg,#FFC000 0%,#E6AC00 100%);animation:button-float 2.5s infinite 1s}
.large-button:hover{transform:scale(1.1) rotate(8deg);box-shadow:0 30px 60px rgba(0,0,0,0.4)}
.learning-card{width:200px;height:200px;border-radius:20px;cursor:pointer;transition:all 0.4s;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:70px;margin:20px;position:relative;box-shadow:0 15px 30px rgba(0,0,0,0.2);border:6px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#ffffff 0%,#f8f9ff 100%);transform-style:preserve-3d}
.learning-card:hover{transform:rotateY(15deg) scale(1.05);box-shadow:0 20px 40px rgba(0,0,0,0.25)}
.learning-card .front{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:15px}
.learning-card .title{font-size:18px;color:#4169E1;margin-top:10px;font-weight:bold}
.interactive-button{width:160px;height:160px;border-radius:25px;cursor:pointer;font-size:24px;color:white;font-weight:bold;transition:all 0.4s;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:4px solid rgba(255,255,255,.3);margin:15px;box-shadow:0 15px 30px rgba(0,0,0,.3)}
.interactive-button.primary{background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%)}
.interactive-button.success{background:linear-gradient(135deg,#70AD47 0%,#5A8F3A 100%)}
.interactive-button.warning{background:linear-gradient(135deg,#FFC000 0%,#E6AC00 100%)}
.interactive-button:hover{transform:scale(1.08) translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.interactive-button .icon{font-size:50px}
.main-visual-circle{width:280px;height:280px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:120px;cursor:pointer;transition:all 0.4s;box-shadow:0 25px 50px rgba(0,0,0,0.3);border:10px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);animation:visual-rotate 8s linear infinite}
.main-visual-circle:hover{transform:scale(1.1)}
.progress-visual{width:400px;height:50px;background:rgba(255,255,255,0.3);border-radius:25px;margin:30px auto;overflow:hidden;position:relative;border:4px solid rgba(255,255,255,0.8)}
.progress-fill{height:100%;background:linear-gradient(90deg,#70AD47 0%,#5A8F3A 30%,#FFC000 70%,#E6AC00 100%);border-radius:25px;width:60%;position:relative;animation:progress-grow 3s infinite}
.progress-fill::after{content:'⭐';position:absolute;right:-20px;top:50%;transform:translateY(-50%);font-size:40px;animation:star-sparkle 1s infinite}
.reward-section{display:flex;justify-content:center;align-items:center;gap:30px;margin:25px 0;padding:20px}
.reward-stars{display:flex;gap:10px}
.reward-star{width:80px;height:80px;background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);cursor:pointer;transition:all 0.3s;margin:5px;animation:star-twinkle 2s infinite;box-shadow:0 8px 16px rgba(255,215,0,0.4)}
.reward-star:hover{transform:scale(1.3) rotate(72deg)}
.medal{width:80px;height:80px;background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;animation:medal-spin 4s infinite;cursor:pointer;border:4px solid rgba(255,255,255,.8);box-shadow:0 8px 20px rgba(255,165,0,.4)}
.points{background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%);color:white;padding:15px 25px;border-radius:25px;font-size:24px;font-weight:bold;box-shadow:0 6px 15px rgba(91,155,213,.4);border:3px solid rgba(255,255,255,.3)}
.sound-button{width:160px;height:160px;background:linear-gradient(135deg,#4ECDC4 0%,#44A08D 100%);border:6px solid rgba(255,255,255,0.9);border-radius:50%;cursor:pointer;position:relative;animation:sound-pulse 2s infinite;box-shadow:0 15px 30px rgba(78,205,196,0.3);font-size:70px;color:white;display:flex;align-items:center;justify-content:center;outline:none;margin:15px}
.sound-button:hover{transform:scale(1.1) rotate(8deg)}
.alphabet-card{width:120px;height:120px;background:linear-gradient(135deg,#5B9BD5 0%,#4A90E2 100%);color:white;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.4s;margin:10px;box-shadow:0 8px 20px rgba(91,155,213,.3);border:3px solid rgba(255,255,255,.3)}
.alphabet-card:hover{transform:rotateY(180deg) scale(1.05)}
.alphabet-card .letter{font-size:40px;font-weight:bold;margin-bottom:5px}
.alphabet-card .word{font-size:12px;text-align:center}
.number-block{width:80px;height:80px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;font-weight:bold;cursor:pointer;transition:all 0.4s;margin:8px;box-shadow:0 6px 15px rgba(0,0,0,.2);border:3px solid rgba(255,255,255,.3)}
.number-block:hover{transform:scale(1.2) rotate(10deg)}
.number-block.n1{background:linear-gradient(135deg,#FF6B6B 0%,#E74C3C 100%)}
.number-block.n2{background:linear-gradient(135deg,#4ECDC4 0%,#26A69A 100%)}
.number-block.n3{background:linear-gradient(135deg,#45B7D1 0%,#2980B9 100%)}
.number-block.n4{background:linear-gradient(135deg,#96CEB4 0%,#52B788 100%)}
.number-block.n5{background:linear-gradient(135deg,#FFEAA7 0%,#FDCB6E 100%)}
.hero-image{width:400px;height:300px;border-radius:30px;border:8px solid rgba(255,255,255,0.9);box-shadow:0 20px 40px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.hero-image:hover{transform:scale(1.05);box-shadow:0 25px 50px rgba(0,0,0,0.3)}
.hero-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.story-image{width:320px;height:240px;border-radius:25px;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px;overflow:hidden;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 30px);box-sizing:border-box}
.story-image:hover{transform:scale(1.08) rotate(2deg)}
.story-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.activity-image{width:240px;height:240px;border-radius:50%;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px;overflow:hidden;background:linear-gradient(135deg,#f3e8ff 0%,#ddd6fe 100%);display:flex;align-items:center;justify-content:center;position:relative;animation:image-float 3s infinite;max-width:calc(100% - 30px);box-sizing:border-box}
.activity-image:hover{transform:scale(1.15) rotate(10deg)}
.activity-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.learning-image{width:180px;height:180px;border-radius:20px;border:4px solid rgba(255,255,255,0.9);box-shadow:0 10px 20px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:10px;overflow:hidden;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 20px);box-sizing:border-box}
.learning-image:hover{transform:scale(1.2)}
.learning-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.image-placeholder{font-size:16px;color:#666;text-align:center;padding:15px;font-family:'Comic Sans MS',cursive;line-height:1.3;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:3px dashed rgba(255,255,255,0.3);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
img{max-width:100%;height:auto;display:block}
.image-container{max-width:100%;margin:15px auto;display:flex;justify-content:center;align-items:center;box-sizing:border-box}
.button-row{display:flex;justify-content:center;align-items:center;gap:30px;margin:30px 0;flex-wrap:wrap}
.content-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden}
.two-column{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;gap:60px;padding:40px;width:100%;box-sizing:border-box}
.two-column .left-side,.two-column .right-side{flex:1;text-align:center;max-width:50%;box-sizing:border-box}
.audio-toggle{position:fixed;top:20px;right:20px;width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:40px;color:white;transition:all 0.3s;z-index:1000;box-shadow:0 10px 20px rgba(0,0,0,0.3);outline:none}
.audio-toggle:hover{transform:scale(1.1);box-shadow:0 15px 30px rgba(0,0,0,0.4)}
.audio-toggle.muted{background:linear-gradient(135deg,#e74c3c 0%,#c0392b 100%);animation:muted-pulse 2s infinite}
.audio-toggle::before{content:'🔊'}
.audio-toggle.muted::before{content:'🔇'}
.audio-status{position:fixed;top:110px;right:20px;background:rgba(0,0,0,0.8);color:white;padding:10px 15px;border-radius:20px;font-size:16px;font-family:'Comic Sans MS',cursive;z-index:1000;opacity:0;transform:translateY(-10px);transition:all 0.3s;pointer-events:none}
.audio-status.show{opacity:1;transform:translateY(0)}
.floating-decoration{position:fixed;font-size:50px;animation:decoration-float 6s infinite;pointer-events:none;text-shadow:2px 2px 4px rgba(0,0,0,0.2);z-index:-1;user-select:none}
.floating-decoration:nth-child(1){top:5%;left:5%;animation-delay:0s}
.floating-decoration:nth-child(2){top:10%;right:5%;animation-delay:2s}
.floating-decoration:nth-child(3){bottom:10%;left:8%;animation-delay:4s}
.floating-decoration:nth-child(4){bottom:5%;right:8%;animation-delay:1s}
.floating-decoration:nth-child(5){top:50%;left:2%;animation-delay:3s}
.floating-decoration:nth-child(6){top:50%;right:2%;animation-delay:5s}
@keyframes title-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
@keyframes text-glow{0%,100%{text-shadow:3px 3px 6px rgba(0,0,0,0.3)}50%{text-shadow:3px 3px 20px rgba(255,255,255,0.8)}}
@keyframes giant-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes button-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes visual-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes progress-grow{0%{width:0%}100%{width:60%}}
@keyframes star-sparkle{0%,100%{transform:translateY(-50%) scale(1)}50%{transform:translateY(-50%) scale(1.2)}}
@keyframes star-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.1)}}
@keyframes medal-spin{0%{transform:rotate(0deg)}25%{transform:rotate(-5deg)}50%{transform:rotate(0deg)}75%{transform:rotate(5deg)}100%{transform:rotate(0deg)}}
@keyframes sound-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes image-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes muted-pulse{0%,100%{opacity:1}50%{opacity:0.7}}
@keyframes decoration-float{0%,100%{transform:translateY(0px) rotate(0deg)}33%{transform:translateY(-20px) rotate(8deg)}66%{transform:translateY(-10px) rotate(-5deg)}}
@keyframes ripple-effect{to{transform:scale(4);opacity:0}}
@media (max-width:768px){.slide-title-main{font-size:56px}.slide-title-secondary{font-size:40px}.instruction-text{font-size:44px}.giant-button{width:280px;height:280px;font-size:120px}.large-button{width:180px;height:180px;font-size:80px}.main-visual-circle{width:260px;height:260px;font-size:120px}.touch-shape{width:160px;height:160px;font-size:60px}.animal-friend{width:140px;height:140px;font-size:70px}.button-row{gap:25px}.two-column{flex-direction:column;gap:40px}.hero-image{width:320px;height:240px}.story-image{width:240px;height:180px}.activity-image{width:160px;height:160px}.mini-image{width:100px;height:100px}.audio-toggle{width:70px;height:70px;font-size:35px}.audio-status{font-size:14px}}
@media (max-width:480px){.slide-title-main{font-size:44px}.slide-title-secondary{font-size:36px}.instruction-text{font-size:36px}.simple-text{font-size:32px}.giant-button{width:220px;height:220px;font-size:100px}.large-button{width:140px;height:140px;font-size:60px}.main-visual-circle{width:200px;height:200px;font-size:100px}.progress-visual{width:300px}.template-section{padding:20px;margin:20px 0}.floating-decoration{font-size:40px}.hero-image{width:280px;height:210px}.story-image{width:200px;height:150px}.activity-image{width:140px;height:140px}.mini-image{width:80px;height:80px}.audio-toggle{width:60px;height:60px;font-size:30px;top:15px;right:15px}.audio-status{font-size:12px;top:85px;right:15px}}
</style>
</head>
<body>
<div class="audio-toggle" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: ON</div>
<div class="layout-fullscreen">
<div class="slide-title-main">HELLO!</div>
<div class="giant-button" onclick="handleGiantButton(this,'success','Hello there!')" role="button" tabindex="0" aria-label="Hello star - click to greet">🌟</div>
<div class="instruction-text">Touch the star!</div>
</div>
<script>
let audioContext,speechSynthesis=window.speechSynthesis;let audioEnabled=true;function initAudio(){if(!audioContext){try{audioContext=new(window.AudioContext||window.webkitAudioContext)()}catch(e){console.warn('Web Audio API not supported')}}return audioContext}function playTone(frequency,duration,volume=0.1){if(!audioEnabled)return;const ctx=initAudio();if(!ctx)return;const oscillator=ctx.createOscillator();const gainNode=ctx.createGain();oscillator.connect(gainNode);gainNode.connect(ctx.destination);oscillator.frequency.value=frequency;oscillator.type='sine';gainNode.gain.setValueAtTime(0,ctx.currentTime);gainNode.gain.linearRampToValueAtTime(volume,ctx.currentTime+0.01);gainNode.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+duration);oscillator.start(ctx.currentTime);oscillator.stop(ctx.currentTime+duration)}function speak(text,options={}){if(!audioEnabled)return;if(!speechSynthesis){console.warn('Speech synthesis not supported');return}try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=0.7;utterance.pitch=1.3;utterance.volume=0.8;utterance.lang='en-US';Object.assign(utterance,options);utterance.onerror=function(event){console.warn('Speech synthesis error:',event.error)};speechSynthesis.speak(utterance)}catch(error){console.warn('Speech synthesis failed:',error)}}const soundEffects={button:()=>{playTone(440,0.2,0.15);setTimeout(()=>speak("Button pressed!"),200)},success:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Great job!"),500)},animal:(type)=>{const sounds={cat:()=>{playTone(800,0.2);setTimeout(()=>speak("Meow!"),300)},dog:()=>{playTone(300,0.3);setTimeout(()=>speak("Woof!"),400)},bear:()=>{playTone(220,0.5);setTimeout(()=>speak("Roar!"),500)}};if(sounds[type])sounds[type]()},play:()=>{playTone(440,0.2);setTimeout(()=>playTone(554,0.2),200);setTimeout(()=>speak("Let's play!"),400)},music:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Music time!"),500)}};function toggleAudio(){audioEnabled=!audioEnabled;const toggleButton=document.querySelector('.audio-toggle');const statusIndicator=document.getElementById('audioStatus');if(audioEnabled){toggleButton.classList.remove('muted');statusIndicator.textContent='Audio: ON';statusIndicator.style.color='#4CAF50'}else{toggleButton.classList.add('muted');statusIndicator.textContent='Audio: OFF';statusIndicator.style.color='#f44336';if(speechSynthesis){speechSynthesis.cancel()}}statusIndicator.classList.add('show');setTimeout(()=>{statusIndicator.classList.remove('show')},2000);toggleButton.style.transform='scale(0.9)';setTimeout(()=>toggleButton.style.transform='',100);console.log('Audio',audioEnabled?'enabled':'disabled')}function handleGiantButton(element,soundType,text){element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform='',100);if(soundEffects[soundType]){soundEffects[soundType]()}setTimeout(()=>speak(text),300);createRippleEffect(element)}function handleShape(element,shapeType){element.style.transform='scale(0.9) rotate(15deg)';setTimeout(()=>element.style.transform='',200);playTone(600+(shapeType==='circle'?100:shapeType==='square'?200:300),0.3);setTimeout(()=>speak(\`\${shapeType.charAt(0).toUpperCase()+shapeType.slice(1)}!\`),300);createRippleEffect(element)}function handleImageClick(element,imageType){const originalTransform=element.style.transform;element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform=originalTransform,150);const sounds={hero:()=>{playTone(523,0.4);setTimeout(()=>speak("Beautiful picture!"),400)},story:()=>{playTone(659,0.3);setTimeout(()=>speak("What a nice story!"),300)},activity:()=>{playTone(784,0.2);setTimeout(()=>speak("Let's learn!"),250)},mini:()=>{playTone(880,0.2);setTimeout(()=>speak("So pretty!"),200)}};if(sounds[imageType]){sounds[imageType]()}createRippleEffect(element)}function createRippleEffect(element){const ripple=document.createElement('div');ripple.style.cssText=\`position:absolute;border-radius:50%;background:rgba(255,255,255,0.7);transform:scale(0);animation:ripple-effect 0.6s linear;pointer-events:none;\`;const rect=element.getBoundingClientRect();const size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=size+'px';ripple.style.left='50%';ripple.style.top='50%';ripple.style.marginLeft=-(size/2)+'px';ripple.style.marginTop=-(size/2)+'px';element.style.position='relative';element.appendChild(ripple);setTimeout(()=>ripple.remove(),600)}document.addEventListener('DOMContentLoaded',function(){const statusIndicator=document.getElementById('audioStatus');if(statusIndicator){statusIndicator.style.color='#4CAF50'}setTimeout(()=>{speak("Welcome! Touch the colorful buttons! Press M to toggle audio.",{rate:0.8,pitch:1.2})},1000);console.log('🎈 AI Template Library for 2-3 years loaded!');console.log('🔊 Press M key to toggle audio on/off')});document.addEventListener('touchstart',function(e){if(audioContext&&audioContext.state==='suspended'){audioContext.resume()}});document.addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M'){e.preventDefault();toggleAudio();return}if(e.target.getAttribute('role')==='button'){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}}});document.addEventListener('focusin',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='4px solid #FFD700';e.target.style.outlineOffset='4px'}});document.addEventListener('focusout',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='none'}});
</script>
</body>
</html>`,

  '4-6': `<!DOCTYPE html>
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
</html>`,

  '7-8': `<!DOCTYPE html>
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
</html>`,

  '9-10': `<!DOCTYPE html>
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
</html>`
};

/**
 * === Template Descriptions ===
 * Descriptions for each age group template
 */
export const AGE_TEMPLATE_DESCRIPTIONS: Record<AgeGroup, string> = {
  '2-3': 'Візуальні компоненти для малюків 2-3 роки: великі кнопки, анімації, звукові ефекти, яскраві кольори',
  '4-6': 'Компоненти для дошкільнят 4-6 років: інтерактивні ігри, персонажі, прості завдання, музика',
  '7-8': 'Елементи для молодших школярів 7-8 років: навчальні ігри, тести, прогрес-бари, досягнення',
  '9-10': 'Компоненти для старших школярів 9-10 років: складні інтерфейси, деталізовані дані, аналітика'
};

/**
 * === Age Configuration ===
 * Configuration settings for each age group
 */
export const AGE_CONFIGURATIONS: Record<AgeGroup, {
  padding: number;
  borderRadius: number;
  fontSize: number;
  buttonSize: number;
  colors: string[];
}> = {
  '2-3': {
    padding: 40,
    borderRadius: 30,
    fontSize: 72,
    buttonSize: 350,
    colors: ['#FFE66D', '#4ECDC4', '#FF6B6B']
  },
  '4-6': {
    padding: 30,
    borderRadius: 25,
    fontSize: 64,
    buttonSize: 320,
    colors: ['#87CEEB', '#98FB98', '#FFE4B5', '#F0E68C']
  },
  '7-8': {
    padding: 25,
    borderRadius: 20,
    fontSize: 36,
    buttonSize: 200,
    colors: ['#667eea', '#764ba2', '#f093fb']
  },
  '9-10': {
    padding: 20,
    borderRadius: 15,
    fontSize: 32,
    buttonSize: 150,
    colors: ['#1F4E79', '#2C5F2D', '#97BC62']
  }
};
