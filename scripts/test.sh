#!/bin/sh

cd packages/browser
yarn install
yarn build
yarn test
cd ../node
yarn install
yarn build
yarn test
