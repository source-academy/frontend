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
5. Run `yarn run start` to start the server at `localhost:8075`.

### Setting up your environment

The project requires some environment variables to be set to work properly. In the `.env` file a few things need to be set-up:

1. **REACT_APP_USE_BACKEND**: Set to false if not running together with the [backend](https://github.com/source-academy/cadet). Take note that CORs has to be handled if running with the backend

## Development

### Running the tests

Before pushing to Github, ensure that your code is formatted and your tests are passing. These two commands should help with that:

- `yarn run format` : formats your code
- `yarn run test`: runs the tests and prints the output

### Running your own js-slang

See [js-slang README](https://github.com/source-academy/js-slang#using-your-js-slang-in-local-source-academy) for instructions how to run your own js-slang in the cadet-frontend.

### Development of Source Academy 2021

The development of Source Academy 2021 is on-going. Use the branch `sa_2021` in this repository for your pull requests. The tip of branch `sa_2021` in `cadet-frontend` is automatically deployed as [https://source-academy.github.io/](https://source-academy.github.io/).

### Contribution Guidelines

Refer to our issue tracker and contribute to any open issues you are able to spot there. If you have any new issues, please do post there as well. We welcome any form of contribution and are open to any new ideas you may have for the project!

To start contributing, create a fork from our repo and send a PR. Refer to [this article](https://help.github.com/en/articles/fork-a-repo) for more information.

## Application Structure

1. `actions` contains action creators, one file per reducer, combined in index.
2. `assets` contains static assets.
3. `components` contains all react components.
4. `containers` contains HOC that inject react components with Redux state.
5. `mocks` contains mock data structures for testing
6. `reducers` contains all Redux reducers and their state, combined in index.
7. `sagas` contains all Redux sagas, combined in index.
8. `slang` contains the source interpreter.
9. `styles` contains all SCSS styles.
10. `utils` contains utility modules.

## TypeScript Coding Conventions

We reference [this guide](https://github.com/piotrwitek/react-redux-typescript-guide).

### Projects

For more info on specific frontend projects, please consult [our wiki](https://github.com/source-academy/cadet-frontend/wiki).
