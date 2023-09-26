const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

let solvedCaptcha = '';
let wordleAnswer = ''
let country = ''
let leapYear = '0'
let latLong

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

    if (brokenRules.some(rule => rule.includes('your password must include the name of this country'))) {
      try {
        await page.waitForSelector('.geo-wrapper iframe', { timeout: 1000 }); // Adjust the timeout as needed
        latLong = await page.evaluate(() => {
          const iframe = document.querySelector('.geo-wrapper iframe');
          const src = iframe ? iframe.src : null;
          if (!src) return {};
      
          const url = new URL(src);
          const params = new URLSearchParams(url.search);
          const pb = params.get('pb');
      
          if (!pb) return {};
      
          const latLongMatch = pb.match(/!1d(-?\d+\.\d+)!2d(-?\d+\.\d+)/);
          if (!latLongMatch) return {};
      
          return {
            latitude: parseFloat(latLongMatch[1]),
            longitude: parseFloat(latLongMatch[2]),
          };
        });
      
        console.log(`Latitude: ${latLong.latitude}, Longitude: ${latLong.longitude}`)

      } catch (error) {
        console.log('Could not find iframe in time:', error);
      }
      country = await getCountryName(latLong.latitude, latLong.longitude);
      console.log('Country:', country);
      password = mod_password + buildFixedPass()
    }
debugger
    // ... (handle other broken rules)

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
  return solvedCaptcha + wordleAnswer + country + leapYear
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

async function getCountryName(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  console.log('Querying nominatim for the country');
  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'davypassapp v0.1',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000  // 10 seconds
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Data:', data);
      if (data && data.address) {
        console.log('Country:', data.address.country);
        return data.address.country.replace(/\s+/g, '');
      } else {
        console.log('No country data received');
        return null;
      }
    } else {
      console.log('Received non-OK status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
}