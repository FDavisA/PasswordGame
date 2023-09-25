const puppeteer = require('puppeteer');

(async () => {
  // Launch a new browser instance in headful mode
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Event listener for browser disconnection
  browser.on('disconnected', () => {
    console.log('Browser disconnected, exiting.');
    process.exit(0);
  });

  // Navigate to the game page
  await page.goto('https://neal.fun/password-game/');

  immutable = {
    captcha: 'value1',
    key2: 'value2',
    key3: 'value3'
  };

  try {
    // Loop to keep playing the game
    while (true) {
      // Read rules or instructions
      const rules = await page.$eval('.password-label', el => el.textContent);

      // Generate password based on rules
      const password = generatePasswordBasedOnRules(rules);
      debugger;
      // Input password
      await page.type('.password-box-inner', password);

      // Wait for a bit before the next iteration (optional)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log('An error occurred:', error.message);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed, exiting.');
    process.exit(0);
  }
})();

function generatePasswordBasedOnRules(rules) {
  // Your password generation logic here
  return 'Pepsimay55555$XXXV';
}

// function getCaptcha(rules) {
//   // Extract the 'src' attribute of the CAPTCHA image
//   const captchaSrc = await page.$eval('.captcha-img', img => img.getAttribute('src'));

//   // Parse the CAPTCHA value from the 'src' attribute
//   const captchaValue = captchaSrc.split('/').pop().split('.')[0];

//   console.log(`CAPTCHA Value: ${captchaValue}`);
// }
