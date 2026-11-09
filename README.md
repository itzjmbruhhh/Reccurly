# Recurrly

Recurrly is an Expo/React Native subscription-tracking app prototype. The current
home screen presents a user's balance, upcoming renewals, and subscription cards
with expandable details. The project also contains the initial authentication,
onboarding, subscriptions, insights, and settings routes.

> **Current status:** The UI is a front-end prototype. Subscription data is
> hard-coded in [`constants/data.ts`](./constants/data.ts); there is currently no
> backend, persistence layer, API integration, or implemented authentication flow.

## Features currently implemented

- Expo Router navigation with a root stack and a custom bottom tab bar.
- Home dashboard with:
  - Static user/avatar and balance information.
  - Horizontal upcoming-renewal cards.
  - Expandable subscription cards with payment, category, dates, and status.
- Currency, date, and status-label formatting helpers.
- Sign-in and sign-up placeholder screens that link to one another.
- Placeholder onboarding, subscriptions, insights, and settings screens.
- NativeWind/Tailwind-based styling with a custom theme and bundled
  Plus Jakarta Sans fonts.
- Android, iOS, and web targets provided by Expo.

## Technology stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Mobile framework | React Native 0.88 |
| Expo | Expo SDK 58 |
| Routing | Expo Router 58 |
| Web support | React Native Web |
| Styling | NativeWind 5 RC, Tailwind CSS 4, React Native CSS |
| UI/runtime libraries | React 19, React Native Reanimated, Gesture Handler, Safe Area Context |
| Utilities | `dayjs` for date formatting, `clsx` for conditional classes |
| Package manager | npm, based on the committed `package-lock.json` |
| Quality tooling | ESLint with `eslint-config-expo`, TypeScript strict mode |

There are no backend framework, database, authentication provider, cloud service,
or external API dependencies in the current implementation.

## Prerequisites

- Node.js and npm. The repository does not declare an `engines` constraint; use
  a currently supported Node.js version compatible with Expo SDK 58.
- For device/simulator development, install the platform tooling required by
  Expo for Android or iOS. Expo Go can be used for compatible JavaScript-only
  development.

## Getting started

Clone the repository and install the locked dependencies:

```bash
git clone <repository-url>
cd Recurrly
npm install
```

No `.env` file or environment variables are currently required. A repository-wide
search found no runtime environment-variable references. There is also no
database initialization or migration step.

Start the development server:

```bash
npm start
```

Then use the options shown by Expo to open the app in Expo Go, an Android
emulator, an iOS simulator, or a web browser.

Target-specific shortcuts are also available:

```bash
npm run android
npm run ios
npm run web
```

## Validation and build commands

Run the configured lint command:

```bash
npm run lint
```

Run the TypeScript compiler without emitting files:

```bash
npx tsc --noEmit
```

The project does not currently define a test script or automated test suite in
[`package.json`](./package.json). It also does not define EAS build profiles or
production build scripts. Native release builds should therefore be configured
before treating the app as production-ready.

## Architecture

Expo Router uses the file system under [`src/app`](./src/app) as the navigation
source. The root layout renders a headerless stack and anchors navigation to the
tab group. Route groups in parentheses organize screens without adding those
group names to the URL/path.

### Navigation and routes

| Route file | Purpose |
| --- | --- |
| [`src/app/_layout.tsx`](./src/app/_layout.tsx) | Root stack, global stylesheet import, and splash-screen handling |
| [`src/app/(tabs)/_layout.tsx`](./src/app/(tabs)/_layout.tsx) | Custom bottom tab navigator and safe-area-aware tab bar |
| [`src/app/(tabs)/index.tsx`](./src/app/(tabs)/index.tsx) | Home dashboard |
| [`src/app/(tabs)/Subscriptions.tsx`](./src/app/(tabs)/Subscriptions.tsx) | Subscriptions placeholder |
| [`src/app/(tabs)/Insights.tsx`](./src/app/(tabs)/Insights.tsx) | Insights placeholder |
| [`src/app/(tabs)/Settings.tsx`](./src/app/(tabs)/Settings.tsx) | Settings placeholder |
| [`src/app/(tabs)/subscriptions/[id].tsx`](./src/app/(tabs)/subscriptions/[id].tsx) | Dynamic subscription-details placeholder using the `id` route parameter |
| [`src/app/(auth)/_layout.tsx`](./src/app/(auth)/_layout.tsx) | Authentication stack |
| [`src/app/(auth)/SignIn.tsx`](./src/app/(auth)/SignIn.tsx) | Sign-in placeholder with a sign-up link |
| [`src/app/(auth)/SignUp.tsx`](./src/app/(auth)/SignUp.tsx) | Sign-up placeholder with a sign-in link |
| [`src/app/Onboarding.tsx`](./src/app/Onboarding.tsx) | Onboarding placeholder |

The tab definitions and tab icons are centralized in
[`constants/data.ts`](./constants/data.ts). The tab layout applies the active
state and uses `useSafeAreaInsets` so the floating tab bar accounts for device
insets.

### Data flow

The home screen imports the sample values from
[`constants/data.ts`](./constants/data.ts), passes them to reusable card
components, and keeps only the currently expanded subscription ID in local
React state. There is no global state store or persistence.

- [`components/SubscriptionCard.tsx`](./components/SubscriptionCard.tsx) renders
  subscription summaries and expanded details.
- [`components/UpcomingSubscriptionCard.tsx`](./components/UpcomingSubscriptionCard.tsx)
  renders upcoming renewal cards.
- [`components/ListHeading.tsx`](./components/ListHeading.tsx) renders section
  headings and the currently non-functional “View all” action.
- [`lib/utils.ts`](./lib/utils.ts) contains currency, date, and status formatting.

### Styling and assets

- [`global.css`](./global.css) imports Tailwind layers and NativeWind theme
  support, then defines the shared colors, spacing, font families, and component
  utility classes.
- [`constants/theme.ts`](./constants/theme.ts) mirrors the application color,
  spacing, and tab-bar design tokens for JavaScript configuration.
- [`assets/fonts`](./assets/fonts) contains the Plus Jakarta Sans font variants.
- [`assets/icons`](./assets/icons) contains navigation and subscription icons.
- [`assets/images`](./assets/images) contains the avatar, splash, platform icon,
  and Expo-provided image assets.
- [`metro.config.js`](./metro.config.js) enables NativeWind through Expo Metro.
- [`postcss.config.mjs`](./postcss.config.mjs) configures the Tailwind PostCSS
  plugin.

## Project structure

```text
Recurrly/
├── assets/
│   ├── fonts/              # Bundled Plus Jakarta Sans fonts
│   ├── icons/              # Tab and subscription icons
│   └── images/             # App, splash, avatar, and web assets
├── components/             # Reusable subscription and list UI
├── constants/              # Static data, image/icon maps, and design tokens
├── lib/                    # Shared formatting utilities
├── src/app/
│   ├── (auth)/             # Authentication route group
│   ├── (tabs)/             # Main tab route group
│   ├── _layout.tsx         # Root navigation and splash setup
│   └── Onboarding.tsx      # Onboarding route
├── app.json                # Expo application and plugin configuration
├── eslint.config.js        # ESLint flat configuration
├── global.css              # Tailwind/NativeWind theme and component classes
├── metro.config.js         # Expo Metro + NativeWind integration
├── package.json             # Dependencies and npm scripts
├── package-lock.json        # Locked npm dependency graph
├── postcss.config.mjs       # Tailwind PostCSS configuration
├── tsconfig.json            # Strict TypeScript and path aliases
└── README.md                # Project documentation
```

The repository also has local `ios/` and `android/` directories in some working
trees. They are ignored as generated native folders and should not be edited by
hand; native behavior belongs in `app.json` or an Expo config plugin.

## Configuration details

[`app.json`](./app.json) configures the application name and slug, portrait
orientation, `recurrly` deep-link scheme, icons, splash screen, bundled fonts,
Expo Router, asset support, and web server output. Typed routes and the React
Compiler are enabled through Expo experiments.

[`tsconfig.json`](./tsconfig.json) enables strict TypeScript checking and defines
these aliases:

```text
@/*       -> ./*
@/src/*   -> ./src/*
@/assets/* -> ./assets/*
```

The root layout imports [`global.css`](./global.css), which makes the
NativeWind/Tailwind classes available throughout the application.

## Extending the application

1. Add new screens under [`src/app`](./src/app) so Expo Router can discover them.
2. Keep reusable UI outside `src/app`, typically in [`components`](./components).
3. Replace the sample constants in [`constants/data.ts`](./constants/data.ts)
   with a data layer when persistence or a server is introduced.
4. Preserve the existing aliases and shared styling tokens when adding modules.
5. Add tests and a corresponding npm script when introducing business logic or
   data access.

Before adding authentication, persistence, or external integrations, document
the provider, required environment variables, error handling, and local setup
steps here.

## Known gaps and developer attention

- Authentication screens are presentational placeholders; they do not collect
  credentials or authenticate users.
- Onboarding, subscriptions, insights, settings, and subscription details are
  placeholders.
- The “View all” and home add controls do not currently perform an action.
- All subscription and balance values are sample data and are not persisted.
- No automated tests or production/EAS build configuration is defined.
- `npm run lint` currently passes with four import-style warnings in
  [`components/ListHeading.tsx`](./components/ListHeading.tsx),
  [`components/SubscriptionCard.tsx`](./components/SubscriptionCard.tsx), and
  [`src/app/(tabs)/_layout.tsx`](./src/app/(tabs)/_layout.tsx). These are
  pre-existing warnings, not README changes.

## License

This project is distributed under the license in [`LICENSE`](./LICENSE).
