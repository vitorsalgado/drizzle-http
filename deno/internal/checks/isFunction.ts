export function isFunction(
  fn: unknown,
  message = "Argument must be a function type.",
) {
  if (typeof fn !== "function") {
    throw new Error(message);
  }
}
