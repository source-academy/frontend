[![Build Status](https://travis-ci.org/source-academy/cadet-frontend.svg?branch=master)](https://travis-ci.org/source-academy/cadet-frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/cadet-frontend/badge.svg?branch=travis)](https://coveralls.io/github/source-academy/cadet-frontend?branch=travis)

## Development Setup

1. Install a stable version of Yarn and NodeJS (use node version 4-9 with nvm).
2. Run `yarn` to install dependencies.
3. Copy the `.env.example` file as `.env` and set the variable `REACT_APP_IVLE_KEY`
   to contain your IVLE Lapi key.
4. Run `yarn start` to start the server at `localhost:80`. Admin permissions may
   be required for your OS to serve at port 80.
   
## IVLE LAPI Key
For NUS students, you can access your IVLE LAPI key [here](https://ivle.nus.edu.sg/LAPI/default.aspx).

## For Windows Users
In package.json, change line 19:
"start-js": "rm -r coverage; BROWSER=none PORT=80 react-scripts-ts start",
to:
"start-js": "set PORT=80 & react-scripts-ts start",

## For Testing of js-slang

1. Follow the instructions on js-slang to transpile your own copy
2. Edit line 41 of package.json in this project to link to the directory of your js-slang and then run `yarn`:

`"js-slang": "file:path/to/js-slang",`

Note that this copies your files over, any future changes will not be reflected. 

You may try [this](https://medium.com/@alexishevia/the-magic-behind-npm-link-d94dcb3a81af) for a smoother experience.

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
