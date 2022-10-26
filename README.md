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

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

```yaml
uses: actions/hello-world-javascript-action@v1.1
with:
  who-to-greet: "Mona the Octocat"
```

# Development

## Setup

The project is using:

- [Prettier](https://prettier.io/)
- [nvm](https://github.com/nvm-sh/nvm)

```shell
nvm install
npm ci
```

## Publish a new version

```shell
npm run build
```

commit the changes
