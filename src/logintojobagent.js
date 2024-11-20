require('dotenv').config();
const puppeteer = require('puppeteer');

const loginToJobAgent = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false }); // Use headless: true for production
        const page = await browser.newPage();

        await page.goto('https://jobagent.ch/user/login', { waitUntil: 'networkidle2' });

        // Handle cookie banner if present
        const cookieButtonSelector = 'button.btn.btn-default'; // Replace with the actual selector
        const isCookieBannerVisible = await page.$(cookieButtonSelector);
        
        if (isCookieBannerVisible) {
            console.log('Cookie banner detected.\nAccepting cookies...\n');
            await page.click(cookieButtonSelector);
            console.log('Cookies accepted.');
        } else {
            console.log('No cookie banner detected.');
        }

        // Check for the email input
        const emailInput = await page.$('#email');
        if (emailInput) {
            console.log('Email input field found.');
        } else {
            console.error('Error: Email input field not found!');
            await browser.close();
            return;
        }

        // Check for the password input
        const passwordInput = await page.$('#password');
        if (passwordInput) {
            console.log('Password input field found.');
        } else {
            console.error('Error: Password input field not found!');
            await browser.close();
            return;
        }

        // Check for the login button
        const loginButton = await page.$('button.btn.btn-primary.btn-block.spacer-right5');
        if (loginButton) {
            const buttonText = await loginButton.evaluate(el => el.textContent);
            const isButtonVisible = await loginButton.evaluate(button => {
                return button.offsetParent !== null && !button.disabled;
             });
            console.log('Login button found.\n', buttonText);
            console.log('Is Login Button Visible and Enabled:', isButtonVisible);
        } else {
            console.error('Error: Login button not found!');
            await browser.close();
            return;
        }

        // Type in credentials and click login
        await page.type('#email', process.env.JOBAGENT_USERNAME);
        await page.type('#password', process.env.JOBAGENT_PASSWORD);

        await Promise.all([
            await loginButton.evaluate(button => button.click()),
            // loginButton.click(),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log('Logged in successfully!');
        return { browser, page };
    } catch (error) {
        console.error('Error during login:', error);
        if (browser) await browser.close();
        throw error;
    }
};

module.exports = loginToJobAgent;

