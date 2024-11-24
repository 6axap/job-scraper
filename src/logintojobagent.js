require("dotenv").config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const { saveCookies, loadCookies } = require("./cookies");


puppeteer.use(StealthPlugin());


const launchPersistentBrowser = async () => {
  const userDataDir = './user_data'; // Directory to store browser session data
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir,
  });
  return browser;
};

const loginToJobAgent = async () => {
  let browser;
  try {
    browser = await launchPersistentBrowser();
    const page = await browser.newPage();

    /* // load cookies and validate
    //
    const cookiesLoaded = await loadCookies(page);
        if (cookiesLoaded) {
        const valid = await validateCookies(page);
        if (valid) {
            return { browser, page }; // Skip login if cookies are valid
        }
    } */

    await page.goto("https://jobagent.ch/user/login", {
      waitUntil: "networkidle2",
    });
    const pageContent = await page.content();
    console.log(pageContent);


    
    // CHECK IF ALREADY LOGGED IN
    //
    const meinKontoText = await page.$eval(
      'a.dropdown-toggle > span:nth-of-type(1)',
      (span) => span.textContent.trim()
    );

    if (meinKontoText == 'Mein Konto') {
      console.log("Already logged in!");
      return { browser, page };
    }


    // Handle cookie banner if present
    const cookieButtonSelector = "button.btn.btn-default"; // Replace with the actual selector
    const isCookieBannerVisible = await page.$(cookieButtonSelector);

    if (isCookieBannerVisible) {
      console.log("Cookie banner detected.\nAccepting cookies...\n");
      await page.click(cookieButtonSelector);
      console.log("Cookies accepted.");
    } else {
      console.log("No cookie banner detected.");
    }

    // Check for the email input
    const emailInput = await page.$("#email");
    if (emailInput) {
      console.log("Email input field found.");
    } else {
      console.error("Error: Email input field not found!");
      await browser.close();
      return;
    }

    // Check for the password input
    const passwordInput = await page.$("#password");
    if (passwordInput) {
      console.log("Password input field found.");
    } else {
      console.error("Error: Password input field not found!");
      await browser.close();
      return;
    }

    // Check for the login button
    const loginButton = await page.$(
      "button.btn.btn-primary.btn-block.spacer-right5",
    );
    if (loginButton) {
      const buttonText = await loginButton.evaluate((el) => el.textContent);
      const isButtonVisible = await loginButton.evaluate((button) => {
        return button.offsetParent !== null && !button.disabled;
      });
      console.log("Login button found.\n", buttonText);
      console.log("Is Login Button Visible and Enabled:", isButtonVisible);
    } else {
      console.error("Error: Login button not found!");
      await browser.close();
      return;
    }

    // Type in credentials and click login
    await page.type("#email", process.env.JOBAGENT_USERNAME);
    await page.type("#password", process.env.JOBAGENT_PASSWORD);

    await Promise.all([
      await loginButton.evaluate((button) => button.click()),
      // loginButton.click(),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    /* --------------------------------------------------- */

    // await page.screenshot({ path: "loggedin-page.png" });
    // const pageContent = await page.content();
    // console.log(pageContent); // Prints the HTML of the page
    console.log("Logged in successfully!");

    await saveCookies(page);
    // return Page after login in

    return { browser, page };
  } catch (error) {
    console.error("Error during login:", error);
    if (browser) await browser.close();
    throw error;
  }
};

module.exports = loginToJobAgent;
