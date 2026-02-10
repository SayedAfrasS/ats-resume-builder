const axios = require("axios");
const pool = require("../config/db");
const { extractSkills } =
  require("./skillExtractor");

exports.fetchCompanyJob = async (domain) => {
  try {

    const response = await axios.get(
      "https://linkedin-data-api.p.rapidapi.com/get-company-by-domain",
      {
        params: { domain },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST
        }
      }
    );

    const companyData = response.data;

    return companyData;

  } catch (err) {
    console.error("RapidAPI Error:", err.message);
    throw err;
  }
};

exports.storeCompanyRole = async (
  companyName,
  role,
  jobDescription
) => {

  const skills = extractSkills(jobDescription);

  await pool.query(
    `INSERT INTO company_roles
     (company_name, role, job_description, extracted_skills)
     VALUES ($1,$2,$3,$4)`,
    [companyName, role, jobDescription, skills]
  );

  console.log("Company role stored");
};
