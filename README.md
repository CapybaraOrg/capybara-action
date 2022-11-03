<p align="center">
  <a href="https://taikai.network/gsf/hackathons/carbonhack22/projects/cl975ox6936793201uh6zkzqkrt/idea">
    <img alt="Gatsby" src="docs/assets/logo.png" width="64" />
  </a>
</p>
<h1 align="center">
  Capybara GitHub Action
</h1>

<p align="center">
  <a href="https://github.com/CapybaraOrg/capybara-action/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Project is released under the MIT license." />
  </a>
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier" />
  </a>
</p>

# Capybara GitHub Action

Capybara is a GitHub Action used to automatically reschedule workflow runs depending on the most carbon efficient time.

## Carbon Aware SDK

Capybara makes use of the carbon-aware WebApi developed by Green Software Foundation. For more information [see GSF repository](https://github.com/Green-Software-Foundation/carbon-aware-sdk)

---

## Table of contents[](#table-of-contents)

1. [Motivation](#motivation)
2. [Composition](#composition)
3. [Usage](#usage)
   - [Repository requirements](#repo-requirements)
   - [Inputs](#inputs)
   - [Outputs](#outputs)
   - [Example usage](#example-usage)
4. [Development](#development)
   - [Setup](#setup)
   - [Publish a new version](#publish-new-version)
5. [Future improvements](#future-improvements)
   - [Reporting (Capybara dashboard)](#reporting)
   - [Location parameter automatically derived](#location)
6. [Gotchas](#gotchas)

---

## Motivation[](#motivation)

Every day developers around the world run workflows that are not necessarily part of a CI/CD development.
Nightly security checks and builds, database backups - those workflows we usually schedule to run at the same time every day, week, or month.
They have some time constraints but can be triggered after a period of time. For instance, a run that is usually triggered at midnight will be ok to run anywhere between 10 PM and 8 AM (when no one is working on the code). Because of this flexibility, routinely running workflows are an excellent area for utilizing carbon-aware computing.

Carbon-aware computing is the idea that you can reduce the carbon footprint of your application just by running things at different times or locations. The carbon intensity of energy varies due to the different proportions of renewable vs. fossil fuel energy sources.
Our Capybara tool, when added to your workflow as a step (Cabybara Github Action), will cancel the run and trigger the workflow again when the energy is "least dirty" within specified time constraints. This is called time-shifting - shift your computation to the times when the grid uses the least fossil fuel energy.
It is a simple approach to make your workflows greener without any cost.

---

## Composition[](#composition)

When we mention Capybara (not Capybara Action) we have in mind the tool as a whole. Capybara Action is what the user sees but underneath it calls Capybara backend.

![Alt text](docs/diagrams/Capybara%20flow.png)
Capybara tool consists of:

1. **Capybara action** (current repo):
   The action in itself is quite simple: it calls our Capybara backend with the input and cancels the workflow run if it wasn't triggered by Capybara backend.
2. **Capybara backend** [CapybaraOrg/capybara-backend](https://github.com/CapybaraOrg/capybara-backend): it is a backend service which is handling the requests from the Capybara Action. You will have to host your own instance of this backend to use the action.

---

## Usage[](#usage)

Capybara Action should be added as a **first step in the workflow**. This is because, if the run is not triggered by Capybara i.e., it's not triggered at the _green time_, run should be cancelled at the very start.
If the workflow run is triggered by Capybara backend, then the action step will be ignored ([see the diagram](/docs/diagrams/Capybara%20flow.png)).

### Repository requirements[](#repo-requirements)

1. [`workflow-dispatch`](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)
   present in the client repository since our backend needs it to trigger the client workflow.
   It must contain an input parameter `isCapybaraDispatch` which defaults to false:

```
name: Example Workflow

on:
  schedule:
    - cron: '00 1 * * 1'  # At 01:00 on Mondays.
  workflow_dispatch:
    inputs:
      isCapybaraDispatch:
        description: System only property (ignore)
        required: true
        default: 'false'
```

2. Generate a [fine-grained personal access token](https://github.blog/changelog/2022-10-18-introducing-fine-grained-personal-access-tokens/) for your repository. In the `Permissions / Repository permissions` section, for `Actions` and `Contents` select `Read and write` access.
   Then use the token value to register your repository to Capybara. You can use this template Curl request:

```
curl -vvv -X POST -H "Content-Type: application/json" \
-d '{"token": "github_pat_YOUR-TOKEN-HERE"}' \
https://{CAPYBARA_URL}/v1/accounts
```

The result of this call needs to be saved as a secret in your repository. See an example for this in [capybara-demo](https://github.com/CapybaraOrg/capybara-demo)

### Inputs

User needs to provide input that is related both to the information about the schedule and the repository itself.
Schedule input is mostly what we need to make a request to carbon aware webapi. Repository information is needed for triggering the workflow with [workflow-dispatch event](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)

Moreover, client id is needed to store the client in the Capybara's database.

| Parameters              | Required | Type                        | Example values        | Definition                                                                                                |
| ----------------------- | -------- | --------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `capybaraUrl`           | True     | URL of the backend          | `https://{your-host}` | URL for Capybara backend (https://github.com/CapybaraOrg/capybara-backend). Use it with your own instance |
| `clientId`              | True     | Authentication(?) parameter | `sdfkl232`            | The client id of the repo                                                                                 |
| `workflowId`            | True     | Repo parameter              | `test.yml`            | The ID of the workflow. You can also pass the workflow file name as a string                              |
| `repoName`              | True     | Repo parameter              | `capybara-demo`       | The name of the repository. The name is not case sensitive                                                |
| `ref`                   | True     | Repo parameter              | `main`                | The git reference for the workflow. The reference can be a branch or tag name                             |
| `owner`                 | True     | Repo parameter              | `JaneDoe`             | The account owner of the repository. The name is not case sensitive                                       |
| `durationInMinutes`     | False    | Schedule parameter          | `20`                  | An approximate duration of the workflow run\*. If not provided, defaults to 5 min                         |
| `maximumDelayInSeconds` | True     | Schedule parameter          | `28800` (8hrs)        | How long after the schedule start of the run the pipeline can be triggered\*\*                            |
| `location`              | True     | Schedule parameter          | `uksouth`             | The location of the workflow runner\*\*\*                                                                 |

\* If the provided duration differs significantly from the actual workflow run duration, the resulting bestTimeToRun output might not be accurate

\*\* Think of it as a window size of the workflow run. If the run is schedule with cron job to always run at 10PM at night, what is the span in which it's still okay to run the pipeline?
Is it 10PM-3AM? 10PM-5AM? Or maybe even 10PM-8AM? In the last case maximumDelayInSeconds=28800 since windowSize is 8 hours (8 hours in seconds is 28800).
Mind that the run will finish a bit later, the equation of the latest possible end of the pipeline run is:

```math
LatesPossibleEndOfTheRun = startOfTheRun + maximumDelayInSeconds + durationInMinutes
```

\*\*\*User provides the location in which the computation is occurring. This can be derived from the IP address (if using the self-hosted runner). Otherwise, deriving the location is a bit more complex. Read more in "location" and "future improvements". (???)
The format is corresponding to AZURE availability zones.

### Outputs

| Parameters    | Required | Type               | Example values        | Definition                                                                                                |
| ------------- | -------- | ------------------ | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `capybaraUrl` | True     | URL of the backend | `https://{your-host}` | URL for Capybara backend (https://github.com/CapybaraOrg/capybara-backend). Use it with your own instance |

### Example usage

See the [exemplary workflow in the demo repository](https://github.com/CapybaraOrg/capybara-demo/blob/main/.github/workflows/example-workflow.yml)

---

## Development[](#development)

### Setup[](#setup)

The project is using:

- [Prettier](https://prettier.io/)
- [nvm](https://github.com/nvm-sh/nvm)

```shell
nvm install
npm ci
```

### Publish a new version[](#publish-new-version)

```shell
npm run build
```

commit the changes

---

## Future improvements[](#future-improvements)

### Reporting (Capybara dashboard)[](#reporting)

### Location input not required[](#location)

Location parameter automatically derived

### Repo input not required[](#location)

Repo input is dynamically read from the client repo. Look into taking them from github context, e.g., github.ref_name.

### Support multiple jobs in the workflow[](#location)

As mentioned in the prerequsities, the action will best work if all the workflow is inside one job as that means we only have one runner and therefore one location where build is run.
In the future, we could try to support multiple jobs. Right now, it is theoretically possible but the accuracy of the calculated time will be bad - most green time (the time where carbon emissions are lowest) at one location is most probably not best time at other location.

### Authenticate with GitHub via GitHub Apps

## Gotchas[](#gotchas) 🤯

### Types of workflow

Since Capybara action is cancelling your current workflow run and running it at later time, it is not suitable for CI/CD workflows where the workflow should be executed immediately.

### All steps witin on job

For best results, put your workflow in one job but with multiple steps. This way, we are sure that everything is run in the same location.
On github, all steps witin a job are run on the same runner which ensure they run on the same machine and following from that - the same location.
If we have multiple jobs, we might calculate best time for one but not for the others.

<!-- markdownlint-enable -->
