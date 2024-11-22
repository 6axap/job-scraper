const scrapeJobs = async (page) => {
  try {
    // Navigate to the job listing page
    const url = "https://www.jobagent.ch/informatik-jobs";
    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.screenshot({ path: "loggedin-page.png" });
    const pageContent = await page.content();
    console.log(pageContent); // Prints the HTML of the page

    // Check if the results list exists
    //const jobCards = await page.$$('a.title');
    //if (!jobCards.length) {
    //    throw new Error('No job results found on the page.');
    //}

    // Wait for job listings to load
    await page.waitForSelector("ul.resultlist a.title", { timeout: 10000 });

    console.log("Found job results. Scraping jobs...");

    // Scrape the jobs
    const jobs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a.title")).map((jobLink) => {
        // Extract job title
        const title =
          jobLink.querySelector(".jobtitle")?.innerText.trim() || "No Title";

        // Extract job URL
        const link = jobLink.href || "No Link";

        // Extract meta details
        const meta = jobLink.nextElementSibling; // The div containing meta info
        const pubDate =
          meta?.querySelector(".pubdate")?.innerText.trim() || "No Date";
        const location =
          meta?.querySelector(".location")?.innerText.trim() || "No Location";
        const company =
          meta?.querySelector(".company a")?.innerText.trim() || "No Company";

        return { title, link, pubDate, location, company };
      });
    });

    console.log("Jobs scraped successfully:", jobs);
    return jobs;
  } catch (error) {
    console.error("Error during job scraping:", error.message);
    return [];
  }
};

module.exports = scrapeJobs;
