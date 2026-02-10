const chalk = require("chalk");

const timestamp = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const divider = (char = "─", len = 60) => char.repeat(len);

const logger = {
  info: (msg, ...args) =>
    console.log(chalk.gray(`[${timestamp()}]`), chalk.blue("ℹ"), msg, ...args),

  success: (msg, ...args) =>
    console.log(chalk.gray(`[${timestamp()}]`), chalk.green("✔"), chalk.green(msg), ...args),

  warn: (msg, ...args) =>
    console.log(chalk.gray(`[${timestamp()}]`), chalk.yellow("⚠"), chalk.yellow(msg), ...args),

  error: (msg, ...args) =>
    console.log(chalk.gray(`[${timestamp()}]`), chalk.red("✖"), chalk.red(msg), ...args),

  cron: (msg, ...args) =>
    console.log(chalk.gray(`[${timestamp()}]`), chalk.magenta("⏰"), chalk.magenta(msg), ...args),

  table: (label, rows) => {
    console.log(chalk.gray(`[${timestamp()}]`), chalk.cyan("📊"), chalk.cyan(label));
    if (rows.length === 0) {
      console.log("   (empty)");
      return;
    }
    rows.forEach((r, i) => {
      console.log(chalk.gray(`   ${i + 1}.`), r);
    });
  },

  divider: (label) => {
    const line = divider("─", 55);
    if (label) {
      console.log(chalk.gray(`\n┌${line}┐`));
      console.log(chalk.gray("│"), chalk.bold.white(` ${label.padEnd(53)}`), chalk.gray("│"));
      console.log(chalk.gray(`└${line}┘`));
    } else {
      console.log(chalk.gray(divider()));
    }
  },

  summary: (stats) => {
    console.log();
    logger.divider("CRON JOB SUMMARY");
    console.log(chalk.gray("  Duration     :"), chalk.white(`${stats.duration}s`));
    console.log(chalk.gray("  Roles fetched:"), chalk.white(stats.fetched));
    console.log(chalk.gray("  New inserted :"), chalk.green(stats.inserted));
    console.log(chalk.gray("  Duplicates   :"), chalk.yellow(stats.duplicates));
    console.log(chalk.gray("  Errors       :"), stats.errors > 0 ? chalk.red(stats.errors) : chalk.white(stats.errors));
    console.log(chalk.gray("  Next run     :"), chalk.cyan(stats.nextRun));
    console.log();
  },
};

module.exports = logger;
