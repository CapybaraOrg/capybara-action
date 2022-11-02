const core = require("@actions/core")
const github = require("@actions/github")
const axios = require("axios")

try {
  const isCapybaraDispatch =
    github.context.payload.inputs &&
    github.context.payload.inputs.isCapybaraDispatch
      ? github.context.payload.inputs.isCapybaraDispatch
      : false

  if (!isCapybaraDispatch) {
    // The workflow is not triggered by Capybara server - call the server and fail the build. Otherwise, ignore.
    const capybaraUrl = core.getInput("capybaraUrl")
    const clientId = core.getInput("clientId")
    const workflowId = core.getInput("workflowId")
    const repoName = core.getInput("workflowId")
    const ref = core.getInput("ref")
    const owner = core.getInput("owner")
    const durationInMinutes = core.getInput("durationInMinutes")
    const maximumDelayInSeconds = core.getInput("maximumDelayInSeconds")
    const location = core.getInput("location")

    const capybaraInstance = axios.create({
      baseURL: capybaraUrl,
      timeout: 60000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    // workflow dispatches
    let bestTimeToStart

    capybaraInstance
      .post("/v1/github/workflows/runs", {
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
      .then(function (response) {
        bestTimeToStart = response.scheduledTime
      })
      .catch(function (error) {
        console.log(error)
      })

    const githubInstance = axios.create({
      baseURL: "https://api.github.com/",
      timeout: 5000,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${core.getInput("github-token")}`,
      },
    })

    githubInstance
      .post(
        `/repos/${owner}/${repoName}/actions/runs/${github.context.runId}/cancel`
      )
      .then(function (response) {
        console.log(response)
      })
      .catch(function (error) {
        console.log(error)
      })

    core.setOutput("bestTimeToStart", bestTimeToStart)
  }
} catch (error) {
  core.setFailed(error.message)
}
