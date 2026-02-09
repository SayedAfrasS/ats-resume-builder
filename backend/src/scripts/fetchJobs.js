require("dotenv").config();

const jobFetcher =
  require("../services/jobFetcherService");

async function run() {

  const company = await jobFetcher.fetchCompanyJob("zoho.com");

  const description =
    company.description || "";

  await jobFetcher.storeCompanyRole(
    company.name,
    "Software Engineer",
    description
  );
}

run();
