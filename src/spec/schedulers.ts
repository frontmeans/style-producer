export function scheduleNow(operation: () => void) {
  // Do not schedule. Execute immediately instead.
  operation();
}
