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
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#1F4E79 0%,#2C5F2D 50%,#97BC62 100%);min-height:100vh;overflow-x:hidden;overflow-y:auto;position:relative;scroll-behavior:smooth}
.s{background:linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95));border-radius:15px;padding:25px;margin:20px 0;box-shadow:0 10px 25px rgba(0,0,0,0.08);position:relative;border:1px solid rgba(255,255,255,0.6);overflow-y:auto;overflow-x:hidden;max-height:90vh}
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
.layout-fullscreen{width:100%;max-width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:25px;box-sizing:border-box;overflow-y:auto;overflow-x:hidden}
.layout-top-bottom{display:flex;flex-direction:column;min-height:100vh;padding:25px;box-sizing:border-box;overflow-y:auto;overflow-x:hidden}
.layout-top-bottom .top-section{flex:1;display:flex;align-items:center;justify-content:center}
.layout-top-bottom .bottom-section{flex:1;display:flex;align-items:center;justify-content:center}
.template-section{margin:25px 0;padding:25px;background:rgba(255,255,255,0.1);border-radius:15px;border:2px dashed rgba(255,255,255,0.4);overflow-y:auto;overflow-x:hidden;max-height:80vh}
.template-title{font-size:26px;color:#2c3e50;text-align:center;margin-bottom:18px;font-weight:600;background:rgba(255,255,255,0.15);padding:8px;border-radius:8px}
.content-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:25px;width:100%;max-width:100%;box-sizing:border-box;overflow-x:hidden;overflow-y:auto}
.two-column{display:flex;align-items:flex-start;justify-content:space-between;max-width:1200px;margin:0 auto;gap:30px;padding:25px;width:100%;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;max-height:80vh}
.two-column .left-side,.two-column .right-side{flex:1;max-width:50%;box-sizing:border-box}
.three-column{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;max-width:1200px;margin:0 auto;padding:25px;width:100%;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;max-height:80vh}
.data-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;padding:20px;overflow-y:auto;overflow-x:hidden;max-height:75vh}
.card{background:rgba(255,255,255,0.95);border-radius:12px;padding:20px;box-shadow:0 8px 20px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.7);transition:all 0.3s ease;cursor:pointer}
.card:hover{transform:translateY(-5px);box-shadow:0 12px 30px rgba(0,0,0,0.15)}
.button-row{display:flex;justify-content:center;align-items:center;gap:20px;margin:20px 0;flex-wrap:wrap}
.simple-text{font-size:18px;color:#2c3e50;text-align:center;margin:12px 0;line-height:1.6}
.slide-title-secondary{font-size:26px;color:#2c3e50;text-align:center;margin:18px 0;font-weight:600}
.slide-title-main{font-size:34px;color:#2c3e50;margin:0 0 12px 0;font-weight:700;background:linear-gradient(45deg,#1F4E79,#2C5F2D,#97BC62);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center}
.instruction-text{font-size:20px;color:#2c3e50;text-align:center;margin:18px 0;font-weight:500;background:rgba(31,78,121,0.1);padding:12px;border-radius:8px}
.data-table{width:100%;border-collapse:collapse;margin:20px 0;background:rgba(255,255,255,0.95);border-radius:10px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,0.1)}
.data-table th,.data-table td{padding:12px 15px;text-align:left;border-bottom:1px solid rgba(0,0,0,0.1)}
.data-table th{background:linear-gradient(135deg,#1F4E79 0%,#2C5F2D 100%);color:white;font-weight:600}
.data-table tr:hover{background:rgba(31,78,121,0.05)}
.chart-container{background:rgba(255,255,255,0.95);border-radius:12px;padding:20px;margin:20px 0;box-shadow:0 8px 20px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.7);overflow-y:auto;overflow-x:hidden;max-height:400px}
.progress-bar{width:100%;height:25px;background:rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;margin:15px 0;position:relative}
.progress-fill{height:100%;background:linear-gradient(90deg,#1F4E79 0%,#2C5F2D 50%,#97BC62 100%);border-radius:12px;transition:width 0.5s ease;position:relative}
.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-weight:600;font-size:14px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin:20px 0}
.stat-card{background:rgba(255,255,255,0.95);border-radius:10px;padding:20px;text-align:center;box-shadow:0 5px 15px rgba(0,0,0,0.1);border-left:4px solid #1F4E79;transition:all 0.3s ease}
.stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,0,0,0.15)}
.stat-number{font-size:32px;font-weight:700;color:#1F4E79;margin:10px 0}
.stat-label{font-size:16px;color:#2c3e50;font-weight:500}
.timeline{position:relative;padding:20px 0;margin:20px 0}
.timeline-item{position:relative;padding:20px 0 20px 40px;border-left:3px solid #1F4E79}
.timeline-item::before{content:'';position:absolute;left:-8px;top:25px;width:14px;height:14px;border-radius:50%;background:#1F4E79}
.timeline-content{background:rgba(255,255,255,0.95);border-radius:8px;padding:15px;box-shadow:0 3px 10px rgba(0,0,0,0.1)}
.tag{display:inline-block;background:linear-gradient(135deg,#1F4E79 0%,#2C5F2D 100%);color:white;padding:5px 12px;border-radius:20px;font-size:14px;margin:5px;font-weight:500}
.alert{padding:15px;border-radius:8px;margin:15px 0;border-left:4px solid}
.alert.info{background:rgba(31,78,121,0.1);border-color:#1F4E79;color:#1F4E79}
.alert.success{background:rgba(44,95,45,0.1);border-color:#2C5F2D;color:#2C5F2D}
.alert.warning{background:rgba(151,188,98,0.1);border-color:#97BC62;color:#6B8E23}
.tabs{display:flex;border-bottom:2px solid rgba(31,78,121,0.2);margin:20px 0}
.tab{padding:12px 20px;cursor:pointer;border-bottom:3px solid transparent;transition:all 0.3s ease;font-weight:500}
.tab.active{border-bottom-color:#1F4E79;background:rgba(31,78,121,0.1);color:#1F4E79}
.tab-content{padding:20px;background:rgba(255,255,255,0.95);border-radius:0 0 8px 8px;overflow-y:auto;overflow-x:hidden;max-height:400px}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.1);border-radius:8px}
::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#1F4E79 0%,#2C5F2D 100%);border-radius:8px;border:1px solid rgba(255,255,255,0.2)}
::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#1A4269 0%,#254F26 100%)}
::-webkit-scrollbar-corner{background:rgba(255,255,255,0.1)}
*{scrollbar-width:thin;scrollbar-color:rgba(31,78,121,0.8) rgba(255,255,255,0.1)}
@media (max-width:768px){.slide-title-main{font-size:28px}.main-heading{font-size:26px}.section-heading{font-size:20px}.slide-title-secondary{font-size:22px}.instruction-text{font-size:18px}.simple-text{font-size:16px}.hero-image{width:320px;height:240px}.s{padding:20px;margin:15px 0;max-height:none;overflow-y:visible}.template-section{padding:20px;margin:20px 0;max-height:none;overflow-y:visible}.two-column{flex-direction:column;gap:20px;max-height:none;overflow-y:visible}.three-column{grid-template-columns:1fr;gap:15px;max-height:none;overflow-y:visible}.data-grid{grid-template-columns:1fr;max-height:none;overflow-y:visible}.chart-container{max-height:none;overflow-y:visible}.tab-content{max-height:none;overflow-y:visible}.stats-grid{grid-template-columns:1fr 1fr}.stat-number{font-size:24px}.audio-toggle{width:70px;height:70px;font-size:35px}.audio-status{font-size:14px}}
@media (max-width:480px){.slide-title-main{font-size:24px}.main-heading{font-size:22px}.section-heading{font-size:18px}.slide-title-secondary{font-size:20px}.instruction-text{font-size:16px}.simple-text{font-size:14px}.hero-image{width:280px;height:210px}.s{padding:15px;margin:10px 0;max-height:none;overflow-y:visible}.template-section{padding:15px;margin:15px 0;max-height:none;overflow-y:visible}.card{padding:15px}.data-table th,.data-table td{padding:8px 10px;font-size:14px}.stat-card{padding:15px}.stat-number{font-size:20px}.stat-label{font-size:14px}.timeline-item{padding:15px 0 15px 30px}.tag{padding:4px 8px;font-size:12px}.alert{padding:12px}.tab{padding:10px 15px;font-size:14px}.audio-toggle{width:60px;height:60px;font-size:30px;top:15px;right:15px}.audio-status{font-size:12px;top:85px;right:15px}.stats-grid{grid-template-columns:1fr}.button-row{gap:15px}.two-column{max-height:none;overflow-y:visible}.three-column{max-height:none;overflow-y:visible}.data-grid{max-height:none;overflow-y:visible}.chart-container{max-height:none;overflow-y:visible}.tab-content{max-height:none;overflow-y:visible}}
</style>
</head>
<body>
<div class="audio-toggle muted" onclick="toggleAudio()" role="button" tabindex="0" aria-label="Toggle audio on/off"></div>
<div class="audio-status" id="audioStatus">Audio: OFF</div>
<div class="s">
<h1 class="main-heading">📚 Math: Fractions and Percentages</h1>
<h2 class="section-heading">🎯 Learning Objectives</h2>
<div class="hero-image" onclick="handleImageClick(this,'hero')" role="button" tabindex="0" aria-label="Hero image - educational scene">
<div class="image-placeholder">🎓 Hero Image<br/>400×300</div>
</div>
</div>
<script>
let audioEnabled=false;
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
