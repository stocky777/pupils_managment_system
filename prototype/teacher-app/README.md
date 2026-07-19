# Teacher app prototype

This is a dependency-free browser prototype for the first teacher workflow.

## Run it

Open `index.html` in a modern browser. The example credentials are already filled in.

## Included flows

- Teacher login and loading state
- Today dashboard and weekly timetable
- Multiple class selection
- Present, absent and late attendance states
- Local browser persistence
- Simulated offline saving and synchronization

## Structure

- `index.html`: semantic application markup
- `styles.css`: responsive presentation and accessibility states
- `app.js`: data model, local attendance store and application controller

## JavaScript classes

- `PrototypeData` contains the fake pupils and allowed attendance statuses.
- `AttendanceStore` owns browser storage and attendance calculations.
- `TeacherAppPrototype` controls screens, navigation and user interactions.

The final four lines of `app.js` connect those parts and start the prototype.
Follow the comments beginning at the top of each class to understand the flow.

The prototype contains dummy data only. It is not a production React Native application and must not be used with real pupil information.
