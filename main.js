const puppeteer = require('puppeteer');

let solvedCaptcha = '';
let wordleAnswer

getWordleAnswer().then((answer) => {
  wordleAnswer = answer;  // Set the global variable
  console.log(`Global variable wordleAnswer is set to: ${wordleAnswer}`);
});

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://neal.fun/password-game/');

  let password = 'PepsiAugust55555$XXXV🌑🌘🌗🌖🌕🌔🌓🌒🌑'; // Initial password
  let mod_password = 'PepsiAugust55555$XXXV🌑🌘🌗🌖🌕🌔🌓🌒🌑'
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
      return brokenRuleDescs;
    });

    // Update the password based on broken rules
    if (brokenRules.some(rule => rule.includes('your password must include this captcha')) && !solvedCaptcha) {
      solvedCaptcha = await solveCaptcha(page);
      password += solvedCaptcha;
    }

    // Update the digits in the password to make their sum 25
    if (brokenRules.some(rule => rule.includes('the digits in your password must add up to 25'))) {
      min_sum = sumOfDigits(solvedCaptcha)
      if (min_sum > 25) {
        throw new Error("The minimum sum is greater than 25");
        return null; // or any other action you'd like to take
      } else {
      mod_sum = sumOfDigits(mod_password)
      target_sum = 25 - min_sum
      mod_password = removeDigits(mod_password) + splitIntoFewestDigits(target_sum)
      }
      password = mod_password + buildFixedPass()
    }

    // ... (handle other broken rules)
    debugger;

  } while (brokenRules.length > 0);

  console.log('Final Password:', password);

  // Delay to keep the browser open for debugging
  await new Promise(resolve => setTimeout(resolve, 5000));
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

function sumOfDigits(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char >= '0' && char <= '9') { // Check if the character is a digit
      sum += parseInt(char, 10); // Convert the character to an integer and add it to the sum
    }
  }
  return sum;
}

function splitIntoFewestDigits(num) {
  if (num < 0 || num > 99) {
    throw new Error("The number must be between 0 and 99");
  }

  const result = [];
  while (num >= 10) {
    result.push(9);
    num -= 9;
  }
  if (num > 0) {
    result.push(num);
  }

  return result.join('');
}

function removeDigits(str) {
  return str.replace(/\d+/g, '');
}

function buildFixedPass() {
  return solvedCaptcha + wordleAnswer
}

async function getWordleAnswer() {
  today = new Date();
  year = today.getFullYear();
  month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  day = String(today.getDate()).padStart(2, '0');

  const url = `https://www.nytimes.com/svc/wordle/v2/${year}-${month}-${day}.json`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const answer = data.solution;
      console.log(`Today's Wordle answer is: ${answer}`);
      return answer;
    } else {
      console.log(`Failed to fetch Wordle answer: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}