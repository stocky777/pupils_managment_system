# Teacher app prototype

This is a dependency-free browser shell for the first teacher workflow.

## Run it

Open `index.html` in a modern browser. Enter any well-formed email and a password
to enter the unconnected interface shell; real authentication is not implemented.

## Included flows

- Unconnected teacher login and loading state
- Empty dashboard, timetable, classes, and attendance states
- Replaceable data-source boundary for a future API or local database
- Local attendance store ready for records supplied by a real class register
- Simulated offline status and synchronization state

## Structure

- `index.html`: semantic application markup
- `styles.css`: responsive presentation and accessibility states
- `app.js`: data model, local attendance store and application controller

## JavaScript classes

- `EmptySchoolDataSource` returns no school records until an API is connected.
- `AttendanceStore` owns browser storage and attendance calculations.
- `TeacherAppPrototype` controls screens, navigation and user interactions.

The final four lines of `app.js` connect those parts and start the prototype.
Follow the comments beginning at the top of each class to understand the flow.

The project contains no embedded teacher, pupil, class, timetable, attendance,
room, or credential records. It is not a production React Native application
and must not be used with real pupil information.
