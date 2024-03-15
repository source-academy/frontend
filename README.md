# Source Academy Frontend

[![Build Status](https://travis-ci.org/source-academy/frontend.svg?branch=master)](https://travis-ci.org/source-academy/frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/frontend/badge.svg?branch=master)](https://coveralls.io/github/source-academy/frontend?branch=master)
[![License](https://img.shields.io/github/license/source-academy/frontend)](https://github.com/source-academy/frontend/blob/master/LICENSE)

The Source Academy (<https://sourceacademy.org/>) is an immersive online experiential environment for learning programming. It is developed by a community of learners (also called "Source Academy") who use the book [Structure and Interpretation of Computer Programs, JavaScript Adaptation](https://sourceacademy.org/sicpjs) (SICP JS). This repository houses the sources for the frontend of the Source Academy, written in ReactJS with Redux.

## Features

- Playground to write and test programs
- Built-in stepper, data visualizer, and environment visualizer to debug your programs
- Assessments (Missions/Quests/Contests) to solve challenging problems while learning about programming fundamentals
- Sessions for collaborative programming
- Integration with Google Drive and Github
- Graphic-novel-style game to provide context for themed assessments
- Grading System to grade and comment on submitted assessments

## Getting Started

### Installation of [Source Academy](https://source-academy.github.io/)

1. Install the version of Node.js as specified in the `.node-version` file

1. Install Python (known working versions: `2.7`, `3.8`, `3.9`, `3.10`) – **Note: Python `3.11` does not work**

1. Clone this repository and navigate to it using your command line

1. Run `yarn install` to install dependencies.

   - If you are on Ubuntu and encounter the error message: `No such file or directory: 'install'`, you might be running the incorrect "yarn" from the cmdtest testing suite instead of the JavaScript package manager of the same name. Refer to this [StackOverflow post](https://stackoverflow.com/questions/46013544/yarn-install-command-error-no-such-file-or-directory-install).
   - If you are on the new M1 or M2 Mac chips, and encounter an error while installing `canvas`, refer to [this documentation](https://github.com/Automattic/node-canvas/wiki/Installation:-Mac-OS-X#homebrew) to install the requisite dependencies first.

1. Run `yarn run start` to start the server at `localhost:8000`. **It might take a couple of minutes for the server to start.**

1. Point your browser to `http://localhost:8000` to see your local Source Academy.

In this edition, you will only see the Playground with all its tools, but no login options or homework submission features.

If you wish to set up the GitHub or Google Drive integrations, copy the `.env.example` file as `.env` and refer to [_Setting up your environment_](#setting-up-your-environment) below for the relevant configuration options.

### Installation of [Source Academy @ NUS](https://sourceacademy.nus.edu.sg)

1. Repeat steps 1-4 above
1. Copy the `.env.example` file as `.env` and set the necessary variables (refer below for more information)
1. Run `yarn run start` to start the server at `localhost:8000`

**Note: It might take a couple of minutes for the server to start the first time.**

### Setting up your environment

The project requires some environment variables to be set to work properly. In the `.env` file a few things need to be set up:

#### Backend configuration

1. `REACT_APP_BACKEND_URL`: The base URL of the backend. If you are testing with a local backend, the value in `.env.example` matches the default development configuration of the backend.
1. `REACT_APP_USE_BACKEND`: Set to false if not running together with the [backend](https://github.com/source-academy/backend).
1. `REACT_APP_MODULE_BACKEND_URL`: The base URL from which Source modules are loaded. (This is a js-slang feature, but of course it has to be configured here.) You can just use the default value in development.
1. `REACT_APP_SHAREDB_BACKEND_URL`: The base URL of the [ShareDB collaborative editor backend](https://github.com/source-academy/sharedb-ace-backend). The protocol must be HTTP or HTTPS (it will automatically be set to WS/WSS as appropriate). **Must end in a trailing `/`.**
1. `REACT_APP_SICPJS_BACKEND_URL`: The base URL from which [SICP JS](https://github.com/source-academy/sicp) content is loaded.

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

#### Other configuration

1. `REACT_APP_DEPLOYMENT_NAME`: The name of the Source Academy deployment. This will be shown in the `/welcome` route. Defaults to 'Source Academy'.
1. `REACT_APP_PLAYGROUND_ONLY`: Whether to build the "playground-only" version, which disables the Academy components, so only the Playground is available. This is what we deploy onto [GitHub Pages](https://source-academy.github.io).
1. `REACT_APP_SHOW_RESEARCH_PROMPT`: Whether to show the educational research consent prompt to users. This is mainly for instructors using their own deployment of Source Academy @ NUS to disable this prompt.

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

## License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
All sources in this repository are licensed under the [Apache License Version 2][apache2].

[apache2]: https://www.apache.org/licenses/LICENSE-2.0.txt
