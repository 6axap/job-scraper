const scrapeJobs = async (page) => {
  try {
    // Navigate to the job listings page
    // const url = "https://www.jobagent.ch/informatik-jobs"; // Replace with the relevant section
    // await page.goto(url, { waitUntil: "networkidle2" });
    // await page.screenshot({ path: "jobs-page.png" });

    // // Scrape job data
    // const jobs = await page.evaluate(() => {
    //   return Array.from(document.querySelectorAll(".job-card")).map((job) => ({
    //     title: job.querySelector(".job-title")?.innerText || "N/A",
    //     company: job.querySelector(".company-name")?.innerText || "N/A",
    //     link: job.querySelector("a")?.href || "#",
    //   }));
    // });

    // console.log("Jobs scraped:", jobs);
    // return jobs;

    const jobSelector = "ul.resultlist > li.item";

    const jobs = await page.$$eval(jobSelector, (jobItems) =>
      jobItems.map((job) => {
        const titleElement = job.querySelector("a.title > span.jobtitle");
        const urlElement = job.querySelector("a.title");
        const locationElement = job.querySelector("span.location");
        const companyElement = job.querySelector("span.company a");
        const kununuScoreElement = job.querySelector("span.kununu-score b");

        return {
          title: titleElement ? titleElement.textContent.trim() : null,
          url: urlElement ? urlElement.href : null,
          location: locationElement ? locationElement.textContent.trim() : null,
          company: companyElement ? companyElement.textContent.trim() : null,
          kununuScore: kununuScoreElement
            ? kununuScoreElement.textContent.trim()
            : null,
        };
      }),
    );

    console.log(jobs);
    return jobs;
  } catch (error) {
    console.error("Error scraping jobs:", error);
    throw error;
  }
};

module.exports = scrapeJobs;
