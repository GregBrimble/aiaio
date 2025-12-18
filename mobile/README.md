# Mobile application

This directory contains a React Native mobile application powered by [Expo](https://expo.dev/).

## Structure

- `./App.tsx`

  The React Native application entrypoint.

- `./index.ts`

  Registers the root component with Expo.

## Configuration

- `../app.config.ts`

  The Expo application configuration. It derives the app name, slug, version, and bundle identifier from `../package.json`.

- `../eas.json`

  The [EAS Build](https://docs.expo.dev/build/introduction/) configuration for building Android and iOS binaries.

## Commands

- `npm run dev:mobile`

  Start the Expo development server.

- `npm run build-all`

  Build for all platforms.
