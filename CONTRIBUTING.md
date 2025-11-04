# Contributing Guide

Refer to our issue tracker and contribute to any open issues you are able to spot there. If you have any new issues, please do post there as well. We welcome any form of contribution and are open to any new ideas you may have for the project!

To start contributing, create a fork from our repo and send a PR. Refer to [this article](https://help.github.com/en/articles/fork-a-repo) for more information.

## Application Structure

1. `assets` contains static assets.
1. `commons` contains components or other code common to more than one page.
1. `features` contains action creators, reducers and type declarations for specific functions.
1. `pages` contains pages and components used only in one page; its layout should mirror the actual routes.
1. `styles` contains all SCSS styles.

## Testing

The frontend comes with an extensive test suite. To run the tests after you made your modifications, run
`yarn test`. Regression tests are run automatically when you want to push changes to this repository.
The regression tests are generated using `vitest` and stored as snapshots in `src/\_\_tests\_\_`. After modifying the frontend, carefully inspect any failing regression tests reported in red in the command line. If you are convinced that the regression tests and not your changes are at fault, you can update the regression tests by running:

```bash
yarn test --update
```

## Manually testing the frontend

Before pushing to Github, ensure that your code is formatted and your tests are passing. These two commands should help with that:

- `yarn run format` : formats your code
- `yarn run test`: runs the tests and prints the output

## Running your own js-slang

See [js-slang README](https://github.com/source-academy/js-slang#using-your-js-slang-in-local-source-academy) for instructions how to run your own js-slang in the frontend.

## TypeScript Coding Conventions

We reference [this guide](https://github.com/piotrwitek/react-redux-typescript-guide).

See also the [this standard in the wiki](https://github.com/source-academy/frontend/wiki/Coding-Standard).
