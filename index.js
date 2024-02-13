#!/usr/bin/env node

import ky from 'ky';
import chalk from 'chalk';
import {Option, program} from "commander"

const log = console.log;

program
  .name('glpc')
  .description('GitLab pipeline cleaner')
  .version('0.0.1', '-v, --version', 'output the current version')
  .option('-d, --debug', 'Output extra debugging')
  .option('-g, --gitlab <string>', 'GitLab URL', 'https://gitlab.com')
  .option('--days <number>', 'Number of days to keep', 365)
  .option('--updated_after <number>', 'Pipelines updated after the specified date (ISO 8601)')
  .option('--updated_before <number>', 'Pipelines updated before the specified date (ISO 8601)')
  .addOption(new Option('status', 'Status of the pipelines').choices(
    ['created', 'waiting_for_resource', 'preparing', 'pending', 'running', 'success', 'failed', 'canceled', 'skipped', 'manual', 'scheduled']
  ))
  .option('-l, --limit <number>', 'Limit the number of pipelines to delete (1-100)', 100)
  .requiredOption('-t, --token <string>', 'GitLab private token')
  .requiredOption('-p, --project <string>', 'Project ID');

program.parse();
const options = program.opts();

// api
const api = ky.create({
  prefixUrl: `${options.gitlab}/api/v4/`,
  headers: {"PRIVATE-TOKEN": options.token}
});

// dates
if (options.updated_after) {
  options.updated_after = new Date(options.updated_after);
}

if (options.updated_before) {
  options.updated_before = new Date(options.updated_before);
}

if (options.days) {
  options.updated_before = new Date();
  options.updated_before.setDate(options.updated_before.getDate() - options.days);
}

try {
  log(chalk.green(`GitLab - Delete old pipelines`));

  if (options.debug) {
    log(chalk.gray(`GitLab URL: ${options.gitlab}`));
    if (options.updated_after) log(chalk.gray(`After: ${options.updated_after.toDateString()}`));
    if (options.updated_before) log(chalk.gray(`Before: ${options.updated_before.toDateString()}`));
    if (options.status) log(chalk.gray(`Status: ${options.status}`));
    if (options.limit) log(chalk.gray(`Limit: ${options.limit} per page`));
  }

  //  search params
  const searchParams = new URLSearchParams();
  searchParams.append('per_page', options.limit);
  if (options.updated_after) searchParams.append('updated_after', options.updated_after.toISOString());
  if (options.updated_before) searchParams.append('updated_before', options.updated_before.toISOString());

  // get pipelines
  const pipelines = await api.get(`projects/${options.project}/pipelines`, {searchParams}).json();

  log(chalk.gray(`${chalk.bold(pipelines.length)} pipelines found`));
  for (const pipeline of pipelines) {
    if (options.debug) {
      log(chalk.gray(`> Deleting pipeline ID=${pipeline.id}`));
      log(chalk.gray(`> Status: ${pipeline.status}`));
      log(chalk.gray(`> URL: ${pipeline.web_url}`));
      log(chalk.gray(`> Updated at: ${new Date(pipeline.updated_at).toISOString()}`));
    }

    const response = await api.delete(`projects/${options.project}/pipelines/${pipeline.id}`);

    if (response.status === 204) {
      log(chalk.green(`[✓] Pipeline ${pipeline.id} deleted`));
    } else {
      log(chalk.red(`An error has occured while deleting pipeline ${pipeline.id}`));
    }
  }

} catch (err) {
  log(chalk.red(`An error has occured: ${err}`))
}