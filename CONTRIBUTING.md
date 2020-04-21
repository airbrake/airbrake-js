# Contributing

Bug fixes and improvements may be submitted in the form of pull requests.

## Development Setup

You will need [Node.js](https://nodejs.org/download) version 10+ and
[yarn](https://yarnpkg.com/en/docs/install).

`airbrake-js` is a monorepo containing multiple packages.
[Lerna](https://lerna.js.org/) and
[yarn workspaces](https://yarnpkg.com/features/workspaces) are used to manage
them. To get started, you'll need to install the project dependencies and run
the build script:

```sh
yarn
yarn build
```

## Building

Run `yarn build` within a package directory to build that specific package, or
run it at the project root to build all packages at once. `yarn build` must be
run before testing or linting.

## Testing

Run `yarn test` within a package directory to run tests for that specific
package, or run it at the project root to run tests for all packages at once.

## Linting

Run `yarn lint` within a package directory to lint that specific package, or run
it at the project root to lint all packages at once.
