const fs = require("fs");
const path = require("path");

// Path to store cookies
const COOKIES_PATH = path.join(__dirname, "cookies.json");

/**
 * Save cookies to a file
 * @param {Page} page - Puppeteer page instance
 */
const saveCookies = async (page) => {
  try {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log("Cookies saved successfully.");
  } catch (error) {
    console.error("Error saving cookies:", error);
  }
};

/**
 * Load cookies from a file and set them in the page
 * @param {Page} page - Puppeteer page instance
 */
const loadCookies = async (page) => {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      console.log("Loading cookies...");
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
      await page.setCookie(...cookies);
      console.log("Cookies loaded successfully.\n", cookies);
    } else {
      console.log("No cookies found.");
    }
  } catch (error) {
    console.error("Error loading cookies:", error);
  }
};

/**
 * Clear cookies file (optional utility)
 */
const clearCookies = () => {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      fs.unlinkSync(COOKIES_PATH);
      console.log("Cookies cleared.");
    }
  } catch (error) {
    console.error("Error clearing cookies:", error);
  }
};

module.exports = {
  saveCookies,
  loadCookies,
  clearCookies,
};

