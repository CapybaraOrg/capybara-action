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

Capybara is a GitHub Action used to automatically reschedule workflow runs depending on the most carbon efficient time. Capybara also regularly reports on the carbon emissions saved.

## Carbon-aware SDK

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
5. [Use cases and benefits](#use-cases-and-benefits)
   - [Workflows that run at night](#workflows-run-at-night)
   - [XXX](#driverless-devices)
   - [XXX](#real-time-solutions)
6. [Future improvements](#future-improvements)
   - [Reporting (Capybara dashboard)](#reporting)
   - [Location parameter automatically derived](#location)

---

## Motivation[](#motivation)

---

## Composition[](#composition)

Capybara consists of:

1. Capybara action (current repo)
2. Capybara backend (link)
3. Infra repo (link)
4. Google cloud (link)

---

## Usage[](#usage)

Capybara Action should be added as a **first step in a workflow**. If the run is not triggered by Capybara i.e., it's not triggered at the 'green time', we should fail at the very beginning.
If the workflow run is triggered by Capybara server, then the action step will be ignored.

### Repository requirements[](#repo-requirements)

- workflow-dispatch present in the client repo [workflow-dispatch event](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event) since our server will use it to trigger the client workflow. See the [architecture](docs/architecture_diagram)
- separate workflow for CI development and cyclical builds.

### Inputs

User needs to provide input that is related both to the information about the schedule and the repository itself.
Schedule input is mostly what we need to make a request to carbon aware webapi. Repository information is needed for triggering the workflow with [workflow-dispatch event](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)

Moreover, client id is needed to store the client in the Capybara database. (????)

| Parameters              | Required | Type                        | Example values   | Definition                                                                        |
| ----------------------- | -------- | --------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `clientId`              | True     | Authentication(?) parameter | `land`           | The client id of the repo                                                         |
| `workflowId`            | True     | Repo parameter              | `land`           | The ID of the workflow. You can also pass the workflow file name as a string      |
| `repoName`              | True     | Repo parameter              | `train_journeys` | The name of the repository. The name is not case sensitive                        |
| `ref`                   | True     | Repo parameter              | `train_journeys` | The git reference for the workflow. The reference can be a branch or tag name     |
| `owner`                 | True     | Repo parameter              | `3`              | The account owner of the repository. The name is not case sensitive               |
| `durationInMinutes`     | False    | Schedule parameter          | `train_journeys` | An approximate duration of the workflow run\*. If not provided, defaults to 5 min |
| `maximumDelayInSeconds` | True     | Schedule parameter          | `train_journeys` | How long after the schedule start of the run the pipeline can be triggered\*\*    |
| `location`              | True     | Schedule parameter          | `train_journeys` | The location of the workflow runner\*\*\*                                         |

\*If the provided duration differs significantly from the actual workflow run duration, the resulting bestTimeToRun output might not be accurate

\*\* Think of it as a window size of the workflow run. If the run is schedule with cron job to always run at 10PM at night, what is the span in which it's still okay to run the pipeline?
Is it 10PM-3AM? 10PM-5AM? Or maybe even 10PM-8AM? In the last case maximumDelayInSeconds=28800 since windowSize is 8 hours (8 hours in seconds is 28800).
Mind that the run will finish a bit later, the equation of the latest possible end of the pipeline run is:

```math
LatesPossibleEndOfTheRun = startOfTheRun + maximumDelayInSeconds + durationInMinutes
```

\*\*\*User provides the location in which the computation is occurring. This can be derived from the IP address (if using the self-hosted runner). Otherwise, deriving the location is a bit more complex. Read more in "location" and "future improvements". (???)
The format is corresponding to AZURE availability zones.

### Outputs

[//]: #

### Example usage

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

## Use cases and benefits[](#use-cases-and-benefits)

#### Workflows that run at night[](<(#workflows-run-at-night)>)

---

## Future improvements[](#future-improvements)

### Reporting (Capybara dashboard)[](#reporting)

### Location input not required[](#location)

Location parameter automatically derived

### Repo input not required[](#location)

Repo input is dynamically read from the client repo.

<!-- markdownlint-enable -->
