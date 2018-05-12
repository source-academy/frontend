# Cadet Frontend

## Development Setup

1. Install the stable version of Yarn and NodeJS.

2. Run `yarn` to install dependencies.

3. Run desired script in `package.json`.

## Application Structure

1. `actions` contains action creators, one file per reducers, combined in index.
2. `components` contains all react components using flat hierarchy.
3. `containers` contains HOC that inject react components with Redux state.
4. `sagas` contains all Redux sagas, combined in index.
5. `reducers` contains all Redux reducers and their state, combined in index.
6. `styles` contains all CSS styles.

## TypeScript Coding Conventions

We faithfully follow [this guide](https://github.com/piotrwitek/react-redux-typescript-guide).
