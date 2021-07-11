# Source Academy Frontend

[![Build Status](https://travis-ci.org/source-academy/frontend.svg?branch=master)](https://travis-ci.org/source-academy/frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/frontend/badge.svg?branch=master)](https://coveralls.io/github/source-academy/frontend?branch=master)
[![License](https://img.shields.io/github/license/source-academy/frontend)](https://github.com/source-academy/frontend/blob/master/LICENSE)

The Source Academy (<https://sourceacademy.org/>) is an immersive online experiential environment for learning programming. It is developed by a community of learners (also called "Source Academy") who use the book [Structure and Interpretation of Computer Programs, JavaScript Adaptation](https://sourceacademy.org/sicpjs) (SICP JS). This repository houses the sources for the frontend of the Source Academy, written in ReactJS with Redux.

## Features

- Playground to write and test programs
- Built-in Debugger and Visualizer to interact with your programs
- Missions/Quests/Contests to solve challenging problems while learning about programming fundamentals
- Sessions for collaborative programming
- Grading System to test your programs and marking

## Getting Started

### Installation of Source Academy (latest version [available in GitHub Pages](https://source-academy.github.io/))

1. Install a stable version of NodeJS. The active LTS or current version should work fine.
2. Clone this repository and navigate to it using "cd" in your command line or shell tool.
3. Run `yarn install` to install dependencies.
4. Run `yarn run start` to start the server at `localhost:8000`. **It might take a couple of minutes for the server to start.**
5. Point your browser to `http://localhost:8000` to see your local Source Academy.

In this edition, you will only see the Playground with all its tools, but no login options or homework submission features. For this edition, there is no need for "Setting up your environment".

### Installation of Source Academy @ NUS (access [latest production version here](https://sourceacademy.nus.edu.sg))

1. Install a stable version of NodeJS. The active LTS or current version should work fine.
2. Clone this repository and navigate to it using "cd" in your command line or shell tool.
3. Run `yarn install` to install dependencies.
4. Copy the `.env.example` file as `.env` and set the necessary variables (refer below for more information)
5. Run `yarn run start` to start the server at `localhost:8000`. **It might take a couple of minutes for the server to start.**

### Setting up your environment

The project requires some environment variables to be set to work properly. In the `.env` file a few things need to be set up:

#### Backend configuration

1. `REACT_APP_BACKEND_URL`: The base URL of the backend. If you are testing with a local backend, the value in `.env.example` matches the default development configuration of the backend.
1. `REACT_APP_USE_BACKEND`: Set to false if not running together with the [backend](https://github.com/source-academy/backend).
1. `REACT_APP_MODULE_BACKEND_URL`: The base URL from which Source modules are loaded. (This is a js-slang feature, but of course it has to be configured here.) You can just use the default value in development.
1. `REACT_APP_SHAREDB_BACKEND_URL`: The base URL of the [ShareDB collaborative editor backend](https://github.com/source-academy/sharedb-ace-backend). The protocol must be HTTP or HTTPS (it will automatically be set to WS/WSS as appropriate). **Must end in a trailing `/`.**

#### URL shortener configuration

Unless you need to use the shortener locally, you can leave these values blank. Otherwise, ask your backend engineer.

1. `REACT_APP_URL_SHORTENER_SIGNATURE`: The API key for the YOURLS URL shortener.
1. `REACT_APP_URL_SHORTENER_DOMAIN`: The base URL of the YOURLS URL shortener. Unless you need to use the shortener locally, you can leave this blank. Otherwise, ask your backend engineer.

#### Authentication provider configuration

If you are testing with a local backend, the values in `.env.example` match the default development configuration of the backend. Otherwise, your backend engineer should provide you with the configuration for the staging and/or production backend.

`n` is an integer starting from 1. The numbers must be consecutive i.e. if you have 5 authentication providers, the numbers must be 1, 2, 3, 4, and 5.

1. `REACT_APP_OAUTH2_PROVIDERn`: The provider ID of the nth authentication provider. This must match the backend configuration.
1. `REACT_APP_OAUTH2_PROVIDERn_NAME`: The name of the nth authentication provider shown on the login screen.
1. `REACT_APP_OAUTH2_PROVIDERn_ENDPOINT`: The authentication endpoint of the nth authentication provider.

#### Google API configuration

The following properties are used for the Playground Google Drive integration. You can leave them blank if you are not using or testing that feature locally.

1. `REACT_APP_GOOGLE_CLIENT_ID`: The OAuth2 client ID issued by Google.
1. `REACT_APP_GOOGLE_API_KEY`: The Picker API key issued by Google.
1. `REACT_APP_GOOGLE_APP_ID`: The project ID of the Google API project.

See [here](https://github.com/source-academy/frontend/wiki/Google-Drive-Persistence) a guide on obtaining the above values from the Google API Console.

#### Disable periods

The frontend can be configured to disable itself (based on user's system time) during certain periods e.g. during e-exams. Note that this is not foolproof, but it can be combined with other strategies e.g. taking down the frontend entirely (but this is needed to counteract the service worker).

1. `REACT_APP_DISABLEn_START`: The time from which to disable the frontend.
1. `REACT_APP_DISABLEn_END`: The time until which to disable the frontend.
1. `REACT_APP_DISABLEn_REASON`: Optional. A reason shown for the disablement.

#### Other configuration

1. `REACT_APP_PLAYGROUND_ONLY`: Whether to build the "playground-only" version, which disables the Academy components, so only the Playground is available. This is what we deploy onto [GitHub Pages](https://source-academy.github.io).
1. `REACT_APP_ENABLE_GITHUB_ASSESSMENTS`: Whether to enable the GitHub Assessments feature. Off by default.

## Development

### Running the tests

Before pushing to Github, ensure that your code is formatted and your tests are passing. These two commands should help with that:

- `yarn run format` : formats your code
- `yarn run test`: runs the tests and prints the output

### Running your own js-slang

See [js-slang README](https://github.com/source-academy/js-slang#using-your-js-slang-in-local-source-academy) for instructions how to run your own js-slang in the frontend.

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

See also the [this standard in the wiki](https://github.com/source-academy/frontend/wiki/Coding-Standard).

## Projects

For more info on specific frontend projects, please consult [our wiki](https://github.com/source-academy/frontend/wiki).

## Build and deployment

There are a few additional environment variables that are used when building and deploying for production.

1. `REACT_APP_VERSION`: A version string shown in the console on app launch.
1. `REACT_APP_ENVIRONMENT`: An environment string. Currently it is only used to differentiate different deploys in Sentry.
1. `REACT_APP_SENTRY_DSN`: The Sentry DSN for error monitoring.
1. `REACT_APP_SW_EXCLUDE_REGEXES`: A JSON array of regexes as strings. The service worker will ignore paths matching any of these regexes. This is used in our [GitHub Pages deploy](https://source-academy.github.io) so that it does not conflict with the subsites we host on GitHub Pages.
1. `REACT_APP_CADET_LOGGER`: Log server URL. To test with cadet-logger on localhost, set it to `http://localhost:8001/assessment-logger`.
1. `REACT_APP_CADET_LOGGER_INTERVAL`: The interval (in ms) that the frontend should upload logs.

## Testing

The frontend comes with an extensive test suite. To run the tests after you made your modifications, run
`yarn test`. Regression tests are run automatically when you want to push changes to this repository.
The regression tests are generated using `jest` and stored as snapshots in `src/\_\_tests\_\_`.  After modifying the frontend, carefully inspect any failing regression tests reported in red in the command line. If you are convinced that the regression tests and not your changes are at fault, you can update the regression tests by running:
``` {.}
$ yarn test --updateSnapshot
```
and then typing `a` to update all snapshots.

## License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
All sources in this repository are licensed under the [Apache License Version 2][apache2].

[apache2]: https://www.apache.org/licenses/LICENSE-2.0.txt
