# GitLab (old) pipeline cleaner

This is simple command line tool to delete old pipelines from GitLab.

```shell
Usage: glpc [options]

GitLab pipeline cleaner

Options:
  -v, --version              output the current version
  -g, --gitlab <string>      GitLab URL (default: "https://gitlab.com")
  -d, --days <number>        Number of days to keep (default: 365)
  --updated_after <number>   Pipelines updated after the specified date (ISO 8601)
  --updated_before <number>  Pipelines updated before the specified date (ISO 8601)
  status                     Status of the pipelines (choices: "created", "waiting_for_resource", "preparing", "pending", "running", "success", "failed", "canceled", "skipped",
                             "manual", "scheduled")
  -l, --limit <number>       Limit the number of pipelines to delete (1-100) (default: 100)
  -t, --token <string>       GitLab private token
  -p, --project <string>     Project ID
  -h, --help                 display help for command
```

## Usage

Following example delete all pipelines older than 365 days.

```bash
glpc -t <token> -p <project_id> --gitlab https://gitlab.com --days 365
```

## Installation

```bash
npm install -g gitlab-pipeline-cleaner
```

## License

MIT