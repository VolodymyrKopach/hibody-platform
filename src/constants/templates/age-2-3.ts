/**
 * === Age Template 2-3 Years ===
 * HTML template for toddlers (2-3 years old)
 * Features: Large buttons, bright colors, animations, sound effects
 */

export const AGE_2_3_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎈 AI Template Library for 2-3 Years</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive;background:linear-gradient(135deg,#FFE66D 0%,#4ECDC4 50%,#FF6B6B 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
.template-section{margin:40px 0;padding:40px;background:rgba(255,255,255,0.1);border-radius:30px;border:3px dashed rgba(255,255,255,0.5);overflow-y:auto;overflow-x:hidden;max-height:90vh;min-height:200px}
.template-title{font-size:36px;color:#FFFFFF;text-align:center;margin-bottom:30px;text-shadow:3px 3px 6px rgba(0,0,0,0.3);background:rgba(0,0,0,0.2);padding:15px;border-radius:15px}
.layout-fullscreen{width:100%;max-width:100vw;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:min(40px,5vw);box-sizing:border-box;overflow-y:auto;overflow-x:hidden;gap:min(20px,3vw)}
.layout-top-bottom{display:flex;flex-direction:column;min-height:100vh;padding:40px;box-sizing:border-box;overflow-y:auto;overflow-x:hidden}
.layout-top-bottom .top-section{flex:1;display:flex;align-items:center;justify-content:center}
.layout-top-bottom .bottom-section{flex:1;display:flex;align-items:center;justify-content:center}
.slide-title-main{font-size:clamp(44px,12vw,72px);color:#FFFFFF;text-shadow:4px 4px 8px rgba(0,0,0,0.4);text-align:center;margin:clamp(20px,5vw,40px) 0;font-weight:bold;animation:title-bounce 2s infinite}
.slide-title-secondary{font-size:clamp(32px,8vw,48px);color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:clamp(15px,4vw,30px) 0;font-weight:bold}
.instruction-text{font-size:clamp(36px,9vw,52px);color:#FFFFFF;text-shadow:3px 3px 6px rgba(0,0,0,0.3);text-align:center;margin:clamp(20px,5vw,40px) 0;font-weight:bold;animation:text-glow 3s infinite}
.simple-text{font-size:clamp(28px,7vw,40px);color:#FFFFFF;text-shadow:2px 2px 4px rgba(0,0,0,0.3);text-align:center;margin:clamp(10px,3vw,20px) 0}
.giant-button{width:clamp(200px,25vw,350px);height:clamp(200px,25vw,350px);border-radius:50%;border:clamp(6px,1.5vw,10px) solid rgba(255,255,255,0.8);cursor:pointer;font-size:clamp(80px,15vw,140px);color:white;font-weight:bold;transition:all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);position:relative;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.3);background:linear-gradient(135deg,#FF6B6B 0%,#FA709A 100%);animation:giant-pulse 3s infinite;display:flex;align-items:center;justify-content:center;outline:none;flex-shrink:0;min-width:44px;min-height:44px}
.giant-button::after{content:attr(data-emoji);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;font-size:inherit;color:white;text-shadow:2px 2px 4px rgba(0,0,0,0.8);pointer-events:none}
.giant-button:hover{transform:scale(1.2) rotate(8deg);box-shadow:0 35px 70px rgba(0,0,0,0.4)}
.large-button{width:clamp(140px,20vw,220px);height:clamp(140px,20vw,220px);border-radius:50%;border:clamp(4px,1vw,8px) solid rgba(255,255,255,0.8);cursor:pointer;font-size:clamp(60px,12vw,100px);color:white;font-weight:bold;transition:all 0.3s;position:relative;box-shadow:0 20px 40px rgba(0,0,0,0.3);margin:clamp(10px,2vw,20px);display:flex;align-items:center;justify-content:center;outline:none;min-width:44px;min-height:44px;overflow:hidden}
.large-button::after{content:attr(data-emoji);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;font-size:inherit;color:white;text-shadow:2px 2px 4px rgba(0,0,0,0.8);pointer-events:none}
.large-button.variant-1{background:linear-gradient(135deg,#4ECDC4 0%,#44A08D 100%);animation:button-float 2.5s infinite}
.large-button.variant-2{background:linear-gradient(135deg,#FFE66D 0%,#FFA500 100%);animation:button-float 2.5s infinite 0.5s}
.large-button.variant-3{background:linear-gradient(135deg,#9B59B6 0%,#8E44AD 100%);animation:button-float 2.5s infinite 1s}
.large-button:hover{transform:scale(1.15) rotate(10deg);box-shadow:0 30px 60px rgba(0,0,0,0.4)}
.interactive-shape{width:200px;height:200px;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;font-size:80px;margin:25px;box-shadow:0 15px 30px rgba(0,0,0,0.2);border:6px solid rgba(255,255,255,0.9)}
.interactive-shape.circle{border-radius:50%;background:linear-gradient(135deg,#FF9A9E 0%,#FECFEF 100%)}
.interactive-shape.square{border-radius:30px;background:linear-gradient(135deg,#A8EDEA 0%,#FED6E3 100%)}
.interactive-shape.triangle{border-radius:30px;background:linear-gradient(135deg,#FFE66D 0%,#FF9A9E 100%);clip-path:polygon(50% 10%,10% 90%,90% 90%);-webkit-clip-path:polygon(50% 10%,10% 90%,90% 90%)}
.interactive-shape:hover{transform:scale(1.3) rotate(15deg)}
.interactive-element{width:180px;height:180px;border-radius:50%;cursor:pointer;transition:all 0.4s;display:flex;align-items:center;justify-content:center;font-size:90px;margin:20px;position:relative;box-shadow:0 15px 30px rgba(0,0,0,0.2);border:6px solid rgba(255,255,255,0.9);animation:element-bounce 3s infinite}
.interactive-element.variant-1{background:linear-gradient(135deg,#FA709A 0%,#FEE140 100%)}
.interactive-element.variant-2{background:linear-gradient(135deg,#4FACFE 0%,#00F2FE 100%);animation-delay:0.5s}
.interactive-element.variant-3{background:linear-gradient(135deg,#8B4513 0%,#D2691E 100%);animation-delay:1s}
.interactive-element:hover{transform:scale(1.4) rotate(20deg)}
[class*="round"],[class*="circle"],[class*="interactive"],.large-button,.giant-button,.primary-visual,.action-image{position:relative}
[class*="round"] .image-container,[class*="circle"] .image-container,[class*="interactive"] .image-container,.large-button .image-container,.giant-button .image-container,.primary-visual .image-container,.action-image .image-container{width:100%!important;height:100%!important;margin:0!important;padding:0!important;border-radius:50%!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;position:absolute!important;top:0!important;left:0!important;z-index:1!important;box-shadow:none!important}
[class*="round"] .image-container img,[class*="circle"] .image-container img,[class*="interactive"] .image-container img,.large-button .image-container img,.giant-button .image-container img,.primary-visual .image-container img,.action-image .image-container img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:0!important;box-shadow:none!important;margin:0!important;padding:0!important;max-width:none!important;display:block!important;border:none!important}
.primary-visual{width:320px;height:320px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:150px;cursor:pointer;transition:all 0.4s;box-shadow:0 25px 50px rgba(0,0,0,0.3);border:12px solid rgba(255,255,255,0.9);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);animation:visual-rotate 8s linear infinite}
.primary-visual:hover{transform:scale(1.15)}
.progress-container{width:400px;height:60px;background:rgba(255,255,255,0.3);border-radius:30px;margin:40px auto;overflow:hidden;position:relative;border:4px solid rgba(255,255,255,0.8)}
.progress-fill{height:100%;background:linear-gradient(90deg,#FF6B6B 0%,#4ECDC4 50%,#FFE66D 100%);border-radius:30px;width:75%;position:relative;animation:progress-grow 3s infinite}
.progress-fill::after{content:'⭐';position:absolute;right:-20px;top:50%;transform:translateY(-50%);font-size:50px;animation:star-sparkle 1s infinite}
.reward-element{width:120px;height:120px;background:linear-gradient(135deg,#FFD700 0%,#FFA500 100%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);cursor:pointer;transition:all 0.3s;margin:15px;animation:star-twinkle 2s infinite;box-shadow:0 10px 20px rgba(255,215,0,0.4)}
.reward-element:hover{transform:scale(1.5) rotate(72deg)}
.celebration-element{position:relative;width:150px;height:150px;background:linear-gradient(135deg,#FF6B6B 0%,#4ECDC4 100%);border-radius:50%;cursor:pointer;animation:celebration-spin 2s linear infinite;display:flex;align-items:center;justify-content:center;font-size:70px;box-shadow:0 15px 30px rgba(0,0,0,0.3);border:6px solid rgba(255,255,255,0.9)}
.audio-control{width:180px;height:180px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:6px solid rgba(255,255,255,0.9);border-radius:50%;cursor:pointer;position:relative;animation:sound-pulse 2s infinite;box-shadow:0 15px 30px rgba(102,126,234,0.3);font-size:80px;color:white;display:flex;align-items:center;justify-content:center;outline:none}
.audio-control::before{content:'🔊';font-size:80px}
.audio-wave{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:220px;height:220px;border:4px solid rgba(102,126,234,0.3);border-radius:50%;animation:wave-expand 2s infinite}
.hero-image{width:400px;height:300px;border-radius:30px;border:8px solid rgba(255,255,255,0.9);box-shadow:0 20px 40px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:20px auto;overflow:hidden;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 40px);box-sizing:border-box}
.hero-image:hover{transform:scale(1.05);box-shadow:0 25px 50px rgba(0,0,0,0.3)}
.hero-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.content-image{width:280px;height:210px;border-radius:25px;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px auto;overflow:hidden;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 30px);box-sizing:border-box}
.content-image:hover{transform:scale(1.08) rotate(2deg)}
.content-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.action-image{width:200px;height:200px;border-radius:50%;border:6px solid rgba(255,255,255,0.9);box-shadow:0 15px 30px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:15px;overflow:hidden;background:linear-gradient(135deg,#f3e8ff 0%,#ddd6fe 100%);display:flex;align-items:center;justify-content:center;position:relative;animation:image-float 3s infinite;max-width:calc(100% - 30px);box-sizing:border-box}
.action-image:hover{transform:scale(1.15) rotate(10deg)}
.action-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.mini-image{width:120px;height:120px;border-radius:20px;border:4px solid rgba(255,255,255,0.9);box-shadow:0 10px 20px rgba(0,0,0,0.2);cursor:pointer;transition:all 0.3s;margin:10px;overflow:hidden;background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);display:flex;align-items:center;justify-content:center;position:relative;max-width:calc(100% - 20px);box-sizing:border-box}
.mini-image:hover{transform:scale(1.2)}
.mini-image img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:inherit}
.image-placeholder{font-size:14px;color:#666;text-align:center;padding:10px;font-family:'Comic Sans MS',cursive;line-height:1.2;max-width:90%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:3px dashed rgba(255,255,255,0.3);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin:0 auto;position:relative;overflow:hidden;box-sizing:border-box}
img{max-width:100%;height:auto;display:block}
.image-container{max-width:100%;margin:15px auto;display:flex;justify-content:center;align-items:center;box-sizing:border-box}
.s{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;width:100%;max-width:100%;box-sizing:border-box}
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
.background-decoration{position:fixed;font-size:50px;animation:decoration-float 6s infinite;pointer-events:none;text-shadow:2px 2px 4px rgba(0,0,0,0.2);z-index:-1;user-select:none}
.background-decoration:nth-child(1){top:5%;left:5%;animation-delay:0s}
.background-decoration:nth-child(2){top:10%;right:5%;animation-delay:2s}
.background-decoration:nth-child(3){bottom:10%;left:8%;animation-delay:4s}
.background-decoration:nth-child(4){bottom:5%;right:8%;animation-delay:1s}
.background-decoration:nth-child(5){top:50%;left:2%;animation-delay:3s}
.background-decoration:nth-child(6){top:50%;right:2%;animation-delay:5s}
.button-row{display:flex;justify-content:center;align-items:center;gap:40px;margin:40px 0;flex-wrap:wrap}
.content-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;width:100%;max-width:100%;box-sizing:border-box}
.two-column{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;gap:60px;padding:40px;width:100%;box-sizing:border-box}
.two-column .left-side,.two-column .right-side{flex:1;text-align:center;max-width:50%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center}
@keyframes title-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes text-glow{0%,100%{text-shadow:3px 3px 6px rgba(0,0,0,0.3)}50%{text-shadow:3px 3px 20px rgba(255,255,255,0.8)}}
@keyframes giant-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes button-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
@keyframes element-bounce{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(3deg)}}
@keyframes visual-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes progress-grow{0%{width:0%}100%{width:75%}}
@keyframes star-sparkle{0%,100%{transform:translateY(-50%) scale(1)}50%{transform:translateY(-50%) scale(1.3)}}
@keyframes star-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.2)}}
@keyframes celebration-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes sound-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes wave-expand{0%{transform:translate(-50%,-50%) scale(0.8);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
@keyframes decoration-float{0%,100%{transform:translateY(0px) rotate(0deg)}33%{transform:translateY(-20px) rotate(8deg)}66%{transform:translateY(-10px) rotate(-5deg)}}
@keyframes ripple-effect{to{transform:scale(4);opacity:0}}
::-webkit-scrollbar{width:12px;height:12px}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.2);border-radius:10px}
::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#FF6B6B 0%,#4ECDC4 100%);border-radius:10px;border:2px solid rgba(255,255,255,0.3)}
::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#FF5252 0%,#26C6DA 100%)}
::-webkit-scrollbar-corner{background:rgba(255,255,255,0.2)}
*{scrollbar-width:thin;scrollbar-color:rgba(255,107,107,0.8) rgba(255,255,255,0.2)}
@media (max-width:600px){.layout-fullscreen{padding:clamp(15px,4vw,30px);gap:clamp(15px,3vw,25px)}.button-row{gap:clamp(15px,3vw,25px);margin:clamp(20px,4vw,30px) 0}.two-column{gap:clamp(20px,4vw,30px);padding:clamp(20px,4vw,30px)}.template-section{padding:clamp(15px,4vw,25px);margin:clamp(15px,3vw,25px) 0;max-height:none;overflow-y:visible}}
@media (max-width:768px){.primary-visual{width:clamp(200px,35vw,260px);height:clamp(200px,35vw,260px);font-size:clamp(100px,18vw,120px)}.interactive-shape{width:clamp(120px,25vw,160px);height:clamp(120px,25vw,160px);font-size:clamp(50px,10vw,60px)}.interactive-element{width:clamp(100px,22vw,140px);height:clamp(100px,22vw,140px);font-size:clamp(60px,12vw,70px)}[class*="round"] .image-container,[class*="circle"] .image-container,[class*="interactive"] .image-container,.large-button .image-container,.giant-button .image-container,.primary-visual .image-container,.action-image .image-container{width:100%;height:100%}[class*="round"] .image-container img,[class*="circle"] .image-container img,[class*="interactive"] .image-container img,.large-button .image-container img,.giant-button .image-container img,.primary-visual .image-container img,.action-image .image-container img{width:100%;height:100%}.hero-image{width:clamp(280px,80vw,320px);height:clamp(210px,60vw,240px)}.content-image{width:clamp(200px,70vw,240px);height:clamp(150px,52vw,180px)}.action-image{width:clamp(120px,30vw,160px);height:clamp(120px,30vw,160px)}.mini-image{width:clamp(80px,20vw,100px);height:clamp(80px,20vw,100px)}.audio-toggle{width:clamp(60px,12vw,70px);height:clamp(60px,12vw,70px);font-size:clamp(30px,6vw,35px)}.audio-status{font-size:clamp(12px,3vw,14px)}.template-section{max-height:none;overflow-y:visible}}
@media (max-width:480px){.progress-container{width:clamp(250px,85vw,300px)}.background-decoration{font-size:clamp(30px,8vw,40px)}.audio-toggle{width:clamp(50px,10vw,60px);height:clamp(50px,10vw,60px);font-size:clamp(25px,5vw,30px);top:clamp(10px,2vw,15px);right:clamp(10px,2vw,15px)}.audio-status{font-size:clamp(10px,2.5vw,12px);top:clamp(70px,15vw,85px);right:clamp(10px,2vw,15px)}.two-column{padding:clamp(15px,3vw,20px);gap:clamp(15px,3vw,20px)}[class*="round"] .image-container,[class*="circle"] .image-container,[class*="interactive"] .image-container,.large-button .image-container,.giant-button .image-container,.primary-visual .image-container,.action-image .image-container{width:100%;height:100%}[class*="round"] .image-container img,[class*="circle"] .image-container img,[class*="interactive"] .image-container img,.large-button .image-container img,.giant-button .image-container img,.primary-visual .image-container img,.action-image .image-container img{width:100%;height:100%}}
</style>
</head>
<body>
<div class="audio-toggle muted" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: OFF</div>
<div class="layout-fullscreen">
<div class="slide-title-main">HELLO!</div>
<div class="giant-button" onclick="handleGiantButton(this,'success','Hello there!')" role="button" tabindex="0" aria-label="Hello star - click to greet">🌟</div>
<div class="instruction-text">Touch! 👆</div>
</div>
<script>
let audioContext,speechSynthesis=window.speechSynthesis;let audioEnabled=false;function initAudio(){if(!audioContext){try{audioContext=new(window.AudioContext||window.webkitAudioContext)()}catch(e){console.warn('Web Audio API not supported')}}return audioContext}function playTone(frequency,duration,volume=0.1){if(!audioEnabled)return;const ctx=initAudio();if(!ctx)return;const oscillator=ctx.createOscillator();const gainNode=ctx.createGain();oscillator.connect(gainNode);gainNode.connect(ctx.destination);oscillator.frequency.value=frequency;oscillator.type='sine';gainNode.gain.setValueAtTime(0,ctx.currentTime);gainNode.gain.linearRampToValueAtTime(volume,ctx.currentTime+0.01);gainNode.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+duration);oscillator.start(ctx.currentTime);oscillator.stop(ctx.currentTime+duration)}function speak(text,options={}){if(!audioEnabled)return;if(!speechSynthesis){console.warn('Speech synthesis not supported');return}try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=0.7;utterance.pitch=1.3;utterance.volume=0.8;utterance.lang='en-US';Object.assign(utterance,options);utterance.onerror=function(event){console.warn('Speech synthesis error:',event.error)};speechSynthesis.speak(utterance)}catch(error){console.warn('Speech synthesis failed:',error)}}const soundEffects={button:()=>{playTone(440,0.2,0.15);setTimeout(()=>speak("Click!"),200)},success:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Good!"),500)},interactive:(type)=>{const sounds={variant1:()=>{playTone(800,0.2);setTimeout(()=>speak("Good!"),300)},variant2:()=>{playTone(300,0.3);setTimeout(()=>speak("Yay!"),400)},variant3:()=>{playTone(220,0.5);setTimeout(()=>speak("Wow!"),500)}};if(sounds[type])sounds[type]()},play:()=>{playTone(440,0.2);setTimeout(()=>playTone(554,0.2),200);setTimeout(()=>speak("Play!"),400)},music:()=>{playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak("Music!"),500)}};function toggleAudio(){const wasEnabled=audioEnabled;audioEnabled=!audioEnabled;const toggleButton=document.querySelector('.audio-toggle');const statusIndicator=document.getElementById('audioStatus');if(audioEnabled){toggleButton.classList.remove('muted');statusIndicator.textContent='Audio: ON';statusIndicator.style.color='#4CAF50';if(!wasEnabled){setTimeout(()=>{speak("Hi! Touch!",{rate:0.6,pitch:1.4})},500)}}else{toggleButton.classList.add('muted');statusIndicator.textContent='Audio: OFF';statusIndicator.style.color='#f44336';if(speechSynthesis){speechSynthesis.cancel()}}statusIndicator.classList.add('show');setTimeout(()=>{statusIndicator.classList.remove('show')},2000);toggleButton.style.transform='scale(0.9)';setTimeout(()=>toggleButton.style.transform='',100);console.log('Audio',audioEnabled?'enabled':'disabled')}function handleGiantButton(element,soundType,text){element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform='',100);if(soundEffects[soundType]){const effect=soundEffects[soundType];if(typeof effect==='function'){if(soundType==='success'){playTone(523,0.15);setTimeout(()=>playTone(659,0.15),150);setTimeout(()=>playTone(784,0.15),300);setTimeout(()=>speak(text||"Good!"),500)}else if(soundType==='button'){playTone(440,0.2,0.15);setTimeout(()=>speak(text||"Click!"),200)}else{effect();if(text){setTimeout(()=>speak(text),300)}}}}else if(text){setTimeout(()=>speak(text),300)}createRippleEffect(element)}function handleInteractiveShape(element,shapeType,customText){element.style.transform='scale(0.9) rotate(15deg)';setTimeout(()=>element.style.transform='',200);playTone(600+(shapeType==='circle'?100:shapeType==='square'?200:300),0.3);setTimeout(()=>speak(customText||(\`\${shapeType.charAt(0).toUpperCase()+shapeType.slice(1)}!\`)),300);createRippleEffect(element)}function handleImageClick(element,imageType,customText){const originalTransform=element.style.transform;element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform=originalTransform,150);const sounds={hero:()=>{playTone(523,0.4);setTimeout(()=>speak(customText||"Pretty!"),400)},story:()=>{playTone(659,0.3);setTimeout(()=>speak(customText||"Story!"),300)},activity:()=>{playTone(784,0.2);setTimeout(()=>speak(customText||"Learn!"),250)},mini:()=>{playTone(880,0.2);setTimeout(()=>speak(customText||"Pretty!"),200)},action:()=>{playTone(440,0.2);setTimeout(()=>speak(customText||"Touch!"),200)}};if(sounds[imageType]){sounds[imageType]()}createRippleEffect(element)}function handlePrimaryVisual(element,customText){element.style.transform='scale(0.95)';setTimeout(()=>element.style.transform='',200);playTone(523,0.3);setTimeout(()=>speak(customText||"Wow!"),300);createRippleEffect(element)}function createRippleEffect(element){const ripple=document.createElement('div');ripple.style.cssText=\`position:absolute;border-radius:50%;background:rgba(255,255,255,0.7);transform:scale(0);animation:ripple-effect 0.6s linear;pointer-events:none;\`;const rect=element.getBoundingClientRect();const size=Math.max(rect.width,rect.height);ripple.style.width=ripple.style.height=size+'px';ripple.style.left='50%';ripple.style.top='50%';ripple.style.marginLeft=-(size/2)+'px';ripple.style.marginTop=-(size/2)+'px';element.style.position='relative';element.appendChild(ripple);setTimeout(()=>ripple.remove(),600)}document.addEventListener('DOMContentLoaded',function(){const statusIndicator=document.getElementById('audioStatus');if(statusIndicator){statusIndicator.style.color='#f44336'}console.log('🎈 AI Template Library for 2-3 years loaded!');console.log('🔊 Press M key or click audio button to enable audio')});document.addEventListener('touchstart',function(e){if(audioContext&&audioContext.state==='suspended'){audioContext.resume()}});document.addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M'){e.preventDefault();toggleAudio();return}if(e.target.getAttribute('role')==='button'){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}}});document.addEventListener('focusin',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='4px solid #FFD700';e.target.style.outlineOffset='4px'}});document.addEventListener('focusout',function(e){if(e.target.getAttribute('role')==='button'){e.target.style.outline='none'}});
</script>
</body>
</html>`;

/**
 * Template description for 2-3 years age group
 */
export const AGE_2_3_DESCRIPTION = 'Simple template for toddlers 2-3 years: very large buttons, simple words, animations, optional sound effects (disabled by default), bright colors, and engaging visual feedback';

/**
 * Configuration for 2-3 years age group
 */
export const AGE_2_3_CONFIG = {
  padding: 40,
  borderRadius: 30,
  fontSize: 72,
  buttonSize: 350,
  colors: ['#FFE66D', '#4ECDC4', '#FF6B6B']
};
