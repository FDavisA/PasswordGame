const puppeteer = require('puppeteer');
let solvedCaptcha = ''; // Global variable to store the solved CAPTCHA

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://neal.fun/password-game/');

  // Enter initial value to solve first 9 rules
  await page.focus('div[contenteditable="true"]');
  await page.keyboard.type('Pepsimay55555$XXXV');

  // Fetch and parse rules within the browser context
  const ruleDescriptions = await page.evaluate(() => {
    const ruleElements = document.querySelectorAll('.rule');
    const ruleDescs = Array.from(ruleElements).map(rule => rule.querySelector('.rule-desc').innerText.toLowerCase());
    return ruleDescs;
  });

  // Check if any rule involves a CAPTCHA
  if (ruleDescriptions.some(desc => desc.includes('captcha')) && !solvedCaptcha) {
    solvedCaptcha = await solveCaptcha(page); // Your function to solve the CAPTCHA
  }

  // Generate final password
  const finalPassword = `Pepsimay55555$XXXV${solvedCaptcha}`;

  // Input final password
  await page.focus('div[contenteditable="true"]');
  await page.keyboard.type(solvedCaptcha);

  // ... (rest of your code)
debugger;
  await browser.close();
})();

async function solveCaptcha(page) {
  // Extract the src attribute of the captcha image
  const captchaSrc = await page.evaluate(() => {
    const captchaImg = document.querySelector('.captcha-img');
    return captchaImg ? captchaImg.src : null;
  });

  // Parse the CAPTCHA value from the src URL
  if (captchaSrc) {
    const captchaValue = captchaSrc.split('/').pop().split('.')[0];
    return captchaValue;
  }

  return null;
}
