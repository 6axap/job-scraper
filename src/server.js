const express = require('express');
const loginToJobAgent = require('./logintojobagent');
const scrapeJobs = require('./scraper');
const path = require('path');

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Route to display the job listings
app.get('/', async (req, res) => {
    let browser;
    try {
        // Step 1: Log in to JobAgent
        const loginResult = await loginToJobAgent();
        browser = loginResult.browser;
        const page = loginResult.page;

        // Step 2: Scrape jobs after login
        const jobs = await scrapeJobs(page);

        // Step 3: Render the scraped jobs to the UI
        res.render('index', { jobs });
    } catch (error) {
        console.error('Error scraping jobs:', error);
        res.status(500).send('Error: Unable to retrieve job listings.');
    } finally {
        if (browser) await browser.close(); // Ensure the browser is closed
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

