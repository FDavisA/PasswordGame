const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://neal.fun/password-game/');

  let password = 'Pepsimay55555$XXXV'; // Initial password
  let solvedCaptcha = '';
  let brokenRules = [];

  do {
    // Enter the password
    await page.evaluate((newPassword) => {
      const editableDiv = document.querySelector('div[contenteditable="true"]');
      editableDiv.innerHTML = '';
      editableDiv.innerText = newPassword;
    }, password);

    // Fetch and parse rules within the browser context
    brokenRules = await page.evaluate(() => {
      const brokenRuleElements = document.querySelectorAll('.rule-error');
      const brokenRuleDescs = Array.from(brokenRuleElements).map(rule => rule.querySelector('.rule-desc').innerText.toLowerCase());
      debugger;
      return brokenRuleDescs;
    });

    // Update the password based on broken rules
    if (brokenRules.some(rule => rule.includes('your password must include this captcha')) && !solvedCaptcha) {
      solvedCaptcha = await solveCaptcha(page);
      password += solvedCaptcha;
    }

    if (brokenRules.includes('the digits in your password must add up to 25')) {
      debugger;
      // Update the digits in the password to make their sum 25
      // (You'll need to implement this logic)
    }

    // ... (handle other broken rules)
    debugger;

  } while (brokenRules.length > 0);

  console.log('Final Password:', password);

  // Delay to keep the browser open for debugging
  await new Promise(resolve => setTimeout(resolve, 5000));
debugger;
  await browser.close();
})();

async function solveCaptcha(page) {
  const captchaSrc = await page.evaluate(() => {
    const captchaImg = document.querySelector('.captcha-img');
    return captchaImg ? captchaImg.src : null;
  });

  if (captchaSrc) {
    const captchaValue = captchaSrc.split('/').pop().split('.')[0];
    return captchaValue;
  }

  return null;
}
