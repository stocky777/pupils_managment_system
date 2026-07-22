# Pupils Teacher mobile app

A teacher-facing React Native prototype for a pupils management system. It is
built with Expo SDK 54, TypeScript, and Expo Router and runs on Android and iOS.

The prototype currently demonstrates the app structure and navigation. It does
not contain hardcoded teachers, pupils, classes, attendance figures, timetable
entries, rooms, or credentials. Empty screens are intentional until a database
or API supplies real data.

## What the app is intended to do

The first version is for teachers. It is intended to let a teacher:

- sign in;
- see today's itinerary and timetable;
- view the classes assigned to them;
- open a class register;
- mark attendance in a later implementation;
- see attendance summaries in a later implementation; and
- continue recording changes offline in a later implementation.

The current sign-in is only a prototype. It checks that both fields contain
text, but it does not authenticate against a server.

## Run the app

Requirements:

- Node.js 20.19 or newer;
- the Expo Go app on the phone; and
- a terminal opened in this `mobile` directory.

Install and start:

```powershell
npm.cmd install
$env:EXPO_NO_DEPENDENCY_VALIDATION='1'
npx.cmd expo start --tunnel
```

The environment variable skips Expo's optional online dependency check. It is
needed only when the computer cannot reach that Expo API. It does not disable
the app or tunnel.

On Android, scan the QR code from Expo Go. On iPhone, scan it with the Camera
app and tap the notification. A Mac is not required for testing on a physical
iPhone through Expo Go. A Mac with Xcode is required for the local iOS
Simulator.

Stop the server with `Ctrl+C`. If caching causes unexpected behaviour, restart
it with:

```powershell
npx.cmd expo start --tunnel --clear
```

## How the app starts

`package.json` points to `expo-router/entry`. Expo Router scans `src/app` and
turns its files into routes. The starting sequence is:

```text
expo-router/entry
  -> src/app/_layout.tsx
  -> src/app/index.tsx
  -> redirect to /login
  -> login.tsx
  -> /home after the prototype form is submitted
```

## What `_layout.tsx` does

`src/app/_layout.tsx` is the root layout. It is not a screen that the user
visits. The underscore tells Expo Router that the file describes the structure
around the routes in the same folder.

The root layout currently provides three things:

1. `SafeAreaProvider` supplies safe-area information so content can avoid
   notches, status bars, and other device edges.
2. `StatusBar` controls the appearance of the phone's status bar.
3. `Stack` creates stack navigation and registers the app's screens.

Stack navigation works like a pile of pages. `router.push()` places a new page
on top, `router.back()` returns to the previous page, and `router.replace()`
replaces the current page so the user cannot navigate back to it.

`headerShown: false` disables Expo Router's default header because the screens
currently render their own content and back buttons.

## Routes and screens

Each `.tsx` file in `src/app` becomes a route:

| File | Route | Responsibility |
| --- | --- | --- |
| `index.tsx` | `/` | Redirects the initial route to `/login`. |
| `login.tsx` | `/login` | Displays the prototype sign-in form and replaces it with `/home`. |
| `home.tsx` | `/home` | Loads the teacher dashboard sections from the data source. |
| `classes.tsx` | `/classes` | Loads available classes and links each one to its register. |
| `timetable.tsx` | `/timetable` | Loads the weekly timetable and links sessions to registers. |
| `register/[classId].tsx` | `/register/:classId` | Loads the register belonging to the selected class. |

Square brackets create a dynamic route. For example,
`router.push('/register/class-10')` opens the same register screen and supplies
`class-10` as its `classId` parameter. This avoids creating a separate screen
file for every class.

## Project structure

```text
mobile/
|-- assets/                 App icons, splash artwork, and other images
|-- src/
|   |-- app/                Expo Router layouts and screens
|   |   |-- register/
|   |   |   `-- [classId].tsx
|   |   |-- _layout.tsx
|   |   |-- index.tsx
|   |   |-- login.tsx
|   |   |-- home.tsx
|   |   |-- classes.tsx
|   |   `-- timetable.tsx
|   |-- components/         Reusable React Native interface elements
|   |-- hooks/              Reusable React state and loading behaviour
|   |-- models/             TypeScript descriptions of school data
|   |-- services/           Data contracts and their implementations
|   `-- theme/              Shared colours, spacing, and corner radii
|-- app.json                Expo name, icons, plugins, and platform settings
|-- package.json            Dependencies and terminal commands
`-- tsconfig.json           TypeScript and import-alias configuration
```

## Reusable components

- `AppButton` provides a consistent button instead of repeating button markup
  and styles on every screen.
- `Screen` provides the common safe layout and optional scrolling behaviour.
- `LoadingView` displays a loading indicator while data is requested.
- `EmptyState` explains when a requested collection contains no records.
- `ConnectivityBanner` can display an offline warning. It is not yet connected
  to the device's actual network state.

React Native uses components such as `View`, `Text`, `Pressable`, and
`TextInput`; it does not use HTML elements. Styles are created with
`StyleSheet.create()` and applied through the `style` prop, not the web-only
`className` attribute.

## Data architecture

The app separates its interface from its future database or web API:

```text
Screen
  -> services.schoolDataSource
  -> SchoolDataSource interface
  -> EmptySchoolDataSource (current implementation)
  -> SQLite/API implementation (future)
```

- `models/school.ts` defines the shapes of teachers, pupils, classes,
  timetables, registers, and attendance summaries.
- `services/school-data-source.ts` defines the `SchoolDataSource` interface.
  The screens depend on this contract instead of a particular database.
- `services/empty-school-data-source.ts` implements that interface and returns
  empty results. This keeps fake school records out of the app.
- `services/container.ts` creates the current implementation in one place. A
  future SQLite/API implementation can replace it without rewriting every
  screen.
- `hooks/use-async-data.ts` handles loading, successful results, and failures
  for asynchronous data requests.

The interface-and-implementation separation is the main object-oriented idea
used here. React itself normally favours small function components and hooks
over class components.

## Styling and theme

`src/theme/theme.ts` holds shared colours, spacing, and corner radii. Individual
screens use `StyleSheet.create()` for styles specific to that screen. Shared
values help the app remain visually consistent and make later design changes
easier.

## How to navigate in code

Import the router:

```tsx
import { router } from "expo-router";
```

Open a screen while keeping the current screen in navigation history:

```tsx
router.push("/classes");
```

Open a dynamic class register:

```tsx
router.push(`/register/${classId}`);
```

Return to the previous screen:

```tsx
router.back();
```

Replace the current route, as the prototype login does:

```tsx
router.replace("/home");
```

## Development and debugging

Saving a source file normally triggers Fast Refresh on the connected phone.
The terminal shows bundling errors and `console.log()` output. Press `j` in the
Expo terminal to open React Native DevTools.

Validate the source code with:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

If VS Code reports `Cannot use JSX unless the '--jsx' flag is provided`, open
the `mobile` folder itself in VS Code. Then choose **TypeScript: Select
TypeScript Version**, select **Use Workspace Version**, and restart the
TypeScript server. `tsconfig.json` already enables React Native JSX.

## Current limitations and future work

- Authentication does not yet communicate with a backend.
- No real school records are bundled with the app.
- Attendance cannot yet be edited or saved.
- SQLite offline storage and later server synchronisation are not implemented.
- Connectivity state is not yet read from the device.
- Attendance action timestamps and an audit trail are not implemented.
- Accessibility, including alternatives to colour-only attendance states,
  needs to be completed and tested.
- Attendance charts need real data before they can be meaningful.
- Final bundle identifiers, signing, store metadata, and branding still require
  stakeholder decisions.

For offline attendance, a future implementation should save pending actions to
SQLite on the phone with timestamps, show their synchronisation state, and send
them to the backend when connectivity returns.
