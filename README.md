# Cadet Frontend 

[![Build Status](https://travis-ci.org/source-academy/cadet-frontend.svg?branch=master)](https://travis-ci.org/source-academy/cadet-frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/cadet-frontend/badge.svg?branch=travis)](https://coveralls.io/github/source-academy/cadet-frontend?branch=travis)

## Development Setup

1. Install a stable version of Yarn and NodeJS (tested: Node 10.15.0).
2. Run `yarn` to install dependencies. (tested: npm install, not yarn)
3. Copy the `.env.example` file as `.env` and set the variable `REACT_APP_IVLE_KEY`
   to contain your IVLE Lapi key.
4. Run `yarn start` to start the server at `localhost:80`. Admin permissions may
   be required for your OS to serve at port 80.
5. If running cadet without ngix, `yarn cors-proxy` to solve CORS problems.
   
## IVLE LAPI Key
For NUS students, you can access your IVLE LAPI key [here](https://ivle.nus.edu.sg/LAPI/default.aspx).

## For Windows Users

### Running cadet-frontend
Run `yarn win-start`

### Dealing with hooks
In package.json, change line 28:\
"pre-push": "bash scripts/test.sh",\
to an empty line.

Please note that doing this will disable the test suite, so you will need to run the tests manually instead. Using Git Bash (or any other UNIX-based command line), run the following:\
cd scripts\
bash test.sh

## For Testing of js-slang

### Alpha version

Use branch js-slang-alpha-preview to see the new changes (native and verbose errors).

Have `"enable verbose";` as the first line of your program to activate verbose messages.

Edit https://github.com/source-academy/cadet-frontend/blob/57ba44f6b55c214d0f20339cd45bece57f24f48c/src/sagas/index.ts#L260

to toggle native.

### To run local copy of js-slang

1. Follow the instructions on the js-slang repository to transpile your own copy
2. Edit line 41 of package.json in this project to link to the directory of your js-slang and then run `yarn`:

`"js-slang": "file:path/to/js-slang",`

Note that this copies your files over, any future changes will not be reflected. 

You may try [this](https://medium.com/@alexishevia/the-magic-behind-npm-link-d94dcb3a81af) for a smoother experience.

## For Editing And Creating New Local XML Missions

1. Use the branch 'mission-editing' in cadet-frontend
2. Run in browser with yarn start
2. Go to Incubator tab.

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
