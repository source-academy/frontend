# Cadet Frontend 

[![Build Status](https://travis-ci.org/source-academy/cadet-frontend.svg?branch=master)](https://travis-ci.org/source-academy/cadet-frontend)
[![Coverage Status](https://coveralls.io/repos/github/source-academy/cadet-frontend/badge.svg?branch=travis)](https://coveralls.io/github/source-academy/cadet-frontend?branch=travis)

## Development Setup

1. Install a stable version of NodeJS (tested: Node 10.15.0).
2. Run `npm install` to install dependencies.
3. Copy the `.env.example` file as `.env` and set the variable `REACT_APP_CLIENT_ID`
   to contain your LumiNUS api key.
4. Run `npm start` to start the server at `localhost:8075`. Admin permissions may
   be required for your OS to serve at port 8075.
5. If running cadet without nginx, `npm run cors-proxy` to solve CORS problems.
   
## For Windows Users

### Dealing with hooks
In package.json, change line 28:\
"pre-push": "bash scripts/test.sh",\
to an empty line.

Please note that doing this will disable the test suite, so you will need to run the tests manually instead. Using Git Bash (or any other UNIX-based command line), run the following:\
cd scripts\
bash test.sh

## js-slang

Currently using a version of js-slang with native and verbose errors.

Edit https://github.com/source-academy/cadet-frontend/blob/57ba44f6b55c214d0f20339cd45bece57f24f48c/src/sagas/index.ts#L260

to toggle native (default is native enabled). 

### To run local copy of js-slang

1. Follow the instructions on the js-slang repository to transpile your own copy
2. Edit line 41 of package.json in this project to link to the directory of your js-slang and then run `npm install`:

`"js-slang": "file:path/to/js-slang",`

Note that this copies your files over, any future changes will not be reflected. 

You may try [this](https://medium.com/@alexishevia/the-magic-behind-npm-link-d94dcb3a81af) for a smoother experience.

## Inspector
This requires the use of the `debugger` branch of js-slang to work. Clone both the frontend and the `debugger` slang to the same directory. You would want to `yarn build` the slang you just obtained and then `yarn && sudo yarn start` in the frontend and it should just work. The merge over there is still ongoing. Meanwhile, please try to break this.

The mental model we are using is: A breakpoint means that the interpreter will stop right before it. Whatever is highlighted is going to be evaluated next. If you meet any inconsistencies with this, also please raise it up for discussion.

### What you can do
- Set breakpoints by clicking on the gutter
- `debugger;` just like ECMAScript
- Inspect!
- Run stuff in the context of the paused program!

### Usage
Here's what happens: After you click run, if there the interpreter meets a breakpoint, the first thing you're going to notice is that the REPL feedbacks to you it hit a breakpoint, the line is highlighted, and one of the icons on the right pane is going to start blinking. If you click on the icon, it reveals the inspector. All the variables in every frame is exposed here. The REPL is also now in the context of where ever you are. So you can evaluate anything you would normally be able to in the REPL. It is all quite simple really.

### Note
Because we use a local version of `js-slang`, the CI just breaks all the time.

## For Editing And Creating New Local XML Missions

1. Use the branch 'mission-editing' in cadet-frontend
2. Run in browser with npm start
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

## Chatkit

The chat functionality replacing the previous comment field found in assignments is built on top of Chatkit. Its documentation can be found [here](https://pusher.com/docs/chatkit).

If you are using Chatkit without the backend server running, use the [test token provider](https://pusher.com/docs/chatkit/reference/test-token-provider), and hardcode `userId` and `roomId`.

Internet connection is required for usage.
