export function log(...args: unknown[]) {
  console.log("[SMARTOPD]", ...args);
}

export function error(...args: unknown[]) {
  console.error("[SMARTOPD]", ...args);
}
