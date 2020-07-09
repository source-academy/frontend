# Cadet Frontend

[![Build Status](https://travis-ci.org/source-academy/cadet-frontend.svg?branch=master)](https://travis-ci.org/source-academy/cadet-frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/cadet-frontend/badge.svg?branch=master)](https://coveralls.io/github/source-academy/cadet-frontend?branch=master)
[![License](https://img.shields.io/github/license/source-academy/cadet-frontend)](https://github.com/source-academy/cadet-frontend/blob/master/LICENSE)

The Source Academy is a gamified platform designed to teach students coding while having fun! This repository in particular houses the source code for the frontend written in ReactJS with Redux.

## Features

- Playground to write and test programs
- Built-in Debugger and Visualiser to interact with your programs
- Missions/Quests/Contests to solve challenging problems while learning about programming fundamentals
- Sessions for collaborative programming
- Grading System to test your programs and marking

## Getting Started

### Installation

1. Install a stable version of NodeJS. The active LTS or current version should work fine.
2. Clone this repository and navigate to it using "cd" in your command line or shell tool.
3. Run `yarn install` to install dependencies.
4. Copy the `.env.example` file as `.env` and set the necessary variables (refer below for more information)
5. Run `yarn run start` to start the server at `localhost:8000`.

### Setting up your environment

The project requires some environment variables to be set to work properly. In the `.env` file a few things need to be set up:

#### Backend configuration

\*If you require access to Luminus keys please email Prof Henz at henz@comp.nus.edu.sg to request for a with the email subject heading "Request for Luminus API Keys".

## Development

### Running the tests

Before pushing to Github, ensure that your code is formatted and your tests are passing. These two commands should help with that:

- `yarn run format` : formats your code
- `yarn run test`: runs the tests and prints the output

### Running your own js-slang

See [js-slang README](https://github.com/source-academy/js-slang#using-your-js-slang-in-local-source-academy) for instructions how to run your own js-slang in the cadet-frontend.

### Running your own js-slang

See [js-slang README](https://github.com/source-academy/js-slang#using-your-js-slang-in-local-source-academy) for instructions how to run your own js-slang in the cadet-frontend.

### Development of Source Acacademy 2021

The development of Source Academy 2021 is on-going. Use the branch `sa_2021` in this repository for your pull requests. The tip of branch `sa_2021` in `cadet-frontend` is automatically deployed as [https://source-academy.github.io/](https://source-academy.github.io/).

### Contribution Guidelines

Refer to our issue tracker and contribute to any open issues you are able to spot there. If you have any new issues, please do post there as well. We welcome any form of contribution and are open to any new ideas you may have for the project!

To start contributing, create a fork from our repo and send a PR. Refer to [this article](https://help.github.com/en/articles/fork-a-repo) for more information.

### Application Structure

1. `assets` contains static assets.
1. `commons` contains components or other code common to more than one page.
1. `features` contains action creators, reducers and type declarations for specific functions.
1. `pages` contains pages and components used only in one page; its layout should mirror the actual routes.
1. `styles` contains all SCSS styles.

### TypeScript Coding Conventions

We reference [this guide](https://github.com/piotrwitek/react-redux-typescript-guide).

See also the [this standard in the wiki](https://github.com/source-academy/cadet-frontend/wiki/Coding-Standard).

## Projects

For more info on specific frontend projects, please consult [our wiki](https://github.com/source-academy/cadet-frontend/wiki).

## Build and deployment

There are a few additional environment variables that are used when building and deploying for production.

- `REACT_APP_SENTRY_DSN`: The Sentry DSN for error monitoring.
- `SW_EXCLUDE_REGEXES`: A JSON array of regexes as strings. This is appended to `navigateFallbackBlacklist` in [Workbox's configuration](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW#GenerateSW). This is used in our [GitHub Pages deploy](https://source-academy.github.io) so that it does not conflict with the subsites we host on GitHub Pages.
