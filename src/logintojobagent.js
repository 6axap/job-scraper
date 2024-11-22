require("dotenv").config();
const puppeteer = require("puppeteer");
const { saveCookies, loadCookies } = require("./cookies");

const loginToJobAgent = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false }); // Use headless: true for production
    const page = await browser.newPage();

    // LOAD COOKIES IF AVAILABLE
    //
    await loadCookies(page);

    // NAVIGATE TO THE WEBSITE
    //
    await page.goto("https://jobagent.ch/user/login", {
      waitUntil: "networkidle2",
    });
    console.log(page);

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

    // HANDLE COOKIE POPUP IF PRESENT
    //
    const cookieButtonSelector = "button.btn.btn-default"; // Replace with the actual selector
    const isCookieBannerVisible = await page.$(cookieButtonSelector);

    if (isCookieBannerVisible) {
      console.log("Cookie banner detected.\nAccepting cookies...\n");
      await page.click(cookieButtonSelector);
      console.log("Cookies accepted.");
    } else {
      console.log("No cookie banner detected.");
    }

    // CHECK FOR THE EMAIL INPUT
    //
    const emailInput = await page.$("#email");
    if (emailInput) {
      console.log("Email input field found.");
    } else {
      console.error("Error: Email input field not found!");
      await browser.close();
      return;
    }

    // CHECK FOR THE PASSWORD INPUT
    //
    const passwordInput = await page.$("#password");
    if (passwordInput) {
      console.log("Password input field found.");
    } else {
      console.error("Error: Password input field not found!");
      await browser.close();
      return;
    }

    // CHECK FOR THE LOGIN BUTTON
    //
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

    // FILL INPUTS AND CLICK LOGIN
    //
    await page.type("#email", process.env.JOBAGENT_USERNAME);
    await page.type("#password", process.env.JOBAGENT_PASSWORD);

    await Promise.all([
      await loginButton.evaluate((button) => button.click()),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    console.log("Logged in successfully!");

    // SAVE COOKIES
    await saveCookies(page).then(() => {
      console.log("Cookies saved.");
    });

    return { browser, page };
  } catch (error) {
    console.error("Error during login:", error);
    if (browser) await browser.close();
    throw error;
  }
};

module.exports = loginToJobAgent;
