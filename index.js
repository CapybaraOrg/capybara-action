const core = require("@actions/core")
const github = require("@actions/github")
const axios = require("axios")

const createCapybaraRun = async (
  capybaraUrl,
  clientId,
  location,
  owner,
  repoName,
  workflowId,
  ref,
  durationInMinutes,
  maximumDelayInSeconds
) => {
  try {
    const capybaraInstance = axios.create({
      baseURL: capybaraUrl,
      timeout: 60000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const response = await capybaraInstance.post("/v1/github/workflows/runs", {
      clientId: clientId,
      repository: {
        owner: owner,
        name: repoName,
        workflowId: workflowId,
        ref: ref,
      },
      schedule: {
        location: location,
        approximateWorkflowRunDurationInMinutes: durationInMinutes,
        maximumDelayInSeconds: maximumDelayInSeconds,
      },
    })
    return response.scheduledTime
  } catch (error) {
    console.log(error)
  }
}

const cancelGitHubRun = async (owner, repoName) => {
  try {
    const githubInstance = axios.create({
      baseURL: "https://api.github.com/",
      timeout: 5000,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${core.getInput("github-token")}`,
      },
    })

    const response = await githubInstance.post(
      `/repos/${owner}/${repoName}/actions/runs/${github.context.runId}/cancel`
    )

    return response
  } catch (error) {
    console.log(error)
  }
}

try {
  const isCapybaraDispatch =
    github.context.payload.inputs &&
    github.context.payload.inputs.isCapybaraDispatch &&
    github.context.payload.inputs.isCapybaraDispatch !== "false"
      ? github.context.payload.inputs.isCapybaraDispatch
      : false

  if (!isCapybaraDispatch) {
    // The workflow is not triggered by Capybara backend - call the backend and cancel the build. Otherwise, ignore.
    const capybaraUrl = core.getInput("capybaraUrl")
    const clientId = core.getInput("clientId")
    const workflowId = core.getInput("workflowId")
    const repoName = core.getInput("repoName")
    const ref = core.getInput("ref")
    const owner = core.getInput("owner")
    const durationInMinutes = core.getInput("durationInMinutes")
    const maximumDelayInSeconds = core.getInput("maximumDelayInSeconds")
    const location = core.getInput("location")

    const bestTimeToStart = createCapybaraRun(
      capybaraUrl,
      clientId,
      location,
      owner,
      repoName,
      workflowId,
      ref,
      durationInMinutes,
      maximumDelayInSeconds
    )
    core.setOutput("bestTimeToStart", bestTimeToStart)

    cancelGitHubRun(owner, repoName)
  }
} catch (error) {
  core.setFailed(error.message)
}
