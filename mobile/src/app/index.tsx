import { Redirect } from "expo-router";

/** The root route starts at login until a real authentication session exists. */
export default function IndexRoute() {
  return <Redirect href="/login" />;
}
