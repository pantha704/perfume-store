export function runtimeEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  return typeof value === "string" && value.length ? value : fallback;
}

export function envFlag(name: string, fallback = false): boolean {
  const value = runtimeEnv(name, fallback ? "true" : "false").toLowerCase();
  return ["1", "true", "yes", "on"].includes(value);
}

export function isDemoMode(): boolean {
  return envFlag("NEXT_PUBLIC_DEMO_MODE", true);
}
