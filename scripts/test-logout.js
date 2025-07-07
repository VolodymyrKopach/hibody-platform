const puppeteer = require('puppeteer');

async function testLogout() {
  console.log('🚀 Starting logout test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Налаштовуємо консоль для відстеження логів
  page.on('console', msg => {
    console.log('🖥️ BROWSER:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.error('❌ PAGE ERROR:', error.message);
  });
  
  try {
    // Переходимо на тестову сторінку
    console.log('📄 Navigating to test page...');
    await page.goto('http://localhost:3000/test', { waitUntil: 'networkidle2' });
    
    // Чекаємо завантаження сторінки
    await page.waitForTimeout(2000);
    
    // Перевіряємо, чи є користувач авторизованим
    const isLoggedIn = await page.evaluate(() => {
      const logoutButton = document.querySelector('button[variant="outlined"]');
      return logoutButton && logoutButton.textContent.includes('Вийти');
    });
    
    if (isLoggedIn) {
      console.log('✅ User is logged in, testing logout...');
      
      // Натискаємо кнопку логауту
      await page.click('button[variant="outlined"]');
      console.log('🖱️ Clicked logout button');
      
      // Чекаємо на зміни
      await page.waitForTimeout(3000);
      
      // Перевіряємо результат
      const isLoggedOut = await page.evaluate(() => {
        const loginForm = document.querySelector('form');
        return loginForm !== null;
      });
      
      if (isLoggedOut) {
        console.log('✅ Logout successful - login form is visible');
      } else {
        console.log('❌ Logout failed - user still appears to be logged in');
      }
      
    } else {
      console.log('⚠️ User is not logged in, cannot test logout');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // Залишаємо браузер відкритим для інспекції
  console.log('🔍 Browser left open for inspection. Close manually when done.');
  // await browser.close();
}

testLogout().catch(console.error); 