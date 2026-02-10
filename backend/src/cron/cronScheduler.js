/**
 * Cron Scheduler — Runs jobFetcherService every 6 hours.
 *
 * Schedule: '0 0,6,12,18 * * *' → runs at 00:00, 06:00, 12:00, 18:00
 * Also runs once on server startup.
 */

const cron = require("node-cron");
const logger = require("../utils/logger");
const jobFetcher = require("../services/jobFetcherService");

// List of company domains to scrape
const COMPANIES = [
  "google.com", "amazon.com", "microsoft.com", "meta.com", "apple.com",
  "netflix.com", "salesforce.com", "adobe.com", "oracle.com", "ibm.com",
  "tcs.com", "infosys.com", "wipro.com", "zoho.com", "uber.com",
  "stripe.com", "shopify.com", "spotify.com", "linkedin.com",
];

let isRunning = false;

// ── Run the fetcher for all companies ────────────────────
async function runFetcher() {
  if (isRunning) {
    logger.warn("Fetcher is already running — skipping this cycle");
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  let success = 0;
  let errors = 0;

  for (const domain of COMPANIES) {
    try {
      const company = await jobFetcher.fetchCompanyJob(domain);
      const description = company.description || "";
      const companyName = company.name || domain.replace(".com", "");

      await jobFetcher.storeCompanyRole(companyName, "Software Engineer", description);
      success++;
    } catch (err) {
      errors++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.cron(`Job fetch cycle completed in ${duration}s — Success: ${success} | Errors: ${errors}`);
  isRunning = false;
}

// ── Start the cron job ───────────────────────────────────
function startCronJob() {
  logger.cron("Cron initialized");
  logger.cron("Job fetching scheduled every 6 hours (00:00, 06:00, 12:00, 18:00)");

  // Schedule: every 6 hours
  const task = cron.schedule("0 */6 * * *", async () => {
    await runFetcher();
  });

  // Run once on startup after a short delay
  setTimeout(async () => {
    await runFetcher();
  }, 5000);

  return task;
}

module.exports = { startCronJob, runFetcher };
