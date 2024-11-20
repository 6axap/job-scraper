const scrapeJobs = async (page) => {
    try {
        // Navigate to the job listings page
        const url = 'https://www.jobagent.ch/informatik-jobs'; // Replace with the relevant section
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Scrape job data
        const jobs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.job-card')).map(job => ({
                title: job.querySelector('.job-title')?.innerText || 'N/A',
                company: job.querySelector('.company-name')?.innerText || 'N/A',
                link: job.querySelector('a')?.href || '#'
            }));
        });

        console.log('Jobs scraped:', jobs);
        return jobs;
    } catch (error) {
        console.error('Error scraping jobs:', error);
        throw error;
    }
};

module.exports = scrapeJobs;
